import express from "express";
import { corsMiddleware } from "./middlewares/cors.js";
import { itemsRouter } from "./routes/items.js";
import { userRouter } from "./routes/users.js";
import cookieParser from "cookie-parser";
import logger from "morgan"
import { Server } from "socket.io";
import { createServer } from "node:http";

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(logger('dev'));

const PORT = process.env.PORT ?? 8000;

app.use("/items", itemsRouter);
app.use('/users', userRouter);

app.get("/", (req, res) => {
  res.sendFile(process.cwd() + "/client/index.html")
})


const server = createServer(app);
const io = new Server(server, {
  connectionStateRecovery: {}
})
import mysql from "mysql2/promise";

const DEFAULT_CONFIG = {
  host: 'localhost',
  user: 'root',
  port: 3306,
  password: '',
  database: 'productsdb'
}
const connectionString = DEFAULT_CONFIG;
const connection = await mysql.createConnection(connectionString);

io.on('connection', async (socket) => {
  console.log('backend: se conecto un nuevo usuario');
  try {
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
      const result = await connection.query(
        'INSERT INTO messages (content, user) VALUES (?, ?);',
        [msg, userName]
      );
      io.emit("chat message", msg, userName)

    }
    catch (e) {
      console.error(e);
    }

    // if (!socket.recovered) {
    //   try {
    //     const [results, _] = await connection.query("SELECT * FROM messages")

    //     results.forEach(msg => {
    //       socket.emit("chat message", msg.content, msg.user)
    //     })
    //   } catch (e) {
    //     console.error(e);
    //   }
    // }

  })
})


server.listen(PORT, () => {
  console.log(`server listening on port http://localhost:${PORT}`);
});

