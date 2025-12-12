// src/pages/Lobby.jsx
import React from 'react'
import { ref, push, set, onValue } from 'firebase/database'
import { rtdb } from '../firebaseConfig.js'   // use the shared rtdb instance

export default function Lobby({ user, onJoin }){
  const [roomId, setRoomId] = React.useState('')
  const [rooms, setRooms] = React.useState([])

  React.useEffect(()=>{
    const roomsRef = ref(rtdb, 'rooms/')
    const unsubscribe = onValue(roomsRef, snapshot => {
      const data = snapshot.val() || {}
      setRooms(Object.keys(data))
    })

    // onValue doesn't return unsubscribe directly in v9; we return cleanup that uses off
    return () => {
      // remove listener
      try { unsubscribe && unsubscribe() } catch(e) {}
    }
  },[])

  async function createRoom(){
    // push returns a DatabaseReference; use set(ref, data) to write
    const roomRef = push(ref(rtdb, 'rooms/'))
    try{
      await set(roomRef, { host: user.displayName, players: { [user.uid]: user.displayName } })
      onJoin({ id: roomRef.key })
    }catch(e){
      console.error('createRoom failed', e)
      alert('Could not create room: '+e.message)
    }
  }

  async function joinRoom(){
    if(!roomId) return alert('Enter room id')
    const playerRef = ref(rtdb, `rooms/${roomId}/players/${user.uid}`)
    try{
      // write player's displayName under rooms/{roomId}/players/{uid}
      await set(playerRef, user.displayName)
      onJoin({ id: roomId })
    }catch(e){
      console.error('joinRoom failed', e)
      alert('Could not join room: '+e.message)
    }
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
