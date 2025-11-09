import Vec2 from "./Vec2.js";
import bodyType from "./Rigidbody.js";
import Shape from "./Shape.js";
import PhysicsBody from "./PhysicsBody.js";
import { DEFAULT_RESTITUTION } from "./PhysicsConstant.js";

export default class Box extends Shape {
  constructor(pos, vel, acc, width, height, color, density, type, options = {}) {
    super(pos.clone());
    this.vel = vel.clone();
    this.acc = acc.clone();
    this.width = width;
    this.height = height;
    this.bodyType = type;
    this.color = color;
    this.mass = density || 1;

    const restitution = options.restitution ?? DEFAULT_RESTITUTION;
    const isStatic = type === bodyType.STATIC;
    const requestedDensity = density || 1;

    const { body, errorMessage } = PhysicsBody.createBoxBody(
      width,
      height,
      pos,
      requestedDensity,
      isStatic,
      restitution
    );

    if (!body) {
      throw new Error(errorMessage);
    }

    this.physicsBody = body;
    this.physicsBody.setLinearVelocity(vel);

    // ✅ Centered vertices (origin is center)
    const w = width / 2;
    const h = height / 2;
    this.vertices = [
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
    const v0 = this.vertices[0];
    const v1 = this.vertices[1];
    const v2 = this.vertices[2];
    const v3 = this.vertices[3];

    // 6 verts -> 12 numbers (x,y)
    return [
      v0.x,
      v0.y,
      v1.x,
      v1.y,
      v2.x,
      v2.y, // tri 1

      v0.x,
      v0.y,
      v2.x,
      v2.y,
      v3.x,
      v3.y, // tri 2
    ];
  }

  //return the location of each verticies of the polygonin the canvas
  getVertexWorldPos() {
    const out = [];
    for (let i = 0; i < this.vertices.length; i++) {
      const v = this.vertices[i];
      out.push(new Vec2(v.x + this.pos.x, v.y + this.pos.y));
    }
    return out;
  }
}
