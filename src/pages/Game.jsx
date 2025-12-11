import React, { useRef, useEffect, useState } from 'react'
import HUD from '../components/HUD'
import { createScene } from '../game/babylonScene'

export default function Game({ user, room, onExit }){
  const canvasRef = useRef()
  const [sceneObj, setSceneObj] = useState(null)

  useEffect(()=>{
    const engineScene = createScene(canvasRef.current, user, room)
    setSceneObj(engineScene)
    return ()=> engineScene.dispose && engineScene.dispose()
  },[])

  const handleMove = ({x, z})=>{
    if(sceneObj) sceneObj.updateLocalMovement(x, z)
  }

  const handleAbility = (ability)=>{
    if(sceneObj) sceneObj.useAbility(ability)
  }

  return (
    <div className="game-root">
      <canvas ref={canvasRef} id="renderCanvas" />
      <HUD onExit={onExit} onMove={handleMove} onAbility={handleAbility} />
    </div>
  )
}
