import { Router } from "express";
import {
  closeRoomController,
  createRoomController,
  joinRoomController,
} from "../controllers/room.controller.js";
import {
  closeRoomSchema,
  createRoomSchema,
  joinRoomSchema,
} from "../validators/room.validator.js";
import { validate } from "../middleware/validate.middleware.js";

const router = Router();

router.post("/", validate(createRoomSchema), createRoomController);
router.post("/join", validate(joinRoomSchema), joinRoomController);
router.patch("/:code/close", validate(closeRoomSchema), closeRoomController);

export default router;
