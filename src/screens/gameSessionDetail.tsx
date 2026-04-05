import { useParams } from "react-router-dom"
import { useListGameSessionDetail, type ListGameSessionDetailInterface } from "../features/game/useListGamesSessionDetail"


const GameSessionDetailScreen = () => {
    const { id } = useParams<string>();
    const {listGameSessionDetail} = useListGameSessionDetail(id || '')
    console.log("listGameSessionDetail = ",listGameSessionDetail)
    return (
        <>
        <h1 className="font-bold text-2xl">
            List Game Sessions
        </h1>
        <table className="mt-5 w-full border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            <thead className="bg-gray-100">
                <tr>
                <th className="text-left p-3 text-sm font-semibold text-gray-600">Student Name</th>
                <th className="text-left p-3 text-sm font-semibold text-gray-600">Level</th>
                <th className="text-left p-3 text-sm font-semibold text-gray-600">Score</th>
                <th className="text-left p-3 text-sm font-semibold text-gray-600">Duration</th>
                </tr>
            </thead>

            <tbody>
                {listGameSessionDetail?.map((game: ListGameSessionDetailInterface, index) => {
                return (
                    <tr
                    key={index}
                    className="border-t hover:bg-gray-50 transition"
                    >
                    <td className="p-3 text-sm text-gray-700">{game.student_name}</td>
                    <td className="p-3 text-sm text-gray-700">{game.level}</td>
                    <td className="p-3 text-sm text-gray-500">
                       {game.score}
                    </td>
                    <td className="p-3 text-sm font-medium text-gray-800">
                        {`${game.hours} hours ${game.minutes} minute ${game.seconds} seconds`}
                    </td>
                    </tr>
                )
                })}
            </tbody>
            </table>
        </>
    )
}

export default GameSessionDetailScreen