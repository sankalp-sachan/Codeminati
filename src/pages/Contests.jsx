import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import client from '../api/client';
import { format } from 'date-fns';
import { Trophy, Bell, CheckCircle, Plus, Calendar, Clock, BookOpen, X, Loader2, Search, EyeOff, Rocket, Bot, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import Loader from '../components/Loader';

const Contests = () => {
    const { user: currentUser } = useAuth();
    const navigate = useNavigate();
    const [contests, setContests] = useState([]);

    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('active');
    const [successModal, setSuccessModal] = useState({ show: false, contest: null });
    const [attemptModal, setAttemptModal] = useState({ show: false, contest: null });
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [allProblems, setAllProblems] = useState([]);
    const [problemSearch, setProblemSearch] = useState('');
    const [creating, setCreating] = useState(false);

    // Create Contest Form State
    const [newContest, setNewContest] = useState({
        title: '',
        description: '',
        startTime: '',
        endTime: '',
        problems: []
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data } = await client.get('/contests');
                setContests(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Failed to fetch data", error);
                setContests([]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'text-green-400 border-green-400 bg-green-400/10';
            case 'upcoming': return 'text-yellow-400 border-yellow-400 bg-yellow-400/10';
            case 'ended': return 'text-gray-400 border-gray-400 bg-gray-400/10';
            default: return 'text-blue-400 border-blue-400 bg-blue-400/10';
        }
    };

    const [isRegistering, setIsRegistering] = useState(null); // Store contest ID being registered

    const handleNotifyClick = async (contest) => {
        if (!currentUser) {
            toast.error("Please login to register");
            return;
        }

        setIsRegistering(contest._id);
        try {
            await client.post(`/contests/${contest._id}/register`, { goal: 'Participate', experience: 'General' });
            setSuccessModal({ show: true, contest });
            // Refresh list to show "Enter Arena"
            const { data } = await client.get('/contests');
            setContests(data);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to register");
        } finally {
            setIsRegistering(null);
        }
    };

    const fetchProblems = async () => {
        try {
            const { data } = await client.get('/problems?limit=1000');
            // Check if data is an array or has a problems property
            const problemsArray = Array.isArray(data) ? data : data.problems || [];
            setAllProblems(problemsArray);
        } catch (error) {
            console.error("Failed to fetch problems", error);
            toast.error("Could not load problems list");
        }
    };

    const handleCreateContest = async (e) => {
        e.preventDefault();
        if (newContest.problems.length === 0) return toast.error("Please select at least one problem");

        setCreating(true);
        try {
            // Treat the input time as IST (+05:30) regardless of local browser time
            const formatDateToIST = (dateString) => {
                if (!dateString) return '';
                return new Date(`${dateString}:00+05:30`).toISOString();
            };

            const startStr = formatDateToIST(newContest.startTime);
            const endStr = formatDateToIST(newContest.endTime);
            
            if (new Date(endStr) <= new Date(startStr)) {
                setCreating(false);
                return toast.error("End time must be after start time");
            }

            const payload = {
                ...newContest,
                startTime: startStr,
                endTime: endStr
            };

            await client.post('/contests', payload);
            toast.success("Contest created successfully!");
            setShowCreateModal(false);
            setNewContest({ title: '', description: '', startTime: '', endTime: '', problems: [] });
            // Refresh contests list
            const { data } = await client.get('/contests');
            setContests(data);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to create contest");
        } finally {
            setCreating(false);
        }
    };

    const toggleProblemSelection = (id) => {
        const isSelected = newContest.problems.includes(id);
        if (isSelected) {
            setNewContest({ ...newContest, problems: newContest.problems.filter(pId => pId !== id) });
        } else {
            setNewContest({ ...newContest, problems: [...newContest.problems, id] });
        }
    };



    const filteredContests = (Array.isArray(contests) ? contests : []).filter(contest => {
        const now = new Date();
        const start = new Date(contest.startTime);
        const end = new Date(contest.endTime);

        if (activeTab === 'active') return now >= start && now <= end;
        if (activeTab === 'upcoming') return now < start;
        if (activeTab === 'ended') return now > end;
        return true;
    });

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader size="xl" />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12 max-w-7xl">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-3 tracking-tight">
                        Platform <span className="bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">Contests</span>
                    </h1>
                    <p className="text-gray-400 text-lg">Challenge yourself against the global developer community.</p>
                </div>

                {currentUser?.role === 'admin' && (
                    <button
                        onClick={() => {
                            setShowCreateModal(true);
                            fetchProblems();
                        }}
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-[0_0_20px_rgba(147,51,234,0.3)] transition-all hover:scale-105 active:scale-95"
                    >
                        <Plus size={20} /> Create Contest
                    </button>
                )}
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-2xl w-fit mb-10 border border-white/10">
                {['active', 'upcoming', 'ended'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-2.5 rounded-xl text-sm font-bold capitalize transition-all ${
                            activeTab === tab
                                ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/20'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Contests Grid */}
            {filteredContests.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredContests.map((contest) => (
                        <div key={contest._id} className="group relative bg-[#0b0b13] border border-white/10 rounded-3xl p-8 hover:border-purple-500/50 transition-all duration-500 overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                                <Trophy size={140} />
                            </div>

                            <div className="relative z-10">
                                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border mb-6 ${getStatusColor(activeTab)}`}>
                                    {activeTab === 'active' ? <Clock size={12} className="animate-pulse" /> : activeTab === 'upcoming' ? <Calendar size={12} /> : <CheckCircle size={12} />}
                                    {activeTab}
                                </div>

                                <h3 className="text-2xl font-black text-white mb-4 line-clamp-1 group-hover:text-purple-400 transition-colors">
                                    {contest.title}
                                </h3>
                                <p className="text-gray-400 text-sm mb-8 line-clamp-2 h-10 leading-relaxed">
                                    {contest.description}
                                </p>

                                <div className="space-y-4 mb-8">
                                    <div className="flex items-center gap-3 text-gray-400 text-xs">
                                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                                            <Calendar size={14} className="text-purple-400" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-300">Start Time</p>
                                            <p>{format(new Date(contest.startTime), 'MMM d, h:mm a')}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-400 text-xs">
                                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                                            <Clock size={14} className="text-pink-400" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-300">Duration</p>
                                            <p>{Math.round((new Date(contest.endTime) - new Date(contest.startTime)) / (1000 * 60 * 60))} Hours</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-6 border-t border-white/5">
                                    <div className="flex items-center gap-2">
                                        <BookOpen size={14} className="text-gray-500" />
                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{contest.problems?.length || 0} Problems</span>
                                    </div>
                                    <button
                                        onClick={() => (contest.myStatus === 'approved' || activeTab === 'ended') ? navigate(`/contests/${contest._id}`) : handleNotifyClick(contest)}
                                        disabled={isRegistering === contest._id}
                                        className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                                            contest.myStatus === 'approved' || activeTab === 'ended'
                                                ? 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10'
                                                : 'bg-purple-600 text-white hover:shadow-[0_0_20px_rgba(147,51,234,0.3)]'
                                        }`}
                                    >
                                        {isRegistering === contest._id ? <Loader2 size={16} className="animate-spin" /> : 
                                         activeTab === 'ended' ? 'View Standings' : 
                                         contest.myStatus === 'approved' ? 'Enter Arena' : 'Join Now'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white/5 border border-white/10 rounded-3xl p-20 text-center flex flex-col items-center max-w-2xl mx-auto">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                        <Trophy size={40} className="text-gray-600" />
                    </div>
                    <h3 className="text-2xl font-black text-white mb-2">No {activeTab} contests</h3>
                    <p className="text-gray-400">There are no contests matching this filter right now. Check back soon!</p>
                </div>
            )}

            {/* Create Contest Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 backdrop-blur-md bg-black/60 overflow-y-auto">
                    <div className="bg-[#0b0b13] border border-white/10 rounded-[2.5rem] w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="p-8 pb-4 border-b border-white/5 flex justify-between items-center shrink-0">
                            <div>
                                <h1 className="text-3xl font-black text-white">Create New Arena</h1>
                                <p className="text-gray-500 text-sm">Organize a competitive event for the community.</p>
                            </div>
                            <button onClick={() => setShowCreateModal(false)} className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 text-gray-400 hover:text-white transition-all">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-8 pt-6 overflow-y-auto flex-1 custom-scrollbar">
                            {/* AI INTEGRATION TOOLBAR */}
                            <div className="mb-10 bg-gradient-to-r from-purple-900/40 to-pink-900/40 border border-purple-500/30 rounded-3xl p-6 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-6 opacity-5">
                                    <Sparkles size={100} className="text-white" />
                                </div>
                                <div className="relative z-10">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Bot className="text-purple-400" size={20} />
                                        <h3 className="text-sm font-black text-white uppercase tracking-widest italic">AI Contest Architect</h3>
                                    </div>
                                    <p className="text-gray-300 text-sm mb-6 max-w-lg">Tell the AI what kind of contest you want (difficulty, topics, etc.) and it will pick the best problems and generate details for you.</p>
                                    
                                    <div className="flex gap-3">
                                        <input 
                                            type="text" 
                                            placeholder="e.g., A beginner friendly contest with Array and String problems..."
                                            className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-all outline-none"
                                            value={problemSearch} // Using existing state for prompt
                                            onChange={(e) => setProblemSearch(e.target.value)}
                                        />
                                        <button 
                                            onClick={async () => {
                                                if (!problemSearch) return toast.error("Write a prompt first!");
                                                setCreating(true);
                                                try {
                                                    const { data } = await client.post('/ai/generate-contest', { prompt: problemSearch });
                                                    setNewContest(prev => ({
                                                        ...prev,
                                                        title: data.title || prev.title,
                                                        description: data.description || prev.description,
                                                        problems: data.problemIds || []
                                                    }));
                                                    toast.success("AI draft generated! Review and pick your times.");
                                                } catch (err) {
                                                    toast.error("AI generation failed.");
                                                } finally {
                                                    setCreating(false);
                                                }
                                            }}
                                            disabled={creating}
                                            className="bg-white text-black px-6 py-3 rounded-xl font-bold text-sm hover:bg-purple-100 transition-all flex items-center gap-2 disabled:opacity-50"
                                        >
                                            {creating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />} GENERATE
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={handleCreateContest} className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Contest Title</label>
                                            <input 
                                                required
                                                type="text" 
                                                placeholder="Enter title..."
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-purple-500 transition-all outline-none"
                                                value={newContest.title}
                                                onChange={(e) => setNewContest({ ...newContest, title: e.target.value })}
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Start Time (IST)</label>
                                                <input 
                                                    required
                                                    type="datetime-local" 
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-purple-500 transition-all outline-none text-sm"
                                                    value={newContest.startTime}
                                                    onChange={(e) => setNewContest({ ...newContest, startTime: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">End Time (IST)</label>
                                                <input 
                                                    required
                                                    type="datetime-local" 
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-purple-500 transition-all outline-none text-sm"
                                                    value={newContest.endTime}
                                                    onChange={(e) => setNewContest({ ...newContest, endTime: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Description</label>
                                            <textarea 
                                                required
                                                rows="4"
                                                placeholder="Describe the contest..."
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-purple-500 transition-all outline-none resize-none"
                                                value={newContest.description}
                                                onChange={(e) => setNewContest({ ...newContest, description: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-col h-[500px]">
                                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1 mb-2 flex justify-between">
                                            <span>Select Problems ({newContest.problems.length})</span>
                                            <span className="text-purple-400">{allProblems.length} available</span>
                                        </label>
                                        <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden flex flex-col h-full">
                                            <div className="p-4 border-b border-white/5">
                                                <div className="relative">
                                                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                                                    <input 
                                                        type="text" 
                                                        placeholder="Filter problems..."
                                                        className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white outline-none focus:border-purple-500 transition-all"
                                                        // Using local temp state to filter UI
                                                        onChange={(e) => {/* Add local filter if needed */}}
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                                                {allProblems.map(p => (
                                                    <div 
                                                        key={p._id}
                                                        onClick={() => toggleProblemSelection(p._id)}
                                                        className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer group/item ${
                                                            newContest.problems.includes(p._id)
                                                                ? 'bg-purple-600/20 border-purple-500 text-white'
                                                                : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10'
                                                        }`}
                                                    >
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-bold truncate max-w-[180px]">{p.title}</span>
                                                            <span className={`text-[10px] uppercase font-black tracking-widest ${
                                                                p.difficulty === 'Easy' ? 'text-green-400' : p.difficulty === 'Medium' ? 'text-yellow-400' : 'text-red-400'
                                                            }`}>{p.difficulty}</span>
                                                        </div>
                                                        {newContest.problems.includes(p._id) && <CheckCircle size={16} className="text-purple-500" />}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-8 border-t border-white/5 flex gap-4">
                                    <button 
                                        type="button"
                                        onClick={() => setShowCreateModal(false)}
                                        className="flex-1 px-8 py-5 rounded-3xl bg-white/5 text-gray-400 font-bold hover:bg-white/10 transition-all"
                                    >
                                        CANCEL
                                    </button>
                                    <button 
                                        type="submit"
                                        disabled={creating}
                                        className="flex-[2] px-8 py-5 rounded-3xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black uppercase tracking-widest shadow-xl shadow-purple-900/40 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                    >
                                        {creating ? <Loader2 size={24} className="animate-spin" /> : <><Rocket size={20} /> PUBLISH ARENA</>}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Modal */}
            {successModal.show && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
                    <div className="bg-[#0b0b13] border border-white/10 rounded-[3rem] p-12 max-w-lg w-full text-center shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 to-pink-500"></div>
                        <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
                            <CheckCircle size={48} className="text-green-400" />
                        </div>
                        <h2 className="text-4xl font-black text-white mb-4 italic uppercase tracking-tighter">Registration Confirmed!</h2>
                        <p className="text-gray-400 mb-10 leading-relaxed">
                            You are now registered for <span className="text-white font-bold">{successModal.contest?.title}</span>. We've sent details to your email!
                        </p>
                        <button
                            onClick={() => setSuccessModal({ show: false, contest: null })}
                            className="w-full py-5 rounded-2xl bg-white text-black font-black uppercase tracking-widest hover:bg-gray-200 transition-all shadow-xl shadow-white/5"
                        >
                            AWESOME
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Contests;
