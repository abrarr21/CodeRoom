import { randomUUID } from "node:crypto";
import { Room } from "../models/room.model.js";
import { generateRoomCode } from "../utils/generateRoomCode.js";

export const createRoomService = async ({ name, title }) => {
  let roomCode;

  // Generate a unique room code
  do {
    roomCode = generateRoomCode();
  } while (await Room.exists({ roomCode }));

  const participantId = randomUUID();

  const room = await Room.create({
    roomCode,
    title: title?.trim(),
    hostParticipantId: participantId,
    participants: [
      {
        participantId,
        name,
        role: "host",
      },
    ],
  });

  return {
    room,
    participantId,
  };
};

export const joinRoomService = async ({ name, roomCode }) => {
  const room = await Room.findOne({ roomCode });

  if (!room) {
    throw new Error("Room not found.");
  }

  if (room.isClosed) {
    throw new Error("Room has been closed.");
  }

  const existingParticipant = room.participants.find(
    (participant) => participant.name.toLowerCase() === name.toLowerCase(),
  );

  if (existingParticipant) {
    throw new Error("Display name already exists.");
  }

  const participantId = randomUUID();

  room.participants.push({
    participantId,
    name,
    role: "participant",
  });

  await room.save();

  return {
    room,
    participantId,
  };
};


export async function findRoomByCode(code) {
  return Room.findOne({ code: code?.toUpperCase() });
}

export const closeRoomService = async ({ roomCode, sessionId }) => {
  const room = await findRoomByCode(roomCode);
  if (!room) {
    throw new Error("Room not found.");
  }

  if (room.hostSessionId !== sessionId) {
    throw new Error("Only the host can close the room.");
  }

  room.isClosed = true;
  await room.save();

  return room;
}

export const markParticipantOfflineService = async ({ roomCode, socketId }) => {
  const room = await findRoomByCode(roomCode);
  if (!room) {
    throw new Error("Room not found.");
  }

  const participant = room.participants.find((p) => p.socketId === socketId);
  if (!participant) {
    throw new Error("Participant not found.");
  }

  if(participant) {
    participant.online = false;
  participant.socketId = null;
  participant.lastSeenAt = new Date();

  await room.save();
  }

  return room
}


