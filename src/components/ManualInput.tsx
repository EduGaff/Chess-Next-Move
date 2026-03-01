import { Info } from 'lucide-react';

interface ManualInputProps {
    fen: string;
    setFen: (fen: string) => void;
    onAnalyze: () => void;
    isAnalyzing: boolean;
}

export function ManualInput({ fen, setFen, onAnalyze, isAnalyzing }: ManualInputProps) {
    return (
        <section className="soft-card p-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Info className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold">Manual Input</h3>
                </div>
                <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase font-bold">Fallback</span>
            </div>
            <div className="space-y-4">
                <input
                    type="text"
                    value={fen}
                    onChange={(e) => setFen(e.target.value)}
                    placeholder="Paste FEN string here..."
                    className="w-full bg-slate-50 border-slate-200 rounded-xl text-sm focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                    onClick={onAnalyze}
                    disabled={isAnalyzing}
                    className="btn-secondary w-full"
                >
                    Analyze FEN
                </button>
            </div>
        </section>
    );
}
