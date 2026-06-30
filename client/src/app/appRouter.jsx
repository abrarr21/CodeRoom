import { createBrowserRouter, Navigate } from "react-router-dom";
import RegisterPage from "../pages/RegisterPage";
import RoomCodePage from "../pages/RoomCodePage";
import RoomPage from "../pages/RoomPage";

const router = createBrowserRouter([
    {
        path: "/",
        element: <RegisterPage/>
    },
    {
        path: "/room-code/:code",
        element: <RoomCodePage/>
    },
    {
        path: "/room/:code",
        element: <RoomPage/>
    },
    {
        path: "*",
        element: <Navigate to="/" replace />
    }
])

export default router;