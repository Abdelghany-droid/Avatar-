
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';

interface ResultViewProps {
  image: string;
  onRetake: () => void;
  onExit: () => void;
}

export const ResultView: React.FC<ResultViewProps> = ({ image, onRetake, onExit }) => {
  const [showQR, setShowQR] = useState(false);

  const downloadImage = () => {
    const link = document.createElement('a');
    link.href = image;
    link.download = 'shutter-studio-3d.png';
    link.click();
  };

  // In a real kiosk app, this would be a shortened URL to a hosted version of the image.
  // For this single-file demo, we use the current URL to allow users to open the app on their phone.
  const shareUrl = window.location.href;

  return (
    <div className="h-full flex flex-col items-center justify-between p-6 py-10 overflow-y-auto">
      <div className="w-full text-center">
        <h2 className="font-futuristic text-xl md:text-2xl text-purple-400 neon-text mb-4 tracking-tighter">CHARACTER SYNTHESIS COMPLETE</h2>
      </div>

      <div className="relative w-full max-w-sm flex flex-col items-center gap-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative group w-full"
        >
          <div className="absolute -inset-1 bg-purple-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
          <div className="relative border-2 border-purple-500/60 rounded-xl overflow-hidden shadow-2xl bg-black">
            <img src={image} alt="AI Stylized" className="w-full aspect-[3/4] object-cover" />
            
            {/* HUD Overlay Elements */}
            <div className="absolute top-2 left-2 text-[10px] font-futuristic text-purple-400/80 bg-black/40 px-2 py-1 rounded">
              REC // 00:00:01
            </div>
            <div className="absolute top-2 right-2 flex gap-1">
               <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black to-transparent"></div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 w-full">
          <button
            onClick={downloadImage}
            className="col-span-2 py-4 bg-purple-600 rounded-lg font-futuristic text-lg border-2 border-purple-400 neon-border hover:bg-purple-500 transition-all active:scale-95 shimmer"
          >
            DOWNLOAD
          </button>
          
          <button
            onClick={() => setShowQR(!showQR)}
            className={`py-3 rounded-lg font-futuristic text-sm border-2 transition-all flex items-center justify-center gap-2 ${showQR ? 'bg-purple-400 text-black border-purple-400' : 'bg-white/5 border-purple-500/40 text-purple-400'}`}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M3 11h8V3H3v8zm2-6h4v4H5V5zM3 21h8v-8H3v8zm2-6h4v4H5v-4zM13 3v8h8V3h-8zm6 6h-4V5h4v4zM13 13h2v2h-2zM15 15h2v2h-2zM13 17h2v2h-2zM17 13h2v2h-2zM19 15h2v2h-2zM17 17h2v2h-2zM15 19h2v2h-2zM19 19h2v2h-2zM13 15h2v2h-2zM15 13h2v2h-2z"/></svg>
            {showQR ? 'HIDE QR' : 'GET ON MOBILE'}
          </button>

          <button
            onClick={onRetake}
            className="py-3 bg-white/5 rounded-lg font-futuristic text-sm border-2 border-white/20 text-white/70 hover:bg-white/10 transition-all"
          >
            RETAKE
          </button>
        </div>
      </div>

      {/* QR Overlay Section */}
      <AnimatePresence>
        {showQR && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed inset-x-0 bottom-0 z-50 p-6 bg-black/90 backdrop-blur-xl border-t-2 border-purple-500/50 rounded-t-3xl flex flex-col items-center gap-4"
          >
            <div className="w-12 h-1 bg-purple-500/30 rounded-full mb-2"></div>
            <div className="flex flex-col items-center">
              <h3 className="font-futuristic text-purple-400 mb-1">SCAN TO TAKE PHOTO</h3>
              <p className="text-[10px] text-purple-300/50 font-futuristic tracking-widest uppercase mb-4">Transferring to mobile device...</p>
              
              <div className="p-4 bg-white rounded-2xl shadow-[0_0_30px_rgba(168,85,247,0.4)] relative">
                <QRCodeSVG value={shareUrl} size={160} level="M" includeMargin={false} />
                {/* Tech Corners on QR */}
                <div className="absolute -top-2 -left-2 w-6 h-6 border-t-2 border-l-2 border-purple-500"></div>
                <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-2 border-r-2 border-purple-500"></div>
              </div>
            </div>
            
            <button 
              onClick={() => setShowQR(false)}
              className="mt-4 px-8 py-2 font-futuristic text-xs text-purple-300 border border-purple-500/30 rounded-full"
            >
              CLOSE
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full flex justify-center mt-4">
        <button
          onClick={onExit}
          className="text-red-500/60 font-futuristic text-xs tracking-[0.3em] hover:text-red-500 transition-colors uppercase"
        >
          [ TERMINATE SESSION ]
        </button>
      </div>
    </div>
  );
};
