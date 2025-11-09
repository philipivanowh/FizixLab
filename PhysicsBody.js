import Vec2 from './Vec2.js';
import Transform from './Transform.js';
import AABB from './AABB.js';
import ShapeType from './ShapeType.js';
import {
  MIN_BODY_SIZE,
  MAX_BODY_SIZE,
  MIN_DENSITY,
  MAX_DENSITY,
  DEFAULT_RESTITUTION,
} from './PhysicsConstant.js';

function clamp(value, min, max) {
  if (min === max) {
    return min;
  }

  if (min > max) {
    throw new RangeError('min is greater than max.');
  }

  if (value < min) {
    return min;
  }

  if (value > max) {
    return max;
  }

  return value;
}

function createBoxVertices(width, height) {
  const left = -width / 2;
  const right = left + width;
  const bottom = -height / 2;
  const top = bottom + height;

  return [
    new Vec2(left, top),
    new Vec2(right, top),
    new Vec2(right, bottom),
    new Vec2(left, bottom),
  ];
}

function createBoxTriangles() {
  return [0, 1, 2, 0, 2, 3];
}

export default class PhysicsBody {
  constructor(position, density, mass, restitution, area, isStatic, radius, width, height, shapeType) {
    this.position = position instanceof Vec2 ? position.clone() : new Vec2(position.x, position.y);
    this.linearVelocity = Vec2.ZERO;
    this.rotation = 0;
    this.rotationalVelocity = 0;

    this.force = Vec2.ZERO;

    this.density = density;
    this.mass = mass;
    this.invMass = isStatic ? 0 : 1 / mass;
    this.restitution = restitution;
    this.area = area;

    this.isStatic = isStatic;
    this.radius = radius;
    this.width = width;
    this.height = height;
    this.shapeType = shapeType;

    if (this.shapeType === ShapeType.BOX) {
      this.vertices = createBoxVertices(this.width, this.height);
      this.triangles = createBoxTriangles();
      this.transformedVertices = new Array(this.vertices.length);
    } else {
      this.vertices = null;
      this.triangles = null;
      this.transformedVertices = null;
    }

    this.aabb = null;

    this.transformUpdateRequired = true;
    this.aabbUpdateRequired = true;
  }

  static createCircleBody(radius, position, density, isStatic, restitution = DEFAULT_RESTITUTION) {
    let errorMessage = '';
    let body = null;
    const area = radius * radius * Math.PI;

    if (area < MIN_BODY_SIZE) {
      errorMessage = `Circle radius is too small. Min circle area is ${MIN_BODY_SIZE}.`;
      return { body, errorMessage };
    }

    if (area > MAX_BODY_SIZE) {
      errorMessage = `Circle radius is too large. Max circle area is ${MAX_BODY_SIZE}.`;
      return { body, errorMessage };
    }

    if (density < MIN_DENSITY) {
      errorMessage = `Density is too small. Min density is ${MIN_DENSITY}`;
      return { body, errorMessage };
    }

    if (density > MAX_DENSITY) {
      errorMessage = `Density is too large. Max density is ${MAX_DENSITY}`;
      return { body, errorMessage };
    }

    const clampedRestitution = clamp(restitution, 0, 1);
    const mass = area * density;

    body = new PhysicsBody(position, density, mass, clampedRestitution, area, isStatic, radius, 0, 0, ShapeType.CIRCLE);
    return { body, errorMessage };
  }

  static createBoxBody(width, height, position, density, isStatic, restitution = DEFAULT_RESTITUTION) {
    let errorMessage = '';
    let body = null;
    const area = width * height;

    if (area < MIN_BODY_SIZE) {
      errorMessage = `Area is too small. Min area is ${MIN_BODY_SIZE}.`;
      return { body, errorMessage };
    }

    if (area > MAX_BODY_SIZE) {
      errorMessage = `Area is too large. Max area is ${MAX_BODY_SIZE}.`;
      return { body, errorMessage };
    }

    if (density < MIN_DENSITY) {
      errorMessage = `Density is too small. Min density is ${MIN_DENSITY}`;
      return { body, errorMessage };
    }

    if (density > MAX_DENSITY) {
      errorMessage = `Density is too large. Max density is ${MAX_DENSITY}`;
      return { body, errorMessage };
    }

    const clampedRestitution = clamp(restitution, 0, 1);
    const mass = area * density;

    body = new PhysicsBody(position, density, mass, clampedRestitution, area, isStatic, 0, width, height, ShapeType.BOX);
    return { body, errorMessage };
  }

  getTransformedVertices() {
    if (this.shapeType !== ShapeType.BOX || !this.vertices) {
      return [];
    }

    if (this.transformUpdateRequired) {
      const transform = new Transform(this.position, this.rotation);
      for (let i = 0; i < this.vertices.length; i++) {
        const v = this.vertices[i];
        this.transformedVertices[i] = transform.apply(v);
      }
      this.transformUpdateRequired = false;
    }

    return this.transformedVertices;
  }

  getAABB() {
    if (!this.aabbUpdateRequired && this.aabb) {
      return this.aabb;
    }

    let minX = Number.POSITIVE_INFINITY;
    let minY = Number.POSITIVE_INFINITY;
    let maxX = Number.NEGATIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;

    if (this.shapeType === ShapeType.BOX) {
      const vertices = this.getTransformedVertices();
      for (let i = 0; i < vertices.length; i++) {
        const v = vertices[i];
        if (v.x < minX) minX = v.x;
        if (v.x > maxX) maxX = v.x;
        if (v.y < minY) minY = v.y;
        if (v.y > maxY) maxY = v.y;
      }
    } else if (this.shapeType === ShapeType.CIRCLE) {
      minX = this.position.x - this.radius;
      minY = this.position.y - this.radius;
      maxX = this.position.x + this.radius;
      maxY = this.position.y + this.radius;
    } else {
      throw new Error('Unknown shape type.');
    }

    this.aabb = AABB.fromValues(minX, minY, maxX, maxY);
    this.aabbUpdateRequired = false;
    return this.aabb;
  }

  step(time, gravity, iterations) {
    if (this.isStatic) {
      return;
    }

    const dt = time / iterations;

    if (this.invMass > 0) {
      const acceleration = this.force.multiply(this.invMass);
      this.linearVelocity = this.linearVelocity.add(acceleration.multiply(dt));
    }

    this.linearVelocity = this.linearVelocity.add(gravity.multiply(dt));
    this.position = this.position.add(this.linearVelocity.multiply(dt));

    this.rotation += this.rotationalVelocity * dt;

    this.force = Vec2.ZERO;
    this.transformUpdateRequired = true;
    this.aabbUpdateRequired = true;
  }

  move(amount) {
    this.position = this.position.add(amount);
    this.transformUpdateRequired = true;
    this.aabbUpdateRequired = true;
  }

  moveTo(position) {
    this.position = position instanceof Vec2 ? position.clone() : new Vec2(position.x, position.y);
    this.transformUpdateRequired = true;
    this.aabbUpdateRequired = true;
  }

  rotate(amount) {
    this.rotation += amount;
    this.transformUpdateRequired = true;
    this.aabbUpdateRequired = true;
  }

  addForce(amount) {
    this.force = amount instanceof Vec2 ? amount.clone() : new Vec2(amount.x, amount.y);
  }

  setLinearVelocity(velocity) {
    this.linearVelocity = velocity instanceof Vec2 ? velocity.clone() : new Vec2(velocity.x, velocity.y);
  }

  getLinearVelocity() {
    return this.linearVelocity;
  }

  getPosition() {
    return this.position;
  }
}
