import { io } from "socket.io-client";

export const SOCKET_URL =
  import.meta.env.VITE_SERVER_URL ||
  "http://localhost:5001";

export const socket = io(SOCKET_URL);