import * as BABYLON from 'babylonjs'
import 'babylonjs-loaders'
import { getDatabase, ref, onValue, set } from 'firebase/database'

export function createScene(canvas, user, room){
  const engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true })
  const scene = new BABYLON.Scene(engine)
  scene.clearColor = new BABYLON.Color4(0.8,0.9,1,1)

  // Camera - top down, fixed
  const camera = new BABYLON.ArcRotateCamera('cam', Math.PI/2, Math.PI/2.6, 40, new BABYLON.Vector3(0,0,0), scene)
  camera.setTarget(BABYLON.Vector3.Zero())
  camera.attachControl(canvas, true)
  camera.lowerRadiusLimit = 30
  camera.upperRadiusLimit = 50

  const light = new BABYLON.HemisphericLight('h1', new BABYLON.Vector3(0,1,0), scene)

  // Ground and lanes
  const ground = BABYLON.MeshBuilder.CreateGround('g', {width:120, height:80}, scene)
  ground.material = new BABYLON.StandardMaterial('mat', scene)
  ground.material.diffuseColor = new BABYLON.Color3(0.15,0.6,0.15)

  for(let i=-1;i<=1;i+=2){
    const lane = BABYLON.MeshBuilder.CreateBox('lane'+i, {height:0.2, width:100, depth:12}, scene)
    lane.position = new BABYLON.Vector3(0,0.1,i*12)
    lane.material = new BABYLON.StandardMaterial('laneMat', scene)
    lane.material.diffuseColor = new BABYLON.Color3(0.4,0.4,0.45)
  }

  // Placeholder glTF hero
  const hero = BABYLON.MeshBuilder.CreateSphere('hero', {diameter:2}, scene)
  hero.position.y = 1.5
  hero.position.x = -10

  // Particle effects placeholder
  const particleSystem = new BABYLON.ParticleSystem('particles', 2000, scene)
  particleSystem.particleTexture = new BABYLON.Texture('https://www.babylonjs-playground.com/textures/flare.png', scene)
  particleSystem.emitter = hero
  particleSystem.start()

  engine.runRenderLoop(()=> scene.render())
  window.addEventListener('resize', ()=> engine.resize())

  return scene
}
