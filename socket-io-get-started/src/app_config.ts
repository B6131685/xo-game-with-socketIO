import * as socketIO from "socket.io";
import express from "express";
import http from "http";
import cors from "cors";

const app = express();
app.use(cors());
const server = http.createServer(app);
export const io = new socketIO.Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
      methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    },
  });

export default app