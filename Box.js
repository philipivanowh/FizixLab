import Vec2 from "./Vec2.js";
import bodyType from "./Rigidbody.js";
import Shape from "./Shape.js";
import { GRAVITATIONAL_STRENGTH } from "./PhysicsConstant.js";

const PIXELS_PER_METER = 100;

export default class Box extends Shape {
  constructor(pos, vel, acc, width, height, color, mass, bodyType) {
    super(pos);
    this.vel = vel.multiply(PIXELS_PER_METER);
    this.acc = acc.multiply(PIXELS_PER_METER);
    this.width = width;
    this.height = height;
    this.bodyType = bodyType;
    this.color = color;
    this.mass = mass || 1;
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

  update(dt, scene) {
    if (this.bodyType === bodyType.STATIC) return;

    if (this.bodyType === bodyType.DYNAMIC) {
      this.vel.x += this.acc.x * dt;
      this.vel.y += this.acc.y * dt;

      this.pos.x += this.vel.x * dt;
      this.pos.y += this.vel.y * dt;
    }

    this.updatePolygonCollision(scene);
  }

  updatePolygonCollision(scene) {
    scene.objects.forEach((object) => {
      if (object === this) return;
      if (!(object instanceof Box)) return;

      const [hit, normal, depth] = this.intersectPolygon(this, object);
      if (!hit) return;

      // minimum translation vector (from this -> out of object)
      const mtv = normal.multiply(depth);

      // inverse masses (0 for static)
      const invMassA =
        this.bodyType === bodyType.STATIC ? 0 : 1 / (this.mass || 1);
      const invMassB =
        object.bodyType === bodyType.STATIC ? 0 : 1 / (object.mass || 1);
      const invMassSum = invMassA + invMassB || 1;

      // move A opposite mtv, move B along mtv
      if (invMassA > 0) {
        const k = invMassA / invMassSum;
        this.pos.x -= mtv.x * k;
        this.pos.y -= mtv.y * k;
      }
      if (invMassB > 0) {
        const k = invMassB / invMassSum;
        object.pos.x += mtv.x * k;
        object.pos.y += mtv.y * k;
      }
    });
  }

  intersectCirclePolygon(circleCenter, circleRadius, verticies) {
    const v1 = verticies.getVertexWorldPos();

    let bestAxis = new Vec2(0, 0);
    let bestDepth = Number.POSITIVE_INFINITY;

    const testAxes = (A) => {
      for (let i = 0; i < A.length; i++) {
        const a = A[i],
          b = A[(i + 1) % A.length];
        // non-mutating edge
        const edge = new Vec2(b.x - a.x, b.y - a.y);

        // perpendicular axis and normalize
        let axis = new Vec2(-edge.y, edge.x);
        const len = axis.length();
        if (len === 0) continue;
        axis = axis.multiply(1 / len);

        // project
        const [minA, maxA] = this.projectVerticies(A, axis);
        const [minB, maxB] = this.projectVerticies(B, axis);

        // gap? (<= treats touching as non-collision; use < for touching = collision)
        if (maxA <= minB || maxB <= minA) return { separated: true };

        // overlap on this axis
        const overlap = Math.min(maxA, maxB) - Math.max(minA, minB);
        if (overlap < bestDepth) {
          bestDepth = overlap;
          bestAxis = axis;
        }
      }
      return { separated: false };
    };

    // test axes from both polygons
    if (testAxes(v1, v2).separated) return [false, new Vec2(0, 0), 0];
    if (testAxes(v2, v1).separated) return [false, new Vec2(0, 0), 0];

    // ensure axis points from A to B
    const cA = this.FindArithemticMean(v1);
    const cB = this.FindArithemticMean(v2);
    const dir = new Vec2(cB.x - cA.x, cB.y - cA.y);
    if (Vec2.dot(dir, bestAxis) < 0) bestAxis = bestAxis.multiply(-1);

    // MTV: axis (unit) and scalar depth
    return [true, bestAxis, bestDepth];
  }

  FindClosestPointOnPolygon(circleCenter, verticies){
    let result = -1;
    let minDistance = Number.POSITIVE_INFINITY;

    for(let i = 0; i < verticies.length; i++){
      let v = verticies[i];
      let distance = v.subtract(circleCenter).length();

      if(distance < minDistance){
        minDistance = distance;
        result = i;
      }

    }
  }

  projectCircle(center,radius,axis){
    let direction = axis.normalize();
    let directionAndRadius = direction * radius;

    let p1 = center + directionAndRadius;
    let p2 = center - directionAndRadius;

    min = Vec2.dot(p1, axis);
    max = Vec2.dot(p2, axis);

    if(min > max){
      let t = min;
      min = max;
      max = t;

    }

    return [p1, p2];
  }

  //Using the SAT algorithm to check for collision return true if there is a collision false otherwise
  intersectPolygon(b1, b2) {
    const v1 = b1.getVertexWorldPos();
    const v2 = b2.getVertexWorldPos();

    let bestAxis = new Vec2(0, 0);
    let bestDepth = Number.POSITIVE_INFINITY;

    const testAxes = (A, B) => {
      for (let i = 0; i < A.length; i++) {
        const a = A[i],
          b = A[(i + 1) % A.length];
        // non-mutating edge
        const edge = new Vec2(b.x - a.x, b.y - a.y);

        // perpendicular axis and normalize
        let axis = new Vec2(-edge.y, edge.x);
        const len = axis.length();
        if (len === 0) continue;
        axis = axis.multiply(1 / len);

        // project
        const [minA, maxA] = this.projectVerticies(A, axis);
        const [minB, maxB] = this.projectVerticies(B, axis);

        // gap? (<= treats touching as non-collision; use < for touching = collision)
        if (maxA <= minB || maxB <= minA) return { separated: true };

        // overlap on this axis
        const overlap = Math.min(maxA, maxB) - Math.max(minA, minB);
        if (overlap < bestDepth) {
          bestDepth = overlap;
          bestAxis = axis;
        }
      }
      return { separated: false };
    };

    // test axes from both polygons
    if (testAxes(v1, v2).separated) return [false, new Vec2(0, 0), 0];
    if (testAxes(v2, v1).separated) return [false, new Vec2(0, 0), 0];

    // ensure axis points from A to B
    const cA = this.FindArithemticMean(v1);
    const cB = this.FindArithemticMean(v2);
    const dir = new Vec2(cB.x - cA.x, cB.y - cA.y);
    if (Vec2.dot(dir, bestAxis) < 0) bestAxis = bestAxis.multiply(-1);

    // MTV: axis (unit) and scalar depth
    return [true, bestAxis, bestDepth];
  }

  //Center of the polygon
  FindArithemticMean(verticies) {
    let sumX = 0;
    let sumY = 0;

    for (let i = 0; i < verticies.length; i++) {
      let v = verticies[i];
      sumX += v.x;
      sumY += v.y;
    }

    return new Vec2(sumX / verticies.length, sumY / verticies.length);
  }

  //find the min and max project of the polygon based on the axis
  projectVerticies(vertices, axis) {
    let min = Number.POSITIVE_INFINITY;
    let max = Number.NEGATIVE_INFINITY;
    for (let i = 0; i < vertices.length; i++) {
      const d = Vec2.dot(vertices[i], axis);
      if (d < min) min = d;
      if (d > max) max = d;
    }
    return [min, max];
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
