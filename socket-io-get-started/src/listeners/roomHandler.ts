import { Socket, Server } from "socket.io";
import { getListRoom, setListRoom } from "../vaiable";
import { emit_Room_canPlay, emit_Room_whoTurn } from "../emit";
import { IPlayer } from "../type";
import { IsEndGame, findRoomIndexByRoomID } from "../services/roomServices";

const roomHandler = (io: Server, socket: Socket) => {
  socket.on("join room", (data: { room: string; user: string }) => {
    const listRoom = getListRoom();
    const index = findRoomIndexByRoomID(data.room)

    if (index !== -1) {
      listRoom[index].player.push({
        user: data.user,
        socketID: socket.id,
        mark: listRoom[index].player[0].mark === "x" ? "o" : "x",
        steps: [],
        state:"ready",
        score:0
      });
      setListRoom(listRoom);
    } else {
      listRoom.push({
        id: data.room,
        state: "awaiting",
        player: [{ user: data.user, socketID: socket.id, mark: "o" , steps: [], state:"ready", score:0}],
        totalStep: 0,
      });
      setListRoom(listRoom);
    }
    socket.join(data.room);
    const newlistRoom = getListRoom();
    io.emit("listRoom", { listRoom: newlistRoom });
  });

  socket.on("join done", ({ room }: { room: string }) => {
    const listRoom = getListRoom();
    let index: number = 0;
    const find = listRoom.find((item, i) => {
      if (item.id === room) {
        index = i;
        return item;
      }
    });
    io.to(room).emit("players-in-room", 
      find?.player.map(player=> ( { id: player.socketID, user:player.user, score:player.score}) )
    );
    const canplay = find?.player.length === 2 && find?.player.every((person)=>person.state === "ready");
    if(canplay) emit_Room_canPlay(room,true,null)

    if (canplay) {
      var randomNum = Math.random();
      if (randomNum < 0.5) {
        emit_Room_whoTurn(room, listRoom[index].player[0].socketID, listRoom[index]?.player[0].user)
      } else {
        emit_Room_whoTurn(room, listRoom[index].player[1].socketID, listRoom[index]?.player[1].user)
      }
      listRoom[index].player[1].state = "playing"
      listRoom[index].player[0].state = "playing"
      setListRoom(listRoom)
    }
  });

  // ready for new game
  socket.on("ready", () => {

  })

  socket.on("leave room", () => {
    const listRoom = getListRoom();
    const crrRoom = Array.from(socket.rooms)[1];
    const index = findRoomIndexByRoomID(crrRoom)

    socket.leave(crrRoom);
    if (index !== -1 && listRoom[index].player.length === 1) {
      const newlistRoom = listRoom.filter((item) => item.id !== crrRoom);
      setListRoom(newlistRoom);
    } else if (index > -1) {
      let game_leaver: string = "";
      const temp = listRoom[index].player.filter((item) => {
        if (item.socketID === socket.id) game_leaver = item.user;
        if (item.socketID !== socket.id) {
          item.state = "ready"
          item.steps = [],
          item.score = 0
          return item;
        }
      });
      listRoom[index].player = temp;
      if (listRoom[index].state === "pending") {
        listRoom[index].state = "awaiting";
        const message = `${game_leaver} leave room`;
        emit_Room_canPlay( listRoom[index].id, false, { message });
        io.emit("reset-game");
      }else{
        emit_Room_canPlay( listRoom[index].id, false, null);
      }
      setListRoom(listRoom);
    }

    const newlistRoom = getListRoom();
    io.emit("listRoom", { listRoom: newlistRoom });
  });

  socket.on("action", (data: { room: string; stepIndex: number }) => {
    const listRoom = getListRoom();
    let roomIndex: number | null = null;
    let  playerIndex: number | null = null;
    const find = listRoom.find((room, i) => {
      if (room.id === data.room) {
        roomIndex = i;
        return room;
      }
    });

    if (roomIndex !== null){

      playerIndex = listRoom[roomIndex].player.findIndex(item=> item.socketID === socket.id)
      listRoom[roomIndex].player[playerIndex].steps.push(data.stepIndex)
      listRoom[roomIndex].totalStep++;
      setListRoom(listRoom);
      
      listRoom[roomIndex].state = "pending";
    } 

    let nexUser:IPlayer | null = null;
    let crrUser:IPlayer | null = null; 
    if(find){
      for (const item of find?.player) {
        if (item.socketID === socket.id) {
          crrUser =  item;
        } else {
          nexUser = item;
        }
      }
      io.to(find?.id).emit("room action", { ...data, mark: crrUser?.mark });
      emit_Room_whoTurn(data.room,  nexUser?.socketID as string, nexUser?.user as string)
    }
    if( roomIndex !==-1 && roomIndex !== null && playerIndex !==-1 && playerIndex !== null ){
      IsEndGame(roomIndex, playerIndex, io)
    }
  });

  socket.on("ready-next-round",({room}:{room:string})=>{
    const listRoom = getListRoom()
    const indexRoom = findRoomIndexByRoomID(room)
    const arrPlayer:IPlayer[] =  listRoom[indexRoom].player.map( (player)=>{
      if(player.socketID === socket.id)
      return {...player, state:"ready"}
      
      return {...player}
    })

    if(arrPlayer.every(el => el.state === "ready") && arrPlayer.length === 2){
      arrPlayer.forEach(item=> item.state="playing")
      var randomNum = Math.random();
      if (randomNum < 0.5) {
        emit_Room_whoTurn(room, listRoom[indexRoom].player[0].socketID, listRoom[indexRoom]?.player[0].user)
      } else {
        emit_Room_whoTurn(room, listRoom[indexRoom].player[1].socketID, listRoom[indexRoom]?.player[1].user)
      }
      io.emit('start-new-round')
    }
    listRoom[indexRoom].player = arrPlayer
    setListRoom(listRoom)
  })
};

export { roomHandler };
