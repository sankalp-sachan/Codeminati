import { useState, useEffect } from 'react';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import useAntiCheat from '../hooks/useAntiCheat';
import Editor from '@monaco-editor/react';
import { Play, Check, AlertTriangle, ChevronDown, ChevronLeft, Lightbulb, Clock, Plus, Trash2, Save, Cloud, Maximize2, Minimize2, GripVertical, GripHorizontal, Coins, Ticket, Gem, Award, RotateCcw, Info } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import client from '../api/client';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';

const HintAccordion = ({ hint, index }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border border-gray-700/50 rounded-lg overflow-hidden bg-gray-800/10">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-3 text-left hover:bg-white/5 transition-colors"
            >
                <div className="flex items-center space-x-2 text-sm font-medium text-gray-300">
                    <Lightbulb className="h-4 w-4 text-yellow-500" />
                    <span>Hint {index + 1}</span>
                </div>
                <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="p-4 pt-0 text-sm text-gray-400 border-t border-gray-700/30 mt-2 bg-black/20">
                    <div className="pt-2">
                        <ReactMarkdown>{hint}</ReactMarkdown>
                    </div>
                </div>
            )}
        </div>
    );
};

const ContestProblem = () => {
    const { id: contestId, slug } = useParams(); // 'id' from route /contests/:id/solve/:slug
    const navigate = useNavigate();
    const location = useLocation();
    const { user, updateUser } = useAuth();

    const [problem, setProblem] = useState(null);
    const [code, setCode] = useState('');
    const [language, setLanguage] = useState('javascript');

    const [codeMap, setCodeMap] = useState({});

    // Contest State
    const [contestEndTime, setContestEndTime] = useState(null);
    const [timeLeft, setTimeLeft] = useState(null);
    const [isContestEnded, setIsContestEnded] = useState(false);

    // Issue 5: Track Start Time
    const [startTime, setStartTime] = useState(Date.now());

    // Update startTime when problem/slug changes
    useEffect(() => {
        setStartTime(Date.now());
    }, [slug]);

    // Issue 6: Violation Listeners
    // Violation Listeners REMOVED by user request






    // UI State
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('description');
    const [activeBottomTab, setActiveBottomTab] = useState('testcase');

    // Test Case State
    const [userTestCases, setUserTestCases] = useState([]);
    const [activeTestCaseId, setActiveTestCaseId] = useState(0);
    const [testResults, setTestResults] = useState(null);
    const [overallStatus, setOverallStatus] = useState(null);


    const [lastSavedCode, setLastSavedCode] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // Success Modal State
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [modalData, setModalData] = useState(null);

    // Reset Confirmation Modal State
    const [showResetConfirm, setShowResetConfirm] = useState(false);

    // Console Visibility State
    const [isConsoleOpen, setIsConsoleOpen] = useState(true);

    // Layout State
    const [leftPanelWidth, setLeftPanelWidth] = useState(50); // Percentage
    const [editorHeight, setEditorHeight] = useState(60); // Percentage for Editor Height (Console Height = 100 - editorHeight)
    const [isDragging, setIsDragging] = useState(false);
    const [isDraggingVertical, setIsDraggingVertical] = useState(false);
    const [fullScreenMode, setFullScreenMode] = useState(null); // 'description', 'compiler', or null

    const [error, setError] = useState(null);

    // Fetch Problem & Progress
    useEffect(() => {
        const fetchProblemAndProgress = async () => {
            try {
                // 1. Fetch Problem
                const { data: problemData } = await client.get(`/problems/${slug}`);
                setProblem(problemData);

                // Default initialization
                let initialLang = user?.preferredLanguage || 'python';
                let initialCode = problemData.starterCode?.[initialLang] ||
                    problemData.starterCode?.python ||
                    problemData.starterCode?.python3 ||
                    problemData.starterCode?.cpp ||
                    problemData.starterCode?.['c++'] ||
                    problemData.starterCode?.c ||
                    '// Write your code here';
                let initialMap = {};

                // 2. Fetch Progress (if logged in)
                if (user) {
                    try {
                        const { data: progressData } = await client.get(`/problems/${slug}/progress`);
                        if (progressData) {
                            console.log('Restoring progress...');
                            initialMap = progressData.codes || {};

                            // If we have saved progress, that takes precedence over preferred language
                            initialLang = progressData.language || initialLang;
                            initialCode = initialMap[initialLang] || problemData.starterCode?.[initialLang] || initialCode;
                        }
                    } catch (err) {
                        console.error('Failed to fetch progress', err);
                    }
                }

                setLanguage(initialLang);
                setCode(initialCode);
                setCodeMap(initialMap);
                setLastSavedCode(initialCode);

                // Initialize user test cases
                if (problemData.examples && problemData.examples.length > 0) {
                    setUserTestCases(problemData.examples.map((ex, i) => ({
                        id: i,
                        input: ex.input,
                        expectedOutput: ex.output
                    })));
                } else {
                    setUserTestCases([{ id: 0, input: 'Input here...', expectedOutput: '' }]);
                }

            } catch (error) {
                console.error(error);
                setError('Problem not found or could not be loaded.');
                toast.error('Failed to load problem');
            }
        };
        fetchProblemAndProgress();
    }, [slug, user]);

    // Fetch Contest Details for Timer & Navigation
    const [contestProblems, setContestProblems] = useState([]);

    useEffect(() => {
        if (contestId) {
            const fetchContest = async () => {
                try {
                    const { data } = await client.get(`/contests/${contestId}`);
                    setContestEndTime(new Date(data.endTime));
                    if (data.problems) setContestProblems(data.problems);
                } catch (err) {
                    console.error('Failed to fetch contest details', err);
                }
            };
            fetchContest();
        }
    }, [contestId]);

    // Navigation Logic
    const currentProblemIndex = contestProblems.findIndex(p => p.slug === slug);
    const prevProblem = currentProblemIndex > 0 ? contestProblems[currentProblemIndex - 1] : null;
    const nextProblem = currentProblemIndex !== -1 && currentProblemIndex < contestProblems.length - 1 ? contestProblems[currentProblemIndex + 1] : null;

    const handleNavigateProblem = (targetSlug) => {
        // Navigate to the contest problem route
        navigate(`/contests/${contestId}/solve/${targetSlug}`);
    };

    // Timer Logic
    useEffect(() => {
        if (!contestEndTime) return;

        const interval = setInterval(() => {
            const now = new Date();
            const diff = contestEndTime - now;

            if (diff <= 0) {
                setTimeLeft('00:00:00');
                setIsContestEnded(true);
                clearInterval(interval);
                toast.error('Contest Ended! Submissions disabled.');
            } else {
                const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
                const m = Math.floor((diff / (1000 * 60)) % 60);
                const s = Math.floor((diff / 1000) % 60);
                setTimeLeft(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [contestEndTime]);

    useEffect(() => {
        if (!user || !code || code === lastSavedCode) return;

        const timeoutId = setTimeout(async () => {
            setIsSaving(true);
            try {
                await client.post(`/problems/${slug}/progress`, { code, language });
                setLastSavedCode(code);
                setCodeMap(prev => ({ ...prev, [language]: code }));
            } catch (error) {
                console.error('Auto-save failed', error);
            } finally {
                setIsSaving(false);
            }
        }, 2000);

        return () => clearTimeout(timeoutId);
    }, [code, language, slug, user, lastSavedCode]);

    const handleLanguageChange = (newLang) => {
        const updatedMap = { ...codeMap, [language]: code };
        setCodeMap(updatedMap);

        const savedCode = updatedMap[newLang];
        const starter = problem?.starterCode?.[newLang] || '// Write your code here';

        setLanguage(newLang);
        setCode(savedCode || starter);
        setLastSavedCode(savedCode || starter);
    };

    const handleReset = () => {
        setShowResetConfirm(true);
    };

    const confirmReset = () => {
        const starter = problem?.starterCode?.[language] || '// Write your code here';
        setCode(starter);
        setShowResetConfirm(false);
    };

    const handleRun = async () => {
        if (!user) {
            toast.error('Please login to run code');
            return;
        }
        setLoading(true);
        setIsConsoleOpen(true);
        setActiveBottomTab('result');
        setTestResults(null);
        setOverallStatus('Running...');

        try {
            const { data } = await client.post(`/problems/${slug}/submit`, {
                code,
                language,
                mode: 'run',
                testCases: userTestCases,
                startTime: startTime // Send start time
            });

            setOverallStatus(data.status);
            setTestResults(data.results);

        } catch (error) {
            toast.error('Run failed');
            setOverallStatus('Error');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!user) {
            toast.error('Please login to submit code');
            return;
        }
        setLoading(true);
        try {
            const { data } = await client.post(`/problems/${slug}/submit`, {
                code,
                language,
                mode: 'submit',
                contestId,
                startTime: startTime // Send start time
            });

            if (data.status === 'Accepted') {
                toast.success('Accepted!');
                if (data.userStats) {
                    updateUser(data.userStats);
                }

                // Show Success Modal with Metrics
                if (data.metrics) {
                    setModalData({
                        code,
                        language,
                        metrics: data.metrics,
                        passedCases: data.passedCases || problem.testCases?.length || 0,
                        totalCases: data.totalCases || problem.testCases?.length || 0
                    });
                    setShowSuccessModal(true);
                }

            } else {
                toast.error(data.status);
            }
            setActiveTab('description');
        } catch (error) {
            toast.error('Submission failed');
        } finally {
            setLoading(false);
        }
    };

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Run Code: Ctrl + '
            if ((e.ctrlKey || e.metaKey) && e.key === "'") {
                e.preventDefault();
                handleRun();
            }
            // Submit Code: Ctrl + Enter
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                handleSubmit();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleRun, handleSubmit]);

    const handleAddTestCase = () => {
        const newId = userTestCases.length;
        setUserTestCases([...userTestCases, { id: newId, input: 'New Input', expectedOutput: '' }]);
        setActiveTestCaseId(newId);
    };

    const handleRemoveTestCase = (deleteId) => {
        if (userTestCases.length <= 1) return;
        const newCases = userTestCases.filter(c => c.id !== deleteId);
        setUserTestCases(newCases);
        setActiveTestCaseId(0);
    };

    const handleTestCaseChange = (val) => {
        const updatedCases = [...userTestCases];
        updatedCases[activeTestCaseId].input = val;
        setUserTestCases(updatedCases);
    };

    const handleDragStart = (e) => {
        setIsDragging(true);
        e.preventDefault();
    };

    const handleDragMove = (e) => {
        if (!isDragging) return;
        const newWidth = (e.clientX / window.innerWidth) * 100;
        if (newWidth > 20 && newWidth < 80) {
            setLeftPanelWidth(newWidth);
        }
    };

    const handleDragEnd = () => {
        setIsDragging(false);
    };

    useEffect(() => {
        if (isDragging) {
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none'; // Prevent text selection while dragging
            window.addEventListener('mousemove', handleDragMove);
            window.addEventListener('mouseup', handleDragEnd);
        } else {
            document.body.style.cursor = 'default';
            document.body.style.userSelect = 'auto';
            window.removeEventListener('mousemove', handleDragMove);
            window.removeEventListener('mouseup', handleDragEnd);
        }
        return () => {
            document.body.style.cursor = 'default';
            document.body.style.userSelect = 'auto'; // Cleanup
            window.removeEventListener('mousemove', handleDragMove);
            window.removeEventListener('mouseup', handleDragEnd);
        };
    }, [isDragging]);

    const handleVerticalDragStart = (e) => {
        setIsDraggingVertical(true);
        e.preventDefault();
    };

    const handleVerticalDragMove = (e) => {
        if (!isDraggingVertical) return;
        // Calculate relative to the container height
        const containerHeight = window.innerHeight - 64 - 48; // Header + Toolbar approx
        // We need the Y position relative to the top of the content area.
        const newHeight = ((e.clientY - 64 - 48) / containerHeight) * 100;

        if (newHeight > 20 && newHeight < 80) {
            setEditorHeight(newHeight);
        }
    };

    const handleVerticalDragEnd = () => {
        setIsDraggingVertical(false);
    };

    useEffect(() => {
        if (isDraggingVertical) {
            document.body.style.cursor = 'row-resize';
            document.body.style.userSelect = 'none';
            window.addEventListener('mousemove', handleVerticalDragMove);
            window.addEventListener('mouseup', handleVerticalDragEnd);
        } else {
            document.body.style.cursor = 'default';
            document.body.style.userSelect = 'auto';
            window.removeEventListener('mousemove', handleVerticalDragMove);
            window.removeEventListener('mouseup', handleVerticalDragEnd);
        }
        return () => {
            document.body.style.cursor = 'default';
            document.body.style.userSelect = 'auto';
            window.removeEventListener('mousemove', handleVerticalDragMove);
            window.removeEventListener('mouseup', handleVerticalDragEnd);
        };
    }, [isDraggingVertical]);

    const toggleFullScreen = (mode) => {
        if (fullScreenMode === mode) {
            setFullScreenMode(null);
            setLeftPanelWidth(50);
        } else {
            setFullScreenMode(mode);
            if (mode === 'description') setLeftPanelWidth(100);
            if (mode === 'compiler') setLeftPanelWidth(0);
        }
    };

    if (error) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#0f0f15] flex-col space-y-4">
                <AlertTriangle className="h-16 w-16 text-red-500" />
                <h2 className="text-2xl font-bold text-white">{error}</h2>
                <button
                    onClick={() => navigate(`/contests/${contestId}`)}
                    className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors text-white"
                >
                    Back to Contest
                </button>
            </div>
        );
    }

    if (!problem) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#0f0f15]">
                <Loader size="xl" />
            </div>
        );
    }

    const showLeftPanel = fullScreenMode !== 'compiler';
    const showRightPanel = fullScreenMode !== 'description';

    return (
        <div className="h-[calc(100vh-64px)] flex flex-col bg-[#0f0f15] relative">

            {/* Reset Confirmation Modal */}
            {showResetConfirm && (
                <div className="absolute inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-[#262626] rounded-xl border border-gray-700 w-full max-w-md shadow-2xl p-6 transform scale-100 animate-in fade-in zoom-in duration-200">
                        <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0 bg-green-500 rounded-full p-2">
                                <Info className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-semibold text-white mb-2">Are you sure?</h3>
                                <p className="text-gray-300 text-sm leading-relaxed">
                                    Your current code will be discarded and reset to the default code!
                                </p>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end space-x-3">
                            <button
                                onClick={() => setShowResetConfirm(false)}
                                className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-500 text-white text-sm font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmReset}
                                className="px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm font-medium transition-colors"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Modal Overlay */}
            {showSuccessModal && modalData && (
                <div className="absolute inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-[#1e1e1e] rounded-xl border border-gray-700 w-full max-w-5xl shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-300 h-[85vh] flex flex-col">
                        {/* Close Button */}
                        <button
                            onClick={() => setShowSuccessModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white z-10 bg-black/20 p-1 rounded-full"
                        >
                            <Trash2 className="rotate-45" size={20} />
                        </button>

                        <div className="flex flex-col md:flex-row h-full overflow-hidden">
                            {/* Left Panel: Stats */}
                            <div className="w-full md:w-5/12 p-6 md:p-8 border-b md:border-b-0 md:border-r border-gray-700 flex flex-col overflow-y-auto">
                                <div className="flex items-center space-x-3 mb-6">
                                    <h2 className="text-3xl font-bold text-green-500">Accepted</h2>
                                    <span className="text-gray-400 text-sm font-mono">{modalData.passedCases || 'All'}/{modalData.totalCases || 'All'} testcases passed</span>
                                </div>

                                <div className="flex items-center space-x-3 mb-8">
                                    {user.avatar ? (
                                        <img src={user.avatar} alt="User" className="w-8 h-8 rounded-full" />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white">
                                            {user.username?.[0]?.toUpperCase()}
                                        </div>
                                    )}
                                    <span className="text-white font-bold">{user.username}</span>
                                    <span className="text-gray-500 text-sm">submitted just now</span>
                                </div>

                                <div className="space-y-6">
                                    {/* Runtime Card */}
                                    <div className="bg-[#2d2d2d] rounded-xl p-4 border border-gray-700 relative overflow-hidden group">
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center space-x-2">
                                                <Clock className="w-5 h-5 text-gray-400" />
                                                <span className="font-bold text-lg text-white">Runtime</span>
                                            </div>
                                            <div className="text-xs text-green-400 font-bold bg-green-900/30 px-2 py-1 rounded">
                                                Accepted
                                            </div>
                                        </div>

                                        <div className="mb-4">
                                            <span className="text-4xl font-extrabold text-white">{modalData.metrics.runtime}</span>
                                            <span className="text-xl text-gray-400 ml-1">ms</span>
                                        </div>

                                        <div className="text-sm text-gray-300">
                                            Beats <span className="font-bold text-white">{modalData.metrics.runtimePercentile}%</span> of users with {modalData.language}
                                        </div>

                                        {/* Simple Bar Graph Visualization */}
                                        <div className="mt-4 h-16 flex items-end space-x-1 pb-2 border-b border-gray-600">
                                            {[...Array(15)].map((_, i) => {
                                                const height = Math.random() * 80 + 20;
                                                // Highlight one bar roughly based on percentile
                                                const isUser = Math.abs(i - Math.floor((100 - modalData.metrics.runtimePercentile) / 100 * 15)) <= 0;

                                                return (
                                                    <div
                                                        key={i}
                                                        className={`flex-1 rounded-t-sm transition-all duration-500 ${isUser ? 'bg-blue-500' : 'bg-gray-600'}`}
                                                        style={{ height: `${height}%` }}
                                                    ></div>
                                                )
                                            })}
                                        </div>
                                    </div>

                                    {/* Memory Card */}
                                    <div className="bg-[#2d2d2d] rounded-xl p-4 border border-gray-700 relative overflow-hidden group">
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center space-x-2">
                                                <Cloud className="w-5 h-5 text-gray-400" />
                                                <span className="font-bold text-lg text-white">Memory</span>
                                            </div>
                                        </div>

                                        <div className="mb-4">
                                            <span className="text-4xl font-extrabold text-white">{modalData.metrics.memory}</span>
                                            <span className="text-xl text-gray-400 ml-1">MB</span>
                                        </div>

                                        <div className="text-sm text-gray-300">
                                            Beats <span className="font-bold text-white">{modalData.metrics.memoryPercentile}%</span> of users with {modalData.language}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 md:mt-auto flex space-x-4 pt-6">
                                    <button
                                        onClick={() => setShowSuccessModal(false)}
                                        className="flex-1 py-3 rounded-lg bg-green-600 hover:bg-green-500 text-white font-bold transition-colors shadow-lg shadow-green-900/20 flex items-center justify-center space-x-2"
                                    >
                                        <span>Close</span>
                                    </button>
                                </div>
                            </div>

                            {/* Right Panel: Code Preview */}
                            <div className="w-full md:w-7/12 bg-[#1e1e1e] flex flex-col h-full overflow-hidden min-h-[300px]">
                                <div className="p-4 border-b border-gray-700 font-medium text-gray-300 flex justify-between items-center bg-[#252526]">
                                    <span>Submitted Code</span>
                                    <span className="text-xs text-blue-400 font-mono border border-blue-500/30 px-2 py-0.5 rounded bg-blue-500/10 uppercase">{modalData.language}</span>
                                </div>
                                <div className="flex-1 overflow-hidden relative">
                                    <Editor
                                        key={modalData.code?.length} // Force re-render if code changes
                                        height="100%"
                                        language={modalData.language}
                                        theme="vs-dark"
                                        value={modalData.code}
                                        loading={<div className="text-gray-500 p-4">Loading code...</div>}
                                        options={{
                                            readOnly: true,
                                            minimap: { enabled: false },
                                            fontSize: 13,
                                            scrollBeyondLastLine: false,
                                            fontFamily: "'Fira Code', 'Monaco', monospace",
                                            renderValidationDecorations: "off",
                                            lineNumbers: "on"
                                        }}
                                    />
                                    {/* Glass Overlay for effect (optional) */}
                                    <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent to-black/10"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Top Toolbar */}
            <div className="h-12 border-b border-gray-800 bg-[#1e1e1e] flex items-center justify-between px-4">
                <div className="flex items-center space-x-4">
                    <div className="flex items-center mr-2 border-r border-gray-700 pr-4">
                        <button
                            onClick={() => navigate(`/contests/${contestId}`)}
                            className="text-gray-400 hover:text-white mr-4 flex items-center gap-1 text-sm bg-gray-800/50 hover:bg-gray-800 px-3 py-1 rounded transition-colors"
                        >
                            <ChevronLeft className="h-4 w-4" /> Back to Contest
                        </button>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex items-center bg-gray-800/50 rounded-lg p-0.5 mr-4 border border-gray-800">
                        <button
                            onClick={() => prevProblem && handleNavigateProblem(prevProblem.slug)}
                            disabled={!prevProblem}
                            className="p-1.5 rounded-md hover:bg-gray-700 text-gray-400 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                            title="Previous Problem"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>

                        <span className="text-xs text-gray-500 font-mono px-2 select-none">
                            {currentProblemIndex + 1} / {contestProblems.length}
                        </span>

                        <button
                            onClick={() => nextProblem && handleNavigateProblem(nextProblem.slug)}
                            disabled={!nextProblem}
                            className="p-1.5 rounded-md hover:bg-gray-700 text-gray-400 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                            title="Next Problem"
                        >
                            <ChevronLeft className="h-4 w-4 rotate-180" />
                        </button>
                    </div>

                    <h1 className="text-lg font-bold text-white truncate max-w-[200px]">{problem.title}</h1>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium border ${problem.difficulty === 'Easy' ? 'border-green-500 text-green-500' :
                        problem.difficulty === 'Medium' ? 'border-yellow-500 text-yellow-500' :
                            'border-red-500 text-red-500'
                        }`}>
                        {problem.difficulty}
                    </span>

                    {/* Timer */}
                    {timeLeft && (
                        <div className={`px-3 py-0.5 rounded text-xs font-mono font-bold flex items-center gap-2 ${timeLeft === "00:00:00" ? 'text-red-500 bg-red-500/10' : 'text-gray-400 bg-gray-800'}`}>
                            <Clock className="w-3 h-3" />
                            {timeLeft}
                        </div>
                    )}
                </div>

                <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2 mr-4">
                        {isSaving ? (
                            <span className="text-xs text-gray-400 flex items-center animate-pulse">
                                <Save className="h-3 w-3 mr-1" /> Saving...
                            </span>
                        ) : lastSavedCode && (
                            <span className="text-xs text-green-500/80 flex items-center">
                                <Cloud className="h-3 w-3 mr-1" /> Saved
                            </span>
                        )}
                    </div>

                    <button
                        onClick={handleReset}
                        className="text-gray-400 hover:text-white p-1.5 rounded-md hover:bg-gray-700 transition-colors mr-2"
                        title="Reset Code"
                    >
                        <RotateCcw className="h-4 w-4" />
                    </button>

                    <select
                        className="bg-[#2d2d2d] text-gray-300 rounded px-3 py-1.5 text-sm border-none outline-none focus:ring-1 focus:ring-blue-500"
                        value={language}
                        onChange={(e) => handleLanguageChange(e.target.value)}
                    >
                        <option value="python">Python</option>
                        <option value="cpp">C++</option>
                        <option value="c">C</option>
                    </select>

                    <button
                        onClick={handleRun}
                        disabled={loading}
                        className={`px-4 py-1.5 rounded-md flex items-center space-x-2 text-sm font-medium transition-all ${loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-gray-700 hover:bg-gray-600 text-white'}`}
                    >
                        <Play className="h-4 w-4" /> <span>Run</span>
                    </button>

                    <button
                        onClick={handleSubmit}
                        disabled={loading || isContestEnded}
                        className={`px-4 py-1.5 rounded-md flex items-center space-x-2 text-sm font-medium transition-all ${loading || isContestEnded ? 'bg-gray-600 cursor-not-allowed' : 'bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-900/20'}`}
                    >
                        {loading ? <span>Submitting...</span> : isContestEnded ? <span>Ended</span> : <span>Submit</span>}
                    </button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden relative">
                {/* Description Panel (Left) */}
                <div
                    className={`flex flex-col border-r border-gray-800 transition-none ${!showLeftPanel ? 'hidden' : ''}`}
                    style={{ width: fullScreenMode ? '100%' : `${leftPanelWidth}%` }}
                >
                    <div className="flex items-center justify-between px-4 pt-2 border-b border-gray-800 bg-[#1e1e1e]/50">
                        <div className="flex items-center space-x-1">
                            {['Description'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab.toLowerCase())}
                                    className={`px-4 py-2 text-sm font-medium transition-colors relative flex items-center space-x-2 rounded-t-md hover:bg-white/5 ${activeTab === tab.toLowerCase()
                                        ? 'text-white border-b-2 border-white'
                                        : 'text-gray-400 border-b-2 border-transparent'
                                        }`}
                                >
                                    <span>{tab}</span>
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => toggleFullScreen('description')}
                            className="text-gray-400 hover:text-white p-1"
                            title={fullScreenMode === 'description' ? "Exit Full Screen" : "Full Screen"}
                        >
                            {fullScreenMode === 'description' ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-700">
                        {activeTab === 'description' && (
                            <>
                                <div className="mb-6">
                                    <div className="prose prose-invert max-w-none text-gray-300">
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm]}
                                            rehypePlugins={[rehypeRaw]}
                                            components={{
                                                code({ node, inline, className, children, ...props }) {
                                                    return !inline ? (
                                                        <div className="bg-gray-800 p-3 rounded-md overflow-x-auto my-4 text-sm font-mono border border-gray-700">
                                                            {children}
                                                        </div>
                                                    ) : (
                                                        <code className="bg-gray-800 px-1.5 py-0.5 rounded text-red-300 font-mono text-sm" {...props}>
                                                            {children}
                                                        </code>
                                                    );
                                                },
                                                img: ({ node, ...props }) => <img className="rounded-lg shadow-lg max-w-full my-4 border border-gray-700" {...props} />,
                                                h1: ({ node, ...props }) => <h1 className="text-2xl font-bold text-white mb-4 mt-6 border-b border-gray-800 pb-2" {...props} />,
                                                h2: ({ node, ...props }) => <h2 className="text-xl font-bold text-white mb-3 mt-5" {...props} />,
                                                h3: ({ node, ...props }) => <h3 className="text-lg font-bold text-white mb-2 mt-4" {...props} />,
                                                p: ({ node, ...props }) => <p className="text-gray-300 mb-4 leading-relaxed" {...props} />,
                                                ul: ({ node, ...props }) => <ul className="list-disc list-inside text-gray-300 mb-4 space-y-1" {...props} />,
                                                li: ({ node, ...props }) => <li className="text-gray-300" {...props} />,
                                                blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-gray-600 pl-4 py-1 my-4 text-gray-400 italic bg-gray-800/30 rounded-r" {...props} />,
                                            }}
                                        >
                                            {problem.description}
                                        </ReactMarkdown>
                                    </div>
                                </div>

                                {/* Examples */}
                                {problem.examples && problem.examples.length > 0 && (
                                    <div className="mb-8">
                                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                            <Ticket className="w-5 h-5 text-blue-500" /> Examples
                                        </h3>
                                        <div className="space-y-4">
                                            {problem.examples.map((example, i) => (
                                                <div key={i} className="bg-[#262626] rounded-lg p-4 border border-gray-700/50">
                                                    <div className="mb-2 text-sm font-medium text-white/80">Example {i + 1}</div>
                                                    <div className="space-y-2">
                                                        <div className="text-sm">
                                                            <span className="text-gray-500 font-mono text-xs uppercase tracking-wide">Input:</span>
                                                            <div className="bg-[#1e1e1e] p-2 rounded mt-1 font-mono text-gray-300">{example.input}</div>
                                                        </div>
                                                        <div className="text-sm">
                                                            <span className="text-gray-500 font-mono text-xs uppercase tracking-wide">Output:</span>
                                                            <div className="bg-[#1e1e1e] p-2 rounded mt-1 font-mono text-gray-300">{example.output}</div>
                                                        </div>
                                                        {example.explanation && (
                                                            <div className="text-sm">
                                                                <span className="text-gray-500 font-mono text-xs uppercase tracking-wide">Explanation:</span>
                                                                <div className="text-gray-400 mt-1 italic">{example.explanation}</div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Constraints */}
                                {problem.constraints && problem.constraints.length > 0 && (
                                    <div className="mb-8">
                                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                            <AlertTriangle className="w-5 h-5 text-yellow-500" /> Constraints
                                        </h3>
                                        <ul className="list-disc list-inside space-y-2 text-gray-300 bg-[#262626] p-4 rounded-lg border border-gray-700/50">
                                            {problem.constraints.map((constraint, i) => (
                                                <li key={i} className="font-mono text-sm">{constraint}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Resizer Handle */}
                <div
                    className={`w-1 hover:bg-blue-600 bg-gray-800 cursor-col-resize flex items-center justify-center transition-colors z-10 ${fullScreenMode ? 'hidden' : ''}`}
                    onMouseDown={handleDragStart}
                >
                    <GripVertical className="h-4 w-4 text-gray-600" />
                </div>

                {/* Right Panel (Compiler & Console) */}
                <div
                    className={`flex flex-col flex-1 bg-[#1e1e1e] ${!showRightPanel ? 'hidden' : ''}`}
                    style={{ width: fullScreenMode === 'compiler' ? '100%' : `${100 - leftPanelWidth}%` }}
                >
                    {/* Editor */}
                    <div className="flex flex-col" style={{ height: `${editorHeight}%` }}>
                        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800 bg-[#1e1e1e]/50">
                            <span className="text-sm font-medium text-gray-400 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                Code Editor
                            </span>
                            <button
                                onClick={() => toggleFullScreen('compiler')}
                                className="text-gray-400 hover:text-white p-1"
                                title={fullScreenMode === 'compiler' ? "Exit Full Screen" : "Full Screen"}
                            >
                                {fullScreenMode === 'compiler' ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                            </button>
                        </div>
                        <div className="flex-1 overflow-hidden relative">
                            <Editor
                                height="100%"
                                language={language === 'c' || language === 'cpp' ? 'cpp' : 'python'}
                                theme="vs-dark"
                                value={code}
                                onChange={(value) => setCode(value || '')}
                                loading={<Loader />}
                                options={{
                                    minimap: { enabled: false },
                                    fontSize: 14,
                                    scrollBeyondLastLine: false,
                                    fontFamily: "'Fira Code', 'Monaco', monospace",
                                    automaticLayout: true,
                                }}
                            />
                        </div>
                    </div>

                    {/* Vertical Resizer */}
                    <div
                        className="h-1 bg-gray-800 hover:bg-blue-600 cursor-row-resize flex justify-center items-center transition-colors z-10"
                        onMouseDown={handleVerticalDragStart}
                    >
                        <GripHorizontal className="h-4 w-4 text-gray-600" />
                    </div>

                    {/* Console & Test Cases */}
                    <div className="flex-1 flex flex-col bg-[#1e1e1e] overflow-hidden" style={{ height: `${100 - editorHeight}%` }}>
                        <div className="flex items-center space-x-1 px-4 border-b border-gray-800 bg-[#1e1e1e]">
                            <button
                                onClick={() => setActiveBottomTab('testcase')}
                                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeBottomTab === 'testcase' ? 'border-white text-white' : 'border-transparent text-gray-400 hover:bg-white/5'
                                    }`}
                            >
                                Test Case
                            </button>
                            <button
                                onClick={() => setActiveBottomTab('result')}
                                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeBottomTab === 'result' ? 'border-white text-white' : 'border-transparent text-gray-400 hover:bg-white/5'
                                    }`}
                            >
                                Result
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-gray-700">
                            {activeBottomTab === 'testcase' ? (
                                <div className="space-y-4">
                                    <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-700">
                                        {userTestCases.map((tc) => (
                                            <div key={tc.id} className="flex items-center">
                                                <button
                                                    onClick={() => setActiveTestCaseId(tc.id)}
                                                    className={`px-3 py-1.5 rounded-l-md text-sm font-medium transition-colors border-y border-l ${activeTestCaseId === tc.id
                                                        ? 'bg-gray-700 text-white border-gray-600'
                                                        : 'bg-transparent text-gray-500 border-gray-800 hover:bg-gray-800'
                                                        }`}
                                                >
                                                    Case {tc.id + 1}
                                                </button>
                                                <button
                                                    onClick={() => handleRemoveTestCase(tc.id)}
                                                    className={`px-2 py-1.5 rounded-r-md text-sm transition-colors border-y border-r border-l-0 ${activeTestCaseId === tc.id
                                                        ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
                                                        : 'bg-transparent text-gray-500 border-gray-800 hover:bg-gray-800'
                                                        }`}
                                                    title="Remove Case"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                        <button
                                            onClick={handleAddTestCase}
                                            className="px-3 py-1.5 rounded-md text-sm font-medium bg-gray-800 text-gray-400 hover:text-white transition-colors flex items-center"
                                        >
                                            <Plus className="h-3 w-3 mr-1" /> Add
                                        </button>
                                    </div>

                                    <div className="bg-[#262626] p-4 rounded-lg border border-gray-700/50">
                                        <div className="mb-2 text-sm text-gray-400 font-mono">Input:</div>
                                        <textarea
                                            value={userTestCases[activeTestCaseId]?.input || ''}
                                            onChange={(e) => handleTestCaseChange(e.target.value)}
                                            className="w-full bg-[#1e1e1e] text-white font-mono text-sm p-3 rounded border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all scrollbar-thin scrollbar-thumb-gray-600"
                                            rows={4}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {overallStatus && (
                                        <div className={`text-lg font-bold mb-4 ${overallStatus === 'Accepted' ? 'text-green-500' : overallStatus === 'Wrong Answer' ? 'text-red-500' : 'text-yellow-500'
                                            }`}>
                                            {overallStatus}
                                        </div>
                                    )}

                                    {testResults && (
                                        <div className="space-y-6">
                                            {/* Summary Metrics */}
                                            {overallStatus === 'Accepted' && (
                                                <div className="flex gap-4 mb-6">
                                                    <div className="bg-[#262626] px-4 py-2 rounded border border-gray-700 flex items-center gap-2">
                                                        <Clock className="w-4 h-4 text-gray-400" />
                                                        <span className="text-gray-300 text-sm">Runtime:</span>
                                                        <span className="text-white font-bold">{Math.max(...testResults.map(r => r.runtime || 0))} ms</span>
                                                    </div>
                                                    <div className="bg-[#262626] px-4 py-2 rounded border border-gray-700 flex items-center gap-2">
                                                        <Cloud className="w-4 h-4 text-gray-400" />
                                                        <span className="text-gray-300 text-sm">Memory:</span>
                                                        <span className="text-white font-bold">{(Math.max(...testResults.map(r => r.memory || 0)) / 1024 / 1024).toFixed(1)} MB</span>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="space-y-3">
                                                {testResults.map((result, i) => (
                                                    <div key={i} className="bg-[#262626] rounded-lg border border-gray-700 overflow-hidden">
                                                        <div className="flex items-center justify-between px-4 py-2 bg-black/20">
                                                            <span className="font-medium text-gray-300 text-sm">TestCase {i + 1}</span>
                                                            <span className={`text-xs px-2 py-0.5 rounded ${result.passed ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                                                }`}>
                                                                {result.passed ? 'Passed' : 'Failed'}
                                                            </span>
                                                        </div>
                                                        <div className="p-3 space-y-2">
                                                            {!result.passed && result.error ? (
                                                                <div className="text-red-400 font-mono text-sm bg-red-900/10 p-2 rounded">
                                                                    {result.error}
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    <div className="grid grid-cols-2 gap-4">
                                                                        <div>
                                                                            <span className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Input</span>
                                                                            <div className="bg-[#1e1e1e] p-2 rounded font-mono text-sm text-gray-300 overflow-x-auto">
                                                                                {result.input}
                                                                            </div>
                                                                        </div>
                                                                        <div>
                                                                            <span className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Expected Output</span>
                                                                            <div className="bg-[#1e1e1e] p-2 rounded font-mono text-sm text-gray-300 overflow-x-auto">
                                                                                {result.expectedOutput}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <div>
                                                                        <span className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Your Output</span>
                                                                        <div className={`bg-[#1e1e1e] p-2 rounded font-mono text-sm overflow-x-auto ${result.passed ? 'text-green-300' : 'text-red-300'
                                                                            }`}>
                                                                            {result.actualOutput}
                                                                        </div>
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {!testResults && !loading && (
                                        <div className="text-gray-500 text-center py-10">
                                            Run or Submit code to see results
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContestProblem;
