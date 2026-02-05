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

        }, 1000);

        return () => clearInterval(interval);
    }, [contest]);

    // Prevent Closing Warning
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (contest && !isEnded) {
                const message = "Are you sure you want to leave? Your contest timer is running.";
                e.preventDefault();
                e.returnValue = message;
                return message;
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [contest, timeLeft]);

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

    const isEnded = timeLeft === "Ended";



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
        const approvalStatus = contest.approvalStatus;
        const now = new Date();
        const startTime = new Date(contest.startTime);
        const hasStarted = now >= startTime;

        let title = "Restricted Access";
        let message = "Access to this contest is currently restricted. You must be approved by an administrator before the contest starts.";
        let iconColor = "text-orange-500";
        let bgColor = "bg-orange-500/10";

        if (approvalStatus === 'pending') {
            title = "Approval Pending";
            message = "Your request is being reviewed by an administrator. Please check back later.";
            iconColor = "text-yellow-500";
            bgColor = "bg-yellow-500/10";
        } else if (approvalStatus === 'rejected') {
            title = "Request Rejected";
            message = "Your request to participate in this contest was rejected. Unfortunately, you cannot enter this contest.";
            iconColor = "text-red-500";
            bgColor = "bg-red-500/10";
        } else if (approvalStatus === 'late_approval') {
            title = "Late Approval";
            message = "Your request was approved after the contest started. According to rules, you must be approved BEFORE the start time to participate.";
            iconColor = "text-red-500";
            bgColor = "bg-red-500/10";
        } else if (approvalStatus === 'blocked') {
            title = "Entry Blocked";
            message = "You cannot enter this contest because you were not approved by an administrator before the start time.";
            iconColor = "text-red-500";
            bgColor = "bg-red-500/10";
        } else if (hasStarted && (approvalStatus === 'none' || approvalStatus === 'guest')) {
            title = "Entry Closed";
            message = "This contest has already started and you did not have a pre-approved request.";
            iconColor = "text-red-500";
            bgColor = "bg-red-500/10";
        }

        return (
            <div className="container mx-auto px-4 py-20 text-center max-w-xl">
                <div className="bg-gray-800/50 p-10 rounded-2xl border border-gray-700 shadow-xl">
                    <div className={`mb-6 inline-flex p-4 rounded-full ${bgColor} border border-current`}>
                        <Lock className={`w-12 h-12 ${iconColor}`} />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-4">
                        {title}
                    </h1>
                    <p className="text-gray-400 text-lg leading-relaxed mb-8">
                        {message}
                    </p>

                    <div className="flex flex-col gap-3">
                        {!hasStarted && (approvalStatus === 'none' || approvalStatus === 'guest') && (
                            <button
                                onClick={handleRequestAccess}
                                disabled={requesting}
                                className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {requesting ? 'Requesting...' : 'Request Approval for Contest'}
                            </button>
                        )}

                        {approvalStatus === 'pending' && !hasStarted && (
                            <div className="w-full py-4 bg-yellow-600/20 text-yellow-500 border border-yellow-500/30 rounded-xl font-bold">
                                Approval Pending...
                            </div>
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
                            {timeLeft}
                        </div>
                    )}
                </div>

                {contest.userStatus?.completed && (
                    <div className="mt-6 bg-green-500/20 border border-green-500/50 p-4 rounded-lg flex items-center gap-3 text-green-400">
                        <Trophy className="w-6 h-6" />
                        <span className="font-bold">Congratulations! You have completed this contest and earned 500 bonus coins!</span>
                    </div>
                )}

                {/* BUTTON: Finish / End Contest or View Leaderboard */}
                <div className="flex justify-end mt-4 gap-4">
                    {contest.resultsPublished && (
                        <Link
                            to={`/judge/leaderboard?contestId=${id}`}
                            className="bg-amber-600 hover:bg-amber-500 text-white font-bold py-2 px-6 rounded-lg transition-colors shadow-lg flex items-center gap-2"
                        >
                            <Trophy size={18} />
                            View Results
                        </Link>
                    )}

                    {!isEnded && !contest.userStatus?.completed && (
                        <button
                            onClick={async () => {
                                if (window.confirm("Are you sure you want to finish the contest? You won't be able to submit anymore.")) {
                                    try {
                                        await client.post(`/contests/${id}/finish`);
                                        alert("Contest submitted successfully!");
                                        window.location.reload();
                                    } catch (e) {
                                        alert("Error finishing contest");
                                    }
                                }
                            }}
                            className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-6 rounded-lg transition-colors shadow-lg"
                        >
                            Finish Contest
                        </button>
                    )}
                </div>
            </div>

            <div className="space-y-4">
                <h2 className="text-xl font-semibold text-white mb-4">Tasks</h2>
                {(contest.problems || []).map((problem, index) => {
                    const solved = isSolved(problem._id);
                    const isCompleted = contest.userStatus?.completed;

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
                                {isEnded || isCompleted ? (
                                    <span className="px-4 py-2 bg-gray-700 text-gray-400 rounded-lg text-sm font-medium cursor-not-allowed">
                                        {isCompleted ? "Completed" : "Ended"}
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
