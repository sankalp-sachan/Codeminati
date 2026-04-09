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
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
            <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur opacity-30 animate-pulse"></div>
                <div className="relative bg-gray-900/80 backdrop-blur-xl border border-gray-800 p-8 rounded-full inline-block mb-8 shadow-2xl">
                    <Trophy size={56} className="text-purple-400" />
                </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent drop-shadow-sm">
                Coming Soon
            </h1>
            <p className="text-gray-400 text-lg md:text-xl max-w-2xl mb-12 leading-relaxed">
                Get ready to compete! We are building an exhilarating competitive programming environment where you can test your skills against the best.
            </p>
            <div className="flex items-center space-x-3 text-sm text-gray-500 font-bold uppercase tracking-widest bg-gray-900/50 px-6 py-3 rounded-full border border-gray-800/50">
                <Bell size={18} className="text-pink-500" />
                <span>Stay Tuned</span>
                <Bell size={18} className="text-pink-500" />
            </div>
        </div>
    );
};

export default Contests;
