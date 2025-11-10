import Vec2 from "./Vec2.js";
import Body from "./Body.js";
import AABB from "./AABB.js";

export default class Box extends Body {
  constructor(pos, vel, acc, width, height, color, mass, bodyType) {
    super(pos, vel, acc, mass, bodyType);
    this.width = width;
    this.height = height;
    this.color = color;
    this.verticesSize = 6;
    this.updateMassProperties();

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
    const rotated = this.getRotatedVertices();
    const v0 = rotated[0];
    const v1 = rotated[1];
    const v2 = rotated[2];
    const v3 = rotated[3];

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
    const rotated = this.getRotatedVertices();
    for (let i = 0; i < rotated.length; i++) {
      const v = rotated[i];
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

      let verticies = this.getVertexWorldPos();

      for (let i = 0; i < verticies.length; i++) {
        minX = Math.min(minX, verticies[i].x);
        minY = Math.min(minY, verticies[i].y);
        maxX = Math.max(maxX, verticies[i].x);
        maxY = Math.max(maxY, verticies[i].y);
      }

      this.aabb = new AABB(minX, minY, maxX, maxY);
    }
    this.aabbUpdateRequired = true;
    return this.aabb;
  }

  computeInertia(){
    if (this.mass <= 0) return 0;
    return (this.mass * (this.width * this.width + this.height * this.height)) / 12;
  }

  getRotatedVertices() {
    const cos = Math.cos(this.rotation);
    const sin = Math.sin(this.rotation);
    const rotated = [];
    for (let i = 0; i < this.vertices.length; i++) {
      const v = this.vertices[i];
      rotated.push(
        new Vec2(
          v.x * cos - v.y * sin,
          v.x * sin + v.y * cos
        )
      );
    }
    return rotated;
  }
}
