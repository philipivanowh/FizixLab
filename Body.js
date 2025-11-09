import Vec2 from "./Vec2.js";
import bodyType from "./Rigidbody.js";
import AABB from "./AABB.js";
import { GRAVITATIONAL_STRENGTH } from "./PhysicsConstant.js";

const PIXELS_PER_METER = 0.01;
export default class Body {
  constructor(pos, linearVel, linearAcc, mass, bodyType) {
    this.pos = pos;
    this.linearVel = linearVel.multiply(PIXELS_PER_METER);
    this.linearAcc = linearAcc.multiply(PIXELS_PER_METER);
    this.bodyType = bodyType;
    this.rotation = 0;
    this.angularVel = 0;
    this.angularAcc = 0;
    this.restitution = 0.5;
    this.force = Vec2.ZERO;

    this.density = 1;
    this.mass = mass || 1;
    this.area = 1*1;
    this.aabb = null;
    this.transformUpdateRequired = true;
    this.aabbUpdateRequired = true;

    if(this.bodyType != bodyType.STATIC){
      this.invMass = 1/this.mass;
    }else{
      this.invMass = 0;
    }
  }
  update(dt, iterations) {
    if (this.bodyType === bodyType.STATIC) return;

    dt /= iterations;

    if (this.bodyType === bodyType.DYNAMIC) {

         // Apply gravity force
    const gravityForce = new Vec2(0, -this.mass * GRAVITATIONAL_STRENGTH * 0.000001);
      this.force = (gravityForce);
      this.linearAcc = this.force.divide(this.mass);
      this.linearVel = this.linearVel.add(this.linearAcc.multiply(dt));
      this.pos = this.pos.add(this.linearVel.multiply(dt));
      this.rotation = this.rotation + this.angularVel * dt;

      this.force = Vec2.ZERO;
      this.transformUpdateRequired = true;
      this.aabbUpdateRequired = true;
    }
  }

  translate(amount){
    this.pos = this.pos.add(amount);
    this.transformUpdateRequired = true;
    this.aabbUpdateRequired = true;
  }

  translateTo(pos){
    this.pos = pos;
    this.transformUpdateRequired = true;
    this.aabbUpdateRequired = true;
  }

  rotate(amount){
    this.rotation += amount;
    this.transformUpdateRequired = true;
    this.aabbUpdateRequired = true;
  }

  applyForce(force) {
    this.force = force;
  }

  getAABB(){}

  drawShape() {}
}
