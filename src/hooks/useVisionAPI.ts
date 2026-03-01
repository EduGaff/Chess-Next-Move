import { useState } from 'react';

export function useVisionAPI(sideToMove: 'w' | 'b', onVisionSuccess: (fen: string) => void) {
    const [isVisionLoading, setIsVisionLoading] = useState(false);
    const [visionError, setVisionError] = useState<string | null>(null);

    const handleVisionAnalysis = async (image: File | null) => {
        if (!image) return;
        setIsVisionLoading(true);
        setVisionError(null);

        try {
            const formData = new FormData();
            formData.append('image', image);
            formData.append('sideToMove', sideToMove);

            const response = await fetch('/api/vision/fen', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Failed to analyze image');
            }

            const data = await response.json();
            onVisionSuccess(data.fen);
        } catch (err: any) {
            setVisionError(err.message || 'Error processing image. Please try manual FEN.');
        } finally {
            setIsVisionLoading(false);
        }
    };

    return {
        isVisionLoading,
        visionError,
        setVisionError,
        handleVisionAnalysis
    };
}
