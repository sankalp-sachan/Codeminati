import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import { format } from 'date-fns';
import { Trophy, Bell, CheckCircle, Plus, Calendar, Clock, BookOpen, X, Loader2, Search, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import Loader from '../components/Loader';

const Contests = () => {
    const { user: currentUser } = useAuth();
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

            const payload = {
                ...newContest,
                startTime: formatDateToIST(newContest.startTime),
                endTime: formatDateToIST(newContest.endTime)
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
        const diffMinutes = (start - now) / (1000 * 60);

        if (activeTab === 'active') return now >= start && now <= end;
        if (activeTab === 'checkin') return diffMinutes > 0 && diffMinutes <= 10;
        if (activeTab === 'upcoming') return diffMinutes > 10;
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
        <div className="container mx-auto px-4 py-8 relative">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                    Contests
                </h1>
                {currentUser?.role === 'admin' && (
                    <button
                        onClick={() => {
                            setShowCreateModal(true);
                            fetchProblems();
                        }}
                        className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-lg shadow-lg shadow-purple-900/20 transition-all transform hover:scale-[1.02] active:scale-95"
                    >
                        <Plus size={20} />
                        <span>Create Contest</span>
                    </button>
                )}
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Contests List */}
                <div className="flex-1">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2 capitalize">
                        <Trophy className="text-purple-400" /> {activeTab === 'ended' ? 'Past' : activeTab} Contests
                    </h2>

                    {/* Tabs */}
                    <div className="flex space-x-1 bg-gray-800/50 p-1 rounded-lg mb-6 w-fit border border-gray-700">
                        {['active', 'checkin', 'upcoming', 'ended'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-all ${activeTab === tab
                                    ? 'bg-primary text-white shadow-lg'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                {tab === 'checkin' ? 'Check-In' : tab}
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        {filteredContests.length === 0 ? (
                            <div className="text-gray-500 text-center py-10 bg-gray-800/30 rounded-xl">
                                No {activeTab === 'checkin' ? 'check-in open' : activeTab} contests found.
                            </div>
                        ) : (
                            filteredContests.map(contest => {
                                const now = new Date();
                                const start = new Date(contest.startTime);
                                const end = new Date(contest.endTime);
                                let status = 'upcoming';
                                if (now >= start && now <= end) status = 'active';
                                if (now > end) status = 'ended';

                                const diffMinutes = (start - now) / (1000 * 60);
                                if (diffMinutes > 0 && diffMinutes <= 10) status = 'Check-In Open';

                                const isRegistered = contest.participants?.includes(currentUser?._id);

                                return (
                                    <div key={contest._id} className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6 hover:border-purple-500/50 transition duration-300">
                                        <div className="flex justify-between items-start mb-2">
                                            <h2 className="text-xl font-semibold text-white">{contest.title}</h2>
                                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase border ${getStatusColor(status === 'Check-In Open' ? 'upcoming' : status)}`}>
                                                {status}
                                            </span>
                                        </div>
                                        <p className="text-gray-400 text-sm mb-4 line-clamp-2">{contest.description}</p>
                                        <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-4">
                                            <span>Starts: {format(start, 'PP p')}</span>
                                        </div>

                                        <div className="flex gap-3">
                                            {status === 'active' ? (
                                                contest.myStatus === 'approved' || currentUser?.role === 'admin' || currentUser?.role === 'assistant' || currentUser?.role === 'judge' ? (
                                                    <button
                                                        onClick={() => setAttemptModal({ show: true, contest })}
                                                        className="inline-block px-6 py-2 rounded-lg font-medium text-white bg-purple-600 hover:bg-purple-700 transition"
                                                    >
                                                        Attempt
                                                    </button>
                                                ) : contest.myStatus === 'pending' ? (
                                                    <span className="px-6 py-2 rounded-lg font-medium bg-orange-500/20 text-orange-400 border border-orange-500/50 cursor-default">
                                                        Pending Approval ⏳
                                                    </span>
                                                ) : contest.myStatus === 'rejected' ? (
                                                    <span className="px-6 py-2 rounded-lg font-medium bg-red-500/20 text-red-400 border border-red-500/50 cursor-default">
                                                        Access Denied ❌
                                                    </span>
                                                ) : (
                                                    <button
                                                        onClick={() => setAttemptModal({ show: true, contest })}
                                                        className="inline-block px-6 py-2 rounded-lg font-medium text-white bg-purple-600 hover:bg-purple-700 transition"
                                                    >
                                                        Attempt
                                                    </button>
                                                )
                                            ) : status === 'Check-In Open' ? (
                                                contest.myStatus === 'approved' ? (
                                                    <span className="px-6 py-2 rounded-lg font-medium bg-green-500/20 text-green-400 border border-green-500/50 cursor-default">
                                                        Approved & Ready 🚀
                                                    </span>
                                                ) : contest.myStatus === 'pending' ? (
                                                    <span className="px-6 py-2 rounded-lg font-medium bg-orange-500/20 text-orange-400 border border-orange-500/50 cursor-default">
                                                        Request Pending...
                                                    </span>
                                                ) : (
                                                    <Link
                                                        to={`/contests/${contest._id}`}
                                                        className="inline-block px-6 py-2 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 transition animate-pulse"
                                                    >
                                                        Enter to Request Access
                                                    </Link>
                                                )
                                            ) : status === 'upcoming' ? (
                                                isRegistered ? (
                                                    <button disabled className="px-6 py-2 rounded-lg font-medium bg-green-500/20 text-green-400 border border-green-500/50 cursor-default">
                                                        Registered ✅
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleNotifyClick(contest)}
                                                        disabled={isRegistering === contest._id}
                                                        className={`px-6 py-2 rounded-lg font-medium bg-gray-700 text-gray-200 hover:bg-gray-600 flex items-center gap-2 transition ${isRegistering === contest._id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    >
                                                        {isRegistering === contest._id ? (
                                                            <Loader2 size={18} className="animate-spin" />
                                                        ) : (
                                                            <Bell size={18} />
                                                        )}
                                                        {isRegistering === contest._id ? 'Registering...' : 'Notify Me'}
                                                    </button>
                                                )
                                            ) : (
                                                <Link
                                                    to={`/contests/${contest._id}`}
                                                    className="inline-block px-6 py-2 rounded-lg font-medium bg-gray-700 text-gray-400 hover:bg-gray-600 transition"
                                                >
                                                    View Results
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Leaderboard */}
                {/* ... (same as before) ... */}

            </div>

            {/* Success/Registered Modal */}
            {
                successModal.show && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-gray-800 border border-green-500/50 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-fade-in scale-100 text-center">
                            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle size={32} className="text-green-500" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Registration Successful!</h3>
                            <p className="text-gray-300 mb-6">
                                You have been registered for <span className="text-white font-semibold">{successModal.contest?.title}</span>.
                                <br />
                                A confirmation email has been sent to your account.
                            </p>

                            <button
                                onClick={() => {
                                    setSuccessModal({ show: false, contest: null });
                                    window.location.reload(); // Simple refresh to update UI state
                                }}
                                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition"
                            >
                                Awesome!
                            </button>
                        </div>
                    </div>
                )
            }

            {/* Attempt Warning Modal */}
            {
                attemptModal.show && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-gray-900 border border-red-500/50 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-fade-in scale-100">
                            <div className="flex flex-col items-center text-center mb-6">
                                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
                                    <span className="text-3xl">⚠️</span>
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">Warning: Timed Event</h3>
                                <p className="text-gray-300">
                                    This contest is open for <span className="text-white font-bold">60 minutes only</span>.
                                </p>
                                <p className="text-gray-400 text-sm mt-2">
                                    Once you start, the timer begins. The contest will close automatically after the duration ends. Ensure you have a stable connection.
                                </p>
                            </div>

                            <div className="flex justify-center gap-4">
                                <button
                                    type="button"
                                    onClick={() => setAttemptModal({ show: false, contest: null })}
                                    className="px-6 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition font-medium"
                                >
                                    Cancel
                                </button>
                                <Link
                                    to={`/contests/${attemptModal.contest._id}`}
                                    className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold shadow-lg shadow-red-900/50 transition transform hover:scale-105"
                                >
                                    Start Contest
                                </Link>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Create Contest Modal */}
            {
                showCreateModal && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-4">
                        <div className="bg-[#151515] border border-gray-800 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">
                            {/* Header */}
                            <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                                <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                                    <Plus className="text-purple-500" /> Create New Contest
                                </h3>
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="text-gray-500 hover:text-white transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Body */}
                            <form onSubmit={handleCreateContest} className="overflow-y-auto p-6 space-y-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">Contest Title</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full bg-[#1e1e1e] border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-purple-500 outline-none transition-colors"
                                            placeholder="e.g. Weekly Codeminati Challenge #1"
                                            value={newContest.title}
                                            onChange={(e) => setNewContest({ ...newContest, title: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                                        <textarea
                                            rows={3}
                                            className="w-full bg-[#1e1e1e] border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-purple-500 outline-none transition-colors resize-none"
                                            placeholder="Tell participants what this contest is about..."
                                            value={newContest.description}
                                            onChange={(e) => setNewContest({ ...newContest, description: e.target.value })}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-1 flex items-center gap-1">
                                                <Calendar size={14} /> Start Time (IST)
                                            </label>
                                            <input
                                                type="datetime-local"
                                                required
                                                className="w-full bg-[#1e1e1e] border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-purple-500 outline-none transition-colors"
                                                value={newContest.startTime}
                                                onChange={(e) => setNewContest({ ...newContest, startTime: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-1 flex items-center gap-1">
                                                <Clock size={14} /> End Time (IST)
                                            </label>
                                            <input
                                                type="datetime-local"
                                                required
                                                className="w-full bg-[#1e1e1e] border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-purple-500 outline-none transition-colors"
                                                value={newContest.endTime}
                                                onChange={(e) => setNewContest({ ...newContest, endTime: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center justify-between">
                                            <div className="flex items-center gap-1">
                                                <BookOpen size={14} /> Select Problems ({newContest.problems.length} selected)
                                            </div>
                                            <div className="relative">
                                                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
                                                <input
                                                    type="text"
                                                    placeholder="Search problems..."
                                                    className="bg-gray-800 border border-gray-700 rounded-md pl-8 pr-3 py-1 text-xs text-white focus:border-purple-500 outline-none w-48"
                                                    value={problemSearch}
                                                    onChange={(e) => setProblemSearch(e.target.value)}
                                                />
                                            </div>
                                        </label>
                                        <div className="bg-[#1e1e1e] border border-gray-700 rounded-lg p-3 h-64 overflow-y-auto space-y-2">
                                            {allProblems.length === 0 ? (
                                                <div className="text-gray-500 text-center py-10">No problems available</div>
                                            ) : (
                                                allProblems
                                                    .filter(p =>
                                                        p.title.toLowerCase().includes(problemSearch.toLowerCase()) ||
                                                        p.difficulty.toLowerCase().includes(problemSearch.toLowerCase()) ||
                                                        (p.isHidden && 'hidden'.includes(problemSearch.toLowerCase()))
                                                    )
                                                    .map(p => (
                                                        <div
                                                            key={p._id}
                                                            onClick={() => toggleProblemSelection(p._id)}
                                                            className={`p-3 rounded-lg border cursor-pointer flex justify-between items-center transition-all ${newContest.problems.includes(p._id)
                                                                ? 'bg-purple-600/20 border-purple-500 text-white'
                                                                : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-600'
                                                                }`}
                                                        >
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-sm font-bold">{p.title}</span>
                                                                    {p.isHidden && (
                                                                        <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-500/10 text-red-500 text-[9px] font-black tracking-widest uppercase border border-red-500/20">
                                                                            <EyeOff size={8} /> HIDDEN
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div className={`text-[10px] uppercase font-bold ${p.difficulty === 'Easy' ? 'text-green-500' :
                                                                    p.difficulty === 'Hard' ? 'text-red-500' :
                                                                        'text-yellow-500'
                                                                    }`}>
                                                                    {p.difficulty}
                                                                </div>
                                                            </div>
                                                            {newContest.problems.includes(p._id) && (
                                                                <CheckCircle size={16} className="text-purple-400" />
                                                            )}
                                                        </div>
                                                    ))
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4 sticky bottom-0 bg-[#151515] pb-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateModal(false)}
                                        className="flex-1 px-6 py-3 bg-gray-800 text-gray-400 hover:text-white rounded-lg font-bold transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={creating}
                                        className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-lg font-bold shadow-lg shadow-purple-900/50 transition-all disabled:opacity-50"
                                    >
                                        {creating ? 'Creating...' : 'Create Contest'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default Contests;
