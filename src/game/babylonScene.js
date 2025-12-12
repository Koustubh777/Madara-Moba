import * as BABYLON from 'babylonjs'
import 'babylonjs-loaders'
import { rtdb } from '../firebaseConfig.js'
import { ref, set, onValue } from 'firebase/database'

export function createScene(canvas, user, room){
  const engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true })
  const scene = new BABYLON.Scene(engine)
  scene.clearColor = new BABYLON.Color4(0.8,0.9,1,1)
  let input = {x:0, z:0}

// expose functions for HUD
scene.updateLocalMovement = (dx, dz)=>{
  input.x = dx
  input.z = dz
}

scene.useAbility = (ability)=>{
  console.log(user.displayName + " used " + ability)
  // TODO: trigger particle effects, damage, cooldowns
}


  // Top-down camera
  const camera = new BABYLON.ArcRotateCamera('cam', Math.PI/2, Math.PI/2.6, 40, new BABYLON.Vector3(0,0,0), scene)
  camera.attachControl(canvas, true)
  camera.lowerRadiusLimit = 30
  camera.upperRadiusLimit = 50

  // Light
  const light = new BABYLON.HemisphericLight('h1', new BABYLON.Vector3(0,1,0), scene)

  // Ground & lanes
  const ground = BABYLON.MeshBuilder.CreateGround('g', {width:120, height:80}, scene)
  const groundMat = new BABYLON.StandardMaterial('groundMat', scene)
  groundMat.diffuseColor = new BABYLON.Color3(0.15,0.6,0.15)
  ground.material = groundMat

  for(let i=-1;i<=1;i+=2){
    const lane = BABYLON.MeshBuilder.CreateBox('lane'+i, {height:0.2, width:100, depth:12}, scene)
    lane.position = new BABYLON.Vector3(0,0.1,i*12)
    const laneMat = new BABYLON.StandardMaterial('laneMat', scene)
    laneMat.diffuseColor = new BABYLON.Color3(0.4,0.4,0.45)
    lane.material = laneMat
  }

  // Hero placeholders
  const heroes = {}  // store hero meshes
  const playerRef = ref(rtdb, `games/${room.id}/positions`)

  // Listen for updates from RTDB
  onValue(playerRef, snapshot=>{
    const data = snapshot.val() || {}
    Object.keys(data).forEach(uid=>{
      if(!heroes[uid]){
        // create hero sphere
        const heroMesh = BABYLON.MeshBuilder.CreateSphere(uid, {diameter:2}, scene)
        heroMesh.position.y = 1
        heroes[uid] = heroMesh
      }
      heroes[uid].position.x = data[uid].x
      heroes[uid].position.z = data[uid].z
    })
  })

  // Local hero control (mobile-friendly)
  const localHero = BABYLON.MeshBuilder.CreateSphere(user.uid, {diameter:2}, scene)
  localHero.position.y = 1
  localHero.position.x = -10
  localHero.position.z = 0
  heroes[user.uid] = localHero

  const speed = 0.3
  let movementInput = { up:false, down:false, left:false, right:false }

  // Update loop
 engine.runRenderLoop(()=>{
  localHero.position.x += input.x
  localHero.position.z += input.z

  // send updated position to RTDB
  import { ref, set } from "firebase/database";

set(ref(rtdb, `games/${room.id}/positions/${user.uid}`), {
  x: localHero.position.x,
  z: localHero.position.z
});

  scene.render()
})
}
