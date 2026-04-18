import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, Lock, Trophy, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import ConfirmationModal from '../components/ConfirmationModal';
import Loader from '../components/Loader';

const ContestDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [contest, setContest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState(null);
    const [requesting, setRequesting] = useState(false);
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
        type: 'warning'
    });

    const isSolved = (problemId) => {
        return contest?.userStatus?.solvedProblems?.includes(problemId);
    };

    const isEnded = timeLeft === "Ended";

    const closeConfirmModal = () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
    };

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
            const startTime = new Date(contest.startTime).getTime();
            const end = new Date(contest.endTime).getTime();
            
            if (now < startTime) {
                const diff = startTime - now;
                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                setTimeLeft(`Starts in: ${days > 0 ? days + "d " : ""}${hours}h ${minutes}m ${seconds}s`);
            } else if (now > end) {
                setTimeLeft("Ended");
            } else {
                const distance = end - now;
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



    // Registration and Approval checks removed as per user request

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
                            onClick={() => {
                                setConfirmModal({
                                    isOpen: true,
                                    title: 'Finish Contest',
                                    message: "Are you sure you want to finish the contest? You won't be able to submit anymore.",
                                    type: 'warning',
                                    onConfirm: async () => {
                                        try {
                                            await client.post(`/contests/${id}/finish`);
                                            toast.success("Contest submitted successfully!");
                                            closeConfirmModal();
                                            window.location.reload();
                                        } catch (e) {
                                            toast.error("Error finishing contest");
                                            closeConfirmModal();
                                        }
                                    }
                                });
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

            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={closeConfirmModal}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                type={confirmModal.type}
                confirmText="Yes, Finish"
                cancelText="Cancel"
            />
        </div >
    );
};

export default ContestDetail;
