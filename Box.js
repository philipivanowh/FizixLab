import Vec2 from "./Vec2.js";
import bodyType from "./Rigidbody.js";
import Shape from "./Shape.js";
import { GRAVITATIONAL_STRENGTH } from "./PhysicsConstant.js";

const PIXELS_PER_METER = 100;
const GRAVITY = GRAVITATIONAL_STRENGTH;

export default class Box extends Shape {
  constructor(pos,vel,acc, width, height, color, mass, bodyType) {
    super(pos);
    this.vel = vel;
    this.acc = acc;
    this.width = width;
    this.height = height;
    this.bodyType = bodyType;
    this.acc.y = 0 * PIXELS_PER_METER;
    this.color = color;
    this.mass = mass || 1;

    // ✅ Centered vertices (origin is center)
    const w = width / 2;
    const h = height / 2;

    this.verticies = [
      new Vec2(-w, -h),
      new Vec2(w, -h),
      new Vec2(w, h),

      new Vec2(w, h),
      new Vec2(-w, h),
      new Vec2(-w, -h),
    ];
  }

  update(dt, scene) {
    if (this.bodyType === bodyType.STATIC) return;

    if (this.bodyType === bodyType.DYNAMIC) {
      this.vel.x += this.acc.x * dt;
      this.vel.y += this.acc.y * dt;

      this.pos.x += this.vel.x * dt;
      this.pos.y += this.vel.y * dt;

    }

  }

  getRect() {
    let verticies = [];
    this.verticies.forEach((vertex) => {
      verticies.push(vertex.x, vertex.y);
    });
    return verticies;
  }

}
