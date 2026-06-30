import { Server } from 'socket.io';
import {
  closeRoomService,
  joinRoomService,
  markParticipantOfflineService,
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

    // 1. Domain A: Room Joining & Handshake
    socket.on('room:join', async (payload, callback) => {
      const { roomCode, displayName, sessionId } = payload;

      const {
        room,
        participantId,
        sessionId: finalSessionId,
        error,
      } = await joinRoomService({
        roomCode,
        displayName,
        sessionId,
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

    // 2. Domain B: Register collaborative document handlers
    registerDocumentEvents(io, socket);

    // 3. Presence indicator: typing
    socket.on('presence:typing', ({ roomCode, sessionId, isTyping }) => {
      socket.to(roomCode).emit('presence:typing', { sessionId, isTyping });
    });

    // 4. Domain A: Close room
    socket.on('room:close', async ({ roomCode, sessionId }) => {
      const { room, error } = await closeRoomService({ roomCode, sessionId });
      if (error) {
        socket.emit('room:error', { message: error });
        return;
      }
      io.to(room.roomCode).emit('room:closed', { roomCode: room.roomCode });
    });

    // 5. Cleanup on disconnection
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
