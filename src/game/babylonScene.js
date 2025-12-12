// src/game/babylonScene.js
import * as BABYLON from 'babylonjs'
import 'babylonjs-loaders'
import { rtdb } from '../firebaseConfig.js'
import { ref, set, onValue, off } from 'firebase/database'

export function createScene(canvas, user, room) {
  const engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true })
  const scene = new BABYLON.Scene(engine)
  scene.clearColor = new BABYLON.Color4(0.8, 0.9, 1, 1)

  // Input state used by HUD
  let input = { x: 0, z: 0 }

  // Expose functions so HUD/Game can call them
  scene.updateLocalMovement = (dx, dz) => {
    input.x = dx
    input.z = dz
  }

  scene.useAbility = (ability) => {
    // ability string like 'Q' / 'W' / 'E'
    console.log(user.displayName + ' used ' + ability)
    // TODO: implement particle effects, damage, cooldowns
  }

  // CAMERA
  const camera = new BABYLON.ArcRotateCamera(
    'cam',
    Math.PI / 2,
    Math.PI / 2.6,
    40,
    new BABYLON.Vector3(0, 0, 0),
    scene
  )
  camera.attachControl(canvas, true)
  camera.lowerRadiusLimit = 30
  camera.upperRadiusLimit = 50

  // LIGHT
  const light = new BABYLON.HemisphericLight('h1', new BABYLON.Vector3(0, 1, 0), scene)

  // GROUND & LANES
  const ground = BABYLON.MeshBuilder.CreateGround('g', { width: 120, height: 80 }, scene)
  const groundMat = new BABYLON.StandardMaterial('groundMat', scene)
  groundMat.diffuseColor = new BABYLON.Color3(0.15, 0.6, 0.15)
  ground.material = groundMat

  for (let i = -1; i <= 1; i += 2) {
    const lane = BABYLON.MeshBuilder.CreateBox('lane' + i, { height: 0.2, width: 100, depth: 12 }, scene)
    lane.position = new BABYLON.Vector3(0, 0.1, i * 12)
    const laneMat = new BABYLON.StandardMaterial('laneMat', scene)
    laneMat.diffuseColor = new BABYLON.Color3(0.4, 0.4, 0.45)
    lane.material = laneMat
  }

  // HERO MANAGEMENT
  const heroes = {} // map uid -> mesh

  // Safe guard: make sure room.id exists
  const roomId = room && room.id ? room.id : 'default_room'

  const playerPositionsPath = `games/${roomId}/positions`
  const playerRef = ref(rtdb, playerPositionsPath)

  // RTDB listener: update or create hero meshes when positions change
  const onValueCallback = (snapshot) => {
    const data = snapshot.val() || {}
    Object.keys(data).forEach((uid) => {
      const pos = data[uid] || { x: 0, z: 0 }
      if (!heroes[uid]) {
        const heroMesh = BABYLON.MeshBuilder.CreateSphere(`hero_${uid}`, { diameter: 2 }, scene)
        heroMesh.position.y = 1
        heroes[uid] = heroMesh
      }
      // guard in case pos missing values
      heroes[uid].position.x = typeof pos.x === 'number' ? pos.x : heroes[uid].position.x
      heroes[uid].position.z = typeof pos.z === 'number' ? pos.z : heroes[uid].position.z
    })
  }

  // Start listening
  onValue(playerRef, onValueCallback)

  // Create local hero mesh and ensure it's registered in heroes map
  const localHeroId = user.uid
  const localHero = BABYLON.MeshBuilder.CreateSphere(`hero_${localHeroId}`, { diameter: 2 }, scene)
  localHero.position.y = 1
  localHero.position.x = -10
  localHero.position.z = 0
  heroes[localHeroId] = localHero

  // HELPER: write local position to RTDB (modular SDK)
  function writeLocalPosition() {
    try {
      set(ref(rtdb, `${playerPositionsPath}/${localHeroId}`), {
        x: localHero.position.x,
        z: localHero.position.z,
      })
    } catch (e) {
      // log but don't crash render loop
      console.warn('RTDB set failed', e)
    }
  }

  // RENDER LOOP
  engine.runRenderLoop(() => {
    // apply input movement (input is small normalized deltas from HUD)
    localHero.position.x += input.x
    localHero.position.z += input.z

    // update RTDB with current position
    writeLocalPosition()

    scene.render()
  })

  // handle resizing
  const resizeHandler = () => engine.resize()
  window.addEventListener('resize', resizeHandler)

  // Dispose function to clean up when leaving Game
  scene.dispose = () => {
    try {
      // stop render loop
      engine.stopRenderLoop()

      // remove RTDB listener
      off(playerRef, 'value', onValueCallback)

      // dispose meshes
      Object.values(heroes).forEach((m) => {
        try { m.dispose && m.dispose() } catch (e) {}
      })

      // dispose scene & engine
      scene.detachControl && scene.detachControl()
      scene.dispose && scene.dispose()
      engine.dispose && engine.dispose()
      window.removeEventListener('resize', resizeHandler)
    } catch (e) {
      console.warn('Error during scene.dispose()', e)
    }
  }

  // Return the scene object (engine+scene available through closure)
  return scene
}
