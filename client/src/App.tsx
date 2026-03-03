import { useState } from "react"
import { Lock } from "lucide-react"
import Home from "./screens/Home"

const defaultSettings = {
    winScore: 500,
    bagLimit: 10,
    bagPenalty: 100,
    nilBonus: 100,
    allowNil: true,
}

// Sub-component: Progress Bar
function ScoreBar({ score, max }: { score: number; max: number }) {
    const pct = Math.max(0, Math.min(100, (score / max) * 100))
    return (
        <div className="bg-[#1e1b4b] rounded-full h-[6px] mt-[6px] overflow-hidden">
            <div
                className="h-full rounded-full bg-gradient-to-r from-[#818cf8] to-[#c084fc] transition-all duration-500"
                style={{ width: `${pct}%` }}
            />
        </div>
    )
}

// Sub-component: Bag Pips
function Pips({ bags, bag_limit }: { bags: number; bag_limit: number }) {
    return (
        <div className="flex gap-1 mt-[6px]">
            {Array.from({ length: bag_limit }).map((_, i) => (
                <div
                    key={i}
                    className={`w-[9px] h-[9px] rounded-full border transition-colors ${
                        i < bags % bag_limit
                            ? "bg-[#fbbf24] border-[#f59e0b]"
                            : "bg-[#374151] border-[#4b5563]"
                    }`}
                />
            ))}
        </div>
    )
}

