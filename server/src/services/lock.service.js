/**
 * In-memory lock table for active rooms.
 * Locks are intentionally ephemeral—they exist only while the server is running.
 * Expired locks are removed lazily when accessed rather than by a background job.
 */
const roomLocks = new Map();

/**
 * Duration (in milliseconds) for which a lock remains valid without being refreshed.
 */
export const LOCK_TTL_MS = 6000;

/**
 * Returns the lock map for a room, creating it on first access.
 */
const getRoomLockMap = (roomCode) => {
  if (!roomLocks.has(roomCode)) {
    roomLocks.set(roomCode, new Map());
  }

  return roomLocks.get(roomCode);
};

/**
 * Returns whether a lock has expired.
 */
const isExpired = (entry) => {
  return Date.now() > entry.expiresAt;
};

/**
 * Attempts to acquire or refresh a lock for a line.
 *
 * A lock is granted if:
 * - the line is unlocked,
 * - the existing lock has expired, or
 * - the requesting client already owns the lock.
 */
export const requestLock = (roomCode, line, clientId) => {
  const locks = getRoomLockMap(roomCode);
  const existing = locks.get(line);

  // Treat expired locks as if they no longer exist.
  if (!existing || isExpired(existing)) {
    locks.set(line, {
      clientId,
      expiresAt: Date.now() + LOCK_TTL_MS,
    });

    return { granted: true };
  }

  // Refresh the TTL when the current owner requests the lock again.
  if (existing.clientId === clientId) {
    existing.expiresAt = Date.now() + LOCK_TTL_MS;
    return { granted: true };
  }

  return {
    granted: false,
    lockedBy: existing.clientId,
  };
};

/**
 * Releases a lock only if it is owned by the requesting client.
 */
export function releaseLock(roomCode, line, clientId) {
  const locks = getRoomLockMap(roomCode);
  const existing = locks.get(line);

  if (!existing) return;

  if (existing.clientId !== clientId) return;

  locks.delete(line);
}

/**
 * Releases every lock owned by a client in a room.
 * Primarily used during client disconnects as a faster alternative
 * to waiting for TTL expiration.
 */
export function releaseAllLocksForClient(roomCode, clientId) {
  const locks = getRoomLockMap(roomCode);
  const releasedLines = [];

  for (const [line, entry] of locks.entries()) {
    if (entry.clientId === clientId) {
      locks.delete(line);
      releasedLines.push(line);
    }
  }

  return releasedLines;
}

/**
 * Returns all active locks for a room.
 * Expired locks are removed while iterating, so no separate cleanup
 * process is required.
 */
export function getActiveLocks(roomCode) {
  const locks = getRoomLockMap(roomCode);
  const active = {};

  for (const [line, entry] of locks.entries()) {
    if (isExpired(entry)) {
      // Remove stale locks during normal access.
      locks.delete(line);
    } else {
      active[line] = entry.clientId;
    }
  }

  return active;
}
/**
 * Shifts line lock indices when lines are inserted or deleted.
 */
export const shiftLocks = (roomCode, startLine, deltaLines) => {
  if (deltaLines === 0) return;
  const locks = getRoomLockMap(roomCode);
  const newLocks = new Map();

  for (const [lineKey, entry] of locks.entries()) {
    const lineNum = Number(lineKey);
    if (lineNum > startLine) {
      newLocks.set(lineNum + deltaLines, entry);
    } else if (lineNum === startLine) {
      if (deltaLines > 0) {
        // Keep the lock on the original line and extend it to the new line
        newLocks.set(lineNum, entry);
        for (let i = 1; i <= deltaLines; i++) {
          newLocks.set(lineNum + i, {
            ...entry,
            expiresAt: Date.now() + LOCK_TTL_MS,
          });
        }
      } else {
        newLocks.set(lineNum, entry);
      }
    } else {
      newLocks.set(lineNum, entry);
    }
  }

  locks.clear();
  for (const [line, entry] of newLocks.entries()) {
    locks.set(line, entry);
  }
};
