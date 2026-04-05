import { useEffect, useState } from "react";
import { getGameSession } from "./gameApi";

export interface GameSessionInterface {
    path_assign_game: string;
    game_name: string;
    game_session_id: string;
    name_session: number;
    deadline_date_from: string;
    deadline_date_to: string;
}

export const useGameSession = (sessionId: string) => {
    
    const [gameSession, setGameSession] = useState<GameSessionInterface | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchGameDetail = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await getGameSession(sessionId);
                setGameSession(res);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchGameDetail();
    }, [sessionId])

    return { gameSession, loading, error }
}