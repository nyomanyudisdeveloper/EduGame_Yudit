import { useEffect, useState } from "react";
import { getListGamesModule } from "./gameApi";

interface ListGameModule {
    id: string;
    name: string;
    description: string;
    level: number;
    thumbnail_link: string;
    path_trial_game: string;
}

export const useListGameModules = (gameId: string) => {
    
    const [listGameModules, setListGameModules] = useState<[ListGameModule] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchGameDetail = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await getListGamesModule(gameId);
                setListGameModules(res);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchGameDetail();
    }, [gameId])

    return { listGameModules, loading, error }
}