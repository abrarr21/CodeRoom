import {
  createRoomService,
  joinRoomService,
} from "../services/room.service.js";

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

export const joinRoomController = async (req, res, next) => {
  try {
    const { name, roomCode } = req.body;

    const { room, participantId } = await joinRoomService({
      name,
      roomCode,
    });

    return res.status(200).json({
      success: true,
      message: "Joined room successfully.",
      data: {
        roomCode: room.roomCode,
        title: room.title,
        participantId,
      },
    });
  } catch (error) {
    next(error);
  }
};
