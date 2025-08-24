import { Server } from "socket.io";

let io;

export const initializeWebSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.ALLOWED_ORIGINS.split(","),
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    // console.log(`WebSocket connected`);
    socket.on("disconnect", () => {
      // console.log(`WebSocket disconnected`);
    });
  });
  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("WebSocket not initialized");
  }
  return io;
};