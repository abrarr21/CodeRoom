import { Server } from "socket.io";
import { closeRoomService, joinRoomService, markParticipantOfflineService } from "../services/room.service.js";
import { applyDeltaWithTransform } from "../services/aync.service.js";


function serializeParticipants(participants) {
  return participants.map((p) => ({
    sessionId: p.sessionId,
    name: p.name,
    isHost: p.isHost,
    online: p.online,
    lastSeenAt: p.lastSeenAt,
  }));
}

export function attachSocketHandlers(httpServer) {
  const io = new Server(httpServer);

  io.on("connection", (socket) => {
    console.log("A user connected");

     socket.on("room:join", async (payload) => {
      const { roomCode, displayName, sessionId } = payload;
      const { room, error } = await joinRoomService({
        roomCode,
        displayName,
        sessionId,
        socketId: socket.id,
      });

      if (error) {
        socket.emit("room:error", { message: error });
        return;
      }

      socket.data.roomCode = room.code;
      socket.data.sessionId = sessionId;
      socket.join(room.code);

      socket.emit("room:snapshot", {
        roomCode: room.code,
        roomName: room.name,
        document: room.document,
        participants: serializeParticipants(room.participants),
        isHost: room.hostSessionId === sessionId,
      });

      io.to(room.code).emit("presence:participants", {
        participants: serializeParticipants(room.participants),
      });
    });

    socket.on("editor:delta", async (payload) => {
      const { roomCode, delta, baseVersion, sessionId } = payload;
      const result = await applyDeltaWithTransformansform({
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
      const { room, error } = await closeRoomService({ roomCode, sessionId });
      if (error) {
        socket.emit("room:error", { message: error });
        return;
      }

      io.to(room.code).emit("room:closed", { roomCode: room.code });
    });

    socket.on("disconnect", async () => {
      console.log("A user disconnected");
      const { roomCode } = socket.data;
      if (roomCode) {
        const room = await markParticipantOfflineService({ roomCode, socketId: socket.id });
        if (room) {
          io.to(room.code).emit("presence:participants", {
            participants: serializeParticipants(room.participants),
          });
        }
      }
    });
  })

  return io;

}