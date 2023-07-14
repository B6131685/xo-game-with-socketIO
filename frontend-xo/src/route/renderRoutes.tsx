import { createBrowserRouter, RouteObject, Navigate, RouterProvider } from "react-router-dom";
import { useContext } from 'react'
import { RoomContext } from "../contexts/roomContext";
import GameRoom from "../pages/gameRoom";
import Home from "../pages/home";

const RenderRoute = ()=>{
    const roomContext = useContext(RoomContext)
    let router:RouteObject[] = []

    if(roomContext?.state?.room){
        router = [
            {
                path: "/",
                element: <Navigate to="/room" replace={true} />
            },
            {
                path: "/room",
                element: <GameRoom/>
            },
            
        ]
    }else{
        router = [
            {
                path: "/",
                element: <Home />
            },
            {
                path: "/room",
                element: <Navigate to="/" replace={true} />
            },
        ]
    }

    const defaultRoute:RouteObject[] = [
        {
            path: "*",
            element: <h1>Not Found</h1> 
        },
    ]

    const AllRouter = createBrowserRouter([...router, ...defaultRoute])

    return (
        <RouterProvider router={AllRouter} />
    )
}


export default RenderRoute;