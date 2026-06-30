import { randomUUID } from 'node:crypto';
import { Room } from '../models/room.model.js';
import { generateRoomCode } from '../utils/generateRoomCode.js';

export const createRoomService = async ({ name, title }) => {
  let roomCode;

  do {
    roomCode = await generateRoomCode();
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
        name,
        role: 'host',
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

export const joinRoomService = async ({ displayName, roomCode, sessionId, socketId }) => {
  const room = await Room.findOne({ roomCode: roomCode?.toUpperCase() });

  if (!room) {
    return { error: 'Room not found.' };
  }

  if (room.isClosed) {
    return { error: 'Room has been closed.' };
  }

  // Handle reconnecting user
  let participant = room.participants.find((p) => p.sessionId === sessionId);

  if (participant) {
    participant.online = true;
    participant.socketId = socketId;
    participant.lastSeenAt = new Date();
  } else {
    // Check if displayName name conflicts with someone else
    const nameConflicted = room.participants.some(
      (p) => p.name.toLowerCase() === displayName.toLowerCase() && p.online
    );
    if (nameConflicted) {
      return { error: 'Display name already exists and is active.' };
    }

    const participantId = randomUUID();
    participant = {
      participantId,
      sessionId: sessionId || randomUUID(),
      socketId,
      name: displayName,
      role: 'participant',
      online: true,
      lastSeenAt: new Date(),
    };
    room.participants.push(participant);
  }

  await room.save();

  return {
    room,
    participantId: participant.participantId,
    sessionId: participant.sessionId,
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

export const renameRoomService = async ({
  roomCode,
  sessionId,
  title,
}) => {
  const room = await findRoomByCode(roomCode);

  if (!room) {
    return { error: "Room not found." };
  }

  if (room.isClosed) {
    return { error: "Room has been closed." };
  }

  if (room.hostSessionId !== sessionId) {
    return { error: "Only the host can rename the room." };
  }

  room.title = title.trim();

  await room.save();

  return { room };
};

export const removeParticipantService = async ({
  roomCode,
  sessionId,
  participantId,
}) => {
  const room = await findRoomByCode(roomCode);

  if (!room) {
    return { error: "Room not found." };
  }

  if (room.isClosed) {
    return { error: "Room has been closed." };
  }

  // Verify host
  if (room.hostSessionId !== sessionId) {
    return { error: "Only the host can remove participants." };
  }

  // Find participant
  const participant = room.participants.find(
    (p) => p.participantId === participantId
  );

  if (!participant) {
    return { error: "Participant not found." };
  }

  // Host cannot remove themselves
  if (participant.role === "host") {
    return { error: "Host cannot remove themselves." };
  }

  // Remove participant
  room.participants = room.participants.filter(
    (p) => p.participantId !== participantId
  );

  await room.save();

  return {
    room,
    removedParticipant: participant,
  };
};