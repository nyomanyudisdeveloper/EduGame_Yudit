import { useEffect, useState } from "react";
import { getGameDetail } from "./gameApi";

export const useGameDetail = (gameId: string) => {
    
    const [gameDetail, setGameDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchGameDetail = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await getGameDetail(gameId);
                setGameDetail(res);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchGameDetail();
    }, [gameId])

    return { gameDetail, loading, error }
}