import express from "express";
import { corsMiddleware } from "./middlewares/cors.js";
import { itemsRouter } from "./routes/items.js";

const app = express();
app.use(express.json());

const PORT = process.env.PORT ?? 8000;

app.use("/items", itemsRouter);


app.listen(PORT, () => {
  console.log(`server listening on port http://localhost:${PORT}`);
});