export default function App() {
    const [screen, setScreen] = useState("home")
    const [room, setRoom] = useState("")
    const [teams, setTeams] = useState([
        { name: "Team North/South", score: 0, bags: 0 },
        { name: "Team East/West", score: 0, bags: 0 },
    ])
    const [settings, setSettings] = useState({ ...defaultSettings })
    const [round, setRound] = useState(1)
    const [phase, setPhase] = useState("bidding")
    const [bids, setBids] = useState(["", ""])
    const [tricks, setTricks] = useState(["", ""])
    const [history, setHistory] = useState<
        Array<{
            round: number
            bids: string[]
            tricks: string[]
            scores: number[]
        }>
    >([])
    const [showHistory, setShowHistory] = useState(false)
    const [editIdx, setEditIdx] = useState<null | number>(null)
    const [tempName, setTempName] = useState("")

    const resetAll = () => {
        setScreen("home")
        setRoom("")
        setTeams([
            { name: "Team North/South", score: 0, bags: 0 },
            { name: "Team East/West", score: 0, bags: 0 },
        ])
        setSettings({ ...defaultSettings })
        setRound(1)
        setPhase("bidding")
        setBids(["", ""])
        setTricks(["", ""])
        setHistory([])
        setShowHistory(false)
    }

    const startGame = () => {
        setTeams((t) => t.map((x) => ({ ...x, score: 0, bags: 0 })))
        setRound(1)
        setPhase("bidding")
        setBids(["", ""])
        setTricks(["", ""])
        setHistory([])
        setScreen("game")
    }

    const submitBids = () => {
        if (bids[0] === "" || bids[1] === "") return
        setPhase("tricks")
        setTricks(["", ""])
    }

    const submitTricks = () => {
        if (tricks[0] === "" || tricks[1] === "") return
        const t0 = +tricks[0],
            t1 = +tricks[1]
        if (t0 + t1 !== 13) {
            alert("Tricks must sum to 13!")
            return
        }

        const newTeams = teams.map((team, i) => {
            const bid = +bids[i],
                won = i === 0 ? t0 : t1
            let delta = 0,
                newBags = team.bags
            if (bid === 0 && settings.allowNil) {
                delta = won === 0 ? settings.nilBonus : -settings.nilBonus
            } else {
                if (won >= bid) {
                    const over = won - bid
                    delta = bid * 10 + over
                    newBags += over
                } else {
                    delta = -(bid * 10)
                }
                delta -=
                    (Math.floor(newBags / settings.bagLimit) -
                        Math.floor(team.bags / settings.bagLimit)) *
                    settings.bagPenalty
            }
            return { ...team, score: team.score + delta, bags: newBags }
        })

        setHistory((h) => [
            ...h,
            {
                round,
                bids: [...bids],
                tricks: [...tricks],
                scores: newTeams.map((t) => t.score),
            },
        ])
        setTeams(newTeams)

        if (newTeams.some((t) => t.score >= settings.winScore)) {
            setPhase("done")
        } else {
            setRound((r) => r + 1)
            setPhase("bidding")
            setBids(["", ""])
            setTricks(["", ""])
        }
    }

    // Shared Tailwind styles
    const cardClass =
        "bg-violet-500/10 border border-violet-500/25 rounded-[18px] p-5"
    const numBtnBase =
        "w-10 h-10 rounded-xl font-bold text-xs cursor-pointer transition-all duration-150 flex items-center justify-center"
    const bigBtnBase =
        "w-full py-3.5 rounded-2xl font-bold text-lg mt-[18px] transition-all"

    // HOME SCREEN
    if (screen === "home")
        return (
            <Home
                room={room}
                onRoomChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setRoom(e.target.value)
                }
                onKeyDown={(e: React.KeyboardEvent) =>
                    e.key === "Enter" && room.trim() && setScreen("lobby")
                }
                onRoomCreate={() => room.trim() && setScreen("lobby")}
            />
        )

    // LOBBY SCREEN
    if (screen === "lobby")
        return (
            <div className="min-h-screen bg-[#0f0a1e] text-white p-6 font-sans">
                <div className="max-w-[480px] mx-auto">
                    <div className="flex items-center gap-3 mb-8">
                        <button
                            onClick={() => setScreen("home")}
                            className="bg-[#8b5cf626] border border-[#8b5cf64d] text-[#a78bfa] rounded-xl px-3.5 py-1.5 cursor-pointer text-base"
                        >
                            ←
                        </button>
                        <div>
                            <h2 className="m-0 text-[22px] font-black">
                                ♠ {room}
                            </h2>
                            <p className="m-0 text-[#818cf8] text-[13px]">
                                Lobby — set up teams & settings
                            </p>
                        </div>
                    </div>

                    <p className="text-[11px] text-[#7c3aed] font-bold tracking-[2px] mb-2.5 uppercase">
                        Teams
                    </p>
                    <div className="flex flex-col gap-2.5 mb-7">
                        {teams.map((t, i) => (
                            <div
                                key={i}
                                className={`${cardClass} flex items-center gap-3`}
                            >
                                <span className="text-[26px]">
                                    {i === 0 ? "🔵" : "🔴"}
                                </span>
                                {editIdx === i ? (
                                    <div className="flex gap-2 flex-1">
                                        <input
                                            className="flex-1 py-1.5 px-3 rounded-xl border border-[#7c3aed] bg-[#8b5cf633] text-white outline-none"
                                            value={tempName}
                                            autoFocus
                                            onChange={(e) =>
                                                setTempName(e.target.value)
                                            }
                                            onKeyDown={(e) =>
                                                e.key === "Enter" &&
                                                (setTeams((tm) =>
                                                    tm.map((x, j) =>
                                                        j === i
                                                            ? {
                                                                  ...x,
                                                                  name: tempName,
                                                              }
                                                            : x,
                                                    ),
                                                ),
                                                setEditIdx(null))
                                            }
                                        />
                                        <button
                                            onClick={() => {
                                                setTeams((tm) =>
                                                    tm.map((x, j) =>
                                                        j === i
                                                            ? {
                                                                  ...x,
                                                                  name: tempName,
                                                              }
                                                            : x,
                                                    ),
                                                )
                                                setEditIdx(null)
                                            }}
                                            className="px-3.5 bg-[#7c3aed] text-white rounded-xl font-bold cursor-pointer"
                                        >
                                            Save
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 flex-1">
                                        <span className="font-bold text-[15px]">
                                            {t.name}
                                        </span>
                                        <button
                                            onClick={() => {
                                                setEditIdx(i)
                                                setTempName(t.name)
                                            }}
                                            className="bg-none border-none cursor-pointer text-sm opacity-60"
                                        >
                                            ✏️
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <p className="text-[11px] text-[#7c3aed] font-bold tracking-[2px] mb-2.5 uppercase">
                        Settings
                    </p>
                    <div className={cardClass + " mb-7"}>
                        {[
                            ["winScore", "Winning Score", "pts"],
                            ["bagLimit", "Bag Limit", "bags"],
                            ["bagPenalty", "Bag Penalty (per # bags)", "pts"],
                            ["nilBonus", "Nil Bonus / Penalty", "pts"],
                        ].map(([k, label, unit]) => (
                            <div
                                key={k}
                                className="flex justify-between items-center mb-4"
                            >
                                <span className="text-[#c4b5fd] text-sm">
                                    {label}
                                </span>
                                <div className="flex items-center gap-1.5">
                                    <input
                                        type="number"
                                        className="w-20 py-1.5 px-2.5 rounded-lg border border-[#8b5cf666] bg-[#8b5cf61f] text-white text-center outline-none"
                                        value={settings[k]}
                                        onChange={(e) =>
                                            setSettings((s) => ({
                                                ...s,
                                                [k as keyof typeof settings]:
                                                    +e.target.value,
                                            }))
                                        }
                                    />
                                    <span className="text-gray-500 text-[12px]">
                                        {unit}
                                    </span>
                                </div>
                            </div>
                        ))}
                        <div className="flex justify-between items-center">
                            <span className="text-[#c4b5fd] text-sm">
                                Allow Nil Bids
                            </span>
                            <div
                                onClick={() =>
                                    setSettings((s) => ({
                                        ...s,
                                        allowNil: !s.allowNil,
                                    }))
                                }
                                className={`w-[46px] h-6 rounded-full relative cursor-pointer transition-colors duration-200 ${settings.allowNil ? "bg-[#7c3aed]" : "bg-[#374151]"}`}
                            >
                                <div
                                    className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all duration-200 ${settings.allowNil ? "left-6" : "left-0.5"}`}
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        className={`${bigBtnBase} bg-gradient-to-br from-[#6366f1] to-[#a855f7] text-white`}
                        onClick={startGame}
                    >
                        Start Game
                    </button>
                </div>
            </div>
        )

    // GAME SCREEN CALCULATIONS
    const done = phase === "done"
    const winner = done
        ? teams[0].score >= teams[1].score
            ? teams[0]
            : teams[1]
        : null
    const tTotal =
        tricks[0] !== "" && tricks[1] !== "" ? +tricks[0] + +tricks[1] : null

    return (
        <div className="min-h-screen bg-[#0f0a1e] text-white font-sans">
            {/* Navbar */}
            <div className="flex flex-wrap gap-y-2 items-center justify-between py-3.5 px-5 border-b border-[#8b5cf633] bg-black/30">
                <div className="flex items-center gap-2.5">
                    <span className="text-[18px]">♠</span>
                    <span className="font-black text-[17px]">{room}</span>
                    <span className="bg-[#7c3aed4d] text-[#c4b5fd] rounded-full px-2.5 py-0.5 text-[12px] font-bold">
                        Round {round}
                    </span>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowHistory((h) => !h)}
                        className="bg-[#8b5cf626] border border-[#8b5cf64d] text-[#a78bfa] rounded-lg px-3 py-1.5 cursor-pointer text-[12px] font-bold"
                    >
                        {showHistory ? "Hide" : "📋"} History
                    </button>
                    <button
                        onClick={resetAll}
                        className="bg-[#ef44441f] border border-[#ef44444d] text-[#fca5a5] rounded-lg px-3 py-1.5 cursor-pointer text-[12px] font-bold"
                    >
                        ✕ End Game
                    </button>
                </div>
            </div>

            <div className="max-w-[520px] mx-auto py-5 px-4">
                {/* Scoreboard Grid */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    {teams.map((t, i) => (
                        <div key={i} className={cardClass}>
                            <div className="flex items-center gap-1.5 mb-2.5">
                                <span className="text-[18px]">
                                    {i === 0 ? "🔵" : "🔴"}
                                </span>
                                <span className="font-bold text-[12px] text-[#c4b5fd] truncate">
                                    {t.name}
                                </span>
                            </div>
                            <div className="text-[42px] font-black leading-none bg-gradient-to-br from-white to-[#c4b5fd] bg-clip-text text-transparent">
                                {t.score}
                            </div>
                            <ScoreBar score={t.score} max={settings.winScore} />
                            <div className="mt-3.5">
                                <span className="text-[11px] font-bold text-[#fbbf24]">
                                    🛄 {t.bags} bags
                                </span>
                                <span className="text-[10px] text-gray-500 ml-1.5">
                                    (next penalty in{" "}
                                    {settings.bagLimit -
                                        (t.bags % settings.bagLimit)}
                                    )
                                </span>
                                <Pips
                                    bags={t.bags}
                                    bag_limit={settings.bagLimit}
                                />
                            </div>
                            {history.length > 0 && (
                                <div className="mt-2.5 text-[11px] text-[#818cf8]">
                                    Last: bid{" "}
                                    {history[history.length - 1].bids[i]}, won{" "}
                                    {history[history.length - 1].tricks[i]}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Winner Screen */}
                {done && (
                    <div className="bg-gradient-to-br from-[#4f46e5] via-[#7c3aed] to-[#a855f7] rounded-[20px] p-7.5 text-center mb-4">
                        <div className="text-[54px]">🏆</div>
                        <h2 className="mt-2.5 mb-1 text-[26px] font-black">
                            {winner?.name} Wins!
                        </h2>
                        <p className="m-0 text-white/75 text-[15px]">
                            Final score: {winner?.score}
                        </p>
                        <div className="flex gap-3 justify-center mt-[18px]">
                            <button
                                onClick={startGame}
                                className="py-2.5 px-[22px] bg-white/20 text-white rounded-xl font-bold cursor-pointer text-sm"
                            >
                                Rematch
                            </button>
                            <button
                                onClick={resetAll}
                                className="py-2.5 px-[22px] bg-white text-[#7c3aed] rounded-xl font-bold cursor-pointer text-sm"
                            >
                                New Game
                            </button>
                        </div>
                    </div>
                )}

                {/* Bidding Phase */}
                {!done && phase === "bidding" && (
                    <div className={cardClass}>
                        <h3 className="m-0 mb-[18px] text-[17px] font-extrabold text-[#e9d5ff]">
                            ✋ Place Bids — Round {round}
                        </h3>
                        {teams.map((t, i) => (
                            <div key={i} className="mb-5 last:mb-0">
                                <label className="text-[12px] text-[#a78bfa] font-bold tracking-wider block mb-2 uppercase">
                                    {t.name}
                                </label>
                                <div className="flex flex-wrap gap-1.5">
                                    {(settings.allowNil
                                        ? [
                                              0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
                                              11, 12, 13,
                                          ]
                                        : [
                                              1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11,
                                              12, 13,
                                          ]
                                    ).map((n) => (
                                        <button
                                            key={n}
                                            className={`${numBtnBase} ${bids[i] === String(n) ? "bg-gradient-to-br from-[#6366f1] to-[#a855f7] text-white scale-110" : "bg-white/10 text-white/55"}`}
                                            onClick={() => {
                                                const b = [...bids]
                                                b[i] = String(n)
                                                setBids(b)
                                            }}
                                        >
                                            {n === 0 ? "NIL" : n}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                        <button
                            className={`flex items-center justify-center gap-2 ${bigBtnBase} ${bids[0] === "" || bids[1] === "" ? "bg-[#2d2748] text-gray-500 cursor-not-allowed" : "bg-gradient-to-br from-[#6366f1] to-[#a855f7] text-white"}`}
                            onClick={submitBids}
                        >
                            Lock Bids
                            <Lock size={16} />
                        </button>
                    </div>
                )}

                {/* Tricks Phase */}
                {!done && phase === "tricks" && (
                    <div className={cardClass}>
                        <h3 className="m-0 mb-1.5 text-[17px] font-extrabold text-[#e9d5ff]">
                            🃏 Enter Tricks Won — Round {round}
                        </h3>
                        <p className="m-0 mb-[18px] text-[#818cf8] text-[13px]">
                            {teams[0].name}: bid{" "}
                            <strong className="text-white">{bids[0]}</strong>{" "}
                            &nbsp;·&nbsp; {teams[1].name}: bid{" "}
                            <strong className="text-white">{bids[1]}</strong>
                        </p>
                        {teams.map((t, i) => (
                            <div key={i} className="mb-5 last:mb-0">
                                <label className="text-[12px] text-[#a78bfa] font-bold tracking-wider block mb-2 uppercase">
                                    {t.name}{" "}
                                    <span className="text-white font-normal lowercase">
                                        (bid {bids[i]})
                                    </span>
                                </label>
                                <div className="flex flex-wrap gap-1.5">
                                    {Array.from({ length: 14 }, (_, n) => (
                                        <button
                                            key={n}
                                            className={`${numBtnBase} ${tricks[i] === String(n) ? "bg-gradient-to-br from-[#6366f1] to-[#a855f7] text-white scale-110" : "bg-white/10 text-white/55"}`}
                                            onClick={() => {
                                                const tr = [...tricks]
                                                tr[i] = String(n)
                                                setTricks(tr)
                                            }}
                                        >
                                            {n}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                        {tTotal !== null && (
                            <p
                                className={`font-bold text-[13px] mt-2 mb-1 ${tTotal === 13 ? "text-green-400" : "text-red-400"}`}
                            >
                                Total tricks: {tTotal} / 13{" "}
                                {tTotal === 13 ? "✓ Good" : "— must equal 13"}
                            </p>
                        )}
                        <button
                            className={`${bigBtnBase} ${tricks[0] === "" || tricks[1] === "" ? "bg-[#2d2748] text-gray-500 cursor-not-allowed" : "bg-gradient-to-br from-[#6366f1] to-[#a855f7] text-white"}`}
                            onClick={submitTricks}
                        >
                            Submit Round →
                        </button>
                    </div>
                )}

                {/* History Table */}
                {showHistory && history.length > 0 && (
                    <div className={`${cardClass} mt-4`}>
                        <h3 className="m-0 mb-3.5 text-[15px] font-extrabold">
                            📋 Score History
                        </h3>
                        <table className="w-full border-collapse text-[13px]">
                            <thead>
                                <tr className="text-[#818cf8] border-b border-violet-500/30">
                                    <th className="text-left pb-2">Rnd</th>
                                    <th className="pb-2 text-center">
                                        {teams[0].name.split("/")[0]}
                                        <br />
                                        <span className="opacity-60 text-[10px]">
                                            bid / won
                                        </span>
                                    </th>
                                    <th className="pb-2 text-center">
                                        {teams[1].name.split("/")[0]}
                                        <br />
                                        <span className="opacity-60 text-[10px]">
                                            bid / won
                                        </span>
                                    </th>
                                    <th className="pb-2 text-center">Scores</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.map((h, idx) => (
                                    <tr
                                        key={idx}
                                        className="border-t border-violet-500/15"
                                    >
                                        <td className="py-2 text-[#a78bfa] font-bold">
                                            {h.round}
                                        </td>
                                        <td className="text-center py-2">
                                            {h.bids[0]} / {h.tricks[0]}
                                        </td>
                                        <td className="text-center py-2">
                                            {h.bids[1]} / {h.tricks[1]}
                                        </td>
                                        <td className="text-center font-bold py-2">
                                            {h.scores[0]} : {h.scores[1]}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}
