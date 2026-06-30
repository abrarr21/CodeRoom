import { applyDelta, getSnapshot, forceSave } from '../services/document.service.js';
import {
  requestLock,
  releaseLock,
  releaseAllLocksForClient,
  getActiveLocks,
} from '../services/lock.service.js';
/**
 * Registers all document-related socket events for a connected client.
 */
export const registerDocumentEvents = (io, socket) => {
  /**
   * A client made a document change.
   * Apply it and notify everyone in the room.
   */
  socket.on('doc:delta', async ({ roomCode, clientId, sequence, op }) => {
    if (!roomCode || !clientId || !op) return;

    const result = await applyDelta(roomCode, op, sequence);

    if (result.success) {
      // Send the updated document to everyone, including the sender.
      io.to(roomCode).emit('doc:delta-applied', {
        clientId,
        sequence,
        op,
        content: result.content,
      });
    } else {
      // Only the sender needs to know their edit failed.
      socket.emit('doc:sync-error', {
        reason: result.error,
      });
    }
  });

  /**
   * A client wants to edit a line.
   */
  socket.on('doc:lock-request', ({ roomCode, clientId, line }) => {
    if (!roomCode || !clientId || line === undefined) return;

    const result = requestLock(roomCode, line, clientId);

    if (result.granted) {
      // Let everyone know this line is now locked.
      io.to(roomCode).emit('doc:lock-granted', {
        line,
        clientId,
      });
    } else {
      // Tell only the requester that the line is already locked.
      socket.emit('doc:lock-denied', {
        line,
        lockedBy: result.lockedBy,
      });
    }
  });

  /**
   * A client finished editing a line.
   */
  socket.on('doc:lock-release', ({ roomCode, clientId, line }) => {
    if (!roomCode || !clientId || line === undefined) return;

    releaseLock(roomCode, line, clientId);

    // Let everyone know the line is available again.
    io.to(roomCode).emit('doc:lock-released', {
      line,
      clientId,
    });
  });

  /**
   * Clean up when a client disconnects.
   */
  socket.on('disconnect', async () => {
    const { roomCode, clientId } = socket.data;

    // The client disconnected before joining a room.
    if (!roomCode || !clientId) return;

    // Release every lock owned by this client.
    const releasedLines = releaseAllLocksForClient(roomCode, clientId);

    if (releasedLines.length > 0) {
      // Send the latest lock state to everyone in the room.
      const activeLocks = getActiveLocks(roomCode);

      io.to(roomCode).emit('doc:locks-sync', {
        locks: activeLocks,
      });
    }

    // Save immediately if this was the last client in the room.
    const socketsInRoom = await io.in(roomCode).fetchSockets();

    if (socketsInRoom.length === 0) {
      await forceSave(roomCode);
    }
  });
};

/**
 * Returns everything a client needs when joining a room.
 */
export const getJoinPayload = async (roomCode) => {
  const { content, lastSequence } = await getSnapshot(roomCode);
  const locks = getActiveLocks(roomCode);

  return { content, lastSequence, locks };
};
