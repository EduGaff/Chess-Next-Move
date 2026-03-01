import { useState, useEffect, useRef } from 'react';
import { Chess } from 'chess.js';

export interface AnalysisResult {
    bestMove: string;
    evaluation: string;
    pv: string;
}

const STOCKFISH_URL = 'https://cdnjs.cloudflare.com/ajax/libs/stockfish.js/10.0.2/stockfish.js';

export function useChessEngine(sideToMove: 'w' | 'b') {
    const [fen, setFen] = useState<string>('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const stockfishRef = useRef<Worker | null>(null);
    const sideToMoveRef = useRef(sideToMove);

    useEffect(() => {
        sideToMoveRef.current = sideToMove;
    }, [sideToMove]);

    // Initialize Stockfish
    useEffect(() => {
        let worker: Worker;
        try {
            const blob = new Blob([`importScripts("${STOCKFISH_URL}")`], { type: 'application/javascript' });
            const workerUrl = URL.createObjectURL(blob);
            worker = new Worker(workerUrl);
            stockfishRef.current = worker;
            worker.postMessage('uci');

            worker.onmessage = (e) => {
                const msg = e.data;
                if (msg.startsWith('info depth')) {
                    const scoreMatch = msg.match(/score cp (-?\d+)/);
                    const mateMatch = msg.match(/score mate (-?\d+)/);
                    const pvMatch = msg.match(/pv (.+)/);

                    let evaluation = '0.00';
                    if (scoreMatch) {
                        evaluation = (parseInt(scoreMatch[1]) / 100).toFixed(2);
                        if (sideToMoveRef.current === 'b') evaluation = (-parseFloat(evaluation)).toFixed(2);
                        evaluation = parseFloat(evaluation) > 0 ? `+${evaluation}` : evaluation;
                    } else if (mateMatch) {
                        evaluation = `M${mateMatch[1]}`;
                    }

                    if (pvMatch) {
                        const pv = pvMatch[1].split(' ').slice(0, 5).join(' ');
                        setAnalysis(prev => {
                            if (!prev) return { bestMove: '', evaluation, pv };
                            return { ...prev, evaluation, pv };
                        });
                    }
                } else if (msg.startsWith('bestmove')) {
                    const move = msg.split(' ')[1];
                    setAnalysis(prev => {
                        if (!prev) return { bestMove: move, evaluation: '0.00', pv: '' };
                        return { ...prev, bestMove: move };
                    });
                    setIsAnalyzing(false);
                }
            };

            worker.onerror = (err) => {
                console.error('Stockfish worker error:', err);
                setError('Chess engine error occurred.');
                setIsAnalyzing(false);
            };

            return () => {
                worker.terminate();
                URL.revokeObjectURL(workerUrl);
            };
        } catch (err) {
            console.error('Failed to initialize Stockfish worker:', err);
            setError('Failed to load chess engine. Please check your internet connection.');
        }
    }, []);

    const analyzeWithEngine = (currentFen: string) => {
        if (!stockfishRef.current) {
            setError('Chess engine is not ready yet.');
            return;
        }

        let fenToUse = currentFen.trim();
        if (fenToUse && !fenToUse.includes(' ')) {
            fenToUse += ` ${sideToMove} KQkq - 0 1`;
        }

        const chess = new Chess();
        try {
            chess.load(fenToUse);
            setFen(fenToUse);
        } catch (e) {
            setError('Invalid FEN string. Please check the format.');
            return;
        }

        setIsAnalyzing(true);
        setError(null);
        setAnalysis({ bestMove: '', evaluation: '...', pv: '...' });

        stockfishRef.current.postMessage('ucinewgame');
        stockfishRef.current.postMessage('isready');
        stockfishRef.current.postMessage(`position fen ${fenToUse}`);
        stockfishRef.current.postMessage('go depth 15');
    };

    const handleManualAnalyze = () => {
        analyzeWithEngine(fen);
    };

    return {
        fen,
        setFen,
        isAnalyzing,
        analysis,
        engineError: error,
        setEngineError: setError,
        analyzeWithEngine,
        handleManualAnalyze
    };
}
