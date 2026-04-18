import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import client from '../api/client';
import { Activity, Users, Monitor, Code2, Clock, Terminal, ChevronRight, Search, Layout, RefreshCw, X, BookOpen } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Loader from '../components/Loader';

const ClassroomLiveMonitor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [filter, setFilter] = useState('');
    const [autoRefresh, setAutoRefresh] = useState(true);

    useEffect(() => {
        fetchData();
    }, [id]);

    useEffect(() => {
        let interval;
        if (autoRefresh) {
            interval = setInterval(fetchData, 10000); // Poll every 10s
        }
        return () => clearInterval(interval);
    }, [id, autoRefresh]);

    const fetchData = async () => {
        try {
            const { data } = await client.get(`/classrooms/${id}`);
            setData(data);
        } catch (error) {
            toast.error('Failed to update live feed');
        } finally {
            setLoading(false);
        }
    };

    const isStudentOnline = (lastActive) => {
        if (!lastActive) return false;
        const now = new Date();
        const activeDate = new Date(lastActive);
        return (now - activeDate) < 60000; // Online if active in last minute
    };

    if (loading) return <div className="flex h-screen items-center justify-center"><Loader size="xl" /></div>;

    const filteredActivities = data?.activities.filter(act => 
        act.user.name.toLowerCase().includes(filter.toLowerCase()) || 
        act.user.username.toLowerCase().includes(filter.toLowerCase())
    ) || [];

    return (
        <div className="min-h-screen bg-[#020617] text-white">
            <div className="container mx-auto px-4 py-8 max-w-[1600px]">
                {/* Header */}
                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 mb-10">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => navigate('/teacher')}
                            className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all"
                        >
                            <ChevronRight className="rotate-180" size={20} />
                        </button>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-3xl font-black italic uppercase tracking-tight">{data?.classroom.name}</h1>
                                <div className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full">
                                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{data?.classroom.code}</span>
                                </div>
                                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                                    <span className="text-[9px] font-bold text-emerald-400 uppercase">Live Monitoring</span>
                                </div>
                            </div>
                            <p className="text-gray-500 text-sm">Dashboard for real-time pedagogical oversight.</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 w-full xl:w-auto">
                        <div className="relative flex-grow xl:flex-grow-0 xl:min-w-[300px]">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                            <input 
                                type="text"
                                placeholder="Search student..."
                                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-sm focus:border-blue-500 transition-all outline-none"
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                            />
                        </div>
                        <button 
                            onClick={() => setAutoRefresh(!autoRefresh)}
                            className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm transition-all border ${
                                autoRefresh 
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                                : 'bg-white/5 border-white/10 text-gray-500'
                            }`}
                        >
                            <RefreshCw size={16} className={autoRefresh ? 'animate-spin' : ''} />
                            {autoRefresh ? 'Auto Sync' : 'Sync Paused'}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-12 gap-8">
                    {/* Student List Area */}
                    <div className="col-span-12 xl:col-span-8 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
                            {filteredActivities.map((act) => {
                                const online = isStudentOnline(act.lastActive);
                                return (
                                    <div 
                                        key={act._id}
                                        onClick={() => setSelectedStudent(act)}
                                        className={`group relative bg-[#0b0b13] border rounded-[2rem] p-6 cursor-pointer transition-all duration-300 ${
                                            selectedStudent?._id === act._id 
                                            ? 'border-blue-500 ring-4 ring-blue-500/10' 
                                            : 'border-white/10 hover:border-white/20'
                                        }`}
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 border border-white/5 flex items-center justify-center text-lg font-black text-gray-400 group-hover:text-white transition-colors">
                                                    {act.user.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-white text-sm group-hover:text-blue-400 transition-colors">{act.user.name}</h3>
                                                    <p className="text-[10px] text-gray-500 font-medium">@{act.user.username}</p>
                                                </div>
                                            </div>
                                            <div className={`w-2.5 h-2.5 rounded-full ${online ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-gray-700'}`}></div>
                                        </div>

                                        <div className="space-y-3 pt-4 border-t border-white/5">
                                            <div className="flex items-center gap-2 text-[10px] text-gray-400">
                                                <Terminal size={12} className="text-blue-400" />
                                                <span className="font-bold opacity-60">Status:</span>
                                                <span className="text-white line-clamp-1">{act.problem?.title || 'No Problem Selected'}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-[10px] text-gray-400">
                                                <Layout size={12} className="text-purple-400" />
                                                <span className="font-bold opacity-60">Lang:</span>
                                                <span className="text-purple-300 uppercase">{act.language}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-[10px] text-gray-400">
                                                <Clock size={12} className="text-gray-500" />
                                                <span className="font-bold opacity-60">Last seen:</span>
                                                <span>{new Date(act.lastActive).toLocaleTimeString()}</span>
                                            </div>
                                        </div>

                                        <div className="mt-5 flex items-center justify-between">
                                            <div className="px-2.5 py-1 bg-white/5 rounded-lg border border-white/5">
                                                <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest italic">{act.currentCode?.length || 0} bytes</span>
                                            </div>
                                            <button className="text-[9px] font-black text-blue-400 uppercase tracking-widest hover:text-white transition-colors">View Details</button>
                                        </div>
                                    </div>
                                );
                            })}

                            {filteredActivities.length === 0 && (
                                <div className="col-span-full py-20 bg-white/5 border border-white/5 border-dashed rounded-[3rem] text-center">
                                    <Users className="mx-auto text-gray-700 mb-4" size={48} />
                                    <h3 className="text-xl font-bold text-gray-500 uppercase italic">No Active Sessions</h3>
                                    <p className="text-gray-600 font-medium">Students will appear here once they start a problem in this lab.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Code Inspector Area */}
                    <div className="col-span-12 xl:col-span-4 lg:sticky lg:top-8 h-fit">
                        {selectedStudent ? (
                            <div className="bg-[#0b0b13] border border-white/10 rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-300">
                                <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
                                    <div>
                                        <h3 className="text-lg font-black italic uppercase tracking-tight text-white">{selectedStudent.user.name}</h3>
                                        <p className="text-xs text-blue-400 font-bold uppercase tracking-widest">{selectedStudent.problem?.title || 'Editor Preview'}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => setSelectedStudent(null)}
                                            className="p-2 bg-white/5 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-all"
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>
                                </div>

                                <div className="p-8 space-y-6">
                                    <div className="bg-black/60 rounded-3xl p-6 border border-white/5 font-mono text-xs leading-relaxed overflow-x-auto max-h-[60vh] custom-scrollbar">
                                        <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/5">
                                            <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Active Buffer Content</span>
                                            <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-[9px] uppercase font-bold">{selectedStudent.language}</span>
                                        </div>
                                        <pre className="text-gray-300">
                                            {selectedStudent.currentCode || '// This student has not typed anything yet.'}
                                        </pre>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-white/5 border border-white/5 rounded-2xl text-center">
                                            <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1">Time Active</p>
                                            <p className="text-lg font-bold text-white tracking-tight italic">--:--</p>
                                        </div>
                                        <div className="p-4 bg-white/5 border border-white/5 rounded-2xl text-center">
                                            <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1">Submissions</p>
                                            <p className="text-lg font-bold text-white tracking-tight italic">0</p>
                                        </div>
                                    </div>
                                    
                                    <button 
                                        onClick={() => navigate(`/problems/${selectedStudent.problem?.slug}`)}
                                        disabled={!selectedStudent.problem}
                                        className="w-full py-4 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-400 transition-all disabled:opacity-30 flex items-center justify-center gap-2"
                                    >
                                        <BookOpen size={16} /> View Problem Details
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white/5 border border-white/5 border-dashed rounded-[3rem] p-20 text-center flex flex-col items-center justify-center h-[600px]">
                                <Monitor className="text-gray-700 mb-6" size={64} />
                                <h3 className="text-2xl font-black text-white/20 uppercase italic mb-4">Code Inspector</h3>
                                <p className="text-gray-600 text-sm max-w-xs mx-auto">Select a student from the grid to view their active coding session and current buffer content.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClassroomLiveMonitor;
