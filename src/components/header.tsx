import { MdMenuBook } from "react-icons/md";
import { VscGoToEditingSession } from "react-icons/vsc";
import { useAuth } from "../features/auth/useAuth";

const Header = () => {
    const {logout} = useAuth();

    return (
        <header className="bg-red-200 px-5 py-3 fixed top-0 left-0 right-0 z-10 flex flex-row justify-between">
            <h1 className="font-bold text-3xl">EduGame Yudit</h1>
            <nav className="flex flex-row gap-5">
                <a href="/" className=" rounded hover:bg-red-300 font-semibold flex items-center gap-2 text-lg "> <MdMenuBook /> Explore Games</a>
                <a href="/game-session" className=" rounded hover:bg-red-300 font-semibold flex items-center gap-2 text-lg "> <VscGoToEditingSession /> Games Session</a>
            </nav>
            <div className="flex items-center gap-3">
                <button onClick={logout} className="cursor-pointer hover:bg-red-600 bg-red-300 px-3 py-1 rounded font-semibold">Logout</button>
            </div>
        </header>
    )
}

export default Header;