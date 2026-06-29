import { customAlphabet } from "nanoid";

const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

const nanoid = customAlphabet(alphabet, 6);

export const generateRoomCode = () => {
  return nanoid();
};
