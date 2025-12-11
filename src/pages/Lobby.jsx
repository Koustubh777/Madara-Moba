import React from 'react'
import { getDatabase, ref, push, onValue } from 'firebase/database'


export default function Lobby({ user, onJoin }){
const [roomId, setRoomId] = React.useState('')
const [rooms, setRooms] = React.useState([])


const db = getDatabase()


React.useEffect(()=>{
const roomsRef = ref(db, 'rooms/')
onValue(roomsRef, snapshot => {
const data = snapshot.val() || {}
setRooms(Object.keys(data))
})
},[])


function createRoom(){
const roomRef = push(ref(db, 'rooms/'))
roomRef.set({ host: user.displayName, players: {[user.uid]: user.displayName} })
onJoin({id: roomRef.key})
}


function joinRoom(){
if(!roomId) return alert('enter room id')
const playerRef = ref(db, `rooms/${roomId}/players/${user.uid}`)
playerRef.set(user.displayName)
onJoin({id: roomId})
}


return (
<div className="center">
<h2>Welcome, {user.displayName}</h2>
<button onClick={createRoom}>Create Room</button>
<div style={{marginTop:12}}>
<input placeholder="Room id" value={roomId} onChange={e=>setRoomId(e.target.value)} />
<button onClick={joinRoom}>Join Room</button>
</div>
<small>Share room id with friends. Rooms support up to 4 players (2v2).</small>
<div style={{marginTop:12}}>
<h4>Active Rooms:</h4>
{rooms.map(r => <div key={r}>{r}</div>)}
</div>
</div>
)
}
