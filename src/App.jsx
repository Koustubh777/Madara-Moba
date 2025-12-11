import React from 'react'
import { initializeApp } from 'firebase/app'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { firebaseConfig } from './firebaseConfig'
import Login from './components/Login'
import Lobby from './pages/Lobby'
import Game from './pages/Game'


initializeApp(firebaseConfig)
const auth = getAuth()


export default function App() {
const [user, setUser] = React.useState(null)
const [room, setRoom] = React.useState(null)
const [inGame, setInGame] = React.useState(false)


React.useEffect(() => {
return onAuthStateChanged(auth, u => setUser(u))
}, [])


if (!user) return <Login />
if (!room) return <Lobby user={user} onJoin={(r) => setRoom(r)} />
if (inGame) return <Game user={user} room={room} onExit={() => { setInGame(false); setRoom(null) }} />


return (
<div className="center">
<h2>Ready in Room: {room.id}</h2>
<button onClick={() => setInGame(true)}>Start Match</button>
<button onClick={() => setRoom(null)}>Leave Room</button>
</div>
)
}
