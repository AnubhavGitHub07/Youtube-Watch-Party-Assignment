import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import { registerRoomHandlers } from "./socket/roomHandlers";

dotenv.config();

const app = express();

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      // Dynamically echo back the request origin to satisfy browser CORS checks
      callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 5001;

app.get("/", (_, res) => {
  res.send("Server is running 🚀");
});

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  registerRoomHandlers(io, socket);
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});