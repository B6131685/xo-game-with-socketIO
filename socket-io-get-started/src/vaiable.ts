import { IlistRoom } from "./type"

let listRoom:IlistRoom[] = []

const getListRoom = ()=>{
    return listRoom ?? []
}

const setListRoom = (arr:IlistRoom[])=>{
    listRoom = [...arr]
}

export {
    getListRoom, 
    setListRoom
}