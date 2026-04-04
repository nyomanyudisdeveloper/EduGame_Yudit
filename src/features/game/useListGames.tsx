import { useEffect, useState } from "react";
import { getListGames } from "./gameApi";

interface Game {
    id: string;
    name: string;
    description: string;
    thumbnail_link: string;
}

export const useListGames = () => {
    const [listGames, setListGames] = useState<Game[]>([]);
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