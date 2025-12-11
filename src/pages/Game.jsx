import React from 'react'
import HUD from '../components/HUD'
import { createScene } from '../game/babylonScene'


export default function Game({ user, room, onExit }){
const canvasRef = React.useRef()
React.useEffect(()=>{
const engineScene = createScene(canvasRef.current, user, room)
return ()=> engineScene.dispose && engineScene.dispose()
},[])


return (
<div className="game-root">
<canvas ref={canvasRef} id="renderCanvas" />
<HUD onExit={onExit} />
</div>
)
}
