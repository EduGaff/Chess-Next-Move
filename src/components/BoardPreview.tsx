import { Chessboard } from 'react-chessboard';

interface BoardPreviewProps {
    fen: string;
    sideToMove: 'w' | 'b';
}

export function BoardPreview({ fen, sideToMove }: BoardPreviewProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section className="soft-card p-5">
                <h3 className="font-semibold text-sm text-slate-500 mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    Current Position
                </h3>
                <div className="aspect-square rounded-xl overflow-hidden shadow-inner">
                    <Chessboard
                        {...({
                            position: fen,
                            boardOrientation: sideToMove === 'w' ? 'white' : 'black',
                            customDarkSquareStyle: { backgroundColor: '#779556' },
                            customLightSquareStyle: { backgroundColor: '#ebecd0' }
                        } as any)}
                    />
                </div>
            </section>

            <section className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white flex flex-col justify-between shadow-lg shadow-blue-200">
                <div>
                    <h4 className="font-bold text-lg mb-2">Pro Tip</h4>
                    <p className="text-sm text-blue-100 leading-relaxed">
                        For the best results, ensure the board screenshot is clear, centered, and includes all 64 squares.
                    </p>
                </div>
                <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between">
                    <div className="flex -space-x-2">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="w-8 h-8 rounded-full border-2 border-blue-600 bg-blue-400 flex items-center justify-center text-[10px] font-bold">
                                {String.fromCharCode(64 + i)}
                            </div>
                        ))}
                    </div>
                    <span className="text-xs font-medium text-blue-200">Trusted by 2k+ players</span>
                </div>
            </section>
        </div>
    );
}
