import mysql from "mysql2/promise";

const DEFAULT_CONFIG = {
  host: 'localhost',
  user: 'root',
  port: 3306,
  password: '',
  database: 'productsdb'
}

const connectionString = DEFAULT_CONFIG;

const connection = await mysql.createConnection(connectionString);
const UPDATABLE_FIELDS = ['title', 'year', 'brand', 'price', 'poster', 'category', 'rate'];

export class ItemModel {
  static async getAll() {
    try {
      const [results, fields] = await connection.query(
        'SELECT *, BIN_TO_UUID(id) id FROM `products`;'
      );
      if (results.length < 1) {
        return { statusCode: 204, results: [] }
      }
      return { statusCode: 200, results: results };
    } catch (err) {
      // console.log(err);
      // SE ENVIA EL ERROR A UN SERVICIO DE MONITOREO
    }
  }

  static async getByName({ name }) {
    try {
      const [results, fields] = await connection.query(
        'SELECT *, BIN_TO_UUID(id) id FROM `products` WHERE = ?',
        [name]
      );
      if (results.length < 1) {
        return { statusCode: 204, results: [] }
      }
      return { statusCode: 200, results: results };
    } catch (e) {
      // TODO: monitoreo
    }
  }

  static async create({ title, year, brand, price, poster, category, rate }) {
    const [uuidResult] = await connection.query('SELECT UUID() uuid;')
    const [{ uuid }] = uuidResult;
    try {
      await connection.query(`INSERT INTO products (id, title, year, brand, price, poster, rate) VALUES (UUID_TO_BIN("${uuid}"), ?, ?, ?, ?, ?, ?)`, [
        title, year, brand, price, poster, rate
      ])
    } catch (e) {
      // MONITOREO
    }

    const [product] = await connection.query(`SELECT *, BIN_TO_UUID(id) id  FROM products WHERE id= UUID_TO_BIN(?);`, [uuid])
    console.log({ product });

    await connection.query(`INSERT INTO product_categories (product_id, category_id)
      SELECT p.id, c.id
      FROM products p
      JOIN category c ON c.name IN (?)
      WHERE p.id=UUID_TO_BIN("${uuid}")
      ORDER BY p.created_at DESC
      LIMIT 1;`, [
      category
    ]
    )
    if (product.length < 1) {
      return { statusCode: 204, results: [] }
    }
    return { statusCode: 201, results: product };
  }


  static async update({ body }) {
    const { id, ...rest } = body || {};
    if (!id) throw new Error('El update requiere `id` (uuid string)');

    // armamos SET dinámico solo con campos presentes
    const setParts = [];
    const values = [];
    for (const key of UPDATABLE_FIELDS) {
      if (rest[key] !== undefined) {
        setParts.push(`${key} = ?`);
        values.push(rest[key]);
      }
    }

    if (setParts.length === 0) {
      return null; // nada para actualizar
    }

    try {
      // UPDATE
      await connection.query(
        `UPDATE products
       SET ${setParts.join(', ')}
       WHERE id = UUID_TO_BIN(?)`,
        [...values, id]
      );

      // Devolver el registro actualizado (opcional pero útil)
      const [rows] = await connection.query(
        `SELECT BIN_TO_UUID(id) AS id, title, year, brand, price, poster, category, rate
       FROM products
       WHERE id = UUID_TO_BIN(?)`,
        [id]
      );
      return { statusCode: 200, result: rows[0] ?? null };
    } catch (e) {
      // MONITOREO
      // Podés loguear e y quizá re-lanzar o devolver null
      return null;
    }
  }


  static async delete({ id }) {
    if (!id) throw new Error('El delete requiere `id` (uuid string)');
    try {
      const [result] = await connection.query(
        'DELETE FROM products WHERE id = UUID_TO_BIN(?)',
        [id]
      );

      // affectedRows > 0 => se borró
      return { statusCode: 200, result: result.affectedRows > 0 };
    } catch (e) {
      // MONITOREO
      return { ok: false };
    }
  }
}
