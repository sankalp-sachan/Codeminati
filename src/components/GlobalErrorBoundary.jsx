import React from 'react';

class GlobalErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Global Error Boundary caught an error", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center min-h-screen bg-[#0f0f15] text-white p-4">
                    <div className="bg-[#1e1e1e] p-8 rounded-xl border border-red-500/20 shadow-2xl max-w-2xl w-full text-center">
                        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                        </div>
                        <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
                        <p className="text-gray-400 mb-6">The application encountered an unexpected error.</p>

                        <details className="text-left bg-black/30 p-4 rounded-lg mb-6 overflow-auto max-h-48 scrollbar-thin scrollbar-thumb-gray-700">
                            <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-300 mb-2">Error Details</summary>
                            <pre className="text-xs text-red-400 font-mono whitespace-pre-wrap">
                                {this.state.error?.toString()}
                            </pre>
                        </details>

                        <button
                            onClick={() => window.location.href = '/'}
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-medium"
                        >
                            Return Home
                        </button>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}

export default GlobalErrorBoundary;
