// Ball.js
import Vec2 from "./Vec2.js";
import Body from "./Body.js";
import AABB from "./AABB.js";
// import { GRAVITATIONAL_STRENGTH } from "./PhysicsConstant.js"; // (unused here)

export default class Ball extends Body {
  /**
   * @param {Vec2} pos
   * @param {Vec2} vel
   * @param {Vec2} acc
   * @param {number} radius
   * @param {[number,number,number]} color RGB 0..255
   * @param {number} mass
   * @param {number} bodyType one of BodyType.*
   */
  constructor(pos, vel, acc, radius, color, mass, bodyType) {
    super(pos, vel, acc, mass, bodyType);
    this.radius = radius;
    this.color = color;

    this.steps = 40;
    this.angle = (Math.PI * 2) / this.steps;

    this.vertices = this.generateVertices(); // use consistent name
    this.verticesSize = this.vertices.length; // number of floats (x,y per vertex)
  }

  // LOCAL-SPACE triangles (center is at 0,0 — shader adds translation)
  generateVertices() {
    const verts = [];
    let prevX = this.radius * Math.cos(0);
    let prevY = this.radius * Math.sin(0);
    for (let i = 1; i <= this.steps; i++) {
      const theta = this.angle * i;
      const newX = this.radius * Math.cos(theta);
      const newY = this.radius * Math.sin(theta);

      verts.push(new Vec2(0, 0)); // center
      verts.push(new Vec2(prevX, prevY)); // previous rim point
      verts.push(new Vec2(newX, newY)); // new rim point

      prevX = newX;
      prevY = newY;
    }
    return verts;
  }

  // Flattened float array for WebGL bufferData
  getBall() {
    const out = [];
    for (let i = 0; i < this.vertices.length; i++) {
      const v = this.vertices[i];
      out.push(v.x, v.y);
    }
    return out;
  }

  // World-space vertices (useful for SAT if you ever need ball mesh)
  getVertexWorldPos() {
    const out = [];
    for (let i = 0; i < this.vertices.length; i++) {
      const v = this.vertices[i];
      out.push(new Vec2(v.x + this.pos.x, v.y + this.pos.y));
    }
    this.transformUpdateRequired = false;
    return out;
  }

  getAABB() {
    if (this.aabbUpdateRequired) {
      let minX = Number.POSITIVE_INFINITY;
      let minY = Number.POSITIVE_INFINITY;
      let maxX = Number.NEGATIVE_INFINITY;
      let maxY = Number.NEGATIVE_INFINITY;

      minX = this.pos.x - this.radius;
      minY = this.pos.y - this.radius;
      maxX = this.pos.x + this.radius;
      maxY = this.pos.y + this.radius;

      this.aabb = new AABB(minX, minY, maxX, maxY);
    }
    this.aabbUpdateRequired = true;
    return this.aabb;
  }
}
