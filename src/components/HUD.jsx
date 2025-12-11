import React, { useState, useEffect } from 'react'

export default function HUD({ onExit, onMove, onAbility }) {
  // onMove = function({x, z}) for joystick
  // onAbility = function(abilityName) for Q/W/E

  const [touchStart, setTouchStart] = useState(null)

  // joystick movement
  const handleTouchStart = (e) => {
    const t = e.touches[0]
    setTouchStart({x: t.clientX, y: t.clientY})
  }

  const handleTouchMove = (e) => {
    if(!touchStart) return
    const t = e.touches[0]
    let dx = t.clientX - touchStart.x
    let dy = t.clientY - touchStart.y

    // normalize movement
    let norm = Math.sqrt(dx*dx + dy*dy)
    if(norm>0){
      dx /= norm
      dy /= norm
    }
    onMove({x: dx*0.5, z: -dy*0.5}) // send small step
  }

  const handleTouchEnd = () => {
    setTouchStart(null)
    onMove({x:0, z:0})
  }

  return (
    <div className="hud">
      {/* Top bar */}
      <div className="topbar">
        Madara MOBA — 2v2 Elemental
      </div>

      {/* Left bottom: joystick */}
      <div 
        className="joystick" 
        onTouchStart={handleTouchStart} 
        onTouchMove={handleTouchMove} 
        onTouchEnd={handleTouchEnd}>
        <div className="stick"></div>
      </div>

      {/* Right bottom: abilities */}
      <div className="abilities">
        <button onTouchStart={()=>onAbility('Q')}>Q</button>
        <button onTouchStart={()=>onAbility('W')}>W</button>
        <button onTouchStart={()=>onAbility('E')}>E</button>
      </div>

      {/* Leave match */}
      <div className="controls">
        <button onClick={onExit}>Leave Match</button>
      </div>
    </div>
  )
}
