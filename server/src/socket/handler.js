import { Server } from "socket.io";
import { closeRoomService, joinRoomService, markParticipantOfflineService } from "../services/room.service.js";
import { applyDeltaWithTransform } from "../services/aync.service.js";


function serializeParticipants(participants) {
  return participants.map((p) => ({
    participantId: p.participantId,
    name: p.name,
    isHost: p.role === "host",
  }));
}

export function attachSocketHandlers(httpServer) {
  const io = new Server(httpServer);

  io.on("connection", (socket) => {
    console.log("A user connected");

     socket.on("room:join", async (payload) => {
      const { roomCode, displayName, sessionId } = payload;
      try {
        const { room, participantId } = await joinRoomService({
          roomCode,
          name: displayName,
        });

        socket.data.roomCode = room.roomCode;
        socket.data.sessionId = participantId;
        socket.join(room.roomCode);

        socket.emit("room:snapshot", {
          roomCode: room.roomCode,
          roomName: room.title,
          document: room.document,
          participants: serializeParticipants(room.participants),
          isHost: room.hostParticipantId === participantId,
        });

        io.to(room.roomCode).emit("presence:participants", {
          participants: serializeParticipants(room.participants),
        });
      } catch (error) {
        socket.emit("room:error", { message: error.message || "Unable to join room." });
        return;
      }
    });

    socket.on("editor:delta", async (payload) => {
      const { roomCode, delta, baseVersion, sessionId } = payload;
      const result = await applyDeltaWithTransform({
        roomCode,
        incomingDelta: delta,
        baseVersion,
        authorSessionId: sessionId,
      });

      if (result.error) {
        socket.emit("room:error", { message: result.error });
        return;
      }

      io.to(roomCode).emit("editor:delta-applied", {
        delta: result.appliedDelta,
        version: result.version,
        authorSessionId: sessionId,
      });
    });

    socket.on("presence:typing", ({ roomCode, sessionId, isTyping }) => {
      socket.to(roomCode).emit("presence:typing", { sessionId, isTyping });
    });

    socket.on("room:close", async ({ roomCode, sessionId }) => {
      try {
        const room = await closeRoomService({ roomCode, sessionId });

        io.to(room.roomCode).emit("room:closed", { roomCode: room.roomCode });
      } catch (error) {
        socket.emit("room:error", { message: error });
        return;
      }
    });

    socket.on("disconnect", async () => {
      console.log("A user disconnected");
      const { roomCode } = socket.data;
      if (roomCode) {
        const room = await markParticipantOfflineService({ roomCode, socketId: socket.id });
        if (room) {
          io.to(room.roomCode).emit("presence:participants", {
            participants: serializeParticipants(room.participants),
          });
        }
      }
    });
  })

  return io;

}