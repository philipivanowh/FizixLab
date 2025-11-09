import Vec2 from "./Vec2.js";
import bodyType from "./Rigidbody.js";
import Body from "./Body.js";
import { GRAVITATIONAL_STRENGTH } from "./PhysicsConstant.js";

export default class Ball extends Body {
  constructor(pos, vel, acc, radius, color, mass, bodyType) {
    super(pos, vel, acc, mass,bodyType);
    this.radius = radius;
    this.color = color;
    this.steps = 40;
    this.angle = (Math.PI * 2) / this.steps;
    this.verticies = this.generateVerticies();
    this.verticiesSize = this.verticies.length;
  }

  // LOCAL-SPACE triangles (no position added)
  // Useful if you use a model matrix in your shader
  generateVerticies() {
    let verticies = [];
    let prevX = this.radius * Math.cos(0);
    let prevY = this.radius * Math.sin(0);
    for (let i = 1; i <= this.steps; i++) {
      const theta = this.angle * i;
      const newX = this.radius * Math.cos(theta);
      const newY = this.radius * Math.sin(theta);

      verticies.push(new Vec2(0, 0)); // center
      verticies.push(new Vec2(prevX, prevY)); // previous point
      verticies.push(new Vec2(newX, newY)); // new point

      prevX = newX;
      prevY = newY;
    }

    return verticies;
  }

  getBall() {
    let verticies = [];
    this.verticies.forEach((vertex) => {
      verticies.push(vertex.x, vertex.y);
    });
    return verticies;
  }

  getVertexWorldPos() {
      const out = [];
      for (let i = 0; i < this.vertices.length; i++) {
        const v = this.vertices[i];
        out.push(new Vec2(v.x + this.pos.x, v.y + this.pos.y));
      }
      return out;
    }
}
