import { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Download, Save, Terminal, FileCode, RotateCcw, Info, Check, AlertTriangle, Copy, X, TerminalSquare, Bot, Sparkles, Send, MessageSquare } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { useAI } from '../context/AIContext';
import client from '../api/client';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const Compiler = () => {
    const { user, activeClassroom } = useAuth();
    const { updateAIContext, resetAIContext, appliedCode, setAppliedCode } = useAI();
    const [language, setLanguage] = useState('python');
    const [code, setCode] = useState(`# Write your code here\nprint("Hello, ${user?.name || 'Coder'}!")\n`);

    // Handle code applied from AI
    useEffect(() => {
        if (appliedCode) {
            setCode(appliedCode);
            setAppliedCode(null);
            toast.success('Code applied to editor!');
            setActiveTab('output');
        }
    }, [appliedCode]);

    // Update AI Context
    useEffect(() => {
        updateAIContext({
            contextType: 'compiler',
            codeContext: {
                code,
                language
            }
        });
        return () => resetAIContext();
    }, [code, language]);
    const [terminalLines, setTerminalLines] = useState([]);
    const [currentInput, setCurrentInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [isExecuting, setIsExecuting] = useState(false);
    const socketRef = useRef(null);
    const terminalEndRef = useRef(null);
    const inputRef = useRef(null);
    const [activeTab, setActiveTab] = useState('output'); // 'output' or 'ai'
    const [aiMessages, setAiMessages] = useState([
        { role: 'model', content: "Hello! I'm your Code Assistant. I'm here EXCLUSIVELY to help you with programming, debugging, and optimization. Ask me anything about your code!" }
    ]);
    const [aiInput, setAiInput] = useState('');
    const [aiLoading, setAiLoading] = useState(false);
    const aiMessagesEndRef = useRef(null);

    const handleAISend = async (e) => {
        if (e) e.preventDefault();
        if (!aiInput.trim() || aiLoading) return;

        const userMsg = { role: 'user', content: aiInput };
        const newMessages = [...aiMessages, userMsg];
        setAiMessages(newMessages);
        setAiInput('');
        setAiLoading(true);

        try {
            const { data } = await client.post('/ai/chat', {
                messages: newMessages,
                contextType: 'compiler',
                codeContext: { code, language }
            });

            setAiMessages([...newMessages, { role: 'model', content: data.content }]);
        } catch (error) {
            console.error('AI Error:', error);
            const msg = error.response?.data?.message || 'Something went wrong.';
            setAiMessages([...newMessages, { role: 'model', content: `Sorry, I encountered an error: ${msg}` }]);
        } finally {
            setAiLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'ai') {
            aiMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [aiMessages, activeTab]);

    const defaultCodes = {
        python: '# Write your code here\nname = input("Enter your name: ")\nprint(f"Hello, {name}!")',
        cpp: '#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n    // Disable buffering for interactive terminal\n    setvbuf(stdout, NULL, _IONBF, 0);\n    \n    string name;\n    cout << "Enter your name: ";\n    cin >> name;\n    cout << "Hello, " << name << "!" << endl;\n    return 0;\n}',
        c: '#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // Disable buffering for interactive terminal\n    setvbuf(stdout, NULL, _IONBF, 0);\n\n    char name[100];\n    printf("Enter your name: ");\n    scanf("%s", name);\n    printf("Hello, %s!\\n", name);\n    return 0;\n}',
        javascript: 'const readline = require("readline").createInterface({\n  input: process.stdin,\n  output: process.stdout\n});\n\nreadline.question("Enter your name: ", name => {\n  console.log(`Hello, ${name}!`);\n  readline.close();\n});',
        java: 'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner scanner = new Scanner(System.in);\n        System.out.print("Enter your name: ");\n        String name = scanner.nextLine();\n        System.out.println("Hello, " + name + "!");\n    }\n}'
    };

    useEffect(() => {
        const socketUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://codeminati-backend.onrender.com';
        socketRef.current = io(socketUrl, {
            withCredentials: true,
            transports: ['websocket']
        });

        socketRef.current.on('terminal:output', (data) => {
            setTerminalLines(prev => [...prev, { type: 'output', text: data }]);
            
            // Sync terminal to classroom monitor if active
            if (activeClassroom && user) {
                socketRef.current.emit('classroom:terminal_output', {
                    classroomId: activeClassroom._id,
                    userId: user._id,
                    output: data
                });
            }
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

        // Classroom Monitoring Join
        if (activeClassroom && user) {
            socketRef.current.emit('classroom:join_session', {
                classroomId: activeClassroom._id,
                userId: user._id
            });
        }

        return () => {
            if (socketRef.current) socketRef.current.disconnect();
        };
    }, [activeClassroom?._id, user?._id]);

    // Real-time code update via Socket for Compiler
    useEffect(() => {
        if (socketRef.current && activeClassroom && user) {
            socketRef.current.emit('classroom:code_update', {
                classroomId: activeClassroom._id,
                userId: user._id,
                code,
                language,
                problemTitle: 'Interactive Compiler'
            });
        }
    }, [code, language, activeClassroom, user]);

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
        const extensions = { python: 'py', cpp: 'cpp', c: 'c', javascript: 'js', java: 'java' };
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
                        <option value="javascript">Node.js</option>
                        <option value="java">Java</option>
                    </select>

                    {activeClassroom && (
                        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{activeClassroom.name} Live</span>
                        </div>
                    )}

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

                    {/* Header with Tabs */}
                    <div className="h-9 shrink-0 bg-[#1e1e1e] border-b border-gray-800 flex items-center justify-between px-4 select-none">
                        <div className="flex space-x-4 h-full">
                            <button 
                                onClick={() => setActiveTab('output')}
                                className={`text-[11px] font-bold py-2.5 transition-all relative ${activeTab === 'output' ? 'text-blue-400 border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                OUTPUT
                            </button>
                            <button 
                                onClick={() => setActiveTab('ai')}
                                className={`text-[11px] font-bold py-2.5 transition-all relative flex items-center gap-1.5 ${activeTab === 'ai' ? 'text-purple-400 border-b-2 border-purple-500' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                <Sparkles size={10} className={activeTab === 'ai' ? 'fill-purple-400' : ''} />
                                AI ASSISTANT
                            </button>
                        </div>
                        <div className="flex items-center space-x-3 text-gray-500">
                            {activeTab === 'output' && (
                                <>
                                    <button onClick={copyTerminal} title="Copy Output" className="hover:text-white transition-colors"><Copy className="h-3.5 w-3.5" /></button>
                                    <button onClick={() => setTerminalLines([])} title="Clear Terminal" className="hover:text-white transition-colors"><RotateCcw className="h-3.5 w-3.5" /></button>
                                </>
                            )}
                            <button onClick={() => setTerminalLines([])} className="lg:hidden"><X className="h-4 w-4 hover:text-red-400 cursor-pointer" /></button>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-hidden flex flex-col relative">
                        {activeTab === 'output' ? (
                            <div
                                className="flex-1 overflow-y-auto p-4 font-mono text-[13px] leading-relaxed custom-scrollbar bg-[#0f0f15]"
                                onClick={() => inputRef.current?.focus()}
                            >
                                {terminalLines.map((line, idx) => (
                                    <span
                                        key={idx}
                                        className={`whitespace-pre-wrap break-words block mb-1 ${line.type === 'input' ? 'text-blue-400 font-bold' :
                                            line.type === 'system' ? 'text-gray-500 italic' :
                                                line.type === 'error' ? 'text-red-400 font-bold' : 'text-gray-300'
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
                        ) : (
                            <div className="flex-1 flex flex-col bg-[#0f0f15] overflow-hidden">
                                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                                    {aiMessages.map((msg, idx) => (
                                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[90%] p-3 rounded-xl text-[13px] leading-relaxed ${
                                                msg.role === 'user' 
                                                    ? 'bg-blue-600 text-white rounded-tr-none' 
                                                    : 'bg-[#1e1e2e] text-gray-200 border border-gray-700/50 rounded-tl-none prose prose-invert prose-sm'
                                            }`}>
                                                <ReactMarkdown 
                                                    remarkPlugins={[remarkGfm]}
                                                    components={{
                                                        code({ node, inline, className, children, ...props }) {
                                                            const match = /language-(\w+)/.exec(className || '');
                                                            const codeContent = String(children).replace(/\n$/, '');
                                                            
                                                            return !inline && match ? (
                                                                <div className="relative group my-4">
                                                                    <div className="flex items-center justify-between px-3 py-1.5 bg-gray-800 rounded-t-lg border-x border-t border-gray-700">
                                                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{match[1]}</span>
                                                                        <button
                                                                            onClick={() => {
                                                                                setAppliedCode(codeContent);
                                                                            }}
                                                                            className="flex items-center gap-1 text-[10px] font-bold text-blue-400 hover:text-blue-300 transition-colors uppercase bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/30"
                                                                        >
                                                                            <Download size={10} />
                                                                            Apply to Editor
                                                                        </button>
                                                                    </div>
                                                                    <pre className="m-0 bg-black/40 border border-gray-700 rounded-b-lg overflow-x-auto p-3">
                                                                        <code className={className} {...props}>
                                                                            {children}
                                                                        </code>
                                                                    </pre>
                                                                </div>
                                                            ) : (
                                                                <code className={`${className} bg-white/10 px-1 rounded text-blue-300`} {...props}>
                                                                    {children}
                                                                </code>
                                                            )
                                                        }
                                                    }}
                                                >
                                                    {msg.content}
                                                </ReactMarkdown>
                                            </div>
                                        </div>
                                    ))}
                                    {aiLoading && (
                                        <div className="flex justify-start">
                                            <div className="bg-[#1e1e2e] p-3 rounded-xl rounded-tl-none border border-gray-700/50 flex space-x-1 items-center">
                                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                            </div>
                                        </div>
                                    )}
                                    <div ref={aiMessagesEndRef} />
                                </div>

                                {/* AI Input */}
                                <form onSubmit={handleAISend} className="p-3 border-t border-gray-800 bg-[#16161a]">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={aiInput}
                                            onChange={(e) => setAiInput(e.target.value)}
                                            placeholder="Ask AI about your code..."
                                            className="w-full bg-[#0b0b0e] text-gray-200 text-xs rounded-lg px-3 py-2.5 pr-10 border border-gray-800 focus:border-blue-500/50 outline-none transition-all"
                                        />
                                        <button
                                            type="submit"
                                            disabled={aiLoading || !aiInput.trim()}
                                            className="absolute right-1.5 top-1.5 p-1.5 text-blue-500 hover:text-blue-400 disabled:text-gray-700 transition-all"
                                        >
                                            <Send size={14} />
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
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
