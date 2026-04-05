import { useParams } from "react-router-dom";
import { useGameDetail } from "../features/game/useGameDetail";
import { useListGameModules } from "../features/game/useListGamesModule";
import { useRef, useState } from "react";
import * as apiGame from "../features/game/gameApi";
import { FaRegCircleCheck } from "react-icons/fa6";
import { AiOutlineClose } from "react-icons/ai";


const DetailGameScreen = () => {
    const { id } = useParams();
    const inputDateFromRef = useRef<HTMLInputElement | null>(null);
    const inputDateToRef = useRef<HTMLInputElement | null>(null);
    const { gameDetail, loading, error } = useGameDetail(id || "");    
    const { listGameModules, loading: listLoading, error: listError } = useListGameModules(id || "");
    
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedGame, setSelectedGame] = useState<string>("");
    const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
    const [isSuccessSubmit, setIsSuccessSubmit] = useState(false);
    const [errorSubmit, setErrorSubmit] = useState("");

    const handleAssignClick = (game:string) => {
        setSelectedGame(game);
        setShowAssignModal(true);
    }

    const closeAssignModal = () => {
        setIsSuccessSubmit(false)
        setShowAssignModal(false)
        setIsLoadingSubmit(false)
        setErrorSubmit("")
        setSelectedGame("")
    }

    const handleSubmitAssign = async (e : React.FormEvent) => {
        e.preventDefault();
        // Handle assignment logic here, e.g., send data to API
        const sessionName = ((e.target as HTMLFormElement).elements[0] as HTMLInputElement).value;
        const dateFrom = ((e.target as HTMLFormElement).elements[1] as HTMLInputElement).value;
        const dateTo = ((e.target as HTMLFormElement).elements[2] as HTMLInputElement).value;
        
        
        if(sessionName.length <= 0 || dateFrom.length <= 0 || dateTo.length <=0){
            setErrorSubmit("All input must be filled")
            return 0;
        } 
        setErrorSubmit("")

        setIsLoadingSubmit(true);
        const res = await apiGame.createGameSession({
            gameId: selectedGame,
            sessionName,
            dateFrom,
            dateTo
        })
        setIsLoadingSubmit(false);
        if(res){
            setIsSuccessSubmit(true);
        }
        //
    }

    if (loading || listLoading) return <p>Loading...</p>;
    if (error || listError) return <p>Error: {error || listError}</p>;
    
    return (
        <> 
            <div className="my-4 border-b px-5 py-3 flex flex-row justify-between">
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
                            <button 
                                className="cursor-pointer mt-2 bg-blue-500 text-white rounded px-3 py-1 hover:bg-blue-600"
                                onClick={() => handleAssignClick(game.id)}
                            >
                                Assign
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            {/* Modal for assigning game */}
            {showAssignModal && (
                <div onClick={() => closeAssignModal()} className="cursor-pointer fixed inset-0 bg-gray-300/80  flex items-center justify-center z-50">
                    <div onClick={(e) => e.stopPropagation()} className="relative bg-white rounded p-5 w-96">
                        <AiOutlineClose onClick={() => closeAssignModal()} className="absolute right-3 top-3 cursor-pointer" size={20} />
                        {!isSuccessSubmit && <>
                        <h3 className="text-lg font-semibold mb-3">Assign Game</h3>
                        <form onSubmit={handleSubmitAssign}>
                            <label className="block mb-1 font-medium">Input Name Session</label>
                            <input type="text" className="border rounded w-full p-2 mb-3" placeholder="Enter session name" />
                            <label className="block mb-1 font-medium">Select Date From</label>
                            <input ref={inputDateFromRef} onClick={() => inputDateFromRef.current?.showPicker()} type="date" className="cursor-pointer border rounded w-full p-2 mb-3" />
                            <label className="block mb-1 font-medium">Select Date To</label>
                            <input ref={inputDateToRef} onClick={() => inputDateToRef.current?.showPicker()} type="date" className="cursor-pointer border rounded w-full p-2 mb-3" />
                            <div className="flex justify-end gap-2 mt-4">
                                <button 
                                    className="cursor-pointer mt-2 bg-gray-500 text-white rounded px-3 py-1 hover:bg-gray-600"
                                    onClick={() => setShowAssignModal(false)}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className={`cursor-pointer mt-2  text-white rounded px-3 py-1 hover:bg-blue-600 ${isLoadingSubmit ? 'bg-gray-600': 'bg-blue-500'}`}
                                    
                                >
                                    {isLoadingSubmit ? "Loading..." : "Assign" }
                                </button>
                            </div>
                            <p className="text-red-600">{errorSubmit}</p>
                        </form>
                        </>}
                        {isSuccessSubmit && <>
                            
                            <div className="flex flex-col justify-center items-center">
                                <FaRegCircleCheck className="w-25 h-25" />
                                <h3 className="text-lg font-semibold my-3">Assign Game Success</h3>
                            </div>
                            
                        </>}
                        
                        
                        
                    </div>
                </div>
            )}

        </>
    )
}

export default DetailGameScreen;