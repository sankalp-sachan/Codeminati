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
        <div className="container mx-auto px-4 py-8 max-w-7xl animate-in fade-in duration-700">
            {/* Page Header & Stats Section */}
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Practice Problems</h1>
                    <p className="text-gray-400">Master your coding skills with our curated collection of technical challenges.</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-[#1e1e2e]/50 border border-gray-800 p-4 rounded-2xl flex flex-col">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Total</span>
                        <span className="text-2xl font-black text-white">{totalProblems}</span>
                    </div>
                    <div className="bg-green-500/5 border border-green-500/20 p-4 rounded-2xl flex flex-col">
                        <span className="text-xs font-bold text-green-500/70 uppercase tracking-wider mb-1">Solved</span>
                        <span className="text-2xl font-black text-green-400">
                            {user?.problemsSolved?.length || 0}
                        </span>
                    </div>
                    <div className="bg-orange-500/5 border border-orange-500/20 p-4 rounded-2xl flex flex-col">
                        <span className="text-xs font-bold text-orange-500/70 uppercase tracking-wider mb-1">Streak</span>
                        <div className="flex items-center gap-2">
                             <Flame size={20} className="text-orange-500" />
                             <span className="text-2xl font-black text-orange-400">{user?.streak || 0}</span>
                        </div>
                    </div>
                    <div className="bg-blue-500/5 border border-blue-500/20 p-4 rounded-2xl flex flex-col">
                        <span className="text-xs font-bold text-blue-500/70 uppercase tracking-wider mb-1">Points</span>
                        <span className="text-2xl font-black text-blue-400">{user?.points || 0}</span>
                    </div>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-[#1e1e2e]/50 backdrop-blur-md border border-gray-800 rounded-2xl p-4 mb-8 sticky top-4 z-30 shadow-2xl flex flex-wrap items-center gap-4">
                <div className="relative flex-1 min-w-[280px]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search problems by title or keywords..."
                        value={searchQuery}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="w-full bg-[#0b0b13] text-white border border-gray-800 rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder:text-gray-600 font-medium"
                    />
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {/* Difficulty Filter */}
                    <div className="relative">
                        <select
                            value={selectedDifficulty}
                            onChange={(e) => handleDifficultyChange(e.target.value)}
                            className="bg-[#0b0b13] text-gray-300 border border-gray-800 rounded-xl py-3 px-6 appearance-none cursor-pointer focus:ring-2 focus:ring-blue-500/20 outline-none font-bold text-sm min-w-[140px] hover:border-gray-700 transition-colors"
                        >
                            <option value="All">All Difficulties</option>
                            <option value="Easy">Easy</option>
                            <option value="Medium">Medium</option>
                            <option value="Hard">Hard</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
                    </div>

                    {/* Status Filter */}
                    <div className="relative">
                        <select
                            value={selectedStatus}
                            onChange={(e) => handleStatusChange(e.target.value)}
                            className="bg-[#0b0b13] text-gray-300 border border-gray-800 rounded-xl py-3 px-6 appearance-none cursor-pointer focus:ring-2 focus:ring-blue-500/20 outline-none font-bold text-sm min-w-[140px] hover:border-gray-700 transition-colors"
                        >
                            <option value="All">All Status</option>
                            <option value="Solved">Solved</option>
                            <option value="Unsolved">Unsolved</option>
                            <option value="Attempted">Attempted</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
                    </div>

                    {/* Category Filter */}
                    <div className="relative">
                        <select
                            value={selectedCategory}
                            onChange={(e) => handleCategoryChange(e.target.value)}
                            className="bg-[#0b0b13] text-gray-300 border border-gray-800 rounded-xl py-3 px-6 appearance-none cursor-pointer focus:ring-2 focus:ring-blue-500/20 outline-none font-bold text-sm min-w-[160px] hover:border-gray-700 transition-colors"
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat === 'All' ? 'All Topics' : cat}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
                    </div>
                </div>
            </div>

            {/* Results Table */}
            <div className="bg-[#1e1e2e]/30 border border-gray-800 rounded-2xl overflow-hidden shadow-xl min-h-[400px]">
                {loading ? (
                    <div className="flex items-center justify-center p-20">
                        <Loader size="xl" />
                    </div>
                ) : problems.length === 0 ? (
                    <div className="p-20 text-center">
                        <div className="bg-gray-800/30 p-6 rounded-full inline-block mb-4">
                            <Search size={48} className="text-gray-600" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">No problems found</h3>
                        <p className="text-gray-500 max-w-md mx-auto">Try adjusting your filters or search query to find what you're looking for.</p>
                        <button 
                            onClick={() => {
                                setSearchQuery('');
                                setSelectedDifficulty('All');
                                setSelectedStatus('All');
                                setSelectedCategory('All');
                            }}
                            className="mt-6 text-blue-400 font-bold hover:text-blue-300 transition-colors"
                        >
                            Clear all filters
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-800 bg-gray-900/50">
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest text-center w-16">#</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest text-center w-20">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Problem</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Difficulty</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Category</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800/50">
                                {problems.map((problem, index) => (
                                    <tr 
                                        key={problem._id} 
                                        className={`group hover:bg-white/[0.02] transition-colors cursor-pointer ${problem.isHidden ? 'opacity-50' : ''}`}
                                        onClick={() => navigate(`/problems/${problem.slug}`)}
                                    >
                                        <td className="px-6 py-5 text-center">
                                            <span className="text-gray-500 font-mono text-xs">{(page - 1) * 20 + index + 1}</span>
                                        </td>
                                        <td className="px-6 py-5 flex items-center justify-center">
                                            {getStatusIcon(problem.userStatus)}
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <span className="text-white font-bold group-hover:text-blue-400 transition-colors">{problem.title}</span>
                                                {problem.isHidden && (
                                                    <span className="bg-gray-800 text-gray-400 text-[10px] px-2 py-0.5 rounded flex items-center gap-1">
                                                        <EyeOff size={10} /> Hidden
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`text-sm font-black ${getDifficultyColor(problem.difficulty)}`}>
                                                {problem.difficulty}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-wrap gap-1">
                                                {Array.isArray(problem.category) ? problem.category.map(cat => (
                                                    <span key={cat} className="text-[10px] bg-gray-800/50 text-gray-400 px-2 py-1 rounded-md font-bold uppercase tracking-tighter">
                                                        {cat}
                                                    </span>
                                                )) : (
                                                    <span className="text-[10px] bg-gray-800/50 text-gray-400 px-2 py-1 rounded-md font-bold uppercase tracking-tighter">
                                                        {problem.category}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex items-center justify-end gap-3">
                                                {user?.role === 'admin' && (
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleHideProblem(problem.slug);
                                                        }}
                                                        className="p-2 text-gray-500 hover:text-white transition-colors"
                                                        title={problem.isHidden ? "Unhide Problem" : "Hide Problem"}
                                                    >
                                                        {problem.isHidden ? <Eye size={18} /> : <EyeOff size={18} />}
                                                    </button>
                                                )}
                                                <Link
                                                    to={`/problems/${problem.slug}`}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="inline-flex items-center gap-2 bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white px-5 py-2 rounded-xl text-sm font-bold transition-all active:scale-95"
                                                >
                                                    Solve <ArrowRight size={14} />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {!loading && totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-4">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="p-3 bg-gray-900 border border-gray-800 rounded-xl text-gray-400 hover:text-white hover:border-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    
                    <div className="flex items-center gap-2">
                        {[...Array(totalPages)].map((_, i) => {
                            const p = i + 1;
                            // Show first, last, current, and neighbors
                            if (p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)) {
                                return (
                                    <button
                                        key={p}
                                        onClick={() => setPage(p)}
                                        className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${
                                            page === p 
                                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40 scale-110' 
                                                : 'bg-gray-900 border border-gray-800 text-gray-500 hover:text-white hover:border-gray-600'
                                        }`}
                                    >
                                        {p}
                                    </button>
                                );
                            } else if (p === page - 2 || p === page + 2) {
                                return <span key={p} className="text-gray-600">...</span>;
                            }
                            return null;
                        })}
                    </div>

                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="p-3 bg-gray-900 border border-gray-800 rounded-xl text-gray-400 hover:text-white hover:border-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            )}

            {/* Daily Challenge Promo */}
            <div className="mt-20 relative group overflow-hidden rounded-3xl border border-blue-500/20 bg-gradient-to-br from-blue-900/20 via-black to-purple-900/20 p-8 text-center md:text-left shadow-2xl">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-500/20 transition-all duration-700"></div>
                 <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div>
                        <div className="inline-flex items-center gap-2 bg-blue-500 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                            <Clock size={12} /> Live Now
                        </div>
                        <h2 className="text-3xl font-black text-white mb-3">Daily Challenge</h2>
                        <p className="text-gray-400 max-w-lg mb-6 leading-relaxed">
                            Solve a unique problem every day to maintain your streak and earn exclusive badges and bonus coins.
                        </p>
                        <Link 
                            to="/daily-challenge" 
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white px-8 py-3 rounded-xl font-bold hover:scale-105 transition-all shadow-xl shadow-blue-900/20"
                        >
                            Start Challenge <CheckCircle size={18} />
                        </Link>
                    </div>
                    <div className="hidden lg:block relative">
                         <div className="w-48 h-48 bg-gray-800 rounded-3xl border border-gray-700 p-6 flex flex-col justify-between transform rotate-3 hover:rotate-0 transition-transform duration-500">
                             <div className="flex justify-between items-start">
                                 <div className="p-2 bg-blue-500/20 rounded-lg"><Calendar className="text-blue-400" size={24} /></div>
                                 <div className="text-right"><div className="text-2xl font-black text-white">16</div><div className="text-[10px] font-bold text-gray-500 uppercase">April 2026</div></div>
                             </div>
                             <div className="mt-auto">
                                 <div className="text-sm font-bold text-white mb-2">Today's Streak</div>
                                 <div className="h-1.5 w-full bg-gray-700 rounded-full overflow-hidden">
                                     <div className="h-full bg-blue-500 w-[70%]" />
                                 </div>
                             </div>
                         </div>
                    </div>
                 </div>
            </div>
        </div>
    );
};

export default Problems;
