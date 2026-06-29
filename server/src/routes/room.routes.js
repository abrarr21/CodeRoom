import { Router } from "express";
import { createRoomController } from "../controllers/room.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import { createRoomSchema } from "../validators/room.validator.js";

const router = Router();

router.post("/", validate(createRoomSchema), createRoomController);

export default router;
