import bcrypt from "bcrypt";
import { getConnection } from "../../config/database.js";

const SALT_ROUNDS = 10;


export class UserModel {

  static async getUser({ email }) {
    try {
      const connection = await getConnection();
      const [results, fields] = await connection.query(
        'SELECT *, BIN_TO_UUID(id) id FROM `users` where email = ?',
        [email]
      );
      if (results.length < 1) {
        return { statusCode: 204, results: [] }
      }
      return { statusCode: 200, user: results };
    } catch (err) {
      return { statusCode: 500, results: [], error: err.message };
    }
  }

  static async getUserById({ id }) {
    try {
      const connection = await getConnection();
      const [results] = await connection.query(
        'SELECT name, email, BIN_TO_UUID(id) id, balance FROM `users` where id = UUID_TO_BIN(?)',
        [id]
      );
      if (results.length < 1) {
        return { statusCode: 404, user: null };
      }
      return { statusCode: 200, user: results[0] };
    } catch (err) {
      return { statusCode: 500, user: null, error: err.message };
    }
  }

  static async register({ name, email, password }) {
    const connection = await getConnection();
    const [uuidResult] = await connection.query('SELECT UUID() uuid;')
    const [{ uuid }] = uuidResult;

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    try {
      await connection.query(
        `INSERT INTO users (id, name, email, password, balance) 
         VALUES (UUID_TO_BIN("${uuid}"), ?, ?, ?, 0)`, 
        [name, email, hashedPassword]
      )
    } catch (e) {
      return { statusCode: 500, message: "Error al crear el usuario", error: e.message };
    }

    const [user] = await connection.query(
      `SELECT name, email, BIN_TO_UUID(id) id FROM users WHERE id= UUID_TO_BIN(?);`, 
      [uuid]
    );

    if (user.length < 1) {
      return { statusCode: 500, message: "No se pudo crear el usuario" }
    }
    return { statusCode: 201, user: user };
  }




  static async login({ email, password }) {
    if (!email) throw new Error('No se envio email en la peticion');

    try {
      const connection = await getConnection();
      const [users] = await connection.query(
        'SELECT * from users WHERE email = ?',
        [email]
      );
      
      if (users.length === 0) {
        return { statusCode: 403, message: "Usuario no encontrado", success: false };
      }
      
      const correctPassword = await bcrypt.compare(password, users[0].password);
      if (correctPassword) {
        return { 
          statusCode: 200, 
          message: "El usuario se loggeo correctamente", 
          success: true, 
          user: { 
            id: users[0].id, 
            name: users[0].name, 
            email: users[0].email,
            balance: users[0].balance || 0
          } 
        };
      } else {
        return { statusCode: 403, message: "Hubo un error con la contraseña", success: false };
      }

    } catch (e) {
      return { statusCode: 500, message: "Error al loguear", success: false };
    }
  }

  static async updateBalance({ userId, amount }) {
    try {
      const connection = await getConnection();
      await connection.query(
        'UPDATE users SET balance = balance + ? WHERE id = UUID_TO_BIN(?)',
        [amount, userId]
      );
      
      const [users] = await connection.query(
        'SELECT name, email, BIN_TO_UUID(id) id, balance FROM users WHERE id = UUID_TO_BIN(?)',
        [userId]
      );
      
      return { statusCode: 200, user: users[0] };
    } catch (e) {
      return { statusCode: 500, user: null, error: e.message };
    }
  }

  static async getBalance({ userId }) {
    try {
      const connection = await getConnection();
      const [results] = await connection.query(
        'SELECT balance FROM users WHERE id = UUID_TO_BIN(?)',
        [userId]
      );
      
      if (results.length < 1) {
        return { statusCode: 404, balance: null };
      }
      
      return { statusCode: 200, balance: results[0].balance || 0 };
    } catch (e) {
      return { statusCode: 500, balance: null, error: e.message };
    }
  }
}
