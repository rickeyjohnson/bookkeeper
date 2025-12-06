import { useState } from "react";

function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'room'>('home')
  const [roomCode, setRoomCode] = useState<string>('')

  const handleNavigate = (page: string, code?: string) => {
    setCurrentPage(page as 'home' | 'room');
    if (code) setRoomCode(code);
  }

  return (
    <>
      {currentPage === 'home' && <HomePage onNavigate={handleNavigate} />}
      {currentPage === 'room' && <RoomPage roomCode={roomCode} onNavigate={handleNavigate} />}
    </>
  )
}

export default App
