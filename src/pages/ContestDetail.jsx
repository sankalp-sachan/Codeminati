import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, Lock, Trophy, Clock } from 'lucide-react';
import Loader from '../components/Loader';

const ContestDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [contest, setContest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState(null);
    const [personalTimeLeft, setPersonalTimeLeft] = useState(null);
    const [requesting, setRequesting] = useState(false);

    useEffect(() => {
        const fetchContest = async () => {
            try {
                const { data } = await client.get(`/contests/${id}`);
                setContest(data);
            } catch (error) {
                console.error("Failed to fetch contest details", error);
            } finally {
                setLoading(false);
            }
        };
        fetchContest();
    }, [id, user]);

    // Timer Logic
    useEffect(() => {
        if (!contest) return;

        const interval = setInterval(() => {
            const now = new Date().getTime();

            // Global Timer
            const end = new Date(contest.endTime).getTime();
            const distance = end - now;

            if (distance < 0) {
                setTimeLeft("Ended");
            } else {
                const days = Math.floor(distance / (1000 * 60 * 60 * 24));
                const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);
                setTimeLeft(`${days > 0 ? days + "d " : ""}${hours}h ${minutes}m ${seconds}s`);
            }

            // Personal Timer (60 mins from start)
            if (contest.userStatus?.startedAt) {
                const startedAt = new Date(contest.userStatus.startedAt).getTime();
                const personalEnd = startedAt + (60 * 60 * 1000); // 60 minutes
                const personalDist = personalEnd - now;

                if (personalDist < 0) {
                    setPersonalTimeLeft("00:00:00");
                } else {
                    const pHours = Math.floor((personalDist % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    const pMinutes = Math.floor((personalDist % (1000 * 60 * 60)) / (1000 * 60));
                    const pSeconds = Math.floor((personalDist % (1000 * 60)) / 1000);
                    setPersonalTimeLeft(`${pHours.toString().padStart(2, '0')}:${pMinutes.toString().padStart(2, '0')}:${pSeconds.toString().padStart(2, '0')}`);
                }
            }

        }, 1000);

        return () => clearInterval(interval);
    }, [contest]);

    // Prevent Closing Warning
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (contest && !isEnded && personalTimeLeft !== "00:00:00") {
                const message = "Are you sure you want to leave? Your contest timer is running.";
                e.preventDefault();
                e.returnValue = message;
                return message;
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [contest, timeLeft, personalTimeLeft]);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader size="xl" />
            </div>
        );
    }
    if (!contest) return <div className="p-8 text-center text-red-500">Contest not found.</div>;

    const isSolved = (problemId) => {
        return contest.userStatus?.solvedProblems?.includes(problemId);
    };

    const isEnded = timeLeft === "Ended" || personalTimeLeft === "00:00:00";



    const handleRequestAccess = async () => {
        try {
            setRequesting(true);
            const { data } = await client.post(`/contests/${id}/access-request`);
            // Update local state to pending
            setContest(prev => ({
                ...prev,
                approvalStatus: 'pending',
                userStatus: { ...prev.userStatus, approvalStatus: 'pending' }
            }));
            alert(data.message); // Simple alert or toast
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || 'Failed to request access');
        } finally {
            setRequesting(false);
        }
    };

    // Approval Handlers
    if (contest.accessDenied) {
        const now = new Date().getTime();
        const start = new Date(contest.startTime).getTime();
        const diffMinutes = (start - now) / (1000 * 60);
        const canRequest = diffMinutes <= 10 && diffMinutes > 0;

        return (
            <div className="container mx-auto px-4 py-20 text-center max-w-xl">
                <div className="bg-gray-800/50 p-10 rounded-2xl border border-gray-700 shadow-xl">
                    <div className="mb-6 inline-flex p-4 rounded-full bg-orange-500/10 border border-orange-500/20">
                        <Lock className="w-12 h-12 text-orange-500" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-4">
                        {contest.approvalStatus === 'pending' ? 'Participation Pending' :
                            contest.approvalStatus === 'rejected' ? 'Access Denied' : 'Restricted Access'}
                    </h1>
                    <p className="text-gray-400 text-lg leading-relaxed mb-8">
                        {contest.approvalStatus === 'pending'
                            ? "You've requested to join this contest. Please wait for the assistant to approve your entry."
                            : contest.approvalStatus === 'rejected'
                                ? "Your request to participate in this contest was rejected by the assistant."
                                : canRequest
                                    ? "This contest requires check-in. You can request access now!"
                                    : `Access to this contest is currently restricted. Check-in opens 10 minutes before start.`
                        }
                    </p>

                    <div className="flex flex-col gap-3">
                        {contest.approvalStatus === 'guest' && canRequest && (
                            <button
                                onClick={handleRequestAccess}
                                disabled={requesting}
                                className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-colors disabled:opacity-50"
                            >
                                {requesting ? 'Requesting...' : 'Request Early Access'}
                            </button>
                        )}

                        <button
                            onClick={() => window.location.reload()}
                            className="w-full py-4 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-bold transition-colors"
                        >
                            Refresh Status
                        </button>
                        <Link
                            to="/contests"
                            className="w-full py-4 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-bold transition-colors"
                        >
                            Back to Contests
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            <div className="mb-8 p-6 bg-gray-800/50 rounded-xl border border-gray-700 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                <h1 className="text-3xl font-bold text-white mb-2">{contest.title}</h1>
                <p className="text-gray-400 mb-4">{contest.description}</p>

                <div className="flex items-center gap-4 text-sm">
                    <div className="bg-gray-900/50 px-3 py-1 rounded border border-gray-700 text-gray-300">
                        Problems: <span className="text-white font-bold">{contest.problems?.length || 0}</span>
                    </div>
                    <div className="bg-gray-900/50 px-3 py-1 rounded border border-gray-700 text-gray-300">
                        Reward: <span className="text-yellow-400 font-bold">10 Coins/Task</span>
                    </div>
                    <div className="bg-gray-900/50 px-3 py-1 rounded border border-gray-700 text-gray-300">
                        Bonus: <span className="text-yellow-400 font-bold">500 Coins</span>
                    </div>

                    {/* Global Timer */}
                    {timeLeft && (
                        <div className={`
                            px-4 py-1 rounded-full font-mono font-bold flex items-center gap-2
                            ${timeLeft === "Ended"
                                ? 'bg-red-500/10 border border-red-500/50 text-red-500'
                                : 'bg-gray-700/50 border border-gray-600 text-gray-400'
                            }
                        `}>
                            <Clock className="w-4 h-4" />
                            {timeLeft} (End)
                        </div>
                    )}

                    {/* Personal Timer */}
                    {personalTimeLeft && (
                        <div className={`
                            px-4 py-1 rounded-full font-mono font-bold flex items-center gap-2 animate-pulse
                            ${personalTimeLeft === "00:00:00"
                                ? 'bg-red-500/10 border border-red-500/50 text-red-500'
                                : 'bg-green-500/10 border border-green-500/50 text-green-400'
                            }
                        `}>
                            <Clock className="w-4 h-4" />
                            {personalTimeLeft} (You)
                        </div>
                    )}
                </div>

                {contest.userStatus?.completed && (
                    <div className="mt-6 bg-green-500/20 border border-green-500/50 p-4 rounded-lg flex items-center gap-3 text-green-400">
                        <Trophy className="w-6 h-6" />
                        <span className="font-bold">Congratulations! You have completed this contest and earned 500 bonus coins!</span>
                    </div>
                )}
            </div>

            <div className="space-y-4">
                <h2 className="text-xl font-semibold text-white mb-4">Tasks</h2>
                {contest.problems.map((problem, index) => {
                    const solved = isSolved(problem._id);
                    return (
                        <div key={problem._id} className={`flex items-center justify-between p-4 rounded-lg border ${solved ? 'bg-green-900/10 border-green-800' : 'bg-gray-800 border-gray-700'} hover:border-gray-500 transition`}>
                            <div className="flex items-center gap-4">
                                <div className={`w-8 h-8 flex items-center justify-center rounded-full ${solved ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-400'}`}>
                                    {solved ? <CheckCircle size={18} /> : <span>{index + 1}</span>}
                                </div>
                                <div>
                                    <h3 className="font-medium text-white text-lg">{problem.title}</h3>
                                    <span className={`text-xs px-2 py-0.5 rounded ${problem.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
                                        problem.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                            'bg-red-500/20 text-red-400'
                                        }`}>
                                        {problem.difficulty}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                {solved && <span className="text-yellow-400 font-bold text-sm">+10 Coins</span>}
                                {isEnded ? (
                                    <span className="px-4 py-2 bg-gray-700 text-gray-400 rounded-lg text-sm font-medium cursor-not-allowed">
                                        Ended
                                    </span>
                                ) : (
                                    <Link
                                        to={`/contests/${id}/solve/${problem.slug}`}
                                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition"
                                    >
                                        Solve
                                    </Link>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ContestDetail;
