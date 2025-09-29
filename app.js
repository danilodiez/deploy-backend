import express from "express";
import crypto from "node:crypto";
import { validateItem, validateItemPartial } from "./schemas/items.js"
import cors from "cors";
import items from "./items.json" with { type: "json" };
let articles = items;

const app = express();
app.use(express.json());

const PORT = process.env.PORT ?? 8000;

app.use(
  cors({
    origin: (origin, callback) => {
      const ACCEPTED_ORIGINS = [
        "http://localhost:8080",
        "http://localhost:3000",
      ];

      if (ACCEPTED_ORIGINS.includes(origin)) {
        return callback(null, true);
      }

      if (!origin) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
  })
);

// recursos (Items - productos)
// metodo (GET - obtencion)
app.get("/items", (req, res) => {
  const { id } = req.query // ESTO ES CON QUERY PARAM
  if (id) {
    const filteredArticle = articles.find(({ id: itemid }) => itemid === id)
    res.send(filteredArticle);
  }

  res.send(articles);
})

// ESTO ES CON PATH PARAM o PARAMETRO DE RUTA
// ESTO SE USA MAS CON IDs.
app.get("/items/:name", (req, res) => {
  const { name } = req.params // ESTO ES CON PATH PARAM
  if (name) {
    const filteredArticle = articles.find(({ title }) => title === name)
    res.send(filteredArticle);
  }
})

// Esto no es REST porque guardamos el estado en nuestro backend,
// porque no estamos conectados a un almacenamiento persistente
app.post("/items", (req, res) => {
  const result = validateItem(req.body);

  if (result.success) {
    const id = crypto.randomUUID();
    const { title, year, brand, price, poster, category, rate } = req.body;
    articles.push({
      id,
      title, year, brand, price, poster, category, rate
    })

    res.send(articles);
  }
})

// METODO PATCH PARA MODIFICAR UN RECURSO
app.patch("/items/:id", (req, res) => {
  const { id } = req.params // OTRO EJEMPLO DE PATH PARAM
  const foundIndex = articles.findIndex(({ id: itemId }) => itemId === id);

  const validationResult = validateItemPartial(req.body)

  if (validationResult.success) {
    articles[foundIndex] = {
      ...articles[foundIndex],
      ...req.body
    }
  }
  res.send(articles)
})

// METODO DELETE PARA BORRAR UN RECURSO
app.delete("/items/:id", (req, res) => {
  const { id } = req.params;
  const foundIndex = articles.findIndex(({ id: itemId }) => itemId === id);

  if (foundIndex < 0) {
    res.send("No se encontro el articulo")
  }

  articles.splice(foundIndex, 1);
  res.send(articles);

})

app.listen(PORT, () => {
  console.log(`server listening on port http://localhost:${PORT}`);
});
