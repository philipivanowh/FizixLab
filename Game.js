import Box from "./Box.js";
import Renderer from "./Renderer.js";
import Scene from "./Scene.js";
import bodyType from "./Rigidbody.js";
"use strict";


const canvas = document.querySelector("#c");
const renderer = new Renderer(canvas);
const scene = new Scene();

// Add boxes
scene.add(new Box(100, 100, 80, 80, [184, 92, 92, 1], 1, bodyType.DYNAMIC));
scene.add(new Box(50, 700, 1600, 50, [255, 255, 255, 1], 1, bodyType.STATIC));

document.querySelector(".spawnBox").addEventListener("click", () => {
  const x = Math.random() * (canvas.width - 50);
  const y = Math.random() * (canvas.height - 50);
  const size = 20 + Math.random() * 80;
  scene.add(new Box(x, y, size, size));
});

var lastTime = Date.now();
function renderLoop() {
  let currentTime = Date.now();
  let deltaTime = (currentTime - lastTime) / 1000;
  renderer.clear();
  scene.draw(renderer);
  scene.update(deltaTime);

  lastTime = currentTime;

  requestAnimationFrame(renderLoop);
}

renderLoop();