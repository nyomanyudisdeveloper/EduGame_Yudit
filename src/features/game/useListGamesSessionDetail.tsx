import { useEffect, useState } from "react";
import { getListGameSessionsDetail } from "./gameApi";

export interface ListGameSessionDetailInterface {
    student_name: string;
    level: number;
    score: number;
    hours: number;
    minutes: number;
    seconds: number;
}

export const useListGameSessionDetail = (sessionID:string) => {
    
    const [listGameSessionDetail, setListGameSessionDetail] = useState<[ListGameSessionDetailInterface] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchGameDetail = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await getListGameSessionsDetail(sessionID);
                setListGameSessionDetail(res);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchGameDetail();
    }, [])

    return { listGameSessionDetail, loading, error }
}