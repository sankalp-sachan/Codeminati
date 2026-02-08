import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import { Trophy, Clock, Medal, Activity, Search, AlertTriangle, ChevronLeft, Calendar, Users, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import Loader from '../components/Loader';
import { toast } from 'react-hot-toast';
import ConfirmationModal from '../components/ConfirmationModal';

const JudgeLeaderboard = () => {
    const { user } = useAuth();
    const isAdminOrJudge = user && (user.role === 'admin' || user.role === 'judge' || user.role === 'assistant');

    const [searchParams, setSearchParams] = useSearchParams();
    const contestIdParam = searchParams.get('contestId');

    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(false);
    const [socket, setSocket] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [timeLeft, setTimeLeft] = useState('02:00:00'); // Mock Timer

    // Contest Filtering
    const [contests, setContests] = useState([]);
    const [selectedContestId, setSelectedContestId] = useState(contestIdParam || null);
    const [selectedContest, setSelectedContest] = useState(null);

    // User Detail Modal State
    const [selectedUser, setSelectedUser] = useState(null);
    const [userDetails, setUserDetails] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);

    // Sync state with URL params (for browser back/forward)
    useEffect(() => {
        setSelectedContestId(contestIdParam);
    }, [contestIdParam]);

    useEffect(() => {
        const fetchContests = async () => {
            try {
                const { data } = await client.get('/contests');
                setContests(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Failed to fetch contests", err);
                setContests([]);
            }
        };
        fetchContests();
    }, []);

    // Restore selected contest details if refreshing on a specific contest page
    useEffect(() => {
        if (contests.length > 0 && selectedContestId) {
            const found = contests.find(c => c._id === selectedContestId);
            if (found) setSelectedContest(found);
        }
    }, [contests, selectedContestId]);

    useEffect(() => {
        if (!selectedContestId) return;

        // Fetch Leaderboard when contest changes
        const fetchLeaderboard = async () => {
            setLoading(true);
            try {
                const { data } = await client.get(`/leaderboard?contestId=${selectedContestId}`);
                setLeaderboard(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('Failed to fetch leaderboard', error);
                setLeaderboard([]);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();

        // Socket Connection
        const API_URL = import.meta.env.VITE_API_URL || 'https://codeminati-backend.onrender.com/api';
        const SOCKET_URL = API_URL.replace('/api', '');
        const newSocket = io(SOCKET_URL);
        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('Connected to Leaderboard Socket');
            newSocket.emit('join_leaderboard');
        });

        newSocket.on('leaderboardUpdate', (update) => {
            console.log('Live Update:', update);
            setLeaderboard(prev => {
                // Update or Add user
                const existingIndex = prev.findIndex(u => u.userId === update.userId);
                let newList = [...prev];

                if (existingIndex !== -1) {
                    newList[existingIndex] = { ...newList[existingIndex], ...update };
                } else {
                    newList.push(update);
                }

                // Re-sort
                return newList.sort((a, b) => {
                    if (b.score !== a.score) return b.score - a.score;
                    return new Date(a.lastSubmission) - new Date(b.lastSubmission);
                }).map((u, i) => ({ ...u, rank: i + 1 }));
            });
        });

        return () => {
            newSocket.disconnect();
        };
    }, [selectedContestId]);

    const handleContestSelect = (contest) => {
        setSelectedContest(contest);
        setSelectedContestId(contest._id);
        setSearchParams({ contestId: contest._id });
    };

    const handleBackToContests = () => {
        setSelectedContestId(null);
        setSelectedContest(null);
        setLeaderboard([]);
        setSearchParams({});
        setSelectedUser(null);
    };

    const handleUserClick = async (user) => {
        setSelectedUser(user);
        setLoadingDetails(true);
        try {
            const { data } = await client.get(`/leaderboard/details/${selectedContestId}/${user.userId}`);
            setUserDetails(data);
        } catch (error) {
            console.error('Failed to fetch user details', error);
        } finally {
            setLoadingDetails(false);
        }
    };

    const closeUserModal = () => {
        setSelectedUser(null);
        setUserDetails(null);
    };

    // Confirmation Modal State
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
        type: 'info'
    });

    const closeConfirmModal = () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
    };

    const handleAwardBadge = (badge, user) => {
        setConfirmModal({
            isOpen: true,
            title: 'Award Badge',
            message: `Are you sure you want to award the badge "${badge}" to ${user.username}?`,
            type: 'warning',
            onConfirm: async () => {
                try {
                    await client.post(`/admin/users/${user.userId}/badge`, { badge });
                    toast.success(`Badge "${badge}" awarded successfully!`);
                    closeConfirmModal();
                } catch (err) {
                    console.error(err);
                    toast.error(err.response?.data?.message || 'Failed to award badge');
                    closeConfirmModal();
                }
            }
        });
    };

    const getRankIcon = (rank) => {
        if (rank === 1) return <Medal className="h-6 w-6 text-yellow-500" />;
        if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />;
        if (rank === 3) return <Medal className="h-6 w-6 text-orange-500" />;
        return <span className="text-gray-400 font-mono w-6 text-center">{rank}</span>;
    };

    const filteredLeaderboard = (Array.isArray(leaderboard) ? leaderboard : []).filter(u =>
        u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.name && u.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    // VIEW 1: CONTEST SELECTION (BOXES)
    if (!selectedContestId) {
        return (
            <div className="min-h-screen bg-[#0f0f15] text-white p-8">
                <div className="max-w-7xl mx-auto space-y-8">
                    <div className="text-center md:text-left border-b border-gray-800 pb-8">
                        <h1 className="text-4xl font-black bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent flex items-center gap-3 justify-center md:justify-start">
                            <Trophy className="h-10 w-10 text-yellow-500" />
                            {isAdminOrJudge ? 'Judge Control Center' : 'Contest Hall of Fame'}
                        </h1>
                        <p className="text-gray-400 mt-2">
                            {isAdminOrJudge
                                ? 'Select a contest to monitor live rankings and integrity violations.'
                                : 'View the final standings and performance of participants.'}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {contests.map((contest) => (
                            <button
                                key={contest._id}
                                onClick={() => handleContestSelect(contest)}
                                className="group relative overflow-hidden rounded-2xl bg-[#1e1e1e] border border-gray-800 p-6 text-left transition-all hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 transition-opacity group-hover:opacity-100" />

                                <div className="relative z-10 space-y-4">
                                    <div className="flex items-start justify-between">
                                        <div className="rounded-lg bg-blue-500/10 p-3 text-blue-400">
                                            <Trophy className="h-6 w-6" />
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${new Date(contest.endTime) < new Date() ? 'bg-gray-800 text-gray-400' : 'bg-green-500/20 text-green-500'}`}>
                                            {new Date(contest.endTime) < new Date() ? 'Ended' : 'Active'}
                                        </span>
                                    </div>

                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                                            {contest.title}
                                        </h3>
                                        <div className="flex items-center gap-4 text-sm text-gray-400">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="h-4 w-4" />
                                                <span>{new Date(contest.startTime).toLocaleDateString()}</span>
                                            </div>
                                            {/* <div className="flex items-center gap-1.5">
                                                <Users className="h-4 w-4" />
                                                <span>42 Participants</span>
                                            </div> */}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 text-sm font-medium text-blue-400 pt-4 group-hover:gap-3 transition-all">
                                        View Live Standings <ArrowRight className="h-4 w-4" />
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // VIEW 2: LEADERBOARD DETAIL
    return (
        <div className="min-h-screen bg-[#0f0f15] text-white p-8">
            {/* User Detail Modal */}
            {selectedUser && (
                <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm" onClick={closeUserModal}>
                    <div className="bg-[#1e1e1e] rounded-xl border border-gray-700 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl relative" onClick={e => e.stopPropagation()}>
                        <button onClick={closeUserModal} className="absolute top-4 right-4 text-gray-400 hover:text-white sticky z-10 bg-[#1e1e1e] p-2 rounded-full">
                            <ChevronLeft className="rotate-180 h-6 w-6" />
                        </button>

                        <div className="p-8">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xl font-bold shadow-lg">
                                    {selectedUser.avatar ? <img src={selectedUser.avatar} className="h-full w-full rounded-full object-cover" /> : selectedUser.username?.[0]?.toUpperCase()}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white">{selectedUser.name || selectedUser.username}</h2>
                                    <p className="text-gray-400">@{selectedUser.username} • Rank #{selectedUser.rank}</p>
                                </div>
                                <div className="ml-auto text-right">
                                    <div className="text-3xl font-mono font-bold text-green-400">{selectedUser.score} pts</div>
                                    <div className="text-sm text-gray-500">{selectedUser.problemsSolved} Solved</div>
                                </div>
                            </div>

                            {loadingDetails ? <Loader size="lg" /> : userDetails && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Column 1: Submissions Timeline */}
                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                            <Activity className="h-5 w-5 text-blue-500" />
                                            Submission Timeline
                                        </h3>
                                        <div className="space-y-4">
                                            {userDetails.problemDetails.map((prob, idx) => (
                                                <div key={prob.problemId} className={`p-4 rounded-lg border ${prob.status === 'Solved' ? 'bg-green-500/10 border-green-500/30' : 'bg-gray-800/50 border-gray-800'}`}>
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <div className="text-sm text-gray-400 mb-1">Question {idx + 1}</div>
                                                            <div className="font-bold text-white">{prob.title}</div>
                                                            <div className={`text-xs mt-1 inline-block px-2 py-0.5 rounded ${prob.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
                                                                prob.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                                                    'bg-red-500/20 text-red-400'
                                                                }`}>
                                                                {prob.difficulty}
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            {prob.status === 'Solved' ? (
                                                                <>
                                                                    <div className="text-green-400 font-bold">+{prob.points} pts</div>
                                                                    <div className="text-xs text-gray-500 mt-1">
                                                                        {Math.floor(prob.timeTaken / 60000)}m to solve
                                                                    </div>
                                                                    <div className="text-xs text-gray-600">
                                                                        {new Date(prob.solvedAt).toLocaleTimeString()}
                                                                    </div>
                                                                </>
                                                            ) : (
                                                                <div className="text-gray-600 text-sm">Not Solved</div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Column 2: Violations */}
                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                            <AlertTriangle className="h-5 w-5 text-red-500" />
                                            Integrity Report
                                        </h3>
                                        {userDetails.activities && userDetails.activities.length > 0 ? (
                                            <div className="bg-red-500/5 border border-red-500/20 rounded-xl overflow-hidden">
                                                {userDetails.activities.map((act, i) => (
                                                    <div key={i} className="p-4 border-b border-red-500/10 last:border-0 flex items-start gap-3">
                                                        <AlertTriangle className="h-4 w-4 text-red-500 mt-1 shrink-0" />
                                                        <div>
                                                            <div className="text-red-400 font-bold text-sm">
                                                                {act.action === 'tab_switch' ? 'Tab Switch' :
                                                                    act.action === 'window_blur' ? 'Window Blur' : 'Suspicious Activity'}
                                                            </div>
                                                            <div className="text-gray-400 text-xs mt-1">
                                                                {new Date(act.timestamp).toLocaleTimeString()}
                                                            </div>
                                                            {act.details && <div className="text-gray-500 text-xs mt-1">{act.details}</div>}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="p-8 text-center text-gray-500 bg-gray-800/30 rounded-xl border border-gray-800">
                                                <div className="text-green-500 mb-2">● Clean Record</div>
                                                No suspicious activities detected.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Award Badge Section */}
                            <div className="mt-8 border-t border-gray-700 pt-8">
                                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                    <Trophy className="h-5 w-5 text-yellow-500" />
                                    Award Badge
                                </h3>
                                <div className="flex flex-wrap gap-4">
                                    {['Hackathon Participant', 'First Prize', 'Second Position', 'Third Position'].map((badge) => (
                                        <button
                                            key={badge}
                                            onClick={() => handleAwardBadge(badge, selectedUser)}
                                            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-medium transition-colors flex items-center gap-2"
                                        >
                                            <Medal className="h-4 w-4" />
                                            {badge}
                                        </button>
                                    ))}
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto">
                <button
                    onClick={handleBackToContests}
                    className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
                >
                    <ChevronLeft className="h-5 w-5" />
                    Back to Contests
                </button>

                {/* Header */}
                <div className="flex flex-col md:flex-row items-center justify-between mb-10 border-b border-gray-800 pb-8">
                    <div>
                        <h1 className="text-3xl font-black bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent flex items-center gap-3">
                            <Activity className="h-8 w-8 text-green-500" />
                            {selectedContest?.title || 'Contest'} Leaderboard
                        </h1>
                        <p className="text-gray-400 mt-2 flex items-center gap-2">
                            Monitoring live submissions and integrity violations
                        </p>
                    </div>

                    {/* Timer & Stats */}
                    <div className="flex items-center gap-6 mt-6 md:mt-0">
                        {/* <div className="bg-[#1e1e1e] px-6 py-3 rounded-xl border border-gray-800 text-center">
                            <span className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Time Remaining</span>
                            <div className="text-2xl font-mono font-bold text-white flex items-center gap-2">
                                <Clock className="h-5 w-5 text-blue-500" />
                                {timeLeft}
                            </div>
                        </div> */}
                        <div className="bg-[#1e1e1e] px-6 py-3 rounded-xl border border-gray-800 text-center">
                            <span className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Active Users</span>
                            <div className="text-2xl font-mono font-bold text-green-400">
                                {leaderboard?.length || 0}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex justify-between items-center mb-6">
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search participant..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[#1e1e1e] border border-gray-800 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none"
                        />
                    </div>
                </div>

                {/* Table */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader size="xl" />
                    </div>
                ) : (
                    <div className="bg-[#1e1e1e]/50 backdrop-blur rounded-2xl border border-gray-800 overflow-hidden shadow-2xl">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/5 border-b border-gray-700">
                                    <th className="px-6 py-5 font-semibold text-gray-400 text-xs uppercase tracking-wider">Rank</th>
                                    <th className="px-6 py-5 font-semibold text-gray-400 text-xs uppercase tracking-wider">Participant</th>
                                    <th className="px-6 py-5 font-semibold text-gray-400 text-xs uppercase tracking-wider text-right">Score</th>
                                    <th className="px-6 py-5 font-semibold text-gray-400 text-xs uppercase tracking-wider text-center">Problems</th>
                                    {isAdminOrJudge && <th className="px-6 py-5 font-semibold text-gray-400 text-xs uppercase tracking-wider text-center">Violations</th>}
                                    <th className="px-6 py-5 font-semibold text-gray-400 text-xs uppercase tracking-wider text-right">Last Submission</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {filteredLeaderboard.map((user, index) => (
                                    <tr
                                        key={user.userId}
                                        onClick={() => handleUserClick(user)}
                                        className={`group transition-all hover:bg-white/5 cursor-pointer ${index < 3 ? 'bg-gradient-to-r from-yellow-500/5 to-transparent' : ''}`}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center justify-center w-8 h-8">
                                                {getRankIcon(user.rank)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-sm font-bold shadow-lg mr-4">
                                                    {user.avatar ? (
                                                        <img src={user.avatar} alt="" className="h-full w-full rounded-full object-cover" />
                                                    ) : (
                                                        user.username?.[0]?.toUpperCase()
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                                                        {user.name || user.username}
                                                    </div>
                                                    <div className="text-xs text-gray-500">@{user.username}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="text-sm font-mono font-bold text-blue-400">
                                                {user.score}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-800 text-gray-300 border border-gray-700">
                                                {user.problemsSolved}
                                            </span>
                                        </td>
                                        {isAdminOrJudge && (
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <div className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${user.violations > 5 ? 'bg-red-500/20 text-red-500 border-red-500/30' :
                                                    user.violations > 0 ? 'bg-orange-500/20 text-orange-500 border-orange-500/30' :
                                                        'bg-green-500/20 text-green-500 border-green-500/30'
                                                    }`}>
                                                    {user.violations > 0 && <AlertTriangle className="h-3 w-3" />}
                                                    <span>{user.violations}</span>
                                                </div>
                                            </td>
                                        )}
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                                            {user.lastSubmission ? new Date(user.lastSubmission).toLocaleTimeString() : '-'}
                                        </td>
                                    </tr>
                                ))}
                                {filteredLeaderboard.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-10 text-center text-gray-500">
                                            No participants found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={closeConfirmModal}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                type={confirmModal.type}
                confirmText="Yes, Award"
                cancelText="Cancel"
            />
        </div>
    );
};

export default JudgeLeaderboard;
