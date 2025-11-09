import {
  intersectPolygons,
  intersectCirclePolygon,
  intersectCircles,
} from "./Collisions.js"; // <- your SAT file
import Ball from "./Ball.js";
import Box from "./Box.js";
import Vec2 from "./Vec2.js";
import bodyType from "./Rigidbody.js";
import Math from "./Math.js";
import Manifold from "./Manifold.js";

const MIN_ITERATIONS = 1;
const MAX_ITERATIONS = 128;

const MIN_DENSITY = 0.5;
const MAX_DENSITY = 21.4;

const MIN_BODY_SIZE = 0.01 * 0.01;
const MAX_BODY_SIZE = 64*64;


export default class Scene {
  constructor() {
    this.objects = [];
    this.contactList = [];
    this.viewBottom = -100;
    
  }

  bodyCount(){
    return this.objects.length;
  }

  add(obj) {
    this.objects.push(obj);
  }

  draw(renderer) {
    this.objects.forEach((object) => {
      renderer.drawShape(object);
    });
  }

  update(dt, iterations) {
    iterations = Math.clamp(iterations, MIN_ITERATIONS, MAX_ITERATIONS);

    for (let it = 0; it < iterations; it++) {
      
      // Movement step
      for (let i = 0; i < this.objects.length; i++) {
        this.objects[i].update(dt, iterations);
      }

      this.contactList = [];
      //collision step
      for (let i = 0; i < this.objects.length-1; i++) {
        const objectA = this.objects[i];

        //update the movement

        //update the collision with other objects
        for (let j = i + 1; j < this.objects.length; j++) {
          const objectB = this.objects[j];

          //Skip if both objects are static
          if (
            objectA.bodyType === bodyType.STATIC &&
            objectB.bodyType === bodyType.STATIC
          )
            continue;

          //detect every collision between the two objects
          let hit = this.collide(objectA, objectB);
          if (hit.result) {
            //penetration resolution
            if (objectA.bodyType == bodyType.STATIC)
             objectB.translate(hit.normal.multiply(hit.depth));
            else if (objectB.bodyType == bodyType.STATIC)
              objectA.translate(hit.normal.multiply(-hit.depth));
            else {
                const correction = hit.normal.multiply(hit.depth/2);
              objectA.translate(correction.negate());
              objectB.translate(correction);
            }

            let contact = new Manifold(objectA, objectB, hit.normal, hit.depth, Vec2.ZERO, Vec2.ZERO, 0);
            this.contactList.push(contact);

           
          }
        }

        for(let i = 0; i < this.contactList.length; i++){
             this.resolveCollision(this.contactList[i]);
        }
      }
    }

    //check for objects that are out of frame
    this.removeObjects();
  }

  removeObjects() {
    for(let i = 0; i < this.objects.length; i++){
        let box = this.objects[i].getAABB();

        if(box.max.y < this.viewBottom){
            this.objects.splice(i,1);
        }
    }
  }

  /**
   * Impulse-based collision resolution (C# parity).
   * @param {Object} bodyA - object with linearVel: Vec2, invMass, restitution, pos: Vec2
   * @param {Object} bodyB - object with linearVel: Vec2, invMass, restitution, pos: Vec2
   * @param {Vec2} normal  - collision normal pointing from A -> B
   * @param {number} depth - penetration depth (for positional correction)
   */
  resolveCollision(contact) {
    const bodyA = contact.bodyA;
    const bodyB = contact.bodyB;
    const normal = contact.normal;
    const depth = contact.depth;

    // relative velocity along the collision normal
    const relativeVelocity = bodyB.linearVel.subtract(bodyA.linearVel);

    // objects separating? then no impulse
    if (Vec2.dot(relativeVelocity, normal) > 0) return;

    // coefficient of restitution
    const e = Math.min(bodyA.restitution, bodyB.restitution);

    // scalar impulse
    let j = -(1 + e) * Vec2.dot(relativeVelocity, normal);
    j /= bodyA.invMass + bodyB.invMass;

    const impulse = normal.multiply(j);

    // apply linear impulse
    bodyA.linearVel = bodyA.linearVel.subtract(
      impulse.multiply(bodyA.invMass)
    );
    bodyB.linearVel = bodyB.linearVel.add(impulse.multiply(bodyB.invMass));
  }

  /**
   * Narrowphase collide wrapper (C# Collide parity).
   * Returns { result, normal, depth } and leaves resolution to caller.
   */
  collide(objectA, objectB) {
    // Prefer a definite zero vector to avoid Vec2.ZERO / ZERO() inconsistencies
    let normal = new Vec2(0, 0);
    let depth = 0;

    // Box vs Box
    if (objectA instanceof Box) {
      if (objectB instanceof Box) {
        const vertsA = objectA.getVertexWorldPos();
        const vertsB = objectB.getVertexWorldPos();

        const hit = intersectPolygons(objectA.pos, vertsA, objectB.pos, vertsB);
        if (!hit.result) return { result: false };
        normal = hit.normal;
        depth = hit.depth;
        return { result: true, normal, depth };
      }

      // Box vs Ball  (invert normal after circle-vs-poly to match A->B direction)
      if (objectB instanceof Ball) {
        const vertsA = objectA.getVertexWorldPos();
        const hit = intersectCirclePolygon(
          objectB.pos,
          objectB.radius,
          objectA.pos,
          vertsA
        );
        if (!hit.result) return { result: false };
        normal = hit.normal.negate(); // make normal point from A(Box) -> B(Ball)
        depth = hit.depth;
        return { result: true, normal, depth };
      }
    }

    // Ball vs ...
    if (objectA instanceof Ball) {
      if (objectB instanceof Box) {
        const vertsB = objectB.getVertexWorldPos();
        const hit = intersectCirclePolygon(
          objectA.pos,
          objectA.radius,
          objectB.pos,
          vertsB
        );
        if (!hit.result) return { result: false };
        normal = hit.normal; // already A(Ball) -> B(Box)
        depth = hit.depth;
        return { result: true, normal, depth };
      }

      if (objectB instanceof Ball) {
        const hit = intersectCircles(
          objectA.pos,
          objectA.radius,
          objectB.pos,
          objectB.radius
        );
        if (!hit.result) return { result: false };
        normal = hit.normal; // A -> B
        depth = hit.depth;
        return { result: true, normal, depth };
      }
    }

    return { result: false };
  }
}
