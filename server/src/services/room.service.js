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
