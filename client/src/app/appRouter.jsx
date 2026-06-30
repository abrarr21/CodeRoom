import { createBrowserRouter } from "react-router-dom";
import RegisterPage from "../pages/RegisterPage";
import RoomCodePage from "../pages/RoomCodePage";
import RoomPage from "../pages/RoomPage";

const router = createBrowserRouter([
    {
        path: "/",
        element: <RegisterPage/>
    },
    {
        path: "/room-code",
        element: <RoomCodePage/>
    },
    {
        path: "/room",
        element: <RoomPage/>
    }
])

export default router;