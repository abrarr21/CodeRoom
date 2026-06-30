/**
 * Splits the document into lines, lets you mutate one line,
 * then joins back. All three functions below use this same pattern.
 */

/**
 * Inserts text at the specified line and character offset.
 * If the inserted text contains '\n', new lines are created automatically
 * when the document is joined back together.
 */
export const applyInsert = (content, line, offset, text) => {
  const lines = content.split('\n');

  if (line < 0 || line >= lines.length) {
    throw new Error(
      `applyInsert: line ${line} does not exist (document has ${lines.length} lines)`
    );
  }

  if (offset < 0 || offset > lines[line].length) {
    throw new Error(
      `applyInsert: offset ${offset} is out of bounds for line ${line} (length ${lines[line].length})`
    );
  }

  // Replace the target line with the text inserted at the given offset.
  lines[line] = lines[line].slice(0, offset) + text + lines[line].slice(offset);

  return lines.join('\n');
};

/**
 * Deletes `length` characters starting from the specified line and offset.
 */
export const applyDelete = (content, line, offset, length) => {
  const lines = content.split('\n');

  if (line < 0 || line >= lines.length) {
    throw new Error(
      `applyDelete: line ${line} does not exist (document has ${lines.length} lines)`
    );
  }

  if (offset < 0 || offset > lines[line].length) {
    throw new Error(
      `applyDelete: offset ${offset} is out of bounds for line ${line} (length ${lines[line].length})`
    );
  }

  if (offset + length > lines[line].length) {
    throw new Error(
      `applyDelete: offset ${offset} + length ${length} exceeds line ${line} length (${lines[line].length})`
    );
  }

  // Keep everything before the deletion and append everything after it.
  lines[line] = lines[line].slice(0, offset) + lines[line].slice(offset + length);

  return lines.join('\n');
};

/**
 * Validates an operation without modifying the document.
 * Returns the reason if the operation cannot be safely applied.
 */
export const validateOperation = (content, operation) => {
  const lines = content.split('\n');

  if (!['insert', 'delete'].includes(operation.type)) {
    return {
      valid: false,
      reason: `Unknown operation type: ${operation.type}`,
    };
  }

  if (operation.line < 0 || operation.line >= lines.length) {
    return {
      valid: false,
      reason: `Line ${operation.line} does not exist (document has ${lines.length} lines)`,
    };
  }

  const line = lines[operation.line];

  if (operation.offset < 0 || operation.offset > line.length) {
    return {
      valid: false,
      reason: `Offset ${operation.offset} is out of bounds for line ${operation.line} (length ${line.length})`,
    };
  }

  // Inserts require the text that will be added.
  if (operation.type === 'insert' && typeof operation.text !== 'string') {
    return {
      valid: false,
      reason: 'Insert operation must have a text field (string)',
    };
  }

  if (operation.type === 'delete') {
    if (typeof operation.length !== 'number' || operation.length < 1) {
      return {
        valid: false,
        reason: 'Delete operation must have a length field (number >= 1)',
      };
    }

    // Ensure the deletion does not extend past the end of the line.
    if (operation.offset + operation.length > line.length) {
      return {
        valid: false,
        reason: `Offset ${operation.offset} + length ${operation.length} exceeds line ${operation.line} length (${line.length})`,
      };
    }
  }

  return { valid: true };
};
