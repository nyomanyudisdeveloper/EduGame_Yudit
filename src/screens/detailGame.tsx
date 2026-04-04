import { useParams } from "react-router-dom";
import { useGameDetail } from "../features/game/useGameDetail";
import { useListGameModules } from "../features/game/useListGamesModule";


const DetailGameScreen = () => {
    const { id } = useParams();
    const { gameDetail, loading, error } = useGameDetail(id || "");    
    const { listGameModules, loading: listLoading, error: listError } = useListGameModules(id || "");
    
    if (loading || listLoading) return <p>Loading...</p>;
    if (error || listError) return <p>Error: {error || listError}</p>;
    
    return (
        <> 
            <div className="my-4 border rounded px-5 py-3 flex flex-row justify-between">
                <img src={gameDetail?.thumbnail_link} alt={gameDetail?.name} className="object-cover mb-3 rounded w-42 h-42" />
                <div className="ml-5">
                    <h2 className="text-xl font-bold">{gameDetail?.name}</h2>
                    <p className="text-gray-600">{gameDetail?.description}</p>
                    <p className="text-sm text-gray-500 mt-2">Subject: {gameDetail?.subject_name}</p>
                    <p className="text-sm text-gray-500">Category: {gameDetail?.category_name}</p>
                </div>
            </div>
            <h3 className="text-lg font-semibold mb-3">Game Modules</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {loading && <p>Loading games...</p>}
                {error && <p>Error loading games: {error}</p>}
                {listGameModules && listGameModules.map(game => (
                    <div key={game.id} className="border rounded p-3 cursor-pointer hover:shadow-lg hover:scale-105 transition-transform">
                        <img src={game.thumbnail_link} alt={game.name} className="w-full h-40 object-cover mb-2" />
                        <h2 className="font-semibold">{game.name}</h2>
                        <p className="text-sm text-gray-600">{game.description}</p>
                        <div className="flex gap-2 mt-2">
                            <button 
                                className="cursor-pointer mt-2 bg-blue-500 text-white rounded px-3 py-1 hover:bg-blue-600"
                                onClick={() => window.open(`${window.location.origin}${game.path_trial_game}`, "_blank")}
                            >
                                Try a game 
                            </button>
                            <button className="cursor-pointer mt-2 bg-blue-500 text-white rounded px-3 py-1 hover:bg-blue-600">Assign</button>
                        </div>
                    </div>
                ))}
            </div>
        </>
    )
}

export default DetailGameScreen;