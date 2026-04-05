import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import * as gameAPI from '../features/game/gameApi'
import { useGameSession } from "../features/game/useGameSession";
// import { useAuth } from "../features/auth/useAuth";
// import { useNavigate } from "react-router-dom";


const JoinGameScreen = () => {
    const navigate = useNavigate()
    const {sessionId} = useParams<{sessionId:string}>()
    const {gameSession}  = useGameSession(sessionId ? sessionId : '')
    console.log('gameSession = ',gameSession)
    
    // const [isLoading, setIsLoading] = useState(false)
    const keySessionDetailIDLocalStorage = `${sessionId}-detailID`
    console.log("sessionId = ",sessionId)
    // const {login} = useAuth()
    // const navigate = useNavigate()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const nickname = ((e.target as HTMLFormElement).elements[0] as HTMLInputElement).value;
        
        // setIsLoading(true)
        const res = await gameAPI.createGameSessionDetail({game_session_id:sessionId ? sessionId : '',student_name:nickname})
        localStorage.setItem(keySessionDetailIDLocalStorage,res.id)
        navigate(`${gameSession?.path_assign_game}`)
        // setIsLoading(false)
        
        // Handle login logic here
        

        // const success = await login(username, password)
        // if (success) {
        //     navigate("/")
        // }
        
    }

    

    useEffect(() => {
        const init = async () => {
            const gameSessionDetailID = localStorage.getItem(keySessionDetailIDLocalStorage)
            if(gameSessionDetailID && gameSession?.path_assign_game){
                navigate(`${gameSession?.path_assign_game}`)
            }
        }

        init()
    },[gameSession])

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-3xl font-bold ">Let's Join The Game</h1>
            <form className="mt-4 w-1/4" onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Input your nickname"
                    className="border border-gray-300 rounded px-3 py-2 mb-4 w-full"
                />
                <button
                    type="submit"
                    className="bg-blue-500 text-white rounded px-4 py-2 w-full cursor-pointer hover:bg-blue-600"
                >
                    Start
                </button>
            </form>
        </div>
    )
}

export default JoinGameScreen