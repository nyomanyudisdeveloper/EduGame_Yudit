import { useQuery } from "@tanstack/react-query"
import { fetchListGames } from "../services/api"

export const useListGames = () => {
    return useQuery({
        queryKey: ["list-games"],
        queryFn: fetchListGames
    })
}

