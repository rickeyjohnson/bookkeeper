import { Lock, Trash2 } from "lucide-react"
import { useState } from "react"

interface Team {
    name: string
    score: number
    bags: number
}

interface Settings {
    winScore: number
    bagLimit: number
    bagPenalty: number
    nilBonus: number
    allowNil: boolean
}

interface History {
    round: number
    bids: string[]
    tricks: string[]
    scores: number[]
}

interface GameState {
    id: string
    room: string
    teams: Team[]
    settings: Settings
    round: number
    phase: string
    bids: string[]
    tricks: string[]
    history: History[]
    savedAt: number
}

const defaultSettings: Settings = {
    winScore: 500,
    bagLimit: 10,
    bagPenalty: 100,
    nilBonus: 100,
    allowNil: true,
}

const STORAGE_KEY = "spades_saved_games"

// ─── Storage Helpers ─────────────────────────────────────────────────────────────────
const loadGames = () => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        return raw ? JSON.parse(raw) : []
    } catch {
        return []
    }
}

const saveGame = (gameState: GameState) => {
    try {
        const games = loadGames()
        const existing = games.findIndex((g: GameState) => g.id === gameState.id)
        if (existing >= 0) games[existing] = gameState
        else games.unshift(gameState)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(games.slice(0, 10)))
    } catch {
        return
    }
}

const deleteGame = (id: string) => {
    try {
        const games = loadGames().filter((g: GameState) => g.id !== id)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(games))
    } catch {
        return
    }
}

// ─── Sub Components ─────────────────────────────────────────────────────────────────
const ScoreBar = ({ score, max }: { score: number; max: number }) => {
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

const Pips = ({ bags, bag_limit }: { bags: number; bag_limit: number }) => {
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

const formatDate = (ts: number) => {
    const d = new Date(ts)
    const now = new Date()
    const diffMs = +now - +d
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)
    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays === 1) return "Yesterday"
    if (diffDays < 7) return `${diffDays}d ago`
    return d.toLocaleDateString()
}

