import { Router } from "express";
import {
  createRoomController,
  joinRoomController,
} from "../controllers/room.controller.js";
import {
  createRoomSchema,
  joinRoomSchema,
} from "../validators/room.validator.js";
import { validate } from "../middleware/validate.middleware.js";

const router = Router();

router.post("/", validate(createRoomSchema), createRoomController);
router.post("/join", validate(joinRoomSchema), joinRoomController);

export default router;
