import { getConnection } from "../../config/database.js";

export class PurchaseModel {
  static async create({ userId, productId, quantity, totalPrice, purchaseDate }) {
    const connection = await getConnection();
    
    try {
      // Create UUID for purchase
      const [uuidResult] = await connection.query('SELECT UUID() uuid;');
      const [{ uuid }] = uuidResult;
      
      await connection.query(
        `INSERT INTO purchases (id, user_id, product_id, quantity, total_price, purchase_date)
         VALUES (UUID_TO_BIN("${uuid}"), UUID_TO_BIN(?), UUID_TO_BIN(?), ?, ?, ?)`,
        [userId, productId, quantity, totalPrice, purchaseDate || new Date()]
      );

      // Get the created purchase
      const [purchases] = await connection.query(
        `SELECT BIN_TO_UUID(id) id, BIN_TO_UUID(user_id) user_id, 
                BIN_TO_UUID(product_id) product_id, quantity, total_price, purchase_date
         FROM purchases WHERE id = UUID_TO_BIN(?)`,
        [uuid]
      );

      return { 
        statusCode: 201, 
        purchase: purchases[0] 
      };
    } catch (e) {
      return { 
        statusCode: 500, 
        purchase: null, 
        error: e.message 
      };
    }
  }

  static async getByUserId({ userId }) {
    const connection = await getConnection();
    
    try {
      const [results] = await connection.query(
        `SELECT p.id, p.quantity, p.total_price, p.purchase_date,
                pr.title, pr.price, pr.brand, pr.poster
         FROM purchases p
         JOIN products pr ON p.product_id = pr.id
         WHERE p.user_id = UUID_TO_BIN(?)
         ORDER BY p.purchase_date DESC`,
        [userId]
      );

      return { 
        statusCode: 200, 
        purchases: results.map(row => ({
          ...row,
          id: row.id ? row.id.toString() : null
        }))
      };
    } catch (e) {
      return { 
        statusCode: 500, 
        purchases: [], 
        error: e.message 
      };
    }
  }

  static async getAll() {
    const connection = await getConnection();
    
    try {
      const [results] = await connection.query(
        `SELECT p.id, p.quantity, p.total_price, p.purchase_date,
                u.name as user_name, u.email as user_email,
                pr.title, pr.price, pr.brand
         FROM purchases p
         JOIN users u ON p.user_id = u.id
         JOIN products pr ON p.product_id = pr.id
         ORDER BY p.purchase_date DESC`
      );

      return { 
        statusCode: 200, 
        purchases: results 
      };
    } catch (e) {
      return { 
        statusCode: 500, 
        purchases: [], 
        error: e.message 
      };
    }
  }

  static async getById({ id }) {
    const connection = await getConnection();
    
    try {
      const [results] = await connection.query(
        `SELECT p.id, p.quantity, p.total_price, p.purchase_date,
                BIN_TO_UUID(p.user_id) user_id,
                BIN_TO_UUID(p.product_id) product_id,
                pr.title, pr.price, pr.brand, pr.poster,
                u.name as user_name, u.email as user_email
         FROM purchases p
         JOIN users u ON p.user_id = u.id
         JOIN products pr ON p.product_id = pr.id
         WHERE p.id = UUID_TO_BIN(?)`,
        [id]
      );

      if (results.length === 0) {
        return { 
          statusCode: 404, 
          purchase: null 
        };
      }

      return { 
        statusCode: 200, 
        purchase: results[0] 
      };
    } catch (e) {
      return { 
        statusCode: 500, 
        purchase: null, 
        error: e.message 
      };
    }
  }
}


