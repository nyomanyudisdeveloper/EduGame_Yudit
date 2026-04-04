import { useParams } from "react-router-dom";
import { useGameDetail } from "../features/game/useGameDetail";


const DetailGameScreen = () => {
    const { id } = useParams();
    const { gameDetail, loading, error } = useGameDetail(id || "");    
    
    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;
    
    return (
        <> 
            <div className="py-20 px-5 flex flex-row justify-between">
                {gameDetail && <p>Game Detail: {JSON.stringify(gameDetail)}</p>}
            </div>
        </>
    )
}

export default DetailGameScreen;