import socket from "../socket_config";
import O_Mark from "./mark/O_mark";
import X_mark from "./mark";
import Line, { CDimensionType } from "./line";

export type MarkType = "none"|"x"|"o"
type Props = {
  room: string;
  stepIndex: number;
  clickAble: boolean;
  dimension: CDimensionType
  mark : MarkType
};

const Box = ({room, stepIndex, clickAble=false, dimension=null, mark }: Props) => {
    function handleOnclick(){        
        if(clickAble && mark === 'none')
            socket.emit("action",{room, stepIndex})
    }
  return (
    <div 
        className={`w-full h-full aspect-square bg-slate-600 rounded-2xl ${mark==="none" && clickAble? "hover:bg-slate-400" : null} hover:cursor-pointer grid place-items-center relative`}
        onClick={handleOnclick}
    >
        {
            (()=>{
                switch (mark) {
                    case "o":
                        return <O_Mark/>
                    case "x":
                        return <X_mark/>
                    default:
                        break;
                }
            })()
        }
        {   
            dimension
            ? 
                <Line dimension={dimension} /> 
            : 
                null
        }
    </div>
  );
};

export default Box;
