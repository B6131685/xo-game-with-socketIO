import { useContext, useEffect, useState } from "react";
import { RoomContext } from "../contexts/roomContext";
import { ToastContainer, toast } from "react-toastify";
import Box, { MarkType } from "../components/box";
import socket from "../socket_config";
import { CDimensionType } from "../components/line";
import { useImmer } from "use-immer";


interface Iboxes {
  index: number;
  mark: MarkType;
}
interface IPlayer {
  id: string;
  user: string;
  score: number;
}
const initialboxes: Iboxes[] = [
  { index: 1, mark: "none" },
  { index: 2, mark: "none" },
  { index: 3, mark: "none" },
  { index: 4, mark: "none" },
  { index: 5, mark: "none" },
  { index: 6, mark: "none" },
  { index: 7, mark: "none" },
  { index: 8, mark: "none" },
  { index: 9, mark: "none" },
];

const GameRoom = () => {
  const roomContext = useContext(RoomContext);
  const [roomState, setRoomState] = useState<"Waiting" | "Playing" | "End">(
    "Waiting"
  );
  const [clickAble, setClickAble] = useState<boolean>(false);
  const [patternWin, setPatternWin] = useState<number[]>([]);
  const [lineType, setLineType] = useState<CDimensionType>(null);
  const [boxes, updateBoxes] = useImmer<Iboxes[]>(initialboxes);
  const [you, setYou] = useState<IPlayer | null>();
  const [enermy, setEnermy] = useState<IPlayer | null>();
  function leave() {
    roomContext?.leaveRoom();
  }

  function resetGame() {
    toast.dismiss();
    setClickAble(false);
    setLineType(null);
    setPatternWin([]);
    updateBoxes(initialboxes);
  }

  function readyNewRound() {
    socket.emit("ready-next-round", { room: roomContext?.state.room });
  }

  function roomAction(data: { room: string; stepIndex: number; mark: "x" | "o" }) {
    // console.log("before map");
    // console.log(boxes);
    // const temp = boxes.map(item=>{ 
    //   if(item.index === data.stepIndex){
    //     return {...item, mark: data.mark}
    //   }else{
    //     return item
    //   }
    // })
    // console.log("after map");
    // console.log(temp);
    updateBoxes(prev => {
      const find = prev .find(a =>
        a.index === data.stepIndex
      );
      if(find) find.mark = data.mark
    });
  }

  // useEffect(() => {
  //   console.log("box change");
  //   console.log(boxes);
  // }, [boxes]);
  useEffect(() => {
    socket.emit("join done", { room: roomContext?.state.room });
    socket.on("players-in-room", (data: IPlayer[]) => {
      data.forEach((element) => {
        if (element.id === socket.id) {
          setYou(element);
        } else {
          setEnermy(element);
        }
      });
    });
    socket.on("start-new-round", () => {
      setRoomState("Playing");
      toast("start new round");
    });
    socket.on(
      "canplay",
      ({
        canplay,
        issue,
      }: {
        canplay: boolean;
        issue: { message: string };
      }) => {
        setLineType(null);
        if (canplay === true) {
          setRoomState("Playing");
        } else {
          setEnermy(null);
          setRoomState("Waiting");
          setClickAble(false);
          if (issue) {
            toast(issue.message);
          }
        }
      }
    );

    socket.on("who turn", ({ id }: { id: string; user: string }) => {
      if (socket.id === id) {
        setClickAble(true);
      } else {
        setClickAble(false);
      }
    });

    function gameEnd({
      player,
      lineType,
      pattern,
    }: {
      player: IPlayer;
      pattern: number[];
      lineType: Exclude<CDimensionType, null>;
    }) {
      setClickAble(false);
      setRoomState("End");
      socket.id === player.id ? setYou(player) : setEnermy(player);
      toast(`Winner is ${player.user}`, {
        autoClose: false,
        onClose: () => {
          resetGame();
          readyNewRound();
        },
      });
      setPatternWin([...pattern]);
      setLineType(lineType);
    }
    socket.on("gameEnd", gameEnd);
    socket.on("reset-game", resetGame);
    
    socket.on(
      "room action",
      roomAction
    );

    return () => {
      socket.off();
    };
  }, []);

  return (
    <div className="grid place-items-center w-full h-screen">
      <div className="bg-slate-800 text-white p-5 rounded-2xl flex flex-col gap-5 h-auto">
        <header className="flex justify-between items-center">
          <h1>Room:{roomContext?.state.room}</h1>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={leave}
          >
            leave
          </button>
        </header>
        <div className="w-full grid grid-cols-4 text-4xl">
          <div
            className={`${
              clickAble && roomState === "Playing" ? "neonText" : null
            } text-center`}
          >
            {you?.user}
          </div>
          <div className="col-span-2 text-center">
            {roomState !== "Waiting"
              ? `${you?.score} - ${enermy?.score}`
              : null}
          </div>
          <div
            className={`${
              clickAble === false && roomState === "Playing" ? "neonText" : null
            } text-center`}
          >
            {enermy?.user}
          </div>
        </div>
        {roomState !== "Waiting" ? (
          <main className="grid grid-cols-3 gap-4 h-auto relative">
            {boxes.map(item => (
              <Box
                key={item.index}
                clickAble={clickAble}
                room={roomContext?.state.room as string}
                stepIndex={item.index}
                dimension={patternWin.includes(item.index) ? lineType : null}
                mark={item.mark}
              />
            ))}
          </main>
        ) : (
          <div className="min-h-[408px] grid place-items-center">
            <span className="text-3xl"> wait other player</span>
          </div>
        )}
      </div>
      <ToastContainer
        position="top-center"
        autoClose={1000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </div>
  );
};

export default GameRoom;
