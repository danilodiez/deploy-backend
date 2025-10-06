// import { ItemModel } from "../models/item.js";
// import { ItemModel } from "../models/mysql/item.js";
import crypto from "node:crypto";
import { validateItem, validateItemPartial } from "../schemas/items.js"

export class ItemsController {
  constructor({ itemModel }) {
    this.model = itemModel;
  }

  // metodo (GET - obtencion)
  getAll = async (req, res) => {
    const articles = await this.model.getAll();
    res.send(articles);
  }

  // ESTO ES CON PATH PARAM o PARAMETRO DE RUTA
  // ESTO SE USA MAS CON IDs.
  getByName = async (req, res) => {
    const { name } = req.params // ESTO ES CON PATH PARAM
    if (name) {
      const filteredArticle = await this.model.getByName({ name })
      res.send(filteredArticle);
    }
  }
  // Creacion
  create = async (req, res) => {
    const result = validateItem(req.body);
    console.log(result);
    if (result.success) {

      const { title, year, brand, price, poster, category, rate } = req.body;
      const newArticles = await this.model.create({ title, year, brand, price, poster, category, rate })
      console.log(newArticles);
      res.send(newArticles);
    }
  }
  // METODO PATCH PARA MODIFICAR UN RECURSO

  update = async (req, res) => {
    const { id } = req.params
    const foundIndex = articles.findIndex(({ id: itemId }) => itemId === id);

    const validationResult = validateItemPartial(req.body)

    if (validationResult.success) {
      const modifiedArticles = await this.model.update({ foundIndex, body: req.body })
      res.send(modifiedArticles)
    }
  }

  delete = async (req, res) => {
    const { id } = req.params;

    const articles = this.model.delete({ id });

    res.send(articles);
  }

}
