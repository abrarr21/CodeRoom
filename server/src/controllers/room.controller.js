import {
  closeRoomService,
  createRoomService,
  joinRoomService,
  renameRoomService,
} from "../services/room.service.js";

export const createRoomController = async (req, res, next) => {
  try {
    const { name, title } = req.body;

    const { room, participantId, sessionId } = await createRoomService({
      name,
      title,
    });

    return res.status(201).json({
      success: true,
      message: "Room created successfully.",
      data: {
        room,
        participantId,
        sessionId,
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


export const closeRoomController = async (req, res, next) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) {
      return res.status(400).json({ error: "sessionId is required" });
    }

    const room = await closeRoomService({
      roomCode: req.params.code,
      sessionId,
    });

    return res.status(200).json({
      success: true,
      message: "Room closed successfully.",
      data: {
        roomCode: room.roomCode,
        isClosed: room.isClosed,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const renameRoomController = async (req, res, next) => {
  try {
    const { sessionId, title } = req.body;

    const { room, error } = await renameRoomService({
      roomCode: req.params.code,
      sessionId,
      title,
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: error,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Room renamed successfully.",
      data: {
        roomCode: room.roomCode,
        title: room.title,
      },
    });
  } catch (error) {
    next(error);
  }
};