
import React from 'react';
import { motion } from 'framer-motion';

export const ProcessingView: React.FC = () => {
  return (
    <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-[#0d0221]">
      <div className="relative w-32 h-32 mb-8">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 border-4 border-purple-500 border-t-transparent rounded-full neon-border"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="absolute inset-4 border-2 border-blue-400 border-b-transparent rounded-full shadow-[0_0_10px_rgba(96,165,250,0.5)]"
        />
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
        </div>
      </div>

      <motion.h2 
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="font-futuristic text-2xl text-purple-400 mb-2 tracking-[0.2em]"
      >
        EVOLVING CHARACTER
      </motion.h2>
      <p className="text-purple-300/60 font-light tracking-widest text-sm">
        GENERATING 3D MESH & LIGHTING...
      </p>
      
      <div className="mt-12 w-full max-w-[200px] h-1 bg-purple-900 rounded-full overflow-hidden">
        <motion.div 
          className="h-full bg-purple-400 shimmer"
          animate={{ width: ["0%", "100%"] }}
          transition={{ duration: 8, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
};
