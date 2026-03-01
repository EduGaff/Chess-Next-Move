import { Play, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { AnalysisResult } from '../hooks/useChessEngine';

interface AnalysisPanelProps {
    isAnalyzing: boolean;
    analysis: AnalysisResult | null;
}

export function AnalysisPanel({ isAnalyzing, analysis }: AnalysisPanelProps) {
    return (
        <section className="soft-card overflow-hidden flex flex-col min-h-[400px]">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <h3 className="font-semibold">Engine Analysis</h3>
                </div>
                <span className="text-xs font-medium text-slate-400">Stockfish 16 WASM</span>
            </div>

            <div className="flex-1 p-8 flex flex-col items-center justify-center text-center">
                {isAnalyzing ? (
                    <div className="space-y-4">
                        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
                        <p className="text-slate-500 font-medium italic">Calculating best lines...</p>
                    </div>
                ) : analysis ? (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full space-y-8"
                    >
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                                <p className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-1">Best Move</p>
                                <p className="text-4xl font-black text-blue-600">{analysis.bestMove || '...'}</p>
                            </div>
                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Evaluation</p>
                                <p className="text-4xl font-black text-slate-700">{analysis.evaluation}</p>
                            </div>
                        </div>

                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 text-left">
                            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Principal Variation</p>
                            <p className="text-sm font-mono text-slate-600 leading-relaxed">
                                {analysis.pv}
                            </p>
                        </div>
                    </motion.div>
                ) : (
                    <div className="text-slate-400">
                        <Play className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p>Upload a position to start analysis</p>
                    </div>
                )}
            </div>
        </section>
    );
}
