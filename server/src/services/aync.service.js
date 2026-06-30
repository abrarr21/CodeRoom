import {Room} from "../models/room.model.js";
import { applyDelta, transformDelta } from "../utils/patch.js";

const HISTORY_LIMIT = 500;

export async function applyDeltaWithTransform({
  roomCode,
  incomingDelta,
  baseVersion,
  authorSessionId,
}) {
  const room = await Room.findOne({ roomCode: roomCode?.toUpperCase() });
  if (!room || room.isClosed) {
    return { error: "Room not found or closed" };
  }

  const participantExists = room.participants.some(
    (p) => p.participantId === authorSessionId,
  );
  if (!participantExists) {
    return { error: "Participant not in room" };
  }

  const missedOps = room.history.filter((item) => item.version > baseVersion);
  const transformed = transformDelta(incomingDelta, missedOps);
  const { nextContent, applied } = applyDelta(
    room.document.content,
    transformed,
  );

  room.document.content = nextContent;
  room.document.version += 1;
  room.history.push({
    version: room.document.version,
    authorSessionId,
    op: applied,
  });

  if (room.history.length > HISTORY_LIMIT) {
    room.history = room.history.slice(room.history.length - HISTORY_LIMIT);
  }

  await room.save();

  return {
    error: null,
    room,
    appliedDelta: applied,
    version: room.document.version,
  };
}