// ─── Previous Game Card ─────────────────────────────────────────────────────────────────
const PreviousGameCard = ({
    game,
    onResume,
    onDelete,
}: {
    game: GameState
    onResume: (state: GameState) => void
    onDelete: (id: string) => void
}) => {
    const [menuOpen, setMenuOpen] = useState(false)
    const isDone = game.phase === "done"
    const winner = isDone
        ? game.teams[0].score >= game.teams[1].score
            ? game.teams[0]
            : game.teams[1]
        : null
    const leading = game.teams[0].score >= game.teams[1].score ? 0 : 1

    const handleDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation()
        setMenuOpen(false)
        onDelete(game.id)
    }

    return (
        <div
            className="min-w-fill relative group bg-[rgba(139,92,246,0.08)] border border-[rgba(139,92,246,0.25)] rounded-[18px] p-5 cursor-pointer hover:border-[rgba(139,92,246,0.55)] hover:bg-[rgba(139,92,246,0.13)] transition-all duration-200"
            onClick={() => onResume(game)}
        >
            {/* ── 3-dot menu button ── */}
            <div
                className="absolute top-4 right-4"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={(e) => {
                        e.stopPropagation()
                        setMenuOpen((o) => !o)
                    }}
                    className={`w-7 h-7 rounded-full flex items-center justify-center border-none cursor-pointer text-[#a78bfa] hover:bg-[rgba(139,92,246,0.25)] transition-all duration-150 text-base leading-none ${menuOpen ? "bg-[rgba(139,92,246,0.25)]" : "bg-transparent"}`}
                >
                    ⋮
                </button>

                {/* Dropdown */}
                {menuOpen && (
                    <>
                        {/* Backdrop to close */}
                        <div
                            className="fixed inset-0 z-10"
                            onClick={(e) => {
                                e.stopPropagation()
                                setMenuOpen(false)
                            }}
                        />
                        <div className="absolute right-0 top-8 z-20 w-fit rounded-[14px] overflow-hidden border border-[rgba(139,92,246,0.35)] bg-[#1a1335] shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
                            {[
                                // {
                                //     icon: <Share size={18} />,
                                //     label: "Share",
                                //     action: () => {},
                                //     color: "text-[#c4b5fd]",
                                // },
                                // {
                                //     icon: <Pencil size={18} />,
                                //     label: "Rename",
                                //     action: () => {},
                                //     color: "text-[#c4b5fd]",
                                // },
                                {
                                    icon: <Trash2 size={18} />,
                                    label: "Delete",
                                    action: handleDelete,
                                    color: "text-[#fca5a5]",
                                },
                            ].map(({ icon, label, action, color }) => (
                                <button
                                    key={label}
                                    onClick={action}
                                    className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 border-none cursor-pointer text-left text-xs font-semibold ${color} bg-transparent hover:bg-[rgba(139,92,246,0.2)] transition-colors duration-100 last:border-t last:border-[rgba(139,92,246,0.2)]`}
                                >
                                    <span>{icon}</span>
                                    <span>{label}</span>
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Header row */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <span className="text-base">♠</span>
                    <span className="font-black text-[15px] text-white truncate max-w-[100px]">
                        {game.room}
                    </span>
                </div>
                <div className="flex items-center gap-1.5 pl-3 pr-7">
                    {isDone ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[rgba(250,204,21,0.15)] text-[#fbbf24] border border-[rgba(250,204,21,0.3)]">
                            FINISHED
                        </span>
                    ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[rgba(139,92,246,0.2)] text-[#c4b5fd] border border-[rgba(139,92,246,0.35)]">
                            ROUND {game.round}
                        </span>
                    )}
                </div>
            </div>

            {/* Teams + scores */}
            <div className="flex flex-col gap-2 mb-3">
                {game.teams.map((t, i) => (
                    <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 min-w-0">
                            <span className="text-sm">
                                {i === 0 ? "🔵" : "🔴"}
                            </span>
                            <span
                                className={`text-xs font-semibold truncate max-w-[130px] ${i === leading && !isDone ? "text-white" : isDone && winner === t ? "text-[#fbbf24]" : "text-[#a78bfa]"}`}
                            >
                                {t.name}
                            </span>
                            {isDone && winner === t && (
                                <span className="text-xs">👑</span>
                            )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <span
                                className={`font-black text-[18px] leading-none ${i === leading && !isDone ? "text-white" : isDone && winner === t ? "text-[#fbbf24]" : "text-[#818cf8]"}`}
                            >
                                {t.score}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between">
                <span className="text-[10px] text-[#6b7280]">
                    {formatDate(game.savedAt)}
                </span>
            </div>

            {/* Hover resume hint */}
            <div className="absolute inset-0 rounded-[18px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none">
                <div className="bg-[rgba(99,102,241,0.15)] rounded-[18px] inset-0 absolute" />
                <span className="relative z-10 text-xs font-bold text-[#c4b5fd] bg-[rgba(15,10,30,0.85)] px-3 py-1.5 rounded-full border border-[rgba(139,92,246,0.4)]">
                    {isDone ? "👁 View Results" : "▶ Resume Game"}
                </span>
            </div>
        </div>
    )
}

// ─── Rules Modal ─────────────────────────────────────────────────────────────────
const RulesModal = ({ onClose }: { onClose: () => void }) => {
    return (
        <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-[rgba(0,0,0,0.75)]"
            onClick={onClose}
        >
            <div
                className="w-full max-w-lg bg-[#1a1335] border border-[rgba(139,92,246,0.35)] rounded-[24px] shadow-[0_24px_64px_rgba(0,0,0,0.7)] max-h-[82vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[rgba(139,92,246,0.2)] shrink-0">
                    <div>
                        <h2 className="m-0 text-white font-black text-xl">
                            ♠ Rules of Spades
                        </h2>
                        <p className="m-0 text-[#818cf8] text-xs mt-1">
                            Quick reference guide
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-[rgba(255,255,255,0.07)] border-none text-[#a78bfa] cursor-pointer hover:bg-[rgba(255,255,255,0.12)] text-sm font-bold flex items-center justify-center"
                    >
                        ✕
                    </button>
                </div>

                {/* Scrollable content */}
                <div className="overflow-y-auto px-6 py-5 flex flex-col gap-5">
                    {[
                        // --- CORE MECHANICS ---
                        {
                            emoji: "🃏",
                            category: "Basics",
                            title: "The Basics",
                            body: "Spades is a 4-player trick-taking card game played in 2 teams (North/South vs East/West). A standard 52-card deck is used. Spades are always trump — they beat every other suit.",
                        },
                        {
                            emoji: "🔀",
                            category: "Basics",
                            title: "The Deal",
                            body: "The dealer shuffles and deals all 52 cards evenly — 13 cards to each player. Players look at their hand and decide how many tricks they think they can win.",
                        },
                        {
                            emoji: "▶️",
                            category: "Basics",
                            title: "Playing Tricks",
                            body: "The player to the left of the dealer leads first. Players must follow the lead suit if they can. If they can't, they may play any card, including a spade. Spades can't be led until they've been 'broken' — played as a discard on another suit.",
                        },
                        {
                            emoji: "🏆",
                            category: "Basics",
                            title: "Winning Tricks",
                            body: "The highest card of the lead suit wins the trick — unless a spade was played, in which case the highest spade wins. The winner of each trick leads the next one.",
                        },

                        // --- BIDDING & SCORING ---
                        {
                            emoji: "✋",
                            category: "Bidding",
                            title: "Standard Bidding",
                            body: "Each player bids the number of tricks they expect to win (0–13). Teammates' bids are added together. You must bid at least 1 unless bidding Nil.",
                        },
                        {
                            emoji: "🚫",
                            category: "Bidding",
                            title: "Nil Bids",
                            body: "A Nil bid (0) means you expect to win zero tricks. If successful, your team gets a large bonus (usually 100pts). If you win even one trick, you are 'set' and penalized that same amount.",
                        },
                        {
                            emoji: "🌑",
                            category: "Bidding",
                            title: "Blind Nil",
                            body: "Declared before looking at your cards. This usually doubles the Nil bonus (200pts), but carries an equal penalty if you fail. Teammates can still bid normally to cover you.",
                        },
                        {
                            emoji: "🛑",
                            category: "Bidding",
                            title: "The Board (Minimum Bid)",
                            body: "A common house rule where the minimum combined team bid must be at least 4. This prevents teams from bidding ultra-low just to avoid bags.",
                        },
                        {
                            emoji: "📊",
                            category: "Scoring",
                            title: "Standard Scoring",
                            body: "If a team meets or exceeds their bid, they score 10 points per trick bid. Extra tricks (bags) are worth 1 point each. Failing to meet a bid results in a 'set' (negative 10 points per trick bid).",
                        },
                        {
                            emoji: "🏚️",
                            category: "Scoring",
                            title: "Going Set",
                            body: "If your team wins fewer tricks than your combined bid, you earn zero points for those tricks and instead lose 10 points for every trick you bid. (e.g., Bid 6, Get 5 = -60 points).",
                        },
                        {
                            emoji: "🛄",
                            category: "Scoring",
                            title: "Bags & Penalties",
                            body: "Bags accumulate across rounds. Every time a team reaches 10 total bags, they are penalized 100 points and their bag count resets to zero.",
                        },
                        {
                            emoji: "🔟",
                            category: "Scoring",
                            title: "10-for-200",
                            body: "If a team bids exactly 10 tricks and wins exactly 10, they receive 200 points. If they fail to hit 10, they lose 100 points. A risky but powerful way to catch up.",
                        },

                        // --- DECK VARIATIONS ---
                        {
                            emoji: "🃏🃏",
                            category: "Variations",
                            title: "Joker Joker Deuce Deuce",
                            body: "Street style! The Big Joker (full color) is #1, Little Joker (B&W) is #2, 2 of Diamonds is #3, and 2 of Spades is #4. The 2 of Clubs and 2 of Hearts are removed from the deck.",
                        },
                        {
                            emoji: "🃏🅰️",
                            category: "Variations",
                            title: "Joker Joker Ace",
                            body: "The two Jokers are the highest trump cards, followed by the Ace of Spades. This makes the Ace the third most powerful card in the game.",
                        },

                        // --- GAME MODES ---
                        {
                            emoji: "💀",
                            category: "Variations",
                            title: "Suicide",
                            body: "One partner on each team MUST bid Nil, while the other partner must bid at least 4. High risk, high reward, and very fast gameplay.",
                        },
                        {
                            emoji: "🧙‍♂️",
                            category: "Variations",
                            title: "Whiz",
                            body: "Bidding is automatic. You must bid the exact number of Spades in your hand. If you have no Spades, you must bid Nil.",
                        },
                        {
                            emoji: "🪞",
                            category: "Variations",
                            title: "Mirror",
                            body: "Your bid must exactly equal the number of Spades in your hand. Unlike Whiz, if you have Spades, you cannot choose to go Nil.",
                        },

                        // --- CONDUCT ---
                        {
                            emoji: "🕵️",
                            category: "Conduct",
                            title: "Reneging",
                            body: "Failing to follow suit when you have the card is 'reneging.' If caught, the offending team is typically penalized 3 tricks, which are given to the opponents.",
                        },
                        {
                            emoji: "🎯",
                            category: "Ending",
                            title: "Winning the Game",
                            body: "First team to 500 points wins. If both teams cross 500 in the same round, the higher score wins. If a team drops to -200 points, they automatically lose.",
                        },
                    ].map(({ emoji, title, body }) => (
                        <div key={title} className="flex gap-3">
                            <div className="text-xl shrink-0 mt-0.5">
                                {emoji}
                            </div>
                            <div>
                                <p className="m-0 text-white font-bold text-sm mb-1">
                                    {title}
                                </p>
                                <p className="m-0 text-[#a78bfa] text-xs leading-relaxed">
                                    {body}
                                </p>
                            </div>
                        </div>
                    ))}

                    {/* Quick scoring reference */}
                    <div className="bg-[rgba(139,92,246,0.1)] border border-[rgba(139,92,246,0.25)] rounded-[14px] p-4">
                        <p className="m-0 text-[#c4b5fd] font-bold text-xs mb-3 tracking-widest">
                            QUICK SCORING REFERENCE
                        </p>
                        <div className="flex flex-col gap-2">
                            {[
                                ["Made bid", "+10 pts per trick bid"],
                                ["Overtricks (bags)", "+1 pt each"],
                                ["Failed bid", "−10 pts per trick bid"],
                                ["Nil success", "+100 pts"],
                                ["Nil failure", "−100 pts"],
                                ["10 bags penalty", "−100 pts"],
                                ["Win condition", "500 pts"],
                            ].map(([label, value]) => (
                                <div
                                    key={label}
                                    className="flex justify-between items-center text-xs"
                                >
                                    <span className="text-[#818cf8]">
                                        {label}
                                    </span>
                                    <span className="text-white font-bold">
                                        {value}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <p className="m-0 text-[10px] text-[#4b5563] text-center pb-1">
                        Scoring values can be customized in room settings.
                    </p>
                </div>
            </div>
        </div>
    )
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
    const [gameId, setGameId] = useState<string | null>(null)
    const [screen, setScreen] = useState("home")
    const [room, setRoom] = useState("")
    const [teams, setTeams] = useState([
        { name: "Team North/South", score: 0, bags: 0 },
        { name: "Team East/West", score: 0, bags: 0 },
    ])
    const [settings, setSettings] = useState({
        ...defaultSettings,
    })
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
    const [savedGames, setSavedGames] = useState(() => loadGames())
    const [showRules, setShowRules] = useState(false)

    // ── Persistence helpers ──
    const persistCurrentGame = (overrides = {}) => {
        if (!gameId) return
        const state = {
            id: gameId,
            room,
            teams,
            settings,
            round,
            phase,
            bids,
            tricks,
            history,
            savedAt: Date.now(),
            ...overrides,
        }
        saveGame(state)
        setSavedGames(loadGames())
    }

    const handleResumeGame = (game: GameState) => {
        setGameId(game.id)
        setRoom(game.room)
        setTeams(game.teams)
        setSettings(game.settings)
        setRound(game.round)
        setPhase(game.phase)
        setBids(game.bids)
        setTricks(game.tricks)
        setHistory(game.history)
        setShowHistory(false)
        setScreen("game")
    }

    const handleDeleteGame = (id: string) => {
        deleteGame(id)
        setSavedGames(loadGames())
    }

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
        setSavedGames(loadGames())
    }

    const startGame = () => {
        const id = `game_${Date.now()}`
        setGameId(id)
        setTeams((t: Team[]) => t.map((x) => ({ ...x, score: 0, bags: 0 })))
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
        persistCurrentGame({ phase: "tricks", tricks: ["", ""] })
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
        const newHistory = [
            ...history,
            {
                round,
                bids: [...bids],
                tricks: [...tricks],
                scores: newTeams.map((t) => t.score),
            },
        ]
        const newRound = round + 1
        const isDone = newTeams.some((t) => t.score >= settings.winScore)

        setHistory(newHistory)
        setTeams(newTeams)

        if (isDone) {
            setPhase("done")
            persistCurrentGame({
                teams: newTeams,
                history: newHistory,
                phase: "done",
                bids: ["", ""],
                tricks: ["", ""],
            })
        } else {
            setRound(newRound)
            setPhase("bidding")
            setBids(["", ""])
            setTricks(["", ""])
            persistCurrentGame({
                teams: newTeams,
                history: newHistory,
                round: newRound,
                phase: "bidding",
                bids: ["", ""],
                tricks: ["", ""],
            })
        }
    }

    const cardClass =
        "bg-violet-500/10 border border-violet-500/25 rounded-[18px] p-5"
    const numBtnBase =
        "w-10 h-10 rounded-xl font-bold text-xs cursor-pointer transition-all duration-150 flex items-center justify-center"
    const bigBtnBase =
        "w-full py-3.5 rounded-2xl font-bold text-lg mt-[18px] transition-all cursor-pointer"

    // HOME SCREEN
    if (screen === "home")
        return (
            <div className="min-h-screen bg-[#0f0a1e] text-white flex flex-col items-center justify-center p-12 font-sans">
                <div className="text-7xl mb-1">♠</div>
                <h1 className="text-[46px] font-black m-0 bg-gradient-to-br from-[#818cf8] to-[#c084fc] bg-clip-text text-transparent">
                    Bookkeeper
                </h1>
                <p className="text-[#818cf8] mb-10 text-base">
                    Spades Scorekeeping
                </p>
                <div className="w-full max-w-[360px] pb-10">
                    <label className="text-[12px] text-[#818cf8] font-bold tracking-widest block mb-2 uppercase">
                        Room Name
                    </label>
                    <input
                        className="w-full py-[13px] px-4 rounded-[13px] border border-[#8b5cf666] bg-[#8b5cf61a] text-white text-[17px] outline-none placeholder:text-white/20"
                        placeholder="e.g. Friday Night Cards"
                        value={room}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setRoom(e.target.value)
                        }
                        onKeyDown={(e: React.KeyboardEvent) =>
                            e.key === "Enter" &&
                            room.trim() &&
                            setScreen("lobby")
                        }
                    />
                    <button
                        className={`${bigBtnBase} ${room.trim() ? "bg-gradient-to-br from-[#6366f1] to-[#a855f7] text-white" : "bg-[#2d2748] text-gray-500 cursor-not-allowed"}`}
                        onClick={() => room.trim() && setScreen("lobby")}
                    >
                        Create Room →
                    </button>
                    <div className="mt-3">
                        <button
                            onClick={() => setShowRules(true)}
                            className="bg-transparent border-none text-[#818cf8]/40 hover:text-[#a78bfa] text-xs cursor-pointer font-medium transition-colors duration-150 underline underline-offset-2"
                        >
                            How to Play Spades?
                        </button>
                    </div>
                </div>
                {/* Previous Games */}
                {savedGames.length > 0 && (
                    <div className="pb-10 max-w-[720px] mx-auto">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-xs text-[#818cf8] font-bold tracking-[2px] m-0">
                                PREVIOUS GAMES
                            </p>
                            <button
                                onClick={() => {
                                    if (
                                        window.confirm(
                                            "Delete all saved games?",
                                        )
                                    ) {
                                        localStorage.removeItem(STORAGE_KEY)
                                        setSavedGames([])
                                    }
                                }}
                                className="text-[10px] text-[#6b7280] hover:text-[#fca5a5] bg-transparent border-none cursor-pointer font-semibold transition-colors"
                            >
                                Clear all
                            </button>
                        </div>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            {savedGames.map((game: GameState) => (
                                <PreviousGameCard
                                    key={game.id}
                                    game={game}
                                    onResume={handleResumeGame}
                                    onDelete={handleDeleteGame}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {savedGames.length === 0 && (
                    <div className="flex flex-col items-center pb-10 opacity-30">
                        <div className="text-3xl mb-2">🃏</div>
                        <p className="text-xs text-[#818cf8] font-semibold m-0">
                            No previous games yet
                        </p>
                    </div>
                )}
                {showRules && (
                    <RulesModal onClose={() => setShowRules(false)} />
                )}
            </div>
        )

    // LOBBY SCREEN
    if (screen === "lobby")
        return (
            <div className="min-h-screen bg-[#0f0a1e] text-white p-6 font-sans pt-10">
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
                        {teams.map((t: Team, i: number) => (
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
                                                (setTeams((tm: Team[]) =>
                                                    tm.map(
                                                        (x: Team, j: number) =>
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
                                                setTeams((tm: Team[]) =>
                                                    tm.map(
                                                        (x: Team, j: number) =>
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
                                        value={String(
                                            settings[
                                                k as keyof typeof settings
                                            ],
                                        )}
                                        onChange={(e) =>
                                            setSettings((s: Settings) => ({
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
                                    setSettings((s: Settings) => ({
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
                        className={`${bigBtnBase} bg-gradient-to-br from-[#6366f1] to-[#a855f7] text-white cursor-pointer`}
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
                    <div
                        className="flex items-center cursor-pointer gap-2.5"
                        onClick={resetAll}
                    >
                        <span className="text-[18px]">♠</span>
                        <span className="font-black text-[17px]">{room}</span>
                    </div>
                    <span className="bg-[#7c3aed4d] text-[#c4b5fd] rounded-full px-2.5 py-0.5 text-[12px] font-bold">
                        Round {round}
                    </span>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowHistory((h: boolean) => !h)}
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
                    {teams.map((t: Team, i: number) => (
                        <div key={i} className={cardClass}>
                            <div className="flex items-center gap-1.5 mb-2.5">
                                <span className="text-[18px]">
                                    {i === 0 ? "🔵" : "🔴"}
                                </span>
                                <span className="font-bold text-[12px] text-[#c4b5fd] truncate">
                                    {t.name} {round % 2 !== i && "•"}
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
                        {teams.map((t: Team, i: number) => (
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
                        {teams.map((t: Team, i: number) => (
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
