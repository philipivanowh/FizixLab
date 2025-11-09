import Box from "./Box.js";
import {createRenderer} from "./Renderer.js";
import Scene from "./Scene.js";
import bodyType from "./Rigidbody.js";
import Ball from "./Ball.js";
import Vec2 from "./Vec2.js";



const canvas = document.querySelector("#c");
const renderer = await createRenderer(canvas);
const scene = new Scene();

// Add boxes
var boxPos = new Vec2(canvas.width/2+500, 200);
var boxVel = new Vec2(0,0);
var boxAcc = new Vec2(0,0);
var box = new Box(boxPos,boxVel,boxAcc, 80, 80, [184, 92, 92, 1], 100, bodyType.DYNAMIC);

var boxPos2 = new Vec2(100, 600);
var boxVel2 = new Vec2(1,0);
var boxAcc2 = new Vec2(0,0);
var box2 = new Box(boxPos2,boxVel2,boxAcc2, 80, 80, [184, 92, 92, 1], 1, bodyType.DYNAMIC);

var groundPos = new Vec2(850, 50);
var groundVel = new Vec2(0,0);
var groundAcc = new Vec2(0,0);
var ground = new Box(groundPos, groundVel,groundAcc ,1600, 50, [255, 255, 255, 1], 1, bodyType.STATIC);


var ball1Pos = new Vec2(200, 400);
var ball1Vel = new Vec2(0,0);
var ball1Acc = new Vec2(0,0);
var ball1 = new Ball(ball1Pos,ball1Vel,ball1Acc,50,[255, 200, 20, 1],5,bodyType.DYNAMIC);

// var ball2Pos = new Vec2(400, 150);
// var ball2Vel = new Vec2(100,0);
// var ball2Acc = new Vec2(0,0);
// var ball2 = new Ball(ball2Pos,ball2Vel,ball2Acc,50,[100, 200, 20, 1],1,bodyType.DYNAMIC);


// var ball3Pos = new Vec2(1000, 150);
// var ball3Vel = new Vec2(-500,0);
// var ball3Acc = new Vec2(0,0);
// var ball3 = new Ball(ball3Pos,ball3Vel,ball3Acc,70,[100, 200, 20, 1],1,bodyType.DYNAMIC);
scene.add(box);
scene.add(box2);
scene.add(ground);
scene.add(ball1);
// scene.add(ball2);
// scene.add(ball3);

document.querySelector(".spawnBox").addEventListener("click", () => {
  const x = Math.random() * (canvas.width - 50);
  const y = Math.random() * (canvas.height - 50);
  const size = 20 + Math.random() * 80;
  scene.add(new Box(new Vec2(x, y),new Vec2(0,0),new Vec2(0,0), size, size,[120,200,200,1],1, bodyType.DYNAMIC));
});

document.querySelector(".spawnBall").addEventListener("click", () => {
  const ballPos = new Vec2(Math.random() * (canvas.width - 50),Math.random() * (canvas.height - 50));
  const ballVel = new Vec2(Math.floor(Math.random() * ((500 + 500 +1)-500)),Math.floor(Math.random() * ((500 + 500 +1)-500)));
  const ballAcc = new Vec2(0,0); 
  const radius = Math.random() * (100-50+1)+50;
  const r = Math.random()*(255-0+1);
  const g = Math.random()*(255-0+1);
  const b = Math.random()*(255-0+1);
  scene.add(new Ball(ballPos,ballVel,ballAcc, radius,[r,g,b,1],1, bodyType.DYNAMIC));
});


var lastTime = Date.now();
function renderLoop() {
  let currentTime = Date.now();
  let deltaTime = (currentTime - lastTime);

  console.groupCollapsed("Frame");
  console.log("DeltaTime" + deltaTime/1000);
  console.log("Body Count" + scene.bodyCount());
  console.groupEnd();
  renderer.clear();
  scene.update(deltaTime,20);
  scene.draw(renderer);

  lastTime = currentTime;

  requestAnimationFrame(renderLoop);
}

renderLoop();