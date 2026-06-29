import jwt from "jsonwebtoken";
import env from "../config/env.js";

const JWT_SECRET = env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is missing.");
}

export const generateRoomToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "1d",
  });
};

export const verifyRoomToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};
