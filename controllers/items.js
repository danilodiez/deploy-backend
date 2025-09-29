import { ItemModel } from "../models/item.js";
import crypto from "node:crypto";
import { validateItem, validateItemPartial } from "../schemas/items.js"

export class ItemsController {
  // metodo (GET - obtencion)
  static async getAll(req, res) {

    const articles = await ItemModel.getAll();
    res.send(articles);
  }

  // ESTO ES CON PATH PARAM o PARAMETRO DE RUTA
  // ESTO SE USA MAS CON IDs.
  static async getByName(req, res) {
    const { name } = req.params // ESTO ES CON PATH PARAM
    if (name) {
      const filteredArticle = await ItemModel.getByName({ name })
      res.send(filteredArticle);
    }
  }
  // Creacion
  static async create(req, res) {
    const result = validateItem(req.body);

    if (result.success) {
      const id = crypto.randomUUID();
      const { title, year, brand, price, poster, category, rate } = req.body;
      const newArticles = await ItemModel.create({ title, year, brand, price, poster, category, rate })
      res.send(newArticles);
    }
  }
  // METODO PATCH PARA MODIFICAR UN RECURSO

  static async update(req, res) {
    const { id } = req.params
    const foundIndex = articles.findIndex(({ id: itemId }) => itemId === id);

    const validationResult = validateItemPartial(req.body)

    if (validationResult.success) {
      const modifiedArticles = await ItemModel.update({ foundIndex, body: req.body })
      res.send(modifiedArticles)
    }
  }

  // METODO DELETE PARA BORRAR UN RECURSO
  // TODO
  static async delete(req, res) {
    const { id } = req.params;
    const foundIndex = articles.findIndex(({ id: itemId }) => itemId === id);

    if (foundIndex < 0) {
      res.send("No se encontro el articulo")
    }

    articles.splice(foundIndex, 1);
    res.send(articles);
  }

}
