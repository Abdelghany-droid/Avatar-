
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LandingViewProps {
  onStart: () => void;
}

const ShutterStudioText = () => {
  const text = "SHUTTER STUDIO";
  const letters = text.split("");

  return (
    <div className="flex flex-wrap justify-center items-center gap-1 mt-8">
      {letters.map((char, i) => (
        <motion.span
          key={i}
          initial={{ 
            opacity: 0, 
            x: (Math.random() - 0.5) * 600, 
            y: (Math.random() - 0.5) * 800,
            rotate: (Math.random() - 0.5) * 180
          }}
          animate={{ 
            opacity: 1, 
            x: 0, 
            y: 0, 
            rotate: 0 
          }}
          transition={{ 
            duration: 3, 
            ease: [0.22, 1, 0.36, 1],
            delay: 0.1
          }}
          className={`font-futuristic text-2xl md:text-4xl font-black neon-text text-purple-400 ${char === " " ? "w-4" : ""}`}
        >
          {char}
        </motion.span>
      ))}
    </div>
  );
};

export const LandingView: React.FC<LandingViewProps> = ({ onStart }) => {
  const [showLogo, setShowLogo] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowLogo(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative h-full flex flex-col items-center justify-center px-6 text-center">
      <AnimatePresence>
        {showLogo && (
          <>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-4"
            >
              <div className="w-24 h-24 mx-auto mb-2 bg-purple-600/30 rounded-full flex items-center justify-center border-2 border-purple-500 neon-border">
                <svg viewBox="0 0 24 24" className="w-12 h-12 text-purple-400 fill-current" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm0-5C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                </svg>
              </div>
            </motion.div>

            <ShutterStudioText />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.5 }}
              className="mt-16"
            >
              <button
                onClick={onStart}
                className="group relative px-12 py-4 font-futuristic text-xl tracking-widest text-white overflow-hidden rounded-full transition-all hover:scale-105 active:scale-95"
              >
                <div className="absolute inset-0 bg-purple-600 transition-all group-hover:bg-purple-500"></div>
                <div className="absolute inset-0 border-2 border-purple-400 rounded-full neon-border opacity-70"></div>
                <span className="relative z-10">START</span>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="absolute bottom-8 text-purple-400/50 text-xs font-futuristic tracking-tighter uppercase">
        Next-Gen Vision Processing v3.1
      </div>
    </div>
  );
};
