import { Upload, RotateCcw, Loader2, Play } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

interface ImageUploaderProps {
    image: File | null;
    preview: string | null;
    setImage: (file: File | null) => void;
    setPreview: (url: string | null) => void;
    setError: (err: string | null) => void;
    sideToMove: 'w' | 'b';
    setSideToMove: (side: 'w' | 'b') => void;
    isVisionLoading: boolean;
    onAnalyze: () => void;
}

export function ImageUploader({
    image,
    preview,
    setImage,
    setPreview,
    setError,
    sideToMove,
    setSideToMove,
    isVisionLoading,
    onAnalyze
}: ImageUploaderProps) {
    const onDrop = (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
            setError(null);
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': ['.png', '.jpg', '.jpeg'] },
        multiple: false
    } as any);

    return (
        <section className="soft-card p-6">
            <div className="flex items-center gap-2 mb-4">
                <Upload className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold">Upload Screenshot</h3>
            </div>

            <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-all cursor-pointer
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-slate-50 hover:border-blue-400 hover:bg-blue-50/30'}`}
            >
                <input {...getInputProps()} />
                {preview ? (
                    <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-slate-200">
                        <img src={preview} alt="Preview" className="w-full h-full object-contain" />
                        <button
                            onClick={(e) => { e.stopPropagation(); setImage(null); setPreview(null); }}
                            className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full shadow-sm hover:bg-white text-slate-600"
                        >
                            <RotateCcw className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <div className="text-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Upload className="w-6 h-6 text-blue-600" />
                        </div>
                        <p className="text-sm font-medium text-slate-700">
                            {isDragActive ? 'Drop it here' : 'Click or drag screenshot'}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">PNG, JPG up to 10MB</p>
                    </div>
                )}
            </div>

            <div className="mt-6 space-y-4">
                <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 block">Side to Move</label>
                    <div className="flex p-1 bg-slate-100 rounded-xl">
                        <button
                            onClick={() => setSideToMove('w')}
                            className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all ${sideToMove === 'w' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            White
                        </button>
                        <button
                            onClick={() => setSideToMove('b')}
                            className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all ${sideToMove === 'b' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Black
                        </button>
                    </div>
                </div>

                <button
                    onClick={onAnalyze}
                    disabled={!image || isVisionLoading}
                    className="btn-primary w-full"
                >
                    {isVisionLoading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Analyzing Board...
                        </>
                    ) : (
                        <>
                            <Play className="w-5 h-5 fill-current" />
                            Analyze Screenshot
                        </>
                    )}
                </button>
            </div>
        </section>
    );
}
