import mongoose from "mongoose";

const participantSchema = new mongoose.Schema(
  {
    participantId: {
      type: String,
      required: true,
      immutable: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 30,
    },

    role: {
      type: String,
      enum: ["host", "participant"],
      default: "participant",
    },
  },
  {
    _id: false,
  },
);

const roomSchema = new mongoose.Schema(
  {
    roomCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },

    title: {
      type: String,
      default: "Untitled Document",
      trim: true,
      maxlength: 100,
    },

    hostParticipantId: {
      type: String,
      required: true,
      index: true,
    },

    participants: {
      type: [participantSchema],
      default: [],
    },

    isClosed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const Room = mongoose.model("Room", roomSchema);
