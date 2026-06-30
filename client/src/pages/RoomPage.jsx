
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import ParticipantsSidebar from "../components/room/ParticipantsSidebar";
import CodeEditorPanel from "../components/room/CodeEditorPanel";
import { socket } from "../socket/clientSocket";

const SESSION_STORAGE_PREFIX = "coderoom:session:";

const getInsertOperation = (delta) => {
  const text = delta.lines.join("\n");
  if (!text) return null;

  return {
    type: "insert",
    line: delta.start.row,
    offset: delta.start.column,
    text,
  };
};

const getDeleteOperation = (delta) => {
  if (delta.start.row !== delta.end.row) {
    return null;
  }

  const removedText = delta.lines.join("\n");
  if (!removedText) return null;

  return {
    type: "delete",
    line: delta.start.row,
    offset: delta.start.column,
    length: removedText.length,
  };
};

const RoomPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { code } = useParams();

  const displayName = useMemo(() => {
    return (
      location.state?.displayName ||
      localStorage.getItem("coderoom:displayName") ||
      "Guest"
    );
  }, [location.state?.displayName]);

  const roomCode = useMemo(() => (code || "").toUpperCase(), [code]);

  const [participants, setParticipants] = useState([]);
  const [typingBySessionId, setTypingBySessionId] = useState({});
  const [content, setContent] = useState("");
  const [sequence, setSequence] = useState(0);
  const [connected, setConnected] = useState(false);
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState("");
  const [currentSessionId, setCurrentSessionId] = useState(null);

  const sessionIdRef = useRef(null);
  const participantIdRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const sequenceRef = useRef(0);

  useEffect(() => {
    if (!roomCode) {
      navigate("/");
      return;
    }

    if (!socket.connected) {
      socket.connect();
    }

    const handleParticipants = ({ participants: nextParticipants }) => {
      setParticipants(nextParticipants || []);
    };

    const handleTyping = ({ sessionId, isTyping }) => {
      if (!sessionId) return;
      setTypingBySessionId((prev) => ({
        ...prev,
        [sessionId]: Boolean(isTyping),
      }));
    };

    const handleDeltaApplied = ({ content: nextContent, sequence: nextSequence }) => {
      if (typeof nextContent === "string") {
        setContent(nextContent);
      }

      if (typeof nextSequence === "number") {
        sequenceRef.current = nextSequence;
        setSequence(nextSequence);
      }
    };

    const handleRoomClosed = () => {
      setError("Room has been closed by the host.");
      navigate("/");
    };

    const handleRoomError = ({ message }) => {
      setError(message || "Socket error occurred.");
    };

    const handleSyncError = ({ reason }) => {
      setError(reason || "Could not sync the document update.");
    };

    socket.on("presence:participants", handleParticipants);
    socket.on("presence:typing", handleTyping);
    socket.on("doc:delta-applied", handleDeltaApplied);
    socket.on("room:closed", handleRoomClosed);
    socket.on("room:error", handleRoomError);
    socket.on("doc:sync-error", handleSyncError);

    const persistedSession =
      location.state?.sessionId ||
      localStorage.getItem(`${SESSION_STORAGE_PREFIX}${roomCode}`);

    socket.emit(
      "room:join",
      {
        roomCode,
        displayName,
        sessionId: persistedSession,
      },
      (response) => {
        if (!response?.success) {
          setError(response?.error || "Unable to join room.");
          return;
        }

        const { snapshot, participantId, sessionId } = response;

        participantIdRef.current = participantId;
        sessionIdRef.current = sessionId;
        setCurrentSessionId(sessionId);

        setConnected(true);
        setJoined(true);
        setError("");
        setParticipants(snapshot?.participants || []);
        setContent(snapshot?.document?.content || "");
        sequenceRef.current = snapshot?.document?.lastSequence || 0;
        setSequence(snapshot?.document?.lastSequence || 0);

        localStorage.setItem("coderoom:displayName", displayName);
        localStorage.setItem(`${SESSION_STORAGE_PREFIX}${roomCode}`, sessionId);
      },
    );

    return () => {
      socket.off("presence:participants", handleParticipants);
      socket.off("presence:typing", handleTyping);
      socket.off("doc:delta-applied", handleDeltaApplied);
      socket.off("room:closed", handleRoomClosed);
      socket.off("room:error", handleRoomError);
      socket.off("doc:sync-error", handleSyncError);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [displayName, navigate, roomCode, location.state?.sessionId]);

  const emitTyping = () => {
    const sessionId = sessionIdRef.current;
    if (!sessionId) return;

    socket.emit("presence:typing", {
      roomCode,
      sessionId,
      isTyping: true,
    });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("presence:typing", {
        roomCode,
        sessionId,
        isTyping: false,
      });
    }, 900);
  };

  const handleEditorChange = (nextValue, delta) => {
    setContent(nextValue);

    if (!joined || !delta || !participantIdRef.current) {
      return;
    }

    const operation =
      delta.action === "insert"
        ? getInsertOperation(delta)
        : getDeleteOperation(delta);

    if (!operation) {
      setError("Multi-line delete is not supported yet in this sync model.");
      return;
    }

    const nextSequence = sequenceRef.current + 1;
    sequenceRef.current = nextSequence;
    setSequence(nextSequence);

    socket.emit("doc:delta", {
      roomCode,
      clientId: participantIdRef.current,
      sequence: nextSequence,
      op: operation,
    });

    emitTyping();
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="flex min-h-screen flex-col md:flex-row">
        <ParticipantsSidebar
          participants={participants}
          typingBySessionId={typingBySessionId}
          currentSessionId={currentSessionId}
        />

        <CodeEditorPanel
          value={content}
          onChange={handleEditorChange}
          connected={connected}
          roomCode={roomCode}
          sequence={sequence}
        />
      </div>

      {error && (
        <div className="fixed right-4 top-4 max-w-sm rounded-lg border border-rose-500/40 bg-rose-500/15 px-4 py-3 text-sm text-rose-200 shadow-lg">
          {error}
        </div>
      )}
    </main>
  );
};

export default RoomPage;