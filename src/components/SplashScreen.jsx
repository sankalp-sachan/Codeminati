import { motion, useMotionValue, useSpring, useTransform, useAnimationFrame, AnimatePresence } from 'framer-motion';
import { Code2 } from 'lucide-react';
import { useState, useEffect, useMemo, useRef } from 'react';

const NebulaField = () => {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            {/* Optimized static atmospheric background */}
            <div className="absolute inset-0 bg-[#000001]" />
            <div
                className="absolute inset-0 opacity-40"
                style={{
                    background: `
                        radial-gradient(circle at 15% 50%, rgba(59, 130, 246, 0.2) 0%, transparent 40%),
                        radial-gradient(circle at 85% 50%, rgba(217, 70, 239, 0.15) 0%, transparent 40%)
                    `
                }}
            />
            {/* Static high-performance 'Stars' */}
            {[...Array(30)].map((_, i) => (
                <div
                    key={i}
                    className="absolute bg-white rounded-full opacity-20"
                    style={{
                        width: Math.random() * 2 + 1 + 'px',
                        height: Math.random() * 2 + 1 + 'px',
                        left: Math.random() * 100 + '%',
                        top: Math.random() * 100 + '%',
                    }}
                />
            ))}
        </div>
    );
};

const CyberOrb = ({ zoom }) => {
    const shards = useMemo(() => [...Array(6)].map((_, i) => ({
        id: i,
        angle: (i / 6) * Math.PI * 2,
        distance: 140,
        speed: 0.2 + Math.random() * 0.2
    })), []);

    return (
        <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{
                scale: zoom ? 50 : 1,
                opacity: 1,
            }}
            transition={{
                duration: zoom ? 1.5 : 2,
                ease: zoom ? "circIn" : [0.16, 1, 0.3, 1]
            }}
            className="relative w-64 h-64 md:w-[30rem] md:h-[30rem] flex items-center justify-center pointer-events-none"
            style={{ transformStyle: "preserve-3d" }}
        >
            {/* Optimized 3D Geometric Concentric Rings */}
            {[...Array(4)].map((_, i) => (
                <motion.div
                    key={i}
                    animate={{ rotateZ: i % 2 === 0 ? 360 : -360 }}
                    transition={{ duration: 20 + i * 10, repeat: Infinity, ease: "linear" }}
                    className="absolute rounded-full border border-white/10"
                    style={{
                        width: `${100 - i * 20}%`,
                        height: `${100 - i * 20}%`,
                        boxShadow: `0 0 40px rgba(59, 130, 246, 0.05)`,
                    }}
                />
            ))}

            {/* Core Singularity */}
            <div className="relative flex items-center justify-center">
                <div className="absolute w-32 h-32 bg-cyan-500/10 blur-[40px] rounded-full" />
                <div className="w-16 h-16 md:w-24 md:h-24 bg-white rounded-full shadow-[0_0_80px_20px_white,0_0_150px_40px_rgba(59, 130, 246, 0.3)] flex items-center justify-center">
                    <Code2 className="w-8 h-8 md:w-12 md:h-12 text-black/80" />
                </div>
            </div>
        </motion.div>
    );
};

const SplashScreen = () => {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const [phase, setPhase] = useState('branding'); // branding -> orb -> zoom

    const springConfig = { damping: 50, stiffness: 60 };
    const smoothX = useSpring(mouseX, springConfig);
    const smoothY = useSpring(mouseY, springConfig);

    const rotateX = useTransform(smoothY, [-500, 500], [5, -5]);
    const rotateY = useTransform(smoothX, [-500, 500], [-5, 5]);

    useEffect(() => {
        const handleMouseMove = (e) => {
            const { clientX, clientY } = e;
            mouseX.set(clientX - window.innerWidth / 2);
            mouseY.set(clientY - window.innerHeight / 2);
        };
        window.addEventListener('mousemove', handleMouseMove);

        const timer1 = setTimeout(() => setPhase('orb'), 4000);
        const timer2 = setTimeout(() => setPhase('zoom'), 5500);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            clearTimeout(timer1);
            clearTimeout(timer2);
        };
    }, [mouseX, mouseY]);

    const brandName = "CODEMINATI".split("");

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{
                opacity: 0,
                transition: { duration: 1 }
            }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#000001] overflow-hidden"
        >
            <NebulaField />

            {/* THE SINGULARITY: STABLE BACKGROUND GLOW */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <motion.div
                    animate={{
                        scale: phase === 'zoom' ? 150 : 1,
                        opacity: phase === 'zoom' ? 1 : 0.6
                    }}
                    transition={{
                        duration: phase === 'zoom' ? 2 : 1.5,
                        ease: "easeInOut"
                    }}
                    className="w-[1px] h-[1px] bg-white shadow-[0_0_400px_200px_rgba(59,130,246,0.1),0_0_200px_100px_rgba(217,70,239,0.05)]"
                />
            </div>

            <motion.div
                style={{ rotateX, rotateY, perspective: 2000, transformStyle: "preserve-3d" }}
                className="relative z-30 flex flex-col items-center w-full"
            >
                <AnimatePresence mode="wait">
                    {phase === 'branding' ? (
                        <motion.div
                            key="branding"
                            className="flex flex-col items-center"
                            exit={{
                                opacity: 0,
                                filter: "blur(20px)",
                                scale: 0.9,
                                transition: { duration: 1.2, ease: "easeInOut" }
                            }}
                        >
                            {/* PREMIUM LOGO Nexus */}
                            <motion.div
                                initial={{ opacity: 0, y: -50, scale: 0.8 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                                className="relative mb-24"
                            >
                                <div className="absolute inset-0 bg-white/5 backdrop-blur-3xl rounded-3xl border border-white/10 scale-125" />
                                <motion.div
                                    className="p-1 w-24 h-24 rounded-2xl border border-white/20 flex items-center justify-center bg-black/40 relative z-10"
                                >
                                    <Code2 className="w-10 h-10 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                        className="absolute inset-[-8px] rounded-2xl border border-t-white/40 border-r-transparent border-b-transparent border-l-transparent"
                                    />
                                </motion.div>
                            </motion.div>

                            {/* SPECTRAL TYPOGRAPHY */}
                            <div className="flex items-center gap-2 md:gap-5 relative px-6">
                                {brandName.map((char, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, scale: 1.5, filter: "blur(15px)", y: 50 }}
                                        animate={{
                                            opacity: 1,
                                            scale: 1,
                                            filter: "blur(0px)",
                                            y: 0,
                                            transition: { duration: 1.2, delay: 0.2 + i * 0.08, ease: [0.16, 1, 0.3, 1] }
                                        }}
                                        className="relative"
                                    >
                                        <span
                                            className="text-6xl md:text-[9.5rem] font-black italic tracking-tighter select-none block"
                                            style={{
                                                fontFamily: "'Space Grotesk', sans-serif",
                                                color: 'transparent',
                                                backgroundImage: 'linear-gradient(to bottom, #ffffff 0%, #e2e8f0 50%, #94a3b8 100%)',
                                                backgroundClip: 'text',
                                                WebkitBackgroundClip: 'text',
                                                filter: 'drop-shadow(0 0 20px rgba(59,130,246,0.2))',
                                                textShadow: '0 20px 40px rgba(0,0,0,0.4)',
                                            }}
                                        >
                                            {char}
                                        </span>
                                    </motion.div>
                                ))}
                            </div>

                            {/* MINIMAL STATUS HUD */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.4 }}
                                transition={{ delay: 2.5 }}
                                className="mt-28 flex flex-col items-center gap-5"
                            >
                                <div className="flex items-center gap-4 text-[11px] font-medium text-white tracking-[1.5em] uppercase">
                                    <span className="w-10 h-[1px] bg-gradient-to-r from-transparent to-white/40" />
                                    <span>Core Synchronized</span>
                                    <span className="w-10 h-[1px] bg-gradient-to-l from-transparent to-white/40" />
                                </div>
                            </motion.div>
                        </motion.div>
                    ) : (
                        <motion.div key="orb" className="relative flex items-center justify-center">
                            <CyberOrb zoom={phase === 'zoom'} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* ARTISTIC EDGE PROCESSING */}
            <div className="absolute inset-0 pointer-events-none z-[60] bg-[radial-gradient(circle_at_center,transparent_45%,rgba(0,0,0,0.85)_100%)]" />
        </motion.div>
    );
};

export default SplashScreen;
