import { getListRoom, setListRoom } from "../vaiable";
import { Server } from "socket.io";

type typeLine = "row" | "col" | "left_diagonal" | "right_diagonal";
interface IWinPattern {
  ptt: number[];
  type: typeLine;
}
const WinPattern: IWinPattern[] = [
  {
    ptt: [1, 2, 3],
    type: "row",
  },
  {
    ptt: [4, 5, 6],
    type: "row",
  },
  {
    ptt: [7, 8, 9],
    type: "row",
  },
  {
    ptt: [1, 4, 7],
    type: "col",
  },
  {
    ptt: [2, 5, 8],
    type: "col",
  },
  {
    ptt: [3, 6, 9],
    type: "col",
  },
  {
    ptt: [1, 5, 9],
    type: "left_diagonal",
  },
  {
    ptt: [3, 5, 7],
    type: "right_diagonal",
  },
];

const IsEndGame = (roomindex: number, playerindex: number, io: Server) => {
  const listRoom = getListRoom();
  const steps = listRoom[roomindex].player[playerindex].steps;
  let resetRoom:boolean = false;
  WinPattern.forEach((item: IWinPattern) => {
    if (item.ptt.every((num: number) => steps.includes(num))) {
      listRoom[roomindex].player[playerindex].score++
      resetRoom = true
      const winner = listRoom[roomindex].player[playerindex]
      io.to(listRoom[roomindex].id).emit("gameEnd", {
        player: {id:winner.socketID,user:winner.user,score:winner.score} ,
        pattern: item.ptt,
        lineType: item.type,
      });
    }
  });

  if(resetRoom){
    listRoom[roomindex].totalStep = 0;
    listRoom[roomindex].player = listRoom[roomindex].player.map(item=>({...item, steps:[], state:"awaiting"}))
    setListRoom(listRoom)
    io.emit('reset-box')
  }
};


const findRoomIndexByRoomID = (id:string)=>{
  const listRoom = getListRoom();
  const index = listRoom.findIndex((item) => item.id === id);
  return index
}

export { IsEndGame, findRoomIndexByRoomID };
