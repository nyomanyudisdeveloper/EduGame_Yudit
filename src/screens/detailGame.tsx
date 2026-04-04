import { useParams, useSearchParams } from "react-router-dom";
import { useGameDetail } from "../features/game/useGameDetail";


const DetailGameScreen = () => {
    const {id  } = useParams();
    const {gameDetail, loading, error} = useGameDetail(id);
    const {listGames, isLoading, error: listGamesError} = useGameDetail(id);    
    
    return (
        <> 
            <div className="py-20 px-5 flex flex-row justify-between">
                {/* <p>{thumbnail_link}</p>
                <img src={thumbnail_link} alt={name} className="w-1/3 h-auto object-cover rounded" /> */}
            </div>
        </>
    )
}

export default DetailGameScreen;