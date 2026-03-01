import { useState, useEffect } from 'react';
import { AlertCircle, RotateCcw, ChevronDown, ChevronUp, Info, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Hooks
import { useChessEngine } from './hooks/useChessEngine';
import { useVisionAPI } from './hooks/useVisionAPI';

// Components
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { ManualInput } from './components/ManualInput';
import { AnalysisPanel } from './components/AnalysisPanel';
import { BoardPreview } from './components/BoardPreview';

export default function App() {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [sideToMove, setSideToMove] = useState<'w' | 'b'>('w');
  const [showFen, setShowFen] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const {
    fen,
    setFen,
    isAnalyzing,
    analysis,
    engineError,
    setEngineError,
    analyzeWithEngine,
    handleManualAnalyze
  } = useChessEngine(sideToMove);

  const {
    isVisionLoading,
    visionError,
    setVisionError,
    handleVisionAnalysis
  } = useVisionAPI(sideToMove, (detectedFen) => {
    setFen(detectedFen);
    analyzeWithEngine(detectedFen);
  });

  // Consolidate errors
  useEffect(() => {
    if (engineError) setGlobalError(engineError);
    else if (visionError) setGlobalError(visionError);
    else setGlobalError(null);
  }, [engineError, visionError]);

  const clearError = () => {
    setGlobalError(null);
    setEngineError(null);
    setVisionError(null);
  };

  return (
    <div className="min-h-screen pb-12">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900">Dashboard</h2>
          <p className="text-slate-500 mt-1">Upload a screenshot or paste a FEN to get engine insights.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Input */}
          <div className="lg:col-span-5 space-y-6">
            <ImageUploader
              image={image}
              preview={preview}
              setImage={setImage}
              setPreview={setPreview}
              setError={setGlobalError}
              sideToMove={sideToMove}
              setSideToMove={setSideToMove}
              isVisionLoading={isVisionLoading}
              onAnalyze={() => handleVisionAnalysis(image)}
            />

            <ManualInput
              fen={fen}
              setFen={setFen}
              onAnalyze={handleManualAnalyze}
              isAnalyzing={isAnalyzing}
            />
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-7 space-y-6">
            <AnalysisPanel
              isAnalyzing={isAnalyzing}
              analysis={analysis}
            />

            {/* FEN Display */}
            <section className="soft-card">
              <button
                onClick={() => setShowFen(!showFen)}
                className="w-full p-5 flex items-center justify-between group"
              >
                <div className="flex items-center gap-2">
                  <Info className="w-5 h-5 text-slate-400 group-hover:text-blue-600" />
                  <h3 className="font-semibold text-slate-700">Detected FEN</h3>
                </div>
                {showFen ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
              </button>
              <AnimatePresence>
                {showFen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5">
                      <div className="bg-slate-900 text-emerald-400 p-4 rounded-xl font-mono text-xs break-all border border-slate-800">
                        {fen}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

            <BoardPreview fen={fen} sideToMove={sideToMove} />
          </div>
        </div>

        {/* Error Toast */}
        <AnimatePresence>
          {globalError && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3 z-[100]"
            >
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">{globalError}</span>
              <button onClick={clearError} className="ml-2 hover:opacity-80">
                <RotateCcw className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="max-w-7xl mx-auto px-4 py-12 border-t border-slate-200 mt-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 opacity-50">
            <Play className="w-4 h-4 text-slate-900 fill-current" />
            <span className="text-sm font-semibold tracking-tight">Chess Next Move v1.0.0</span>
          </div>
          <div className="flex gap-8 text-sm font-medium text-slate-400">
            <a href="#" className="hover:text-blue-600">Privacy</a>
            <a href="#" className="hover:text-blue-600">Terms</a>
            <a href="#" className="hover:text-blue-600">API</a>
          </div>
          <p className="text-xs text-slate-400">© 2024 ChessNextMove. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
