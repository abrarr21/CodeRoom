// server/src/utils/delta.js

/**
 * Splits the document into lines, lets you mutate one line,
 * then joins back. All three functions below use this same pattern.
 */

/**
 * Inserts `text` at the given line and character offset.
 * @param {string} content - full document as one string, lines separated by \n
 * @param {number} line    - zero-indexed line number
 * @param {number} offset  - zero-indexed character position within that line
 * @param {string} text    - text to insert (can contain \n — new lines will be created naturally)
 * @returns {string} updated full document string
 */
export function applyInsert(content, line, offset, text) {
  const lines = content.split('\n');

  if (line < 0 || line >= lines.length) {
    throw new Error(
      `applyInsert: line ${line} does not exist (document has ${lines.length} lines)`
    );
  }

  const targetLine = lines[line];

  if (offset < 0 || offset > targetLine.length) {
    throw new Error(
      `applyInsert: offset ${offset} is out of bounds for line ${line} (length ${targetLine.length})`
    );
  }

  // Slice the line at offset, insert the new text in between
  const updated = targetLine.slice(0, offset) + text + targetLine.slice(offset);

  // If `text` contained \n characters, `updated` will have them —
  // splitting on \n when we rejoin handles it naturally
  lines[line] = updated;

  return lines.join('\n');
}

/**
 * Deletes `length` characters starting at the given line and offset.
 * @param {string} content - full document as one string
 * @param {number} line    - zero-indexed line number
 * @param {number} offset  - zero-indexed character position within that line
 * @param {number} length  - number of characters to remove
 * @returns {string} updated full document string
 */
export function applyDelete(content, line, offset, length) {
  const lines = content.split('\n');

  if (line < 0 || line >= lines.length) {
    throw new Error(
      `applyDelete: line ${line} does not exist (document has ${lines.length} lines)`
    );
  }

  const targetLine = lines[line];

  if (offset < 0 || offset > targetLine.length) {
    throw new Error(
      `applyDelete: offset ${offset} is out of bounds for line ${line} (length ${targetLine.length})`
    );
  }

  if (offset + length > targetLine.length) {
    throw new Error(
      `applyDelete: offset ${offset} + length ${length} exceeds line ${line} length (${targetLine.length})`
    );
  }

  // Cut out the characters between offset and offset+length
  const updated = targetLine.slice(0, offset) + targetLine.slice(offset + length);

  lines[line] = updated;

  return lines.join('\n');
}

/**
 * Validates an operation against the current content WITHOUT applying it.
 * Call this before applyInsert/applyDelete — if it returns invalid, don't apply.
 * @param {string} content
 * @param {{ type: "insert"|"delete", line: number, offset: number, text?: string, length?: number }} op
 * @returns {{ valid: boolean, reason?: string }}
 */
export function validateOp(content, op) {
  const lines = content.split('\n');

  // Check op type
  if (op.type !== 'insert' && op.type !== 'delete') {
    return { valid: false, reason: `Unknown op type: ${op.type}` };
  }

  // Check line exists
  if (op.line < 0 || op.line >= lines.length) {
    return {
      valid: false,
      reason: `Line ${op.line} does not exist (document has ${lines.length} lines)`,
    };
  }

  const targetLine = lines[op.line];

  // Check offset is within line bounds
  if (op.offset < 0 || op.offset > targetLine.length) {
    return {
      valid: false,
      reason: `Offset ${op.offset} is out of bounds for line ${op.line} (length ${targetLine.length})`,
    };
  }

  if (op.type === 'insert') {
    if (typeof op.text !== 'string') {
      return { valid: false, reason: 'Insert op must have a text field (string)' };
    }
  }

  if (op.type === 'delete') {
    if (typeof op.length !== 'number' || op.length < 1) {
      return { valid: false, reason: 'Delete op must have a length field (number >= 1)' };
    }
    if (op.offset + op.length > targetLine.length) {
      return {
        valid: false,
        reason: `offset ${op.offset} + length ${op.length} exceeds line ${op.line} length (${targetLine.length})`,
      };
    }
  }

  return { valid: true };
}
