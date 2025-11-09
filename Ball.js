import Vec2 from "./Vec2.js";
import bodyType from "./Rigidbody.js";
import Shape from "./Shape.js";
import PhysicsBody from "./PhysicsBody.js";
import { DEFAULT_RESTITUTION } from "./PhysicsConstant.js";

export default class Ball extends Shape{
  constructor(pos,vel,acc,radius, color, density, type, options = {}) {
    super(pos.clone());
    this.vel = vel.clone();
    this.acc = acc.clone();
    this.radius = radius;
    this.color = color;
    this.mass = density || 1;
    this.bodyType = type;
    this.steps = 40;
    this.angle = (Math.PI * 2) / this.steps;

    const restitution = options.restitution ?? DEFAULT_RESTITUTION;
    const isStatic = type === bodyType.STATIC;
    const requestedDensity = density || 1;

    const { body, errorMessage } = PhysicsBody.createCircleBody(
      radius,
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

    this.verticies = this.generateVerticies();
  }

  syncFromPhysics(){
    if (!this.physicsBody) {
      return;
    }

    this.pos = this.physicsBody.getPosition().clone();
    this.vel = this.physicsBody.getLinearVelocity().clone();
  }

  update(dt){
    if (this.bodyType === bodyType.KINEMATIC && this.physicsBody) {
      const delta = this.vel.multiply(dt);
      this.pos = this.pos.add(delta);
      this.physicsBody.moveTo(this.pos);
    }
  }

 generateVerticies() {
  let verticies = [];
  let prevX = this.radius * Math.cos(0);
  let prevY = this.radius * Math.sin(0);
  for (let i = 1; i <= this.steps; i++) {
    const theta = this.angle * i;
    const newX = this.radius * Math.cos(theta);
    const newY = this.radius * Math.sin(theta);

    verticies.push(new Vec2(0, 0));        // center
    verticies.push(new Vec2(prevX, prevY)); // previous point
    verticies.push(new Vec2(newX, newY));   // new point

    prevX = newX;
    prevY = newY;
  }
  
  return verticies;
}

  getBall() {
    let verticies = [];
    this.verticies.forEach((vertex)=>{
        verticies.push(vertex.x,vertex.y);
    });
    return verticies;
  }
}
