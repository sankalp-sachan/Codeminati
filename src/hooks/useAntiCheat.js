import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import client from '../api/client';

const useAntiCheat = (contestId, problemId, isActive = true) => {
    const [switchCount, setSwitchCount] = useState(0);

    const logActivity = async (action, details) => {
        if (!isActive || !contestId) return;
        try {
            await client.post('/contests/report', {
                contestId,
                problemId,
                action,
                details
            });
        } catch (err) {
            console.error('Failed to log anti-cheat activity', err);
        }
    };

    useEffect(() => {
        if (!isActive) return;

        const handleVisibilityChange = () => {
            if (document.hidden) {
                setSwitchCount(prev => {
                    const newCount = prev + 1;
                    toast('Warning: Tab switching is monitored!', { icon: '⚠️' });
                    logActivity('tab_switch', `User switched tab. Count: ${newCount}`);
                    return newCount;
                });
            }
        };

        const handleBlur = () => {
            logActivity('window_blur', 'Window lost focus');
        };

        const handleContextMenu = (e) => {
            e.preventDefault();
            // toast.error('Right Click is disabled');
            logActivity('right_click', 'Right click attempted');
        };

        // Enforce Fullscreen Attempt (Soft enforcement via Toast)
        // const checkFullscreen = () => {
        //     if (!document.fullscreenElement) {
        //         toast('Please stay in Fullscreen mode!', { icon: '📺' });
        //         logActivity('fullscreen_exit', 'Fullscreen exited');
        //     }
        // };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleBlur);
        document.addEventListener('contextmenu', handleContextMenu);
        // document.addEventListener('fullscreenchange', checkFullscreen);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('blur', handleBlur);
            document.removeEventListener('contextmenu', handleContextMenu);
            // document.removeEventListener('fullscreenchange', checkFullscreen);
        };
    }, [isActive, contestId, problemId]);

    return { switchCount };
};

export default useAntiCheat;
