import { Server } from "socket.io";




export function attachSocketHandlers(httpServer) {
  const io = new Server(httpServer);

  io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("disconnect", () => {
      console.log("A user disconnected");
    })
  })

  return io;

}