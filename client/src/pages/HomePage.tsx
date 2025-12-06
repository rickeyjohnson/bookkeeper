import { useState } from "react"

const HomePage = ({onNavigate}) => {
    const [creatorName, setCreatorName] = useState('')
    const [joinCode, setJoinCode] = useState('')
    const [joinName, setJoinName] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    
    const handleCreateRoom = async () => {
        if (!creatorName.trim()) {
            setError('Please enter your name')
            return
        }

        setLoading(true)
        setError('')

        try {
      const { code } = await api.createRoom(creatorName);
      onNavigate('room', code);
    } catch (err) {
      setError('Failed to create room. Please try again.');
    } finally {
      setLoading(false);
    }
    }
}
