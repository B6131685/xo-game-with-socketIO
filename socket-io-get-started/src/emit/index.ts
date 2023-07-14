import { io } from '../index'
function emit_Room_canPlay(roomID:string, canplay:boolean, issue: { message:string } | null ){
    io.to(roomID).emit("canplay", {
        canplay,
        issue
      });
}

function emit_Room_whoTurn(roomID:string, socketID:string, user:string){
    io.to(roomID).emit("who turn", {
        id: socketID,
        user
    });
}

export {
    emit_Room_canPlay,
    emit_Room_whoTurn
}