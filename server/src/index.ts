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

const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:5173",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
];

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const isAllowed = allowedOrigins.some(allowed => origin === allowed || origin.startsWith(allowed));
      if (isAllowed || origin.includes("localhost") || origin.includes("127.0.0.1")) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
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