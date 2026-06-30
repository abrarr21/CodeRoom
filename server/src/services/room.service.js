import { randomUUID } from 'node:crypto';
import { Room } from '../models/room.model.js';
import { generateRoomCode } from '../utils/generateRoomCode.js';

export const createRoomService = async ({name,title}) => {
  let roomCode;

  do {
    roomCode = generateRoomCode();
  } while (await Room.exists({ roomCode }));

  const participantId = randomUUID();
  const sessionId = randomUUID();

  const room = await Room.create({
    roomCode,
    title: title?.trim() || 'Untitled Document',
    hostParticipantId: participantId,
    hostSessionId: sessionId,
    participants: [
      {
        participantId,
        sessionId,
        socketId: null,
        name,
        role: "host",
        online: true,
        lastSeenAt: new Date(),
      },
    ],
  });

  return {
    room,
    participantId,
    sessionId,
  };
};

export const joinRoomService = async ({
  displayName,
  roomCode,
  socketId,
}) => {
  const room = await Room.findOne({
    roomCode: roomCode?.toUpperCase(),
  });

  if (!room) {
    return { error: "Room not found." };
  }

  if (room.isClosed) {
    return { error: "Room has been closed." };
  }

  // Display name must be unique among online participants
  const nameConflicted = room.participants.some(
    (p) =>
      p.name.toLowerCase() === displayName.toLowerCase() &&
      p.online
  );

  if (nameConflicted) {
    return {
      error: "Display name already exists and is active.",
    };
  }

  const participantId = randomUUID();
  const sessionId = randomUUID();

  room.participants.push({
    participantId,
    sessionId,
    socketId,
    name: displayName,
    role: "participant",
    online: true,
    lastSeenAt: new Date(),
  });

  await room.save();

  return {
    room,
    participantId,
    sessionId,
  };
};

export async function findRoomByCode(code) {
  return Room.findOne({ roomCode: code?.toUpperCase() });
}

export const closeRoomService = async ({ roomCode, sessionId }) => {
  const room = await findRoomByCode(roomCode);
  if (!room) {
    return { error: 'Room not found.' };
  }

  if (room.hostSessionId !== sessionId) {
    return { error: 'Only the host can close the room.' };
  }

  room.isClosed = true;
  await room.save();

  return { room };
};

export const markParticipantOfflineService = async ({ roomCode, socketId }) => {
  const room = await findRoomByCode(roomCode);
  if (!room) return null;

  const participant = room.participants.find((p) => p.socketId === socketId);
  if (participant) {
    participant.online = false;
    participant.socketId = null;
    participant.lastSeenAt = new Date();
    await room.save();
  }

  return room;
};

export const reconnectRoomService = async ({
  roomCode,
  participantId,
  sessionId,
  socketId,
}) => {
  const room = await findRoomByCode(roomCode);

  if (!room) {
    return { error: "Room not found." };
  }

  if (room.isClosed) {
    return { error: "Room has been closed." };
  }

  const participant = room.participants.find(
    (p) =>
      p.participantId === participantId &&
      p.sessionId === sessionId
  );

  if (!participant) {
    return { error: "Session expired. Please join again." };
  }

  participant.socketId = socketId;
  participant.online = true;
  participant.lastSeenAt = new Date();

  await room.save();

  return {
    room,
    participant,
  };
};