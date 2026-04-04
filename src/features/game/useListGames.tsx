import { useEffect, useState } from "react";
import { getListGames } from "./gameApi";

export const useListGames = () => {
    const [listGames, setListGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchListGames = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await getListGames();
                setListGames(res);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchListGames();
    }, [])

    return { listGames, loading, error }
}