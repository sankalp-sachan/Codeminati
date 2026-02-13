import { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Download, Save, Terminal, FileCode, RotateCcw, Info, Check, AlertTriangle, Copy, X, TerminalSquare } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

const Compiler = () => {
    const { user } = useAuth();
    const [language, setLanguage] = useState('python');
    const [code, setCode] = useState(`# Write your code here\nprint("Hello, ${user?.name || 'Coder'}!")\n`);
    const [terminalLines, setTerminalLines] = useState([]);
    const [currentInput, setCurrentInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [isExecuting, setIsExecuting] = useState(false);
    const socketRef = useRef(null);
    const terminalEndRef = useRef(null);
    const inputRef = useRef(null);

    const defaultCodes = {
        python: '# Write your code here\nname = input("Enter your name: ")\nprint(f"Hello, {name}!")',
        cpp: '#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n    string name;\n    cout << "Enter your name: ";\n    cin >> name;\n    cout << "Hello, " << name << "!" << endl;\n    return 0;\n}',
        c: '#include <stdio.h>\n\nint main() {\n    char name[100];\n    printf("Enter your name: ");\n    scanf("%s", name);\n    printf("Hello, %s!\\n", name);\n    return 0;\n}',
        javascript: 'const readline = require("readline").createInterface({\n  input: process.stdin,\n  output: process.stdout\n});\n\nreadline.question("Enter your name: ", name => {\n  console.log(`Hello, ${name}!`);\n  readline.close();\n});'
    };

    useEffect(() => {
        const socketUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://codeminati-backend.onrender.com';
        socketRef.current = io(socketUrl, {
            withCredentials: true,
            transports: ['websocket']
        });

        socketRef.current.on('terminal:output', (data) => {
            setTerminalLines(prev => [...prev, { type: 'output', text: data }]);
        });

        socketRef.current.on('terminal:exit', ({ code, error }) => {
            setIsExecuting(false);
            setLoading(false);
            setTerminalLines(prev => [
                ...prev,
                { type: 'system', text: error ? `\n[Error: ${error}]` : `\n[Process exited with code ${code}]` }
            ]);
        });

        socketRef.current.on('terminal:error', (err) => {
            setIsExecuting(false);
            setLoading(false);
            setTerminalLines(prev => [...prev, { type: 'error', text: `\n[System Error: ${err}]` }]);
            toast.error('Execution Error');
        });

        return () => {
            if (socketRef.current) socketRef.current.disconnect();
        };
    }, []);

    useEffect(() => {
        terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [terminalLines, isExecuting]);

    const handleLanguageChange = (e) => {
        const lang = e.target.value;
        setLanguage(lang);
        setCode(defaultCodes[lang] || '');
    };

    const handleRun = () => {
        if (!socketRef.current) return;
        setLoading(true);
        setIsExecuting(true);
        setTerminalLines([{ type: 'system', text: `Executing ${language} program...\n` }]);
        setCurrentInput('');

        socketRef.current.emit('terminal:run', { language, code });

        // Focus terminal input
        setTimeout(() => inputRef.current?.focus(), 100);
    };

    const handleStop = () => {
        socketRef.current?.emit('terminal:stop');
    };

    const handleTerminalKeyDown = (e) => {
        if (e.key === 'Enter') {
            const val = currentInput;
            setCurrentInput('');
            setTerminalLines(prev => [...prev, { type: 'input', text: val + '\n' }]);
            socketRef.current?.emit('terminal:input', val);
        }
    };

    const handleSave = () => {
        const extensions = { python: 'py', cpp: 'cpp', c: 'c', javascript: 'js' };
        const blob = new Blob([code], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `main.${extensions[language] || 'txt'}`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Source saved');
    };

    const copyTerminal = () => {
        const text = terminalLines.map(l => l.text).join('');
        navigator.clipboard.writeText(text);
        toast.success('Terminal output copied');
    };

    return (
        <div className="h-[calc(100vh-64px)] flex flex-col bg-[#0f0f15] text-gray-300 overflow-hidden">
            {/* Toolbar */}
            <div className="h-14 shrink-0 border-b border-gray-800 bg-[#1e1e1e] flex items-center justify-between px-6 shadow-md z-10">
                <div className="flex items-center space-x-4">
                    <div className="bg-blue-600/20 p-2 rounded-lg border border-blue-500/30">
                        <TerminalSquare className="h-5 w-5 text-blue-400" />
                    </div>
                    <h1 className="text-base font-bold tracking-tight text-gray-100 hidden sm:block">Interactive Playground</h1>

                    <select
                        value={language}
                        onChange={handleLanguageChange}
                        className="bg-[#2d2d2d] text-gray-200 rounded-md px-3 py-1.5 text-sm border border-gray-700 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all cursor-pointer font-medium"
                    >
                        <option value="python">Python</option>
                        <option value="cpp">C++</option>
                        <option value="c">C</option>
                        {/* <option value="javascript">Node.js</option> */}
                    </select>
                </div>

                <div className="flex items-center space-x-3">
                    <button
                        onClick={handleSave}
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors border border-transparent hover:border-gray-700"
                        title="Download Code"
                    >
                        <Download className="h-5 w-5" />
                    </button>

                    {isExecuting ? (
                        <button
                            onClick={handleStop}
                            className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-bold flex items-center space-x-2 shadow-lg shadow-red-900/20 active:scale-95 transition-all"
                        >
                            <X className="h-4 w-4" />
                            <span>Stop</span>
                        </button>
                    ) : (
                        <button
                            onClick={handleRun}
                            disabled={loading}
                            className="px-6 py-2 rounded-lg bg-green-600 hover:bg-green-500 disabled:bg-gray-700 text-white text-sm font-bold flex items-center space-x-2 shadow-lg shadow-green-900/20 active:scale-95 transition-all"
                        >
                            <Play className="h-4 w-4 fill-current" />
                            <span>Run</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Main Workspace */}
            <div className="flex-1 flex overflow-hidden">
                {/* Monaco Editor */}
                <div className="flex-1 min-w-0 bg-[#1e1e1e] flex flex-col">
                    <div className="h-8 flex items-center px-4 bg-[#252526] text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-gray-800">
                        Source Code Editor
                    </div>
                    <div className="flex-1">
                        <Editor
                            height="100%"
                            language={language}
                            theme="vs-dark"
                            value={code}
                            onChange={setCode}
                            options={{
                                fontSize: 14,
                                minimap: { enabled: false },
                                scrollBeyondLastLine: false,
                                automaticLayout: true,
                                padding: { top: 20 },
                                fontFamily: "'Fira Code', monospace",
                                smoothScrolling: true,
                                cursorSmoothCaretAnimation: "on"
                            }}
                        />
                    </div>
                </div>

                {/* VS Code Style Interactive Terminal */}
                <div className="w-[400px] lg:w-[500px] shrink-0 flex flex-col bg-[#0b0b0e] border-l border-gray-800">
                    {/* Header */}
                    <div className="h-9 shrink-0 bg-[#1e1e1e] border-b border-gray-800 flex items-center justify-between px-4 select-none">
                        <div className="flex space-x-4">
                            <span className="text-[11px] font-bold text-blue-400 border-b-2 border-blue-500 py-2.5">Output </span>
                            {/* <span className="text-[11px] font-medium text-gray-500 hover:text-gray-300 py-2.5 cursor-pointer">DEBUG CONSOLE</span> */}
                        </div>
                        <div className="flex items-center space-x-3 text-gray-500">
                            <button onClick={copyTerminal} className="hover:text-white transition-colors"><Copy className="h-3.5 w-3.5" /></button>
                            <button onClick={() => setTerminalLines([])} className="hover:text-white transition-colors"><RotateCcw className="h-3.5 w-3.5" /></button>
                            <X className="h-4 w-4 hover:text-red-400 cursor-pointer" />
                        </div>
                    </div>

                    {/* Terminal History */}
                    <div
                        className="flex-1 overflow-y-auto p-4 font-mono text-sm leading-relaxed custom-scrollbar bg-[#16161a]"
                        onClick={() => inputRef.current?.focus()}
                    >
                        {terminalLines.map((line, idx) => (
                            <span
                                key={idx}
                                className={`whitespace-pre-wrap break-words ${line.type === 'input' ? 'text-blue-400 font-bold' :
                                    line.type === 'system' ? 'text-gray-500 italic' :
                                        line.type === 'error' ? 'text-red-400' : 'text-gray-300'
                                    }`}
                            >
                                {line.text}
                            </span>
                        ))}

                        {/* Static Input Line */}
                        {isExecuting && (
                            <div className="inline-flex w-full items-center text-green-400 font-bold">
                                <span className="mr-2">❯</span>
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={currentInput}
                                    onChange={(e) => setCurrentInput(e.target.value)}
                                    onKeyDown={handleTerminalKeyDown}
                                    className="flex-1 bg-transparent border-none outline-none text-white font-mono caret-blue-500"
                                    autoFocus
                                />
                            </div>
                        )}
                        <div ref={terminalEndRef} className="h-4" />
                    </div>

                    {/* Footer Info */}
                    <div className="h-7 bg-[#007acc] text-white flex items-center justify-between px-3 text-[10px] font-medium select-none">
                        <div className="flex items-center space-x-3">
                            <div className="flex items-center gap-1"><Check size={12} /> 0 Errors</div>
                            <div className="flex items-center gap-1 opacity-80"><Info size={12} /> Connected to Cluster</div>
                        </div>
                        <div className="flex items-center space-x-3 uppercase">
                            <span>UTF-8</span>
                            <span>{language}</span>
                            <div className="flex items-center bg-white/20 px-1 rounded">MASTER</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Compiler;
