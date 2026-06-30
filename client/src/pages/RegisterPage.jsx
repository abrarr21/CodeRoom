import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createRoom, getApiErrorMessage } from "../api/http";

const RegisterPage = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [roomName, setRoomName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [roomCode, setRoomCode] = useState("");

  const withIdentity = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      throw new Error("Please enter your name");
    }

    setName(trimmed);
    return { name: trimmed };
  };

  const handleCreateRoom = async () => {
    setError("");
    setLoading(true);

    try {
      const identity = withIdentity();
      const data = await createRoom({
        name: identity.name,
        title: roomName.trim() || undefined,
      });

      const createdRoomCode = data.data.room.roomCode;
      const createdSessionId = data.data.sessionId;
      setRoomCode(createdRoomCode);
      localStorage.setItem("coderoom:displayName", identity.name);
      if (createdSessionId) {
        localStorage.setItem(`coderoom:session:${createdRoomCode}`, createdSessionId);
      }

      localStorage.setItem(`coderoom:roomName:${createdRoomCode}`, data.data.room.title || "");

      navigate(`/room-code/${createdRoomCode}`, {
        state: {
          roomCode: createdRoomCode,
          participantId: data.data.participantId,
          sessionId: createdSessionId,
          displayName: identity.name,
          roomName: roomName.trim() || "",
        },
      });
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "An error occurred while creating the room."));
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    setError("");
    setLoading(true);

    try {
      const identity = withIdentity();
      const normalizedCode = roomCode.trim().toUpperCase();
      localStorage.setItem("coderoom:displayName", identity.name);
      localStorage.setItem(`coderoom:roomName:${normalizedCode}`, roomName.trim() || "");

      navigate(`/room/${normalizedCode}`, {
        state: {
          roomCode: normalizedCode,
          displayName: identity.name,
          roomName: roomName.trim() || "",
        },
      });
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "An error occurred while joining the room."));
    } finally {
      setLoading(false);
    }
  };


  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-10 text-slate-100">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(37,99,235,0.22),transparent_52%)]" />
      </div>

      <section className="relative z-10 w-full max-w-lg rounded-xl border border-slate-700/60 bg-slate-900/85 p-7 shadow-[0_0_0_1px_rgba(30,41,59,0.5),0_22px_80px_rgba(2,6,23,0.85)] backdrop-blur-lg sm:p-8">
        <header className="text-center">
          <h1 className="text-4xl font-black tracking-tight text-blue-300 sm:text-[2.7rem]">
            CodeRoom
          </h1>
          <p className="mt-2 text-sm font-medium tracking-wider text-slate-300">
            Code together, live.
          </p>
        </header>

        <div className="mt-8 space-y-6">
          <div className="space-y-2">
            <label
              htmlFor="displayName"
              className="text-[0.7rem] font-semibold tracking-[0.18em] text-slate-400 uppercase"
            >
              Display Name / Handle
            </label>
            <div className="flex items-center gap-2 rounded-md border border-slate-700 bg-slate-950/80 px-3">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-4 w-4 shrink-0 text-slate-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 21a8 8 0 0 0-16 0" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <input
                id="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                type="text"
                placeholder="e.g. dev_ninja_01"
                className="h-11 w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="roomName" className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Room Name (optional)
            </label>
            <div className="flex items-center gap-2 rounded-md border border-slate-700 bg-slate-950/80 px-3">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-4 w-4 shrink-0 text-slate-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 10.5 12 4l9 6.5" />
                <path d="M5 9.5V20h14V9.5" />
                <path d="M9 20v-6h6v6" />
              </svg>

              <input
                id="roomName"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                type="text"
                placeholder="e.g. dev Room"
                className="h-11 w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="h-px bg-slate-800" />

          <button
            type="button"
            onClick={handleCreateRoom}
            disabled={loading}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-md bg-blue-200/90 text-lg font-semibold text-slate-900 transition hover:bg-blue-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="text-xl leading-none">+</span>
            <span>{loading ? "Please wait..." : "Create Room"}</span>
          </button>

          {error && <p className="mt-2 text-center text-sm font-medium text-red-500">{error}</p>}

          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-slate-800" />
            <span className="text-xs font-semibold tracking-[0.22em] text-slate-400">OR</span>
            <div className="h-px flex-1 bg-slate-800" />
          </div>

          <div className="flex gap-2 sm:gap-3">
            <div className="flex flex-1 items-center gap-2 rounded-md border border-slate-700 bg-slate-950/80 px-3">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-4 w-4 shrink-0 text-slate-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="7.5" cy="15.5" r="5.5" />
                <path d="m21 2-9.6 9.6" />
                <path d="m15.5 7.5 1.7 1.7" />
              </svg>
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                placeholder="Enter Room Code"
                className="h-11 w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={handleJoinRoom}
              disabled={loading}
              className="h-11 min-w-16 rounded-md bg-slate-700 px-4 text-sm font-semibold text-slate-100 transition hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "..." : "Join"}
            </button>
          </div>
        </div>

        <footer className="mt-10 flex items-center justify-center gap-3 text-xs text-slate-500">
          <div className="flex -space-x-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-900 bg-violet-300 text-[0.58rem] font-bold text-slate-900">
              JD
            </span>
            <span className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-900 bg-amber-300 text-[0.58rem] font-bold text-slate-900">
              MK
            </span>
            <span className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-900 bg-blue-300 text-[0.58rem] font-bold text-slate-900">
              AL
            </span>
            <span className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-900 bg-slate-700 text-[0.62rem] font-semibold text-slate-200">
              +4
            </span>
          </div>
          <p>Collaborate in real-time with zero latency.</p>
        </footer>
      </section>
    </main>
  );
};

export default RegisterPage;
