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

export const createGameSession = async (data: {gameId: string, sessionName: string, dateFrom: string, dateTo: string}) => {
    const response = await api.post(`/game/session`, {
        gameModuleId: data.gameId,
        name: data.sessionName,
        deadlineDateFrom: data.dateFrom,
        deadlineDateTo: data.dateTo
    });
    return response.data;
}

export const getListGameSessions = async() => {
    const response = await api.get(`/game/session`);
    return response.data
}