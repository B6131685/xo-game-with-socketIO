import axios, { AxiosError } from "axios";
import { IListRoom } from "./type";

const createRoomService = async (): Promise<{ room: string }> => {
  const res = await axios.get("http://localhost:5000/createRoom");

  if (res.status >= 200 && res.status <= 300) {
    return res.data;
  } else {
    throw new Error(res.data.message);
  }
};

const joinRoomService = async (id: string): Promise<{ room: string }> => {
  try {
    const res = await axios.post("http://localhost:5000/joinRoom/" + id);
    return res.data;
    
  } catch (error) {

    if(error instanceof AxiosError)
        throw new Error(error.response?.data.message);
    else if(error instanceof Error){
        throw new Error(error.message)
    }else
        throw new Error("joinRoomService: unknow Error")
  }
};

const listRoomService = async (): Promise<IListRoom[]> => {
  const res = await axios.get("http://localhost:5000/listRoom");

  if (res.status >= 200 && res.status <= 300) {
    return res.data.listRoom;
  } else {
    throw new Error(res.data.message);
  }
};

export { createRoomService, listRoomService, joinRoomService };
