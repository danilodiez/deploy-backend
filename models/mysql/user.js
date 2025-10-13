import mysql from "mysql2/promise";
import bcrypt from "bcrypt";


const SALT_ROUNDS = 10;


const DEFAULT_CONFIG = {
  host: 'localhost',
  user: 'root',
  port: 3306,
  password: '',
  database: 'productsdb'
}

const connectionString = DEFAULT_CONFIG;

const connection = await mysql.createConnection(connectionString);


export class UserModel {

  static async getUser({ email }) {
    try {
      const [results, fields] = await connection.query(
        'SELECT *, BIN_TO_UUID(id) id FROM `users` where email = ?',
        [email]
      );
      if (results.length < 1) {
        return { statusCode: 204, results: [] }
      }
      return { statusCode: 200, user: results };
    } catch (err) {
      // console.log(err);
      // SE ENVIA EL ERROR A UN SERVICIO DE MONITOREO
    }
  }

  static async register({ name, email, password }) {
    const [uuidResult] = await connection.query('SELECT UUID() uuid;')
    const [{ uuid }] = uuidResult;

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    try {
      await connection.query(`INSERT INTO users (id, name, email, password) VALUES (UUID_TO_BIN("${uuid}"), ?, ?,?)`, [
        name, email, hashedPassword,
      ])
    } catch (e) {
      // MONITOREO
    }

    const [user] = await connection.query(`SELECT name, email  FROM users WHERE id= UUID_TO_BIN(?);`, [uuid])

    if (user.length < 1) {
      return { statusCode: 500, message: "No se pudo crear el usuario" }
    }
    return { statusCode: 201, user: user };
  }




  static async login({ email, password }) {
    if (!email) throw new Error('No se envio email en la peticion');

    try {
      const [users] = await connection.query(
        'SELECT * from users WHERE email = ?',
        [email]
      );
      const correctPassword = await bcrypt.compare(password, users[0].password);
      if (correctPassword) {
        return { statusCode: 200, message: "El usuario se loggeo correctamente", success: true, user: { name: users[0].name, email: users[0].email } };
      } else {
        return { statusCode: 403, message: "Hubo un error con la contraseña", success: false };
      }

    } catch (e) {
      // MONITOREO
      return { ok: false };
    }
  }
}
