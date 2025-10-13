import crypto from "node:crypto";
import { validateItem, validateItemPartial } from "../schemas/items.js"
import jwt from "jsonwebtoken";
import { SECRET_JWT_KEY } from "../secret.js";
import { success } from "zod";

export class UsersController {
  constructor({ userModel }) {
    this.model = userModel;
  }

  // metodo (GET - obtencion)
  getUser = async (req, res) => {
    const user = await this.model.getUser({ email: req.body.email });
    res.send(user);
  }

  // Creacion
  register = async (req, res) => {
    // TODO: implementar esquema de ZOD
    // const result = validateItem(req.body);

    const { name, email, password } = req.body;
    const repeatedUser = await this.model.getUser({ email: email });

    if (repeatedUser.user && repeatedUser.user.length) {
      return res.send({ success: false, message: "El email ya esta registrado" });
    }


    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return res.send({ success: false, message: "No es un mail correcto" })

    if (!password.length > 12) return res.send({ success: false, message: "La contraseña debe tener mas de 12 caracteres" });
    if (!/\d/.test(password)) return res.send({ success: false, message: "La contraseña debe incluir al menos un numero" })

    const result = await this.model.register({ email, name, password });
    if (result.statusCode === 201) {
      return res.send({ user: result.user });
    } else {
      return res.send({ error: "Hubo un error" });
    }
  }
  // METODO PATCH PARA MODIFICAR UN RECURSO

  login = async (req, res) => {
    const { email, password } = req.body;
    const dbUser = await this.model.login({ email, password });
    if (dbUser.success === false) {
      return res.send({ message: "usuario/contraseña incorrectos", statusCode: 403 })
    }

    const token = jwt.sign(
      { username: dbUser.user.name, email: dbUser.user.email },
      SECRET_JWT_KEY,
      {
        expiresIn: '1h'
      }
    )

    res.cookie('access_token', token, {
      httpOnly: true, // la cookie solo se puede acceder en el servidor
      secure: false, // la cookie solo se puede acceder en httpS
      sameSite: 'strict', // la cookie solo se puede acceder en el mismo dominio
      maxAge: 1000 * 60 * 60,
    }).send({ username: dbUser.user.name, email: dbUser.user.email })
  }

  protectedAccess = async (req, res) => {
    const token = req.cookies.access_token;
    if (!token) return res.send({ message: "Acceso denegado, debe iniciar sesion", success: true });

    return res.send({ message: "Acceso permitido", success: true });
  }

  logout = async (req, res) => {
    res.clearCookie('access_token')
    return res.send({ success: true, message: "Se cerro la sesion" });
  }
}
