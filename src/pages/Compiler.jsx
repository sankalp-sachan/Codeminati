import { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Download, Save, Terminal, FileCode } from 'lucide-react';
import { toast } from 'react-hot-toast';
import client from '../api/client';

const Compiler = () => {
    const [language, setLanguage] = useState('python');
    const [code, setCode] = useState('# Write your code here\nprint("Hello, World!")');
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [loading, setLoading] = useState(false);

    const defaultCodes = {
        python: '# Write your code here\nprint("Hello, World!")',
        cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}',
        c: '#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}'
    };

    const handleLanguageChange = (e) => {
        const lang = e.target.value;
        setLanguage(lang);
        setCode(defaultCodes[lang] || '');
    };

    const handleRun = async () => {
        setLoading(true);
        setOutput('Running...');
        try {
            const { data } = await client.post('/compiler/run', {
                language,
                code,
                input
            });

            if (data.error) {
                setOutput(`Error:\n${data.error}`);
            } else {
                setOutput(data.output);
            }
        } catch (error) {
            console.error(error);
            setOutput('Error: Failed to execute code.');
            toast.error('Execution failed');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = () => {
        const blob = new Blob([code], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');

        const extensions = {
            python: 'py',
            cpp: 'cpp',
            c: 'c',
        };

        a.href = url;
        a.download = `main.${extensions[language]}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('File saved to local system');
    };

    return (
        <div className="h-[calc(100vh-64px)] flex flex-col bg-[#0f0f15]">
            {/* Header / Toolbar */}
            <div className="h-14 border-b border-gray-800 bg-[#1e1e1e] flex items-center justify-between px-4">
                <div className="flex items-center space-x-3">
                    <div className="bg-blue-500/10 p-2 rounded-lg">
                        <Terminal className="h-5 w-5 text-blue-400" />
                    </div>
                    <h1 className="text-lg font-bold text-gray-100">Online Compiler</h1>
                </div>

                <div className="flex items-center space-x-4">
                    <select
                        value={language}
                        onChange={handleLanguageChange}
                        className="bg-[#2d2d2d] text-gray-300 rounded-md px-3 py-1.5 text-sm border border-gray-700 outline-none focus:border-blue-500"
                    >
                        <option value="python">Python</option>
                        <option value="cpp">C++</option>
                        <option value="c">C</option>
                    </select>

                    <button
                        onClick={handleSave}
                        className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-md transition-colors"
                        title="Save Code"
                    >
                        <Save className="h-5 w-5" />
                    </button>

                    <button
                        onClick={handleRun}
                        disabled={loading}
                        className={`px-4 py-1.5 rounded-md flex items-center space-x-2 text-sm font-bold transition-all ${loading
                            ? 'bg-gray-600 cursor-not-allowed'
                            : 'bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-900/20'
                            }`}
                    >
                        <Play className="h-4 w-4 fill-current" />
                        <span>{loading ? 'Running...' : 'Run'}</span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Editor Section */}
                <div className="flex-1 flex flex-col border-r border-gray-800">
                    <div className="flex-1 relative">
                        <Editor
                            height="100%"
                            language={language}
                            theme="vs-dark"
                            value={code}
                            onChange={setCode}
                            onMount={(editor, monaco) => {
                                const container = editor.getContainerDomNode();
                                container.addEventListener('copy', (e) => e.preventDefault(), true);
                                container.addEventListener('paste', (e) => e.preventDefault(), true);
                                container.addEventListener('cut', (e) => e.preventDefault(), true);
                                container.addEventListener('contextmenu', (e) => e.preventDefault(), true);
                            }}
                            options={{
                                contextmenu: false,
                                fontSize: 14,
                                minimap: { enabled: false },
                                scrollBeyondLastLine: false,
                                automaticLayout: true,
                                padding: { top: 16 },
                                fontFamily: "'Fira Code', 'Monaco', monospace"
                            }}
                        />
                    </div>
                </div>

                {/* IO Section */}
                <div className="w-[350px] lg:w-[400px] flex flex-col bg-[#1e1e1e]">
                    {/* Input */}
                    <div className="h-1/3 flex flex-col border-b border-gray-800">
                        <div className="px-4 py-2 bg-[#252526] text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center justify-between">
                            <span>Input (Stdin)</span>
                        </div>
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="flex-1 bg-[#1e1e1e] text-gray-300 p-3 text-sm font-mono resize-none focus:outline-none focus:bg-[#2d2d2d]/50 transition-colors"
                            placeholder="Enter your input here..."
                        />
                    </div>

                    {/* Output */}
                    <div className="flex-1 flex flex-col">
                        <div className="px-4 py-2 bg-[#252526] text-xs font-bold text-gray-400 uppercase tracking-wider">
                            Output
                        </div>
                        <div className="flex-1 bg-[#1e1e1e] p-3 overflow-auto">
                            <pre className={`font-mono text-sm whitespace-pre-wrap ${output.startsWith('Error') ? 'text-red-400' : 'text-gray-300'}`}>
                                {output || 'Run code to see output...'}
                            </pre>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Compiler;
