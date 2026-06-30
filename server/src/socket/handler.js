import { Server } from 'socket.io';
import {
  closeRoomService,
  joinRoomService,
  markParticipantOfflineService,
  renameRoomService,
  removeParticipantService
} from '../services/room.service.js';
import { registerDocumentEvents, getJoinPayload } from './document.events.js';

function serializeParticipants(participants) {
  return participants.map((p) => ({
    participantId: p.participantId,
    sessionId: p.sessionId,
    name: p.name,
    isHost: p.role === 'host',
    online: p.online,
    lastSeenAt: p.lastSeenAt,
  }));
}

export function attachSocketHandlers(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('room:join', async (payload, callback) => {
      const { roomCode, displayName } = payload;

      const {
        room,
        participantId,
        sessionId: finalSessionId,
        error,
      } = await joinRoomService({
        roomCode,
        displayName,
        socketId: socket.id,
      });

      if (error) {
        if (callback) callback({ success: false, error });
        return;
      }

      // Populate socket.data for Domain B disconnect cleanup
      socket.data.roomCode = room.roomCode;
      socket.data.clientId = participantId;

      socket.join(room.roomCode);

      // Fetch the initial document content and active locks from Domain B
      const initialPayload = await getJoinPayload(room.roomCode);

      if (callback) {
        callback({
          success: true,
          participantId,
          sessionId: finalSessionId,
          snapshot: {
            roomCode: room.roomCode,
            title: room.title,
            document: {
              content: initialPayload.content,
              lastSequence: initialPayload.lastSequence,
            },
            locks: initialPayload.locks,
            participants: serializeParticipants(room.participants),
            isHost: room.hostSessionId === finalSessionId,
          },
        });
      }

      // Notify others in room
      io.to(room.roomCode).emit('presence:participants', {
        participants: serializeParticipants(room.participants),
      });
    });

    socket.on("room:reconnect", async (payload, callback) => {
      const { roomCode, participantId, sessionId } = payload;
    
      const { room, participant, error } = await reconnectRoomService({
        roomCode,
        participantId,
        sessionId,
        socketId: socket.id,
      });
    
      if (error) {
        if (callback) callback({ success: false, error });
        return;
      }
    
      socket.data.roomCode = room.roomCode;
      socket.data.clientId = participant.participantId;
    
      socket.join(room.roomCode);
    
      const initialPayload = await getJoinPayload(room.roomCode);
    
      if (callback) {
        callback({
          success: true,
          participantId: participant.participantId,
          sessionId: participant.sessionId,
          snapshot: {
            roomCode: room.roomCode,
            title: room.title,
            document: {
              content: initialPayload.content,
              lastSequence: initialPayload.lastSequence,
            },
            locks: initialPayload.locks,
            participants: serializeParticipants(room.participants),
            isHost: room.hostParticipantId === participant.participantId,
          },
        });
      }
    
      io.to(room.roomCode).emit("presence:participants", {
        participants: serializeParticipants(room.participants),
      });
    });

    registerDocumentEvents(io, socket);

    socket.on('presence:typing', ({ roomCode, sessionId, isTyping }) => {
      socket.to(roomCode).emit('presence:typing', { sessionId, isTyping });
    });

    socket.on("room:rename", async ({ roomCode, sessionId, title }) => {
      const { room, error } = await renameRoomService({
        roomCode,
        sessionId,
        title,
      });
    
      if (error) {
        socket.emit("room:error", {
          message: error,
        });
        return;
      }
    
      io.to(room.roomCode).emit("room:renamed", {
        roomCode: room.roomCode,
        title: room.title,
      });
    });

    socket.on(
      "participant:remove",
      async ({ roomCode, sessionId, participantId }) => {
        const { room, removedParticipant, error } =
          await removeParticipantService({
            roomCode,
            sessionId,
            participantId,
          });
    
        if (error) {
          socket.emit("room:error", {
            message: error,
          });
          return;
        }
    
        // Notify removed participant
        if (removedParticipant.socketId) {
          io.to(removedParticipant.socketId).emit("participant:removed", {
            roomCode,
            participantId: removedParticipant.participantId,
          });
    
          // Disconnect the participant
          const removedSocket = io.sockets.sockets.get(
            removedParticipant.socketId
          );
    
          if (removedSocket) {
            removedSocket.leave(roomCode);
            removedSocket.disconnect(true);
          }
        }
    
        // Notify everyone else
        io.to(room.roomCode).emit("presence:participants", {
          participants: serializeParticipants(room.participants),
        });
      }
    );

    // 4. Domain A: Close room
    socket.on('room:close', async ({ roomCode, sessionId }) => {
      const { room, error } = await closeRoomService({ roomCode, sessionId });
      if (error) {
        socket.emit('room:error', { message: error });
        return;
      }
      io.to(room.roomCode).emit('room:closed', { roomCode: room.roomCode });
    });

    socket.on('disconnect', async () => {
      console.log('A user disconnected:', socket.id);
      const { roomCode } = socket.data;
      if (roomCode) {
        const room = await markParticipantOfflineService({ roomCode, socketId: socket.id });
        if (room) {
          io.to(room.roomCode).emit('presence:participants', {
            participants: serializeParticipants(room.participants),
          });
        }
      }
    });
  });

  return io;
}
