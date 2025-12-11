import React from 'react'


export default function HUD({ onExit }){
return (
<div className="hud">
<div className="topbar">Madara MOBA — 2v2 Elemental</div>
<div className="controls">
<button onClick={onExit}>Leave Match</button>
</div>
</div>
)
}
