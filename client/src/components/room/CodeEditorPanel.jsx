import { useState } from "react";
import ReactAce from "react-ace";
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/theme-tomorrow_night";
import "ace-builds/src-noconflict/ext-language_tools";

const AceEditor = ReactAce?.default || ReactAce;

const CodeEditorPanel = ({ value, onChange, connected, roomCode }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyRoomCode = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 1800);
    } catch {
      setIsCopied(false);
    }
  };

  const roomName = localStorage.getItem(`coderoom:roomName:${roomCode}`) || "";
  return (
    <section className="flex min-h-[70vh] w-full flex-1 flex-col bg-[#050b18] md:w-3/4">
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2.5">
        <div className="flex items-center gap-2 text-sm">
          welcome to <span className="font-semibold text-blue-300">{roomName || "Code Room"}</span>
          <span className="flex gap-1 items-center "> | Invite others <button  onClick={handleCopyRoomCode}>
            {
            isCopied ? (
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#00ffff"><path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z"/></svg>
            ) : (
                 <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M760-200H320q-33 0-56.5-23.5T240-280v-560q0-33 23.5-56.5T320-920h280l240 240v400q0 33-23.5 56.5T760-200ZM560-640v-200H320v560h440v-360H560ZM160-40q-33 0-56.5-23.5T80-120v-560h80v560h440v80H160Zm160-800v200-200 560-560Z"/></svg>
            )
            }</button> </span>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-slate-700/80 bg-slate-900/70 px-3 py-1 text-xs text-slate-200">
          <span className={`h-2 w-2 rounded-full ${connected ? "bg-emerald-400" : "bg-amber-400"}`} />
          {connected ? "Connected" : "Connecting..."}
          <span className="ml-1 font-semibold text-blue-300">{roomCode}</span>
        
        </div>
      </div>

      <div className="relative flex-1">
        <AceEditor
          mode="javascript"
          theme="tomorrow_night"
          name="coderoom-editor"
          width="100%"
          height="100%"
          value={value}
          onChange={onChange}
          fontSize={15}
          showPrintMargin={false}
          highlightActiveLine
          setOptions={{
            enableBasicAutocompletion: true,
            enableLiveAutocompletion: true,
            tabSize: 2,
            useWorker: false,
          }}
          editorProps={{ $blockScrolling: true }}
        />
      </div>
    </section>
  );
};

export default CodeEditorPanel;
