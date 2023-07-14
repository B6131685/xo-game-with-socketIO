import "./App.css";
import RoomProvider from "./contexts/roomContext";
import UserProvider from "./contexts/userContext";
import RenderRoute from "./route/renderRoutes";
import { ChakraProvider } from "@chakra-ui/react";
import { useEffect } from "react";
import { userTokenName, roomTokenNameKey } from "./const/tokenName";
function App() {
  useEffect(() => {
    return () => {
      localStorage.removeItem(userTokenName);
      localStorage.removeItem(roomTokenNameKey);
    };
  }, []);
  return (
    <UserProvider>
      <RoomProvider>
        <ChakraProvider>
          <RenderRoute />
        </ChakraProvider>
      </RoomProvider>
    </UserProvider>
  );
}

export default App;
