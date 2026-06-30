import { Room } from '../models/room.model.js';
import { applyInsert, applyDelete, validateOperation } from '../utils/delta.js';
import { shiftLocks } from './lock.service.js';

/**
 * In-memory cache of active room documents.
 * Each entry stores the latest document state and a pending save timer.
 */
const liveDocuments = new Map();

// Delay before persisting changes to MongoDB after the latest edit.
const DEBOUNCE_MS = 2500;

/**
 * Persists the latest in-memory state of a room to MongoDB.
 */
const persistToDb = async (roomCode) => {
  const entry = liveDocuments.get(roomCode);
  if (!entry) return;

  try {
    await Room.updateOne(
      { roomCode },
      {
        $set: {
          'document.content': entry.content,
          'document.lastSequence': entry.lastSequence,
          'document.updatedAt': new Date(),
        },
      }
    );
  } catch (err) {
    // A failed save is recoverable since the document remains in memory.
    console.error(`[document.service] Failed to persist room ${roomCode}:`, err.message);
  }
};

/**
 * Restarts the debounce timer for a room.
 * The document is only written to MongoDB after edits have stopped
 * for DEBOUNCE_MS milliseconds.
 */
const scheduleSave = (roomCode) => {
  const entry = liveDocuments.get(roomCode);
  if (!entry) return;

  if (entry.saveTimer) {
    clearTimeout(entry.saveTimer);
  }

  entry.saveTimer = setTimeout(() => {
    persistToDb(roomCode);
    entry.saveTimer = null;
  }, DEBOUNCE_MS);
};

/**
 * Returns the latest document snapshot.
 * Loads the room from MongoDB only once and caches it in memory.
 */
export const getSnapshot = async (roomCode) => {
  // Serve directly from memory if already loaded.
  if (liveDocuments.has(roomCode)) {
    const { content, lastSequence } = liveDocuments.get(roomCode);
    return { content, lastSequence };
  }

  const room = await Room.findOne({ roomCode });

  if (!room) {
    throw new Error(`[document.service] Room "${roomCode}" not found in database`);
  }

  liveDocuments.set(roomCode, {
    content: room.document.content,
    lastSequence: room.document.lastSequence,
    saveTimer: null,
    history: [], // Bounded opertaion history for OT transformation
  });

  return {
    content: room.document.content,
    lastSequence: room.document.lastSequence,
  };
};

/**
 * Applies a validated delta to the in-memory document and schedules
 * a debounced database save.
 */
export const applyDelta = async (roomCode, op, sequence) => {
  // Ensure the room is available in memory before applying edits.
  await getSnapshot(roomCode);

  const entry = liveDocuments.get(roomCode);

  // 1. Transform op against concurrent history edits
  let transformedLine = op.line;
  const history = entry.history || [];

  if (history.length > 0 && sequence < history[0].sequence) {
    return {
      success: false,
      error: 'Sequence too old. Please reload to resync.',
    };
  }

  for (const hist of history) {
    if (hist.sequence >= sequence) {
      // If a concurrent edit inserted newlines above or at our line, shift our line down
      if (hist.op.type === 'insert' && hist.op.line <= transformedLine) {
        const newlines = (hist.op.text.match(/\n/g) || []).length;
        if (newlines > 0) {
          transformedLine += newlines;
        }
      }
    }
  }

  const transformedOp = { ...op, line: transformedLine };

  const validation = validateOperation(entry.content, transformedOp);
  if (!validation.valid) {
    return {
      success: false,
      error: validation.reason,
    };
  }

  // Apply the requested edit.
  const updatedContent =
    transformedOp.type === 'insert'
      ? applyInsert(entry.content, transformedOp.line, transformedOp.offset, transformedOp.text)
      : applyDelete(entry.content, transformedOp.line, transformedOp.offset, transformedOp.length);

  // Count newline inserted/deleted to shift locks
  let deltaLines = 0;
  if (transformedOp.type === 'insert') {
    deltaLines = (transformedOp.text.match(/\n/g) || []).length;
  }

  if (deltaLines !== 0) {
    shiftLocks(roomCode, transformedOp.line, deltaLines);
  }

  const nextSequence = entry.lastSequence + 1;
  entry.content = updatedContent;
  entry.lastSequence = nextSequence;

  // Append transformed opertaion to history and enforce limits
  if (!entry.history) entry.history = [];
  entry.history.push({ sequence: nextSequence, op: transformedOp });

  if (entry.history.length > 100) {
    entry.history.shift();
  }

  // Saving is deferred to reduce database writes during rapid edits.
  scheduleSave(roomCode);

  return {
    success: true,
    content: updatedContent,
    sequence: nextSequence,
    op: transformedOp,
  };
};

/**
 * Immediately persists any pending changes for a room,
 * bypassing the debounce timer.
 */
export const forceSave = async (roomCode) => {
  const entry = liveDocuments.get(roomCode);
  if (!entry) return;

  if (entry.saveTimer) {
    clearTimeout(entry.saveTimer);
    entry.saveTimer = null;
  }

  await persistToDb(roomCode);
};

/**
 * Removes a room from the in-memory cache.
 * Call only after forceSave() to avoid losing unsaved edits.
 */
export const evictFromMemory = (roomCode) => {
  liveDocuments.delete(roomCode);
};
