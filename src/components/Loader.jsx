import React from 'react';

const Loader = ({ size = "md" }) => {
    // Size mapping
    const sizeClasses = {
        sm: "w-8 h-8",
        md: "w-16 h-16",
        lg: "w-24 h-24",
        xl: "w-32 h-32"
    };

    return (
        <div className={`flex items-center justify-center ${sizeClasses[size]} relative`}>
            {/* Outer Ring */}
            <svg
                className="animate-spin-slow absolute inset-0 w-full h-full text-blue-500/20"
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <circle cx="50" cy="50" r="46" stroke="currentColor" strokeWidth="2" strokeDasharray="10 10" />
            </svg>

            {/* Inner Ring */}
            <svg
                className="animate-spin-reverse absolute inset-0 w-full h-full text-primary"
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path d="M50 10 A 40 40 0 0 1 90 50" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                <path d="M50 90 A 40 40 0 0 1 10 50" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
            </svg>

            {/* Center Logo/Dot */}
            <div className="relative z-10 w-1/3 h-1/3 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.6)] animate-pulse"></div>
        </div>
    );
};

export default Loader;
