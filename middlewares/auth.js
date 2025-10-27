import jwt from "jsonwebtoken";
import { SECRET_JWT_KEY } from "../secret.js";


export const authMiddleware = (req, res, next) => {
  const token = req.cookies.access_token;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Acceso denegado. Debe iniciar sesión"
    });
  }

  try {
    const decoded = jwt.verify(token, SECRET_JWT_KEY);
    req.user = decoded; // Agregar información del usuario al request
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Token inválido o expirado"
    });
  }
};


