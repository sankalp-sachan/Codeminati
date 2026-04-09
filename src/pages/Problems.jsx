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
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
            <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur opacity-30 animate-pulse"></div>
                <div className="relative bg-gray-900/80 backdrop-blur-xl border border-gray-800 p-8 rounded-full inline-block mb-8 shadow-2xl">
                    <CheckCircle size={56} className="text-blue-400" />
                </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent drop-shadow-sm">
                Coming Soon
            </h1>
            <p className="text-gray-400 text-lg md:text-xl max-w-2xl mb-12 leading-relaxed">
                We're crafting an extraordinary problem-solving experience. Get ready to challenge yourself with our curated collection of coding problems, running on an advanced decentralized judging system.
            </p>
            <div className="flex items-center space-x-3 text-sm text-gray-500 font-bold uppercase tracking-widest bg-gray-900/50 px-6 py-3 rounded-full border border-gray-800/50">
                <Flame size={18} className="text-pink-500" />
                <span>Under Construction</span>
                <Flame size={18} className="text-pink-500" />
            </div>
        </div>
    );
};

export default Problems;
