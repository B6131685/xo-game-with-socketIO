import { useContext, useEffect, useState } from "react";
import socket from "../socket_config";
import { IListRoom } from "../services/room/type";
import { joinRoomService, listRoomService } from "../services/room";
import { UserContext } from "../contexts/userContext";
import { RoomContext } from "../contexts/roomContext";

const ListRoom = () => {
  const [listRoom, setListRoom] = useState<IListRoom[]>([]);
  const userContext = useContext(UserContext);
  const roomContext = useContext(RoomContext);
  useEffect(() => {
    socket.on("listRoom", (data: { listRoom: IListRoom[] }) => {
      if (Array.isArray(data.listRoom)) {
        setListRoom([...data.listRoom]);
      }
    });

    listRoomService().then((data) => {
      setListRoom(data);
    });

    return () => {
      socket.off("listRoom");
    };
  }, []);

  async function joinRoom(room: string) {
    joinRoomService(room).then(
      (data)=>{
        roomContext?.joinRoom(data.room, userContext?.state.name as string);
      }
    ).catch(error=>{
      console.log(error.message)
      alert(error.message)
    })
  }
  return (
    <div className="h-full bg-slate-700 overflow-y-auto overflow-x-hidden rounded-2xl p-2 flex flex-col gap-2">
      {listRoom.length === 0 ? (
        <h3>No Room</h3>
      ) : (
        listRoom?.map((item: IListRoom, index: number) => {
          return (
            <div
              onClick={() => joinRoom(item.id)}
              key={item.id}
              className="grid grid-cols-8 border-pink-500 hover:bg-slate-500 hover:cursor-pointer"
            >
              <div className="col-span-1">{index + 1}</div>
              <div className="col-span-6">{item.id}</div>
              <div className="col-span-1">{item.player.length} / 2</div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default ListRoom;
