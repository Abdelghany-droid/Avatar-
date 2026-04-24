
import React, { useState, useEffect } from 'react';
import { LandingView } from './components/LandingView';
import { CameraView } from './components/CameraView';
import { ProcessingView } from './components/ProcessingView';
import { ResultView } from './components/ResultView';
import { transformToGameCharacter } from './services/geminiService';
import { View, AppState } from './types';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    view: View.LANDING,
    capturedImage: null,
    processedImage: null,
    error: null
  });

  const reset = () => {
    setState({
      view: View.LANDING,
      capturedImage: null,
      processedImage: null,
      error: null
    });
  };

  const startCamera = () => {
    setState(prev => ({ ...prev, view: View.CAMERA }));
  };

  const handleCapture = async (image: string) => {
    setState(prev => ({ 
      ...prev, 
      capturedImage: image,
      view: View.PROCESSING 
    }));

    try {
      const stylizedImage = await transformToGameCharacter(image);
      setState(prev => ({ 
        ...prev, 
        processedImage: stylizedImage,
        view: View.RESULT 
      }));
    } catch (err) {
      console.error(err);
      setState(prev => ({ 
        ...prev, 
        error: "Style transformation failed. Please try again.",
        view: View.RESULT 
      }));
    }
  };

  return (
    <div className="h-screen w-full select-none overflow-hidden relative">
      {state.view === View.LANDING && (
        <LandingView onStart={startCamera} />
      )}
      
      {state.view === View.CAMERA && (
        <CameraView onCapture={handleCapture} onExit={reset} />
      )}
      
      {state.view === View.PROCESSING && (
        <ProcessingView />
      )}
      
      {state.view === View.RESULT && (
        <ResultView 
          image={state.processedImage || state.capturedImage || ''} 
          onRetake={startCamera} 
          onExit={reset} 
        />
      )}

      {state.error && state.view === View.RESULT && (
          <div className="absolute top-4 left-4 right-4 bg-red-900/80 p-2 rounded text-xs text-center font-futuristic">
              {state.error}
          </div>
      )}
    </div>
  );
};

export default App;
