import express from "express";
import { corsMiddleware } from "./middlewares/cors.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { requestLogger } from "./utils/logger.js";
import { itemsRouter } from "./routes/items.js";
import { userRouter } from "./routes/users.js";
import { purchaseRouter } from "./routes/purchase.js";
import cookieParser from "cookie-parser";
import logger from "morgan";
import { Server } from "socket.io";
import { createServer } from "node:http";
import { getConnection } from "./config/database.js";

const app = express();

// Middlewares
app.use(corsMiddleware());
app.use(express.json());
app.use(cookieParser());
app.use(logger('dev'));
app.use(requestLogger);

const PORT = process.env.PORT ?? 8000;

// Routes
app.use("/items", itemsRouter);
app.use('/users', userRouter);
app.use('/purchases', purchaseRouter);

app.get("/", (req, res) => {
  res.sendFile(process.cwd() + "/client/index.html")
})


app.use(errorHandler);

const server = createServer(app);
const io = new Server(server, {
  connectionStateRecovery: {}
})

io.on('connection', async (socket) => {
  console.log('backend: se conecto un nuevo usuario');
  try {
    const connection = await getConnection();
    const [results, _] = await connection.query("SELECT * FROM messages")

    results.forEach(msg => {
      socket.emit("chat message", msg.content, msg.user)
    })
  } catch (e) {
    console.error(e);
  }

  socket.on('disconnect', () => {
    console.log('se desconecto un usuario')
  })


  socket.on("chat message", async (msg) => {
    const userName = socket.handshake.auth.username ?? "";
    try {
      const connection = await getConnection();
      const result = await connection.query(
        'INSERT INTO messages (content, user) VALUES (?, ?);',
        [msg, userName]
      );
      io.emit("chat message", msg, userName)

    }
    catch (e) {
      console.error(e);
    }
  })
})


server.listen(PORT, () => {
  console.log(`server listening on port http://localhost:${PORT}`);
});

