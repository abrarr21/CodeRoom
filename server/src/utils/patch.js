function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function transformIndex(index, op) {
  if (op.type === "insert") {
    if (op.index <= index) {
      return index + op.text.length;
    }
    return index;
  }

  if (op.type === "delete") {
    if (op.index < index) {
      const shifted = index - Math.min(op.length, index - op.index);
      return Math.max(shifted, op.index);
    }
    return index;
  }

  return index;
}

export function transformDelta(delta, historyOps) {
  let nextIndex = delta.index;
  for (const item of historyOps) {
    nextIndex = transformIndex(nextIndex, item.op);
  }

  return {
    ...delta,
    index: nextIndex,
  };
}

export function applyDelta(content, delta) {
  if (delta.type === "insert") {
    const index = clamp(delta.index, 0, content.length);
    const left = content.slice(0, index);
    const right = content.slice(index);
    return {
      nextContent: `${left}${delta.text}${right}`,
      applied: { ...delta, index },
    };
  }

  if (delta.type === "delete") {
    const index = clamp(delta.index, 0, content.length);
    const length = clamp(delta.length, 0, content.length - index);
    const left = content.slice(0, index);
    const right = content.slice(index + length);
    return {
      nextContent: `${left}${right}`,
      applied: { ...delta, index, length },
    };
  }

  throw new Error("Unsupported delta type");
}
