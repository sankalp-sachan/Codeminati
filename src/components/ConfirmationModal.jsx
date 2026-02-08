import React from 'react';
import { X, AlertTriangle, Check } from 'lucide-react';

const ConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    type = "warning", // 'warning' | 'danger' | 'info' | 'success'
    isProcessing = false
}) => {
    if (!isOpen) return null;

    const getIcon = () => {
        switch (type) {
            case 'danger':
                return <AlertTriangle className="h-6 w-6 text-red-500" />;
            case 'success':
                return <Check className="h-6 w-6 text-green-500" />;
            case 'info':
                return <AlertTriangle className="h-6 w-6 text-blue-500" />;
            default:
                return <AlertTriangle className="h-6 w-6 text-yellow-500" />;
        }
    };

    const getButtonColor = () => {
        switch (type) {
            case 'danger':
                return 'bg-red-600 hover:bg-red-500';
            case 'success':
                return 'bg-green-600 hover:bg-green-500';
            case 'info':
                return 'bg-blue-600 hover:bg-blue-500';
            default:
                return 'bg-yellow-600 hover:bg-yellow-500 text-black'; // Warning usually implies caution
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="bg-[#1e1e1e] border border-gray-700 rounded-xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all scale-100"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-700/50">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-gray-800/50 border border-gray-700`}>
                            {getIcon()}
                        </div>
                        <h3 className="text-lg font-bold text-white">{title}</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-gray-800 rounded-lg"
                        disabled={isProcessing}
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    <p className="text-gray-300 leading-relaxed">
                        {message}
                    </p>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-4 bg-gray-900/30 border-t border-gray-700/50">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
                        disabled={isProcessing}
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isProcessing}
                        className={`px-4 py-2 rounded-lg text-sm font-bold text-white shadow-lg transition-all transform active:scale-95 flex items-center gap-2 ${getButtonColor()} ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {isProcessing ? 'Processing...' : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
