import { z } from "zod";

export const createRoomSchema = z.object({
  name: z
    .string({
      required_error: "Display name is required.",
    })
    .trim()
    .min(2, "Display name must be at least 2 characters.")
    .max(30, "Display name must not exceed 30 characters."),

  title: z
    .string()
    .trim()
    .min(1, "Room title cannot be empty.")
    .max(100, "Room title must not exceed 100 characters.")
    .optional(),
});
