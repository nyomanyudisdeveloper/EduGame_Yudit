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

export const getGameSession = async(sessionId: string) => {
    const response = await api.get(`/game/session/${sessionId}`)
    return response.data
} 

export const getGameSessionDetail = async(sessionDetailId: string) => {
    const response = await api.get<{student_name:string,level:number,score:number,duration:number}>(`/game/sessionDetail/${sessionDetailId}`)
    return response.data
} 

export const updateGameSessionDetail = async(sessionDetailID:string,level:number,score:number) => {
    const response = await api.put(`/game/sessionDetail/${sessionDetailID}`, {
        level,
        score
    })
    return response.data
}

export const createGameSessionDetail = async (data: {game_session_id: string, student_name: string}) => {
    const response = await api.post(`/game/sessionDetail`, {
        game_session_id: data.game_session_id,
        student_name: data.student_name
    });
    return response.data;
}

export const getListGameSessions = async() => {
    const response = await api.get(`/game/session`);
    return response.data
}

export const getListGameSessionsDetail = async(sessionID:string) => {
    const response = await api.get(`game/sessionDetails/${sessionID}`);
    return response.data
}