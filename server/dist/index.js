"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const roomHandlers_1 = require("./socket/roomHandlers");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: process.env.CLIENT_URL,
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
    (0, roomHandlers_1.registerRoomHandlers)(io, socket);
});
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
