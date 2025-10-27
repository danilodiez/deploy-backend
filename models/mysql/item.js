import { getConnection } from "../../config/database.js";
const UPDATABLE_FIELDS = ['title', 'year', 'brand', 'price', 'poster', 'category', 'rate'];

export class ItemModel {
  static async getAll() {
    try {
      const connection = await getConnection();
      const [results, fields] = await connection.query(
        'SELECT *, BIN_TO_UUID(id) id FROM `products`;'
      );
      if (results.length < 1) {
        return { statusCode: 204, results: [] }
      }
      return { statusCode: 200, results: results };
    } catch (err) {
      // SE ENVIA EL ERROR A UN SERVICIO DE MONITOREO
      return { statusCode: 500, results: [], error: err.message };
    }
  }

  static async getByName({ name }) {
    try {
      const connection = await getConnection();
      const [results, fields] = await connection.query(
        'SELECT *, BIN_TO_UUID(id) id FROM `products` WHERE title = ? OR brand = ?',
        [name, name]
      );
      if (results.length < 1) {
        return { statusCode: 204, results: [] }
      }
      return { statusCode: 200, results: results };
    } catch (e) {
      return { statusCode: 500, results: [] };
    }
  }

  static async getById({ id }) {
    try {
      const connection = await getConnection();
      const [results] = await connection.query(
        'SELECT *, BIN_TO_UUID(id) id FROM `products` WHERE id = UUID_TO_BIN(?)',
        [id]
      );
      if (results.length < 1) {
        return { statusCode: 404, result: null };
      }
      return { statusCode: 200, result: results[0] };
    } catch (e) {
      return { statusCode: 500, result: null };
    }
  }

  static async create({ title, year, brand, price, poster, category, rate, stock }) {
    const connection = await getConnection();
    const [uuidResult] = await connection.query('SELECT UUID() uuid;')
    const [{ uuid }] = uuidResult;
    try {
      await connection.query(
        `INSERT INTO products (id, title, year, brand, price, poster, rate, stock) 
         VALUES (UUID_TO_BIN("${uuid}"), ?, ?, ?, ?, ?, ?, ?)`, 
        [title, year, brand, price, poster, rate, stock || 0]
      )
    } catch (e) {
      return { statusCode: 500, results: [], error: e.message };
    }

    const [product] = await connection.query(
      `SELECT *, BIN_TO_UUID(id) id  FROM products WHERE id= UUID_TO_BIN(?);`, 
      [uuid]
    );

    if (category && category.length > 0) {
      await connection.query(`INSERT INTO product_categories (product_id, category_id)
        SELECT p.id, c.id
        FROM products p
        JOIN category c ON c.name IN (?)
        WHERE p.id=UUID_TO_BIN("${uuid}")
        ORDER BY p.created_at DESC
        LIMIT 1;`, [category]
      );
    }

    if (product.length < 1) {
      return { statusCode: 204, results: [] }
    }
    return { statusCode: 201, results: product };
  }


  static async update({ id, body }) {
    if (!id) throw new Error('El update requiere `id` (uuid string)');

    const { ...rest } = body || {};
    const ALL_UPDATABLE_FIELDS = [...UPDATABLE_FIELDS, 'stock'];

    // armamos SET dinámico solo con campos presentes
    const setParts = [];
    const values = [];
    for (const key of ALL_UPDATABLE_FIELDS) {
      if (rest[key] !== undefined) {
        setParts.push(`${key} = ?`);
        values.push(rest[key]);
      }
    }

    if (setParts.length === 0) {
      return null; // nada para actualizar
    }

    try {
      const connection = await getConnection();
      // UPDATE
      await connection.query(
        `UPDATE products
       SET ${setParts.join(', ')}
       WHERE id = UUID_TO_BIN(?)`,
        [...values, id]
      );

      // Devolver el registro actualizado
      const [rows] = await connection.query(
        `SELECT BIN_TO_UUID(id) AS id, title, year, brand, price, poster, rate, stock
       FROM products
       WHERE id = UUID_TO_BIN(?)`,
        [id]
      );
      return { statusCode: 200, result: rows[0] ?? null };
    } catch (e) {
      return null;
    }
  }


  static async delete({ id }) {
    if (!id) throw new Error('El delete requiere `id` (uuid string)');
    try {
      const connection = await getConnection();
      const [result] = await connection.query(
        'DELETE FROM products WHERE id = UUID_TO_BIN(?)',
        [id]
      );

      // affectedRows > 0 => se borró
      return { statusCode: 200, result: result.affectedRows > 0 };
    } catch (e) {
      return { statusCode: 500, result: false, error: e.message };
    }
  }

  // Método para actualizar stock
  static async updateStock({ id, quantity }) {
    try {
      const connection = await getConnection();
      const [result] = await connection.query(
        `UPDATE products 
         SET stock = stock - ? 
         WHERE id = UUID_TO_BIN(?) AND stock >= ?`,
        [quantity, id, quantity]
      );
      
      return { 
        statusCode: result.affectedRows > 0 ? 200 : 400, 
        result: result.affectedRows > 0 
      };
    } catch (e) {
      return { statusCode: 500, result: false, error: e.message };
    }
  }
}
