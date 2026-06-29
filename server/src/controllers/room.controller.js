import { createRoomService } from "../services/room.service.js";

export const createRoomController = async (req, res, next) => {
  try {
    const { name, title } = req.body;

    const { room, participantId } = await createRoomService({
      name,
      title,
    });

    return res.status(201).json({
      success: true,
      message: "Room created successfully.",
      data: {
        room,
        participantId,
      },
    });
  } catch (error) {
    next(error);
  }
};
