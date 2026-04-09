import React from 'react';
import { Calendar, Rocket } from 'lucide-react';

const DailyChallenge = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
            <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-orange-400 to-red-600 rounded-full blur opacity-30 animate-pulse"></div>
                <div className="relative bg-gray-900/80 backdrop-blur-xl border border-gray-800 p-8 rounded-full inline-block mb-8 shadow-2xl">
                    <Calendar size={56} className="text-orange-400" />
                </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6 bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 bg-clip-text text-transparent drop-shadow-sm">
                Coming Soon
            </h1>
            <p className="text-gray-400 text-lg md:text-xl max-w-2xl mb-12 leading-relaxed">
                A new challenge every day to keep your coding skills sharp. We are preparing an exclusive set of daily algorithmic puzzles. Get ready to commit every single day!
            </p>
            <div className="flex items-center space-x-3 text-sm text-gray-500 font-bold uppercase tracking-widest bg-gray-900/50 px-6 py-3 rounded-full border border-gray-800/50">
                <Rocket size={18} className="text-red-500" />
                <span>Stay Tuned</span>
                <Rocket size={18} className="text-red-500" />
            </div>
        </div>
    );
};

export default DailyChallenge;
