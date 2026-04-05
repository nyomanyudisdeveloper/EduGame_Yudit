import { useEffect, useState } from "react";
import { getListGameSessions, getListGamesModule } from "./gameApi";

export interface ListGameSessionInterface {
    game_session_id: string;
    game_name: string;
    name_session: string;
    deadline_date_from: string;
    deadline_date_to: string;
    total_participant: number;
}

export const useListGameSession = () => {
    
    const [listGameSession, setListGameSession] = useState<[ListGameSessionInterface] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchGameDetail = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await getListGameSessions();
                setListGameSession(res);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchGameDetail();
    }, [])

    return { listGameSession, loading, error }
}