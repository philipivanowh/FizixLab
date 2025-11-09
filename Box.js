import Vec2 from "./Vec2.js";
import bodyType from "./Rigidbody.js";
import Body from "./Body.js";
import { GRAVITATIONAL_STRENGTH } from "./PhysicsConstant.js";

export default class Box extends Body {
  constructor(pos, vel, acc, width, height, color, mass, bodyType) {
    super(pos, vel, acc, mass,bodyType);
    this.width = width;
    this.height = height;
    this.color = color;
    this.verticiesSize = 6;

    // ✅ Centered vertices (origin is center)
    const w = width / 2;
    const h = height / 2;
    this.vertices = [
      new Vec2(-w, -h),
      new Vec2(w, -h),
      new Vec2(w, h),
      new Vec2(-w, h),
    ];
  }

  // LOCAL-SPACE triangles (no position added)
  // Useful if you use a model matrix in your shader
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
