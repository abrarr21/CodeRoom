const getInitials = (name = "") => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
};

const avatarPalette = [
  "bg-blue-500/90",
  "bg-violet-500/90",
  "bg-emerald-500/90",
  "bg-amber-500/90",
  "bg-rose-500/90",
  "bg-cyan-500/90",
];

const getAvatarColor = (index) => avatarPalette[index % avatarPalette.length];

const ParticipantItem = ({ participant, index, isCurrentUser, isTyping }) => {
  const subtitle = isTyping
    ? "Typing..."
    : participant.online
      ? "Online"
      : "Offline";

  return (
    <li className="rounded-lg border border-slate-800/80 bg-slate-900/70 px-3 py-2.5">
      <div className="flex items-start gap-2.5">
        <span
          className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[0.68rem] font-semibold text-white ${getAvatarColor(index)}`}
        >
          {getInitials(participant.name)}
        </span>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-100">
            {participant.name}
            {participant.isHost ? " (Host)" : ""}
            {isCurrentUser ? " (You)" : ""}
          </p>
          <div className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-400">
            <span
              className={`h-2 w-2 rounded-full ${isTyping ? "bg-emerald-400" : participant.online ? "bg-blue-400" : "bg-slate-500"}`}
            />
            <span>{subtitle}</span>
          </div>
        </div>
      </div>
    </li>
  );
};

const ParticipantsSidebar = ({ participants, typingBySessionId, currentSessionId, onLeaveRoom }) => {
  return (
    <aside className="flex h-full min-h-[100vh] w-full flex-col border-b border-slate-800 bg-slate-950/80 md:w-1/4 md:border-b-0 md:border-r">
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
        <h2 className="text-xs font-semibold tracking-[0.18em] text-slate-300">PARTICIPANTS</h2>
        <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-xs font-bold text-blue-300">
          {participants.length}
        </span>
      </div>

      <ul className="flex-1 space-y-2 overflow-y-auto p-3">
        {participants.map((participant, index) => (
          <ParticipantItem
            key={participant.participantId || participant.sessionId || `${participant.name}-${index}`}
            participant={participant}
            index={index}
            isCurrentUser={participant.sessionId === currentSessionId}
            isTyping={Boolean(typingBySessionId[participant.sessionId])}
          />
        ))}
      </ul>

      <div className="border-t border-slate-800 p-3 mt-auto">
        <button
          type="button"
          onClick={onLeaveRoom}
          className="flex h-10 w-full items-center justify-center rounded-md border border-rose-500/40 bg-rose-500/10 text-sm font-semibold text-rose-300 transition hover:bg-rose-500/20"
        >
          Leave Room
        </button>
      </div>
    </aside>
  );
};

export default ParticipantsSidebar;
