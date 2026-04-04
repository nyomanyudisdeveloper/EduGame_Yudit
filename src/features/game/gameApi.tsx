import api from "../../lib/apiClient"


export const getListGames = async () => {
    const response = await api.get("/game/list-games");
    return response.data
}

export const getGameDetail = async (gameId: string) => {
    const response = await api.get(`/game/${gameId}`);
    return response.data
}

export const getListGamesModule = async (gameId: string) => {
    const response = await api.get(`/game/${gameId}/modules`);
    return response.data
}