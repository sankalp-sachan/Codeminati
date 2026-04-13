import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, Sparkles, Code, Info, Terminal } from 'lucide-react';
import client from '../api/client';
import { toast } from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAI } from '../context/AIContext';

const CodeminatiAI = () => {
    const { aiContext } = useAI();
    const { contextType, problemContext, codeContext } = aiContext;
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'model', content: "Hello! I'm Codeminati AI. How can I help you today?" }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMsg = { role: 'user', content: input };
        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        setInput('');
        setLoading(true);

        try {
            const { data } = await client.post('/ai/chat', {
                messages: newMessages,
                contextType,
                problemContext,
                codeContext
            });

            setMessages([...newMessages, { role: 'model', content: data.content }]);
        } catch (error) {
            console.error('AI Error:', error);
            const msg = error.response?.data?.message || 'Something went wrong. Please try again.';
            toast.error(msg);
            setMessages([...newMessages, { role: 'model', content: `Sorry, I encountered an error: ${msg}` }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="mb-4 w-[380px] sm:w-[450px] h-[600px] bg-[#1e1e2e] border border-gray-700/50 rounded-2xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl"
                    >
                        {/* Header */}
                        <div className="p-4 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-b border-gray-700/50 flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="bg-blue-600 p-2 rounded-lg">
                                    <Bot className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white flex items-center gap-2">
                                        Codeminati AI <Sparkles className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                                    </h3>
                                    <p className="text-[10px] text-blue-400 font-medium uppercase tracking-wider">
                                        {contextType === 'problem' ? 'Problem Assistant' : contextType === 'compiler' ? 'Compiler Assistant' : 'Platform Assistant'}
                                    </p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setIsOpen(false)}
                                className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-all"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Chat Context Info */}
                        {contextType === 'problem' && problemContext && (
                            <div className="px-4 py-2 bg-blue-500/5 border-b border-gray-700/30 flex items-center gap-2 text-[11px] text-gray-400">
                                <Info size={12} className="text-blue-400" />
                                <span>Helping with: <span className="text-blue-300 font-bold">{problemContext.title}</span></span>
                            </div>
                        )}
                        {contextType === 'compiler' && codeContext && (
                            <div className="px-4 py-2 bg-green-500/5 border-b border-gray-700/30 flex items-center gap-2 text-[11px] text-gray-400">
                                <Code size={12} className="text-green-400" />
                                <span>Analyzing: <span className="text-green-300 font-bold">{codeContext.language}</span> code</span>
                            </div>
                        )}

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-[#0f0f15]/50">
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${
                                        msg.role === 'user' 
                                            ? 'bg-blue-600 text-white rounded-tr-none' 
                                            : 'bg-[#2a2a3a] text-gray-200 border border-gray-700/50 rounded-tl-none prose prose-invert prose-sm'
                                    }`}>
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {msg.content}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            ))}
                            {loading && (
                                <div className="flex justify-start">
                                    <div className="bg-[#2a2a3a] text-gray-200 p-3 rounded-2xl rounded-tl-none border border-gray-700/50 flex space-x-1 items-center">
                                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSend} className="p-4 bg-[#1e1e2e] border-t border-gray-700/50">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Type your question..."
                                    className="w-full bg-[#0f0f15] text-gray-200 text-sm rounded-xl px-4 py-3 pr-12 border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-600"
                                />
                                <button
                                    type="submit"
                                    disabled={loading || !input.trim()}
                                    className="absolute right-2 top-1.5 p-1.5 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 text-white rounded-lg transition-all active:scale-95"
                                >
                                    <Send className="h-4 w-4" />
                                </button>
                            </div>
                            <p className="mt-2 text-[10px] text-gray-600 text-center">
                                AI can make mistakes. Verify important information.
                            </p>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toggle Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`p-4 rounded-full shadow-2xl transition-all duration-300 flex items-center justify-center group ${
                    isOpen 
                        ? 'bg-red-500 text-white rotate-0' 
                        : 'bg-blue-600 text-white'
                }`}
            >
                {isOpen ? <X size={24} /> : (
                    <div className="flex items-center gap-2">
                        <MessageSquare size={24} className="group-hover:rotate-12 transition-transform" />
                        <span className="max-w-0 overflow-hidden group-hover:max-w-[200px] transition-all duration-500 whitespace-nowrap font-bold text-sm">
                            Codeminati AI
                        </span>
                    </div>
                )}
            </motion.button>
        </div>
    );
};

export default CodeminatiAI;
