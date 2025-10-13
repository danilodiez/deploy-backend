import express from "express";
import { corsMiddleware } from "./middlewares/cors.js";
import { itemsRouter } from "./routes/items.js";
import { userRouter } from "./routes/users.js";
import cookieParser from "cookie-parser";

const app = express();
app.use(express.json());
app.use(cookieParser());

const PORT = process.env.PORT ?? 8000;

app.use("/items", itemsRouter);
app.use('/users', userRouter);

app.listen(PORT, () => {
  console.log(`server listening on port http://localhost:${PORT}`);
});
