export function ensureSessionId() {
  const key = "coderoom_session_id";
  const existing = window.localStorage.getItem(key);
  if (existing) {
    return existing;
  }

  const value = crypto.randomUUID();
  window.localStorage.setItem(key, value);
  return value;
}
