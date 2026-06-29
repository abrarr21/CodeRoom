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
