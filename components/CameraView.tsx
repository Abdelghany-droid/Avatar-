
import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { audioService } from '../services/audioService';

interface CameraViewProps {
  onCapture: (image: string) => void;
  onExit: () => void;
}

export const CameraView: React.FC<CameraViewProps> = ({ onCapture, onExit }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const activeStreamRef = useRef<MediaStream | null>(null);
  
  const [countdown, setCountdown] = useState(5);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initAttempt, setInitAttempt] = useState(0);
  const [isInitializing, setIsInitializing] = useState(false);

  // Aggressive track disposal to ensure hardware release
  const stopAllTracks = () => {
    if (activeStreamRef.current) {
      activeStreamRef.current.getTracks().forEach(track => {
        track.stop();
        // Some browsers require explicit disabling to release hardware hooks faster
        track.enabled = false;
      });
      activeStreamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
      // Force the video element to clear its internal buffer/hook
      videoRef.current.load();
    }
  };

  useEffect(() => {
    let isMounted = true;
    
    async function setupCamera() {
      if (isInitializing) return;
      
      setIsInitializing(true);
      setError(null);
      setIsReady(false);

      // 1. Dispose existing resources
      stopAllTracks();

      // 2. Wait for hardware to cycle (Crucial for 'Device in use' errors)
      // On some OS/Browser combos, the release isn't instantaneous. 
      await new Promise(resolve => setTimeout(resolve, 800));

      if (!isMounted) {
        setIsInitializing(false);
        return;
      }

      try {
        const constraints: MediaStreamConstraints = {
          video: { 
            facingMode: 'user',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        
        if (!isMounted) {
          stream.getTracks().forEach(t => t.stop());
          setIsInitializing(false);
          return;
        }

        activeStreamRef.current = stream;
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          // Use onloadeddata for better confirmation of stream flow
          videoRef.current.onloadeddata = () => {
            if (isMounted) {
              setIsReady(true);
              setIsInitializing(false);
            }
          };
        }
      } catch (err: any) {
        if (!isMounted) return;
        setIsInitializing(false);
        
        console.error("Camera access error:", err);
        
        // Map common errors to user-friendly but technical instructions
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setError("ACCESS BLOCKED. PLEASE ENABLE CAMERA PERMISSIONS IN YOUR BROWSER SETTINGS.");
        } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError' || err.message?.toLowerCase().includes('in use')) {
          setError("HARDWARE CONFLICT: CAMERA IS CURRENTLY IN USE BY ANOTHER TAB OR APPLICATION.");
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          setError("HARDWARE NOT FOUND. PLEASE CONNECT A CAMERA TO CONTINUE.");
        } else {
          setError(`SYSTEM ERROR: ${err.name || 'UNKNOWN'}. PLEASE REFRESH THE PAGE.`);
        }
      }
    }

    setupCamera();

    return () => {
      isMounted = false;
      stopAllTracks();
    };
  }, [initAttempt]);

  useEffect(() => {
    if (!isReady || !!error || isInitializing) return;

    if (countdown > 0) {
      const timer = setTimeout(() => {
        audioService.playTick();
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      handleCapture();
    }
  }, [countdown, isReady, error, isInitializing]);

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current || !containerRef.current) return;
    
    audioService.playShutter();
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const container = containerRef.current;
    
    if (context) {
      const streamWidth = video.videoWidth;
      const streamHeight = video.videoHeight;
      const containerRatio = container.clientWidth / container.clientHeight;
      const streamRatio = streamWidth / streamHeight;

      let sX, sY, sWidth, sHeight;

      if (streamRatio > containerRatio) {
        sWidth = streamHeight * containerRatio;
        sHeight = streamHeight;
        sX = (streamWidth - sWidth) / 2;
        sY = 0;
      } else {
        sWidth = streamWidth;
        sHeight = streamWidth / containerRatio;
        sX = 0;
        sY = (streamHeight - sHeight) / 2;
      }

      // Optimized for Gemini processing while staying under payload limits
      canvas.width = 720; 
      canvas.height = Math.round(720 / containerRatio);

      context.save();
      context.translate(canvas.width, 0);
      context.scale(-1, 1);
      
      context.drawImage(
        video,
        sX, sY, sWidth, sHeight,
        0, 0, canvas.width, canvas.height
      );
      
      context.restore();

      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      onCapture(dataUrl);
    }
  };

  return (
    <div ref={containerRef} className="relative h-full w-full bg-black overflow-hidden flex flex-col">
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center p-8 text-center bg-black/90 backdrop-blur-lg"
          >
              <div className="w-20 h-20 mb-8 rounded-full border-2 border-red-500/50 flex items-center justify-center">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
              </div>
              
              <h3 className="font-futuristic text-red-500 text-lg mb-4 tracking-widest uppercase">Hardware Conflict</h3>
              <p className="text-white/60 font-futuristic text-xs mb-10 tracking-widest leading-relaxed max-w-xs">
                {error}
              </p>
              
              <div className="flex flex-col gap-4 w-full max-w-[260px]">
                <button 
                  onClick={() => setInitAttempt(prev => prev + 1)} 
                  disabled={isInitializing}
                  className="px-8 py-4 bg-purple-600 rounded-xl text-white font-futuristic text-sm hover:bg-purple-500 transition-all uppercase tracking-widest shadow-[0_0_20px_rgba(168,85,247,0.4)] disabled:opacity-50"
                >
                  {isInitializing ? 'RESETTING...' : 'FORCE RECONNECT'}
                </button>
                <button 
                  onClick={onExit} 
                  className="px-8 py-4 border border-white/20 rounded-xl text-white/40 font-futuristic text-sm hover:bg-white/5 transition-all uppercase tracking-widest"
                >
                  ABORT SESSION
                </button>
              </div>

              <div className="mt-8 text-[10px] text-white/20 font-futuristic tracking-[0.3em] uppercase">
                Tip: Close other tabs using your camera
              </div>
          </motion.div>
        )}
      </AnimatePresence>

      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`absolute inset-0 w-full h-full object-cover scale-x-[-1] transition-opacity duration-1000 ${isReady ? 'opacity-100' : 'opacity-0'}`}
      />
      
      <div className="absolute inset-0 pointer-events-none z-10">
          <div className="absolute inset-x-0 h-[2px] bg-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.8)] animate-[scan_4s_linear_infinite]"></div>
          
          <div className="absolute inset-0 border-[20px] border-purple-600/10">
            <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-purple-400"></div>
            <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-purple-400"></div>
            <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-purple-400"></div>
            <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-purple-400"></div>
          </div>
      </div>

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
        <AnimatePresence mode="wait">
          {countdown > 0 && !error && isReady && (
            <motion.div
              key={countdown}
              initial={{ scale: 3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="font-futuristic text-[12rem] md:text-[16rem] font-black neon-text text-purple-400"
            >
              {countdown}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="absolute top-0 inset-x-0 p-6 flex justify-between items-start z-30 pointer-events-none">
        <div className="bg-black/40 backdrop-blur-md border border-purple-500/30 p-2 rounded px-4">
          <span className="font-futuristic text-[9px] text-purple-400 flex items-center gap-2 uppercase tracking-[0.2em]">
            <span className={`w-2 h-2 rounded-full ${isReady ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`}></span>
            {isInitializing ? 'SYS_INITIALIZING' : (isReady ? 'LINK_ESTABLISHED' : 'SYS_OFFLINE')}
          </span>
        </div>
        
        <button
          onClick={onExit}
          className="pointer-events-auto p-3 text-purple-400 font-futuristic border border-purple-500/50 rounded-xl bg-black/60 backdrop-blur-md hover:bg-purple-900/40 transition-all uppercase text-[10px] tracking-widest"
        >
          EXIT
        </button>
      </div>

      <canvas ref={canvasRef} className="hidden" />
      
      <style>{`
        @keyframes scan {
          0% { top: -5%; }
          100% { top: 105%; }
        }
      `}</style>
    </div>
  );
};
