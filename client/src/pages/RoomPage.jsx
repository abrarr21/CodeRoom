
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import ParticipantsSidebar from "../components/room/ParticipantsSidebar";
import CodeEditorPanel from "../components/room/CodeEditorPanel";
import { socket } from "../socket/clientSocket";

const SESSION_STORAGE_PREFIX = "coderoom:session:";
const PARTICIPANT_STORAGE_PREFIX = "coderoom:participant:";

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
  const [connected, setConnected] = useState(false);
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState("");
  const [roomTitle, setRoomTitle] = useState(
    localStorage.getItem(`coderoom:roomName:${roomCode}`) || "Code Room",
  );
  const [locksByLine, setLocksByLine] = useState({});
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [isCurrentUserHost, setIsCurrentUserHost] = useState(false);

  const sessionIdRef = useRef(null);
  const participantIdRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const sequenceRef = useRef(0);
  const currentLockedLineRef = useRef(null);

  const lineByParticipantId = useMemo(() => {
    const entries = Object.entries(locksByLine);
    return entries.reduce((accumulator, [line, participantId]) => {
      accumulator[participantId] = Number(line);
      return accumulator;
    }, {});
  }, [locksByLine]);

  useEffect(() => {
    if (!error) return;

    const timeoutId = setTimeout(() => {
      setError("");
    }, 3000);

    return () => clearTimeout(timeoutId);
  }, [error]);

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

      const currentParticipant = (nextParticipants || []).find(
        (participant) => participant.sessionId === sessionIdRef.current,
      );
      setIsCurrentUserHost(Boolean(currentParticipant?.isHost));
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
      }
    };

    const handleLockGranted = ({ line, clientId }) => {
      setLocksByLine((prev) => ({
        ...prev,
        [line]: clientId,
      }));
    };

    const handleLockReleased = ({ line }) => {
      setLocksByLine((prev) => {
        const next = { ...prev };
        delete next[line];
        return next;
      });
    };

    const handleLocksSync = ({ locks }) => {
      setLocksByLine(locks || {});
    };

    const handleLockDenied = ({ line }) => {
      setError(`Line ${line + 1} is being edited by another participant.`);
    };

    const handleRoomClosed = () => {
      setError("Room has been closed by the host.");
      navigate("/");
    };

    const handleRoomError = ({ message }) => {
      setError(message || "Socket error occurred.");
    };

    const handleRoomRenamed = ({ title }) => {
      setRoomTitle(title || "Code Room");
      localStorage.setItem(`coderoom:roomName:${roomCode}`, title || "Code Room");
    };

    const handleSyncError = ({ reason }) => {
      setError(reason || "Could not sync the document update.");
    };

    const handleParticipantRemoved = () => {
      if (socket.connected) {
        socket.disconnect();
      }

      setError("You were removed from the room by the host.");
      navigate("/");
    };

    socket.on("presence:participants", handleParticipants);
    socket.on("presence:typing", handleTyping);
    socket.on("doc:delta-applied", handleDeltaApplied);
    socket.on("room:closed", handleRoomClosed);
    socket.on("room:error", handleRoomError);
    socket.on("room:renamed", handleRoomRenamed);
    socket.on("doc:sync-error", handleSyncError);
    socket.on("doc:lock-granted", handleLockGranted);
    socket.on("doc:lock-released", handleLockReleased);
    socket.on("doc:lock-denied", handleLockDenied);
    socket.on("doc:locks-sync", handleLocksSync);
    socket.on("participant:removed", handleParticipantRemoved);

    const persistedSession =
      location.state?.sessionId ||
      localStorage.getItem(`${SESSION_STORAGE_PREFIX}${roomCode}`);
    const persistedParticipantId =
      location.state?.participantId ||
      localStorage.getItem(`${PARTICIPANT_STORAGE_PREFIX}${roomCode}`);

    const eventName = persistedSession ? "room:reconnect" : "room:join";
    const payload = persistedSession
      ? {
          roomCode,
          displayName,
          participantId: persistedParticipantId,
          sessionId: persistedSession,
        }
      : {
          roomCode,
          displayName,
          sessionId: persistedSession,
        };


    socket.emit(
      eventName,
      payload,
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
        setRoomTitle(snapshot?.title || "Code Room");
        setLocksByLine(snapshot?.locks || {});
        const currentParticipant = (snapshot?.participants || []).find(
          (participant) => participant.sessionId === sessionId,
        );
        setIsCurrentUserHost(Boolean(currentParticipant?.isHost));
        setContent(snapshot?.document?.content || "");
        sequenceRef.current = snapshot?.document?.lastSequence || 0;

        localStorage.setItem("coderoom:displayName", displayName);
        localStorage.setItem(`${SESSION_STORAGE_PREFIX}${roomCode}`, sessionId);
        localStorage.setItem(`${PARTICIPANT_STORAGE_PREFIX}${roomCode}`, participantId);
        localStorage.setItem(`coderoom:roomName:${roomCode}`, snapshot?.title || "Code Room");
      },
    );

    return () => {
      if (currentLockedLineRef.current !== null && participantIdRef.current) {
        socket.emit("doc:lock-release", {
          roomCode,
          clientId: participantIdRef.current,
          line: currentLockedLineRef.current,
        });
      }

      socket.off("presence:participants", handleParticipants);
      socket.off("presence:typing", handleTyping);
      socket.off("doc:delta-applied", handleDeltaApplied);
      socket.off("room:closed", handleRoomClosed);
      socket.off("room:error", handleRoomError);
      socket.off("room:renamed", handleRoomRenamed);
      socket.off("doc:sync-error", handleSyncError);
      socket.off("doc:lock-granted", handleLockGranted);
      socket.off("doc:lock-released", handleLockReleased);
      socket.off("doc:lock-denied", handleLockDenied);
      socket.off("doc:locks-sync", handleLocksSync);
      socket.off("participant:removed", handleParticipantRemoved);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [displayName, navigate, roomCode, location.state?.sessionId, location.state?.participantId]);

  const emitTyping = () => {
    const sessionId = sessionIdRef.current;
    if (!sessionId) return;

    setTypingBySessionId((prev) => ({
      ...prev,
      [sessionId]: true,
    }));

    socket.emit("presence:typing", {
      roomCode,
      sessionId,
      isTyping: true,
    });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setTypingBySessionId((prev) => ({
        ...prev,
        [sessionId]: false,
      }));

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

    socket.emit("doc:delta", {
      roomCode,
      clientId: participantIdRef.current,
      sequence: nextSequence,
      op: operation,
    });

    emitTyping();
  };

  const handleLeaveRoom = () => {
    if (currentLockedLineRef.current !== null && participantIdRef.current) {
      socket.emit("doc:lock-release", {
        roomCode,
        clientId: participantIdRef.current,
        line: currentLockedLineRef.current,
      });
    }

    if (socket.connected) {
      socket.disconnect();
    }

    navigate("/");
  };

  const handleCursorLineChange = (line) => {
    if (!joined || !participantIdRef.current || line === undefined || line === null) {
      return;
    }

    const previousLine = currentLockedLineRef.current;
    if (previousLine === line) {
      return;
    }

    if (previousLine !== null) {
      socket.emit("doc:lock-release", {
        roomCode,
        clientId: participantIdRef.current,
        line: previousLine,
      });
    }

    currentLockedLineRef.current = line;
    socket.emit("doc:lock-request", {
      roomCode,
      clientId: participantIdRef.current,
      line,
    });
  };

  const handleRenameRoom = (nextTitle) => {
    if (!isCurrentUserHost || !sessionIdRef.current) {
      return;
    }

    const trimmed = nextTitle.trim();
    if (!trimmed) {
      setError("Room title cannot be empty.");
      return;
    }

    socket.emit("room:rename", {
      roomCode,
      sessionId: sessionIdRef.current,
      title: trimmed,
    });
  };

  const handleRemoveParticipant = (participantId) => {
    if (!isCurrentUserHost || !sessionIdRef.current || !participantId) {
      return;
    }

    socket.emit("participant:remove", {
      roomCode,
      sessionId: sessionIdRef.current,
      participantId,
    });
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="flex min-h-screen flex-col md:flex-row">
        <ParticipantsSidebar
          participants={participants}
          typingBySessionId={typingBySessionId}
          lineByParticipantId={lineByParticipantId}
          currentSessionId={currentSessionId}
          isCurrentUserHost={isCurrentUserHost}
          onRemoveParticipant={handleRemoveParticipant}
          onLeaveRoom={handleLeaveRoom}
        />

        <CodeEditorPanel
          value={content}
          onChange={handleEditorChange}
          connected={connected}
          roomCode={roomCode}
          roomTitle={roomTitle}
          isHost={isCurrentUserHost}
          onRenameRoom={handleRenameRoom}
          onCursorLineChange={handleCursorLineChange}
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