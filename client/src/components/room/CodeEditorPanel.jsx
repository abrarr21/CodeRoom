import ReactAce from "react-ace";
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/theme-tomorrow_night";
import "ace-builds/src-noconflict/ext-language_tools";

const AceEditor = ReactAce?.default || ReactAce;

const CodeEditorPanel = ({ value, onChange, connected, roomCode, sequence }) => {
  return (
    <section className="flex min-h-[70vh] w-full flex-1 flex-col bg-[#050b18] md:w-3/4">
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2.5">
        <div className="flex items-center gap-2 text-sm">
          welcome to <span className="font-semibold text-blue-300">{roomCode}</span>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-slate-700/80 bg-slate-900/70 px-3 py-1 text-xs text-slate-200">
          <span className={`h-2 w-2 rounded-full ${connected ? "bg-emerald-400" : "bg-amber-400"}`} />
          {connected ? "Connected" : "Connecting..."}
          <span className="ml-1 font-semibold text-blue-300">{roomCode}</span>
          <span className="ml-2 text-slate-400">v{sequence}</span>
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
