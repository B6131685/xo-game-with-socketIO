import express, { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import cors from "cors";
import http from "http";
import "dotenv/config";
const app = express();
app.use(cors());
const server = http.createServer(app);
import * as socketIO from "socket.io";
import path from "path";
import { getListRoom, setListRoom } from "./vaiable";
import { roomHandler } from "./listeners/roomHandler";
import { emit_Room_canPlay } from "./emit";

export const io = new socketIO.Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  },
});

app.get("/createID", (req: Request, res: Response) => {
  const filePath = path.join(__dirname, "../pages/index.html");
  res.sendFile(filePath);
});

app.get("/createRoom", (req: Request, res: Response) => {
  const roomID = uuidv4();
  res.json({ room: roomID });
});

app.post("/joinRoom/:id", (req: Request, res: Response) => {
  const listRoom = getListRoom();
  const id = req.params.id
  const roomobj = listRoom.find( item=> item.id === id)

  if(!roomobj){
    res.status(404).json({ message: "not found room" })
  }
  if(roomobj?.player.length && roomobj?.player.length === 1){
    res.json({ room: id })
  }else{
    res.status(403).json({ message: "room is full" })
  }
});

app.get("/test", (req: Request, res: Response) => {
  throw new Error("game full")
});

app.get("/listRoom", (req: Request, res: Response) => {
  const listRoom = getListRoom();
  res.json({ listRoom: listRoom });
});

io.on("connection", (socket: socketIO.Socket) => {
  console.log(`a user(${socket.id}) connected`);

  io.emit("listRoom", () => {
    const listRoom = getListRoom();
    return listRoom;
  });

  roomHandler(io, socket);

  socket.on("disconnecting", () => {
    // console.log(socket.rooms); // the Set contains at least the socket ID
    const listRoom = getListRoom();
    const room = Array.from(socket.rooms)[1];
    if (room) {
      socket.leave(room);

      const index = listRoom.findIndex((item) => item.id === room);
      if (listRoom[index].player.length === 1) {
        const temp = listRoom.filter((item) => item.id !== room);
        setListRoom(temp);
      } else {
        const player = listRoom[index].player.filter((item) => item.socketID !== socket.id);
        const game_leaver = listRoom[index].player.find((item)=> item.socketID === socket.id)
        listRoom[index].player = player
        const message = `${game_leaver?.user} leave room`
        emit_Room_canPlay(listRoom[index].id, false, { message })
        setListRoom(listRoom);
      }
      const newlistRoom = getListRoom();
      io.emit("listRoom", { listRoom:newlistRoom });
      
    }
  });
});

server.listen(5000, () => {
  console.log("listening on *:5000");
});
