import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, Circle, ArrowRight, Search, ChevronLeft, ChevronRight, Clock, ChevronDown, Calendar, Flame } from 'lucide-react';
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

    // Local state for UI inputs (syncs to URL)
    const [searchQuery, setSearchQuery] = useState(initialSearch);
    const [selectedDifficulty, setSelectedDifficulty] = useState(initialDifficulty);
    const [selectedStatus, setSelectedStatus] = useState(initialStatus);
    const [selectedCategory, setSelectedCategory] = useState(initialCategory);

    const [categories, setCategories] = useState([]);
    const [showCategories, setShowCategories] = useState(false);



    // Pagination State (driven by URL mostly, but kept for ease)
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

        setSearchParams(params, { replace: true });
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

    useEffect(() => {
        // Only reset page if filters change (not on initial load or page change itself)
        // Check if filters effectively changed compared to what's in URL to avoid loop or unnecessary resets
        // Actually, cleaner logic: 
        // We watch the "filter" states. If they change, we should reset page to 1 UNLESS it's the initial hydration.
        // But since we use URL as source of truth, simpler approach:
        // Let the user change local state -> triggers URL update -> triggers fetch?
        // Or specific effect resets page?

        // Let's keep it simple: When a FILTER value changes, manually setPage(1)
        // This effect handles the fetching only.
    }, []);



    // Filter change handler helpers
    const handleSearchChange = (val) => { setSearchQuery(val); setPage(1); };
    const handleDifficultyChange = (val) => { setSelectedDifficulty(val); setPage(1); };
    const handleStatusChange = (val) => { setSelectedStatus(val); setPage(1); };
    const handleCategoryChange = (val) => { setSelectedCategory(val); setPage(1); };

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

                if (data.problems) {
                    setProblems(data.problems);
                    setTotalPages(data.pages);
                    setTotalProblems(data.total);
                } else {
                    setProblems(data);
                }
            } catch (error) {
                console.error(error);
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


    const handleProblemClick = (e, problem) => {
        // Premium check removed
    };

    const getStatusIcon = (status, isPremium) => {
        // If user is premium, premium problems show normal status icons
        // If user is premium, premium problems show normal status icons

        switch (status) {
            case 'Solved':
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'Attempted':
                return <Clock className="h-5 w-5 text-yellow-500" />;
            default:
                return <Circle className="h-5 w-5 text-gray-600" />;
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <h1 className="text-3xl font-bold mb-8">All Problems</h1>



            <div className="flex flex-col space-y-4 mb-6">
                {/* Search Bar */}
                <div className="relative w-full md:w-1/2">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-lg leading-5 bg-gray-800 text-gray-300 placeholder-gray-400 focus:outline-none focus:bg-gray-700 focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"
                        placeholder="Search problems..."
                        value={searchQuery}
                        onChange={(e) => handleSearchChange(e.target.value)}
                    />
                </div>

                <div className="flex flex-col md:flex-row gap-4 flex-wrap">
                    {/* Status Filters */}
                    <div className="flex space-x-2 items-center">
                        <span className="text-sm text-gray-400 mr-2">Status:</span>
                        {['All', 'Solved', 'Attempted', 'Todo'].map((status) => (
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
                        <span className="text-sm text-gray-400 mr-2">Difficulty:</span>
                        {['All', 'Easy', 'Medium', 'Hard'].map((diff) => (
                            <button
                                key={diff}
                                onClick={() => handleDifficultyChange(diff)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${selectedDifficulty === diff
                                    ? 'bg-primary text-white'
                                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                    }`}
                            >
                                {diff}
                            </button>
                        ))}
                    </div>

                    {/* Category Toggle */}
                    <div className="flex space-x-2 items-center">
                        <span className="text-sm text-gray-400 mr-2">Category:</span>
                        <div className="relative">
                            <button
                                onClick={() => setShowCategories(!showCategories)}
                                className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center space-x-2 ${selectedCategory !== 'All'
                                    ? 'bg-secondary text-white'
                                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                            >
                                <span>{selectedCategory}</span>
                                <ChevronDown className={`w-3 h-3 transition-transform ${showCategories ? 'rotate-180' : ''}`} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Categories Warning/Panel */}
            {showCategories && (
                <div className="mb-8 p-4 bg-[#1e1e1e] border border-gray-700 rounded-xl animate-in fade-in slide-in-from-top-2">
                    <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">Select Category</h3>
                    <div className="flex flex-wrap gap-2">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => {
                                    handleCategoryChange(cat);
                                    setShowCategories(false);
                                }}
                                className={`px-3 py-1.5 rounded-md text-xs transition-colors ${selectedCategory === cat
                                    ? 'bg-secondary text-white shadow-lg shadow-purple-900/50'
                                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader size="xl" />
                </div>
            ) : (
                <>
                    <div className="glass rounded-xl overflow-hidden mb-6">
                        <table className="w-full text-left">
                            <thead className="bg-white/5 border-b border-gray-700">
                                <tr>
                                    <th className="px-6 py-4 font-medium text-gray-400">#</th>
                                    <th className="px-6 py-4 font-medium text-gray-400">Status</th>
                                    <th className="px-6 py-4 font-medium text-gray-400">Title</th>
                                    <th className="px-6 py-4 font-medium text-gray-400">Category</th>
                                    <th className="px-6 py-4 font-medium text-gray-400">Difficulty</th>
                                    <th className="px-6 py-4 font-medium text-gray-400">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {problems.length > 0 ? (
                                    problems.map((problem, index) => (
                                        <tr key={problem._id} className="hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4 text-gray-400">
                                                {problem.problemNumber || (page - 1) * 20 + index + 1}
                                            </td>
                                            <td className="px-6 py-4">
                                                {getStatusIcon(problem.status, problem.isPremium)}
                                            </td>
                                            <td className="px-6 py-4 font-medium text-white">
                                                <Link
                                                    to={`/problems/${problem.slug}`}
                                                    className="hover:text-primary transition-colors flex items-center gap-2"
                                                    onClick={(e) => handleProblemClick(e, problem)}
                                                >
                                                    {problem.title}
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4 text-gray-300">
                                                <span className="px-2 py-1 rounded bg-gray-800 text-xs">
                                                    {problem.category}
                                                </span>
                                            </td>
                                            <td className={`px-6 py-4 font-medium ${getDifficultyColor(problem.difficulty)}`}>
                                                {problem.difficulty}
                                            </td>
                                            <td className="px-6 py-4">
                                                <Link
                                                    to={`/problems/${problem.slug}`}
                                                    className="text-primary hover:text-blue-400 flex items-center"
                                                    onClick={(e) => handleProblemClick(e, problem)}
                                                >
                                                    Solve <ArrowRight className="ml-1 h-4 w-4" />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-10 text-center text-gray-500">
                                            No problems found matching your criteria.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex flex-wrap justify-center items-center gap-2 mt-8 select-none">
                            {/* Previous Button */}
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className={`p-2 rounded-lg transition-colors ${page === 1 ? 'text-gray-600 cursor-not-allowed' : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'}`}
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </button>

                            {/* Page Numbers */}
                            {(function () {
                                const pages = new Set([1, totalPages, page]);
                                // Add Neighbors
                                if (page > 1) pages.add(page - 1);
                                if (page < totalPages) pages.add(page + 1);

                                // Add Multiples of 20 (Jump Points)
                                for (let i = 20; i < totalPages; i += 20) {
                                    pages.add(i);
                                }

                                const sortedPages = Array.from(pages).sort((a, b) => a - b);

                                return sortedPages.map((p, idx) => {
                                    const prev = sortedPages[idx - 1];
                                    const showGap = prev && p - prev > 1;

                                    return (
                                        <div key={p} className="flex items-center">
                                            {showGap && <span className="mx-1 text-gray-600">...</span>}
                                            <button
                                                onClick={() => setPage(p)}
                                                className={`min-w-[40px] h-10 px-2 rounded-lg text-sm font-medium transition-all ${page === p
                                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50 scale-105'
                                                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                                                    }`}
                                            >
                                                {p}
                                            </button>
                                        </div>
                                    );
                                });
                            })()}

                            {/* Next Button */}
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className={`p-2 rounded-lg transition-colors ${page === totalPages ? 'text-gray-600 cursor-not-allowed' : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'}`}
                            >
                                <ChevronRight className="h-5 w-5" />
                            </button>
                        </div>
                    )}
                </>
            )}

        </div>
    );
};

export default Problems;
