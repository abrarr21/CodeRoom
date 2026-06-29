import mongoose from 'mongoose';

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
      enum: ['host', 'participant'],
      default: 'participant',
    },
  },
  {
    _id: false,
  }
);

const HistorySchema = new mongoose.Schema(
  {
    version: { type: Number, required: true },
    authorSessionId: { type: String, required: true },
    op: {
      type: {
        type: String,
        enum: ['insert', 'delete'],
        required: true,
      },
      index: { type: Number, required: true },
      text: { type: String },
      length: { type: Number },
    },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
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

      version: {
        type: Number,
        default: 0,
      },

      lastSequece: {
        type: Number,
        default: 0,
      },
      updatedAt: {
        type: Date,
        default: Date.now,
      },
    },

    history: {
      type: [HistorySchema],
      default: [],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const Room = mongoose.model('Room', roomSchema);
