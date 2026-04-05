import { useNavigate } from "react-router-dom"
import { useListGameSession, type ListGameSessionInterface } from "../features/game/useListGamesSession"


const GameSession = () => {
    const {listGameSession} = useListGameSession()
    const navigate = useNavigate()
    
    const handleCopy = async (sessionId:string) => {
        try{
            await navigator.clipboard.writeText(`${window.location.origin}/join/${sessionId}`)
            alert('URL Copied')
        }
        catch(err) {
             console.error("Failed to copy: ", err);
        }
    }

    return (
        <>
            <h1 className="font-bold text-2xl">
                List Game Sessions
            </h1>
            <table className="mt-5 w-full border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                <thead className="bg-gray-100">
                    <tr>
                    <th className="text-left p-3 text-sm font-semibold text-gray-600">Name Game Module</th>
                    <th className="text-left p-3 text-sm font-semibold text-gray-600">Name Session</th>
                    <th className="text-left p-3 text-sm font-semibold text-gray-600">Duration Session</th>
                    <th className="text-left p-3 text-sm font-semibold text-gray-600">Total Participant</th>
                    <th className="text-left p-3 text-sm font-semibold text-gray-600">Action</th>
                    </tr>
                </thead>

                <tbody>
                    {listGameSession?.map((game: ListGameSessionInterface, index) => {
                    return (
                        <tr
                        key={index}
                        className="border-t hover:bg-gray-50 transition"
                        >
                        <td className="p-3 text-sm text-gray-700">{game.game_name}</td>
                        <td className="p-3 text-sm text-gray-700">{game.name_session}</td>
                        <td className="p-3 text-sm text-gray-500">
                            {`${game.deadline_date_from} - ${game.deadline_date_to}`}
                        </td>
                        <td className="p-3 text-sm font-medium text-gray-800">
                            {game.total_participant}
                        </td>
                        <td className="p-3 text-sm font-medium text-gray-800">
                            <button onClick={() => navigate(`/game-session/${game.game_session_id}`)  } className="border rounded px-3 py-2 cursor-pointer bg-blue-500 hover:bg-blue-200 mr-3">
                                See Detail
                            </button>
                            <button onClick={() => handleCopy(game.game_session_id)  } className="border rounded px-3 py-2 cursor-pointer bg-amber-500 hover:bg-amber-200">
                                Copy Link
                            </button>
                        </td>
                        </tr>
                    )
                    })}
                </tbody>
                </table>
        </>
    )
}

export default GameSession