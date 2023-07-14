import { useContext, useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { RoomContext } from "../contexts/roomContext";
import {
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
} from "@chakra-ui/react";
import ListRoom from "../components/listRoom";
import { UserContext } from "../contexts/userContext";
import { createRoomService } from "../services/room";

type Inputs = {
  playerName: string;
};

const Home = () => {
  const roomContext = useContext(RoomContext);
  const userContext = useContext(UserContext);
  const [loadingRoom, setLoadingRoom] = useState<boolean>(false);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>();
  const onSubmit: SubmitHandler<Inputs> = (data) => {
    userContext?.createUser(data.playerName);
    onClose();
  };
  async function createRoom() {
    try {
      setLoadingRoom(true);
      const res = await createRoomService();
      roomContext?.joinRoom(res.room, userContext?.state.name as string);
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("unknow Error");
      }
    } finally {
      setLoadingRoom(false);
    }
  }

  useEffect(() => {
    const name = userContext?.state.name;
    if (name) {
      onClose();
    } else {
      onOpen();
    }
  }, []);
  return (
    <div className="h-screen w-full grid place-items-center">
      <div className="bg-slate-800 text-white p-5 rounded-2xl flex flex-col gap-5 h-[450px] min-w-[500px] ">
        {/* <h1>listRoom</h1> */}
        <header className="flex justify-between mb-5 items-center">
          <span className="text-4xl font-bold">Rooms</span>
          <button 
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={createRoom} 
            disabled={loadingRoom}>
            {loadingRoom ? <span>Loading...</span> : <span>create Room</span>}
          </button>
        </header>
        <ListRoom />
      </div>
      <Modal isOpen={isOpen} onClose={()=>{}}>
        <ModalOverlay />
        <ModalContent>
          <ModalBody>
            <div className="mt-5 mb-5 flex justify-center h-14 items-center">
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex gap-5 items-center"
              >
                <span>NAME</span>
                <div className="relative">
                  <input
                    type="text"
                    {...register("playerName", { required: true })}
                    className="focus:outline-none bg-stone-300"
                  />
                  {errors.playerName && (
                    <div className="text-red-600 absolute">
                      Name is required
                    </div>
                  )}
                </div>
                <input
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
                />
              </form>
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default Home;
