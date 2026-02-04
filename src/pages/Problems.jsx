import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, Circle, ArrowRight, Search, ChevronLeft, ChevronRight, Clock, ChevronDown, Calendar, Flame, Check, EyeOff, Eye } from 'lucide-react';
import Loader from '../components/Loader';

const Problems = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    // Initialize state from URL params
    const initialPage = parseInt(searchParams.get('page')) || 1;
    const initialSearch = searchParams.get('search') || '';
    const initialDifficulty = searchParams.get('difficulty') || 'All';
    const initialStatus = searchParams.get('status') || 'All';
    const initialCategory = searchParams.get('category') || 'All';

    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState(initialSearch);
    const [selectedDifficulty, setSelectedDifficulty] = useState(initialDifficulty);
    const [selectedStatus, setSelectedStatus] = useState(initialStatus);
    const [selectedCategory, setSelectedCategory] = useState(initialCategory);
    const [categories, setCategories] = useState(['All']);
    const [showCategories, setShowCategories] = useState(false);

    const [page, setPage] = useState(initialPage);
    const [totalPages, setTotalPages] = useState(1);
    const [totalProblems, setTotalProblems] = useState(0);

    // Update URL when filters/page change
    useEffect(() => {
        const params = {};
        if (page > 1) params.page = page;
        if (searchQuery) params.search = searchQuery;
        if (selectedDifficulty !== 'All') params.difficulty = selectedDifficulty;
        if (selectedStatus !== 'All') params.status = selectedStatus;
        if (selectedCategory !== 'All') params.category = selectedCategory;
        setSearchParams(params);
    }, [page, searchQuery, selectedDifficulty, selectedStatus, selectedCategory, setSearchParams]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const { data } = await client.get('/problems/categories');
                setCategories(['All', ...data]);
            } catch (error) {
                console.error('Failed to fetch categories');
            }
        };
        fetchCategories();
    }, []);

    const handleSearchChange = (val) => {
        setSearchQuery(val);
        setPage(1);
    };

    const handleDifficultyChange = (val) => {
        setSelectedDifficulty(val);
        setPage(1);
    };

    const handleStatusChange = (val) => {
        setSelectedStatus(val);
        setPage(1);
    };

    const handleCategoryChange = (val) => {
        setSelectedCategory(val);
        setPage(1);
    };

    const handleHideProblem = async (slug) => {
        if (!user || user.role !== 'admin') {
            toast.error('Only admins can hide problems');
            return;
        }
        try {
            const { data } = await client.post(`/problems/${slug}/hide`);
            toast.success(data.message);
            // Update local state to reflect visibility change
            setProblems(prev => prev.map(p =>
                p.slug === slug ? { ...p, isHidden: data.isHidden } : p
            ));
        } catch (error) {
            console.error(error);
            toast.error('Failed to update problem visibility');
        }
    };

    useEffect(() => {
        const fetchProblems = async () => {
            setLoading(true);
            try {
                const queryParams = new URLSearchParams();
                if (searchQuery) queryParams.append('search', searchQuery);
                if (selectedDifficulty !== 'All') queryParams.append('difficulty', selectedDifficulty);
                if (selectedStatus !== 'All') queryParams.append('status', selectedStatus);
                if (selectedCategory !== 'All') queryParams.append('category', selectedCategory);
                queryParams.append('page', page);
                queryParams.append('limit', 20);

                const { data } = await client.get(`/problems?${queryParams.toString()}`);
                setProblems(data.problems);
                setTotalPages(data.pages);
                setTotalProblems(data.total);
            } catch (error) {
                console.error(error);
                toast.error('Failed to fetch problems');
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(() => {
            fetchProblems();
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchQuery, selectedDifficulty, selectedStatus, selectedCategory, page]);

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'Easy': return 'text-green-400';
            case 'Medium': return 'text-yellow-400';
            case 'Hard': return 'text-red-400';
            default: return 'text-gray-400';
        }
    };

    const getStatusIcon = (status) => {
        if (status === 'Solved') return <Check size={18} className="text-green-500" />;
        if (status === 'Attempted') return <div className="w-4 h-4 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />;
        return <div className="w-4 h-4 rounded-full border-2 border-gray-700" />;
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <h1 className="text-3xl font-bold mb-8">All Problems</h1>

            <div className="flex flex-col space-y-4 mb-6">
                {/* Search Bar */}
                <div className="relative w-full md:w-1/2">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                    <input
                        type="text"
                        className="w-full bg-black/20 border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        placeholder="Search problems..."
                        value={searchQuery}
                        onChange={(e) => handleSearchChange(e.target.value)}
                    />
                </div>

                <div className="flex flex-col md:flex-row gap-4 flex-wrap">
                    {/* Status Filters */}
                    <div className="flex space-x-2 items-center">
                        {['All', 'Todo', 'Solved', 'Attempted'].map(status => (
                            <button
                                key={status}
                                onClick={() => handleStatusChange(status)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${selectedStatus === status
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                    }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>

                    {/* Difficulty Filters */}
                    <div className="flex space-x-2 items-center">
                        {['All', 'Easy', 'Medium', 'Hard'].map(diff => (
                            <button
                                key={diff}
                                onClick={() => handleDifficultyChange(diff)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${selectedDifficulty === diff
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                    }`}
                            >
                                {diff}
                            </button>
                        ))}
                    </div>

                    {/* Category Toggle */}
                    <div className="relative">
                        <button
                            onClick={() => setShowCategories(!showCategories)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center space-x-2 ${selectedCategory !== 'All'
                                ? 'bg-purple-600 text-white'
                                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                }`}
                        >
                            <span>{selectedCategory === 'All' ? 'Categories' : selectedCategory}</span>
                            <ChevronDown className={`w-3 h-3 transition-transform ${showCategories ? 'rotate-180' : ''}`} />
                        </button>

                        {showCategories && (
                            <div className="absolute top-full left-0 mt-2 w-64 bg-gray-950 border border-gray-800 rounded-xl shadow-2xl z-50 p-2 grid grid-cols-2 gap-1">
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => { handleCategoryChange(cat); setShowCategories(false); }}
                                        className={`px-3 py-2 rounded-lg text-[10px] text-left uppercase font-bold tracking-tighter transition-colors ${selectedCategory === cat
                                            ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/50'
                                            : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                                            }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader size="xl" />
                </div>
            ) : (
                <div className="bg-gray-950/40 border border-gray-800 rounded-2xl overflow-hidden backdrop-blur-sm">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-800/50 text-xs font-bold text-gray-500 uppercase tracking-widest px-6 py-3">
                                <th className="px-6 py-4">#</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Title</th>
                                <th className="px-6 py-4">Difficulty</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {problems.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-10 text-center text-gray-500 font-medium">No problems match your criteria.</td>
                                </tr>
                            ) : (
                                problems.map((problem, index) => (
                                    <tr key={problem._id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4 text-gray-500 font-mono text-sm">
                                            {problem.problemNumber || (page - 1) * 20 + index + 1}
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusIcon(problem.status)}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-white">
                                            <Link
                                                to={`/problems/${problem.slug}`}
                                                className="hover:text-blue-400 transition"
                                            >
                                                {problem.title}
                                            </Link>
                                        </td>
                                        <td className={`px-6 py-4 text-sm font-semibold ${getDifficultyColor(problem.difficulty)}`}>
                                            {problem.difficulty}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="bg-gray-800 text-gray-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter">
                                                {problem.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end space-x-3">
                                                {user?.role === 'admin' && (
                                                    <button
                                                        onClick={() => handleHideProblem(problem.slug)}
                                                        className={`p-1.5 rounded-lg transition-all opacity-0 group-hover:opacity-100 ${problem.isHidden
                                                                ? 'text-yellow-500 bg-yellow-400/10 hover:bg-yellow-400/20'
                                                                : 'text-gray-500 hover:text-red-400 hover:bg-red-400/10'
                                                            }`}
                                                        title={problem.isHidden ? "Unhide Problem" : "Hide Problem"}
                                                    >
                                                        {problem.isHidden ? <Eye size={16} /> : <EyeOff size={16} />}
                                                    </button>
                                                )}
                                                <Link
                                                    to={`/problems/${problem.slug}`}
                                                    className="inline-flex items-center space-x-2 text-sm text-blue-400 hover:text-blue-300 font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <span>Solve</span>
                                                    <ArrowRight size={14} />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between px-6 py-4 bg-gray-900/40 border-t border-gray-800">
                            <div className="text-sm text-gray-500">
                                Showing <span className="text-white font-medium">{(page - 1) * 20 + 1}</span> to <span className="text-white font-medium">{Math.min(page * 20, totalProblems)}</span> of <span className="text-white font-medium">{totalProblems}</span> problems
                            </div>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => setPage(page - 1)}
                                    disabled={page === 1}
                                    className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white disabled:opacity-30 disabled:hover:text-gray-400 transition"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <div className="flex space-x-1">
                                    {[...Array(totalPages)].map((_, i) => (
                                        <button
                                            key={i + 1}
                                            onClick={() => setPage(i + 1)}
                                            className={`w-8 h-8 rounded-lg text-sm font-medium transition ${page === i + 1
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                                }`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={() => setPage(page + 1)}
                                    disabled={page === totalPages}
                                    className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white disabled:opacity-30 disabled:hover:text-gray-400 transition"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Problems;
