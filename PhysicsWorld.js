import Vec2 from './Vec2.js';
import PhysicsBody from './PhysicsBody.js';
import ShapeType from './ShapeType.js';
import {
  intersectPolygons,
  intersectCirclePolygon,
  intersectCircles,
} from './Collisions.js';
import {
  GRAVITATIONAL_STRENGTH,
  MIN_ITERATIONS,
  MAX_ITERATIONS,
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

export default class PhysicsWorld {
  constructor() {
    this.gravity = new Vec2(0, -GRAVITATIONAL_STRENGTH);
    this.bodyList = [];
  }

  get bodyCount() {
    return this.bodyList.length;
  }

  addBody(body) {
    if (!(body instanceof PhysicsBody)) {
      throw new Error('Only PhysicsBody instances can be added to the world.');
    }
    this.bodyList.push(body);
  }

  removeBody(body) {
    const index = this.bodyList.indexOf(body);
    if (index === -1) {
      return false;
    }
    this.bodyList.splice(index, 1);
    return true;
  }

  getBody(index) {
    if (index < 0 || index >= this.bodyList.length) {
      return null;
    }
    return this.bodyList[index];
  }

  step(time, iterations = MIN_ITERATIONS) {
    const clampedIterations = clamp(Math.floor(iterations), MIN_ITERATIONS, MAX_ITERATIONS);

    for (let it = 0; it < clampedIterations; it++) {
      for (let i = 0; i < this.bodyList.length; i++) {
        this.bodyList[i].step(time, this.gravity, clampedIterations);
      }

      for (let i = 0; i < this.bodyList.length - 1; i++) {
        const bodyA = this.bodyList[i];
        for (let j = i + 1; j < this.bodyList.length; j++) {
          const bodyB = this.bodyList[j];

          if (bodyA.isStatic && bodyB.isStatic) {
            continue;
          }

          const collision = this.collide(bodyA, bodyB);
          if (collision.result) {
            const { normal, depth } = collision;

            if (bodyA.isStatic) {
              bodyB.move(normal.multiply(depth));
            } else if (bodyB.isStatic) {
              bodyA.move(normal.multiply(-depth));
            } else {
              bodyA.move(normal.multiply(-depth / 2));
              bodyB.move(normal.multiply(depth / 2));
            }

            this.resolveCollision(bodyA, bodyB, normal);
          }
        }
      }
    }
  }

  resolveCollision(bodyA, bodyB, normal) {
    const relativeVelocity = bodyB.getLinearVelocity().subtract(bodyA.getLinearVelocity());

    if (Vec2.dot(relativeVelocity, normal) > 0) {
      return;
    }

    const e = Math.min(bodyA.restitution, bodyB.restitution);

    let j = -(1 + e) * Vec2.dot(relativeVelocity, normal);
    const invMassSum = bodyA.invMass + bodyB.invMass;

    if (invMassSum === 0) {
      return;
    }

    j /= invMassSum;

    const impulse = normal.multiply(j);

    if (bodyA.invMass > 0) {
      bodyA.setLinearVelocity(bodyA.getLinearVelocity().subtract(impulse.multiply(bodyA.invMass)));
    }

    if (bodyB.invMass > 0) {
      bodyB.setLinearVelocity(bodyB.getLinearVelocity().add(impulse.multiply(bodyB.invMass)));
    }
  }

  collide(bodyA, bodyB) {
    const shapeTypeA = bodyA.shapeType;
    const shapeTypeB = bodyB.shapeType;

    if (shapeTypeA === ShapeType.BOX) {
      if (shapeTypeB === ShapeType.BOX) {
        return intersectPolygons(
          bodyA.getPosition(),
          bodyA.getTransformedVertices(),
          bodyB.getPosition(),
          bodyB.getTransformedVertices(),
        );
      }

      if (shapeTypeB === ShapeType.CIRCLE) {
        const result = intersectCirclePolygon(
          bodyB.getPosition(),
          bodyB.radius,
          bodyA.getPosition(),
          bodyA.getTransformedVertices(),
        );

        if (result.result) {
          result.normal = result.normal.negate();
        }

        return result;
      }
    } else if (shapeTypeA === ShapeType.CIRCLE) {
      if (shapeTypeB === ShapeType.BOX) {
        return intersectCirclePolygon(
          bodyA.getPosition(),
          bodyA.radius,
          bodyB.getPosition(),
          bodyB.getTransformedVertices(),
        );
      }

      if (shapeTypeB === ShapeType.CIRCLE) {
        return intersectCircles(
          bodyA.getPosition(),
          bodyA.radius,
          bodyB.getPosition(),
          bodyB.radius,
        );
      }
    }

    return { result: false };
  }
}
