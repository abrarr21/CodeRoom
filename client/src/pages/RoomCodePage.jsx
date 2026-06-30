
import { useState } from "react";

const RoomCodePage = () => {
  const roomCode = "CR-7X9B";
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyRoomCode = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 3000);
    } catch {
      setIsCopied(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-10 text-slate-100">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(37,99,235,0.22),transparent_52%)]" />
      </div>

      <section className="relative z-10 w-full max-w-sm rounded-2xl border border-slate-700/60 bg-slate-900/85 p-5 shadow-[0_0_0_1px_rgba(30,41,59,0.5),0_22px_80px_rgba(2,6,23,0.85)] backdrop-blur-sm sm:p-6">
        <header className="text-center">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl border border-slate-700 bg-slate-800/80 text-blue-300">
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 12.75 11.25 15 15 9.75" />
              <circle cx="12" cy="12" r="9" />
            </svg>
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-100">Room Created!</h1>
          <p className="mt-2 text-xs leading-5 text-slate-400">
            Your collaborative workspace is ready. Share the code below to invite your team.
          </p>
        </header>

        <div className="mt-6 rounded-lg border border-slate-700 bg-slate-800/70 px-4 py-4 text-center">
          <p className="text-[0.62rem] font-bold uppercase tracking-[0.24em] text-slate-400">Access Code</p>
          <p className="mt-2 text-3xl font-black tracking-[0.12em] text-blue-300">{roomCode}</p>
        </div>

        <div className="mt-4 space-y-3">
          <button
            type="button"
            onClick={handleCopyRoomCode}
            className={`flex h-10 w-full items-center justify-center gap-2 rounded-md text-xs font-semibold text-slate-100 transition ${
              isCopied ? "bg-emerald-600 hover:bg-emerald-500" : "bg-slate-700 hover:bg-slate-600"
            }`}
          >
            {isCopied ? (
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m5 13 4 4L19 7" />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="9" y="9" width="10" height="10" rx="2" />
                <path d="M5 15V7a2 2 0 0 1 2-2h8" />
              </svg>
            )}
            <span>{isCopied ? "Copied" : "Copy room code"}</span>
          </button>

          <button
            type="button"
            className="flex h-10 w-full items-center justify-center gap-2 rounded-md bg-blue-200/90 text-sm font-semibold text-slate-900 transition hover:bg-blue-200"
          >
            <span>Continue to Room</span>
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14" />
              <path d="m13 6 6 6-6 6" />
            </svg>
          </button>
        </div>

        
      </section>
    </main>
  )
}

export default RoomCodePage