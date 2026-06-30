import mongoose from 'mongoose';

const participantSchema = new mongoose.Schema(
  {
    participantId: {
      type: String,
      required: true,
      immutable: true,
    },
    sessionId: {
      type: String,
      required: true,
      index: true,
    },
    socketId: {
      type: String,
      default: null,
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
      enum: ['host', 'participant'],
      default: 'participant',
    },
    online: {
      type: Boolean,
      default: true,
    },
    lastSeenAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: false,
  }
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
      default: 'Untitled Document',
      trim: true,
      maxlength: 100,
    },

    hostParticipantId: {
      type: String,
      required: true,
      index: true,
    },

    hostSessionId: {
      type: String,
      required: true,
    },

    participants: {
      type: [participantSchema],
      default: [],
    },

    isClosed: {
      type: Boolean,
      default: false,
    },

    document: {
      content: {
        type: String,
        default: '',
      },
      lastSequence: {
        type: Number,
        default: 0,
      },
      updatedAt: {
        type: Date,
        default: Date.now,
      },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const Room = mongoose.model('Room', roomSchema);
