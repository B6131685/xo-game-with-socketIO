import { createContext, useReducer, ReactNode } from 'react';
import { roomTokenNameKey } from '../const/tokenName';
import socket from '../socket_config';


interface RoomType {
    room: null | string
}

type Join = { type: "join"; payload: { id:string, user:string } }
type Leave = { type: "leave";}
interface RoomContextType {
    state:RoomType
    joinRoom: (id:string, user:string)=>void,
    leaveRoom: ()=>void

}
const RoomContext = createContext<null | RoomContextType >(null);

function roomsReducer(room: RoomType, action: Join | Leave) {
    switch (action.type) {
        case 'join' : 
            socket.emit("join room", { room: action.payload.id, user: action.payload.user })
            return { room: action.payload.id }
        case 'leave':
            socket.emit("leave room")
            return { room: null }
        default :
            return room
    }
}

const RoomProvider = ({children}: {children: ReactNode })=>{
    const roomToken = localStorage.getItem(roomTokenNameKey)
    const initialState:RoomType = { room:null }
    if(roomToken){
        initialState.room = JSON.stringify(roomToken) 
    }
    const [room, dispath] = useReducer( roomsReducer, { ...initialState } )
    
    function joinRoom(id:string, user: string):void{
        dispath({type:'join', payload: { id , user}})
    }

    function leaveRoom(){
        dispath({type:'leave'})
    }
    return (
    <RoomContext.Provider value={{state:room, joinRoom, leaveRoom}}>
        {children}
    </RoomContext.Provider>
    )
}



export { RoomContext };
export default RoomProvider