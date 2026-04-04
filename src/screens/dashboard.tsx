import { IoSearchSharp } from "react-icons/io5";
import { useListGames } from "../features/game/useListGames";
import { useNavigate } from "react-router-dom";


const DashboardScreen = () => {
    const { listGames, loading, error } = useListGames();
    const navigate = useNavigate();
   

    const goToGameDetail = (gameId: string) => {
        // Implement navigation to game detail page
        navigate(`/detailGame/${gameId}`);
    }

    return (        
        <>
            <h1 className="font-bold text-2xl">
                Choose Game for Your Kids !
            </h1>
            <div className=" relative my-3">
                <IoSearchSharp className="absolute mt-3.5 ml-2 text-gray-400" />
                <input type="text" placeholder="Search Game..." className="border border-gray-300 rounded px-7 py-2 w-full " />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {loading && <p>Loading games...</p>}
                {error && <p>Error loading games: {error}</p>}
                {listGames && listGames.map(game => (
                    <div onClick={() => goToGameDetail(game.id)} key={game.id} className="border rounded p-3 cursor-pointer hover:shadow-lg hover:scale-105 transition-transform">
                        <img src={game.thumbnail_link} alt={game.name} className="w-full h-40 object-cover mb-2" />
                        <h2 className="font-semibold">{game.name}</h2>
                        <p className="text-sm text-gray-600">{game.description}</p>
                        <button className="mt-2 bg-blue-500 text-white rounded px-3 py-1 hover:bg-blue-600">Play Now</button>
                    </div>
                ))}
            </div>
        </>
    )
}

export default DashboardScreen;