import { bigBtnBase } from "../constants"

interface HomeProps {
    room: string
    onRoomChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    onKeyDown: (e: React.KeyboardEvent) => void
    onRoomCreate: () => void
}

const Home = ({ room, onRoomChange, onKeyDown, onRoomCreate }: HomeProps) => {
    return (
        <div className="min-h-screen bg-[#0f0a1e] text-white flex flex-col items-center justify-center p-6 font-sans">
            <div className="text-7xl mb-1">♠</div>
            <h1 className="text-[46px] font-black m-0 bg-gradient-to-br from-[#818cf8] to-[#c084fc] bg-clip-text text-transparent">
                Bookkeeper
            </h1>
            <p className="text-[#818cf8] mb-10 text-base">
                Spades Scorekeeping
            </p>
            <div className="w-full max-w-[360px]">
                <label className="text-[12px] text-[#818cf8] font-bold tracking-widest block mb-2 uppercase">
                    Room Name
                </label>
                <input
                    className="w-full py-[13px] px-4 rounded-[13px] border border-[#8b5cf666] bg-[#8b5cf61a] text-white text-[17px] outline-none placeholder:text-white/20"
                    placeholder="e.g. Friday Night Cards"
                    value={room}
                    onChange={onRoomChange}
                    onKeyDown={onKeyDown}
                />
                <button
                    className={`${bigBtnBase} ${room.trim() ? "bg-gradient-to-br from-[#6366f1] to-[#a855f7] text-white" : "bg-[#2d2748] text-gray-500 cursor-not-allowed"}`}
                    onClick={onRoomCreate}
                >
                    Create Room →
                </button>
            </div>
        </div>
    )
}

export default Home
