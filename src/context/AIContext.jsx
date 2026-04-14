import { createContext, useContext, useState } from 'react';

const AIContext = createContext();

export const AIProvider = ({ children }) => {
    const [aiContext, setAiContext] = useState({
        contextType: 'general', // 'general', 'problem', 'compiler'
        problemContext: null,
        codeContext: null
    });

    const [appliedCode, setAppliedCode] = useState(null);

    const updateAIContext = (newContext) => {
        setAiContext(prev => ({ ...prev, ...newContext }));
    };

    const resetAIContext = () => {
        setAiContext({
            contextType: 'general',
            problemContext: null,
            codeContext: null
        });
        setAppliedCode(null);
    };

    return (
        <AIContext.Provider value={{ aiContext, updateAIContext, resetAIContext, appliedCode, setAppliedCode }}>
            {children}
        </AIContext.Provider>
    );
};

export const useAI = () => {
    const context = useContext(AIContext);
    if (!context) {
        throw new Error('useAI must be used within an AIProvider');
    }
    return context;
};
