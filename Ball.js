import Vec2 from "./Vec2.js";
import bodyType from "./Rigidbody.js";
import Shape from "./Shape.js";
import { GRAVITATIONAL_STRENGTH } from "./PhysicsConstant.js";


const PIXELS_PER_METER = 100;

export default class Ball extends Shape{
  constructor(pos,vel,acc,radius, color, mass, bodyType) {
    super(pos);
    this.vel = vel;
    this.acc = acc;
    this.acc.y = PIXELS_PER_METER * GRAVITATIONAL_STRENGTH
    this.radius = radius;
    this.color = color;
    this.mass = mass;
    this.bodyType = bodyType;
    this.steps = 40;
    this.angle = (Math.PI * 2) / this.steps;
    this.verticies = this.generateVerticies();
    this.verticiesSize = this.verticies.length;
  }

  update(dt,scene){
    if (this.bodyType === bodyType.STATIC) return;

    if (this.bodyType === bodyType.DYNAMIC) {
      this.vel.x += this.acc.x * dt;
      this.vel.y += this.acc.y * dt;
      this.pos.x += this.vel.x * dt;
      this.pos.y += this.vel.y * dt;
    }

     this.updateBallvsBallCollision(scene);
  }

  updateBallvsBallCollision(scene){
    scene.objects.forEach(object => {
        if(object === this){
            return;
        }
        if(object instanceof Ball){

            //collision detected
            if(this.isCollidingBallvsBall(this,object)){
                this.penetrationResolutionBallvsBall(this,object);
                this.collisionResolutionBallvsBall(this,object);
            }
        }
    });
  }

  

  isCollidingBallvsBall(b1,b2){
    let distanceVec = b1.pos.subtract(b2.pos);

            //collision detected
    return (distanceVec.length() < b1.radius + b2.radius);
  }

  penetrationResolutionBallvsBall(b1,b2){
    let distanceVec = b1.pos.subtract(b2.pos);
    let penetration_depth = b1.radius + b2.radius - distanceVec.length();
    let penetration_resolution = distanceVec.normalize().multiply(penetration_depth/2);
    b1.pos = b1.pos.add(penetration_resolution);
    b2.pos = b2.pos.add(penetration_resolution.multiply(-1));
  }

  collisionResolutionBallvsBall(b1,b2){
    let normal = b1.pos.subtract(b2.pos).normalize();
    let relativeVel = b1.vel.subtract(b2.vel);
    let seperateVel = Vec2.dot(relativeVel,normal);
    let new_seperateVel = -seperateVel;
    let sepeperateVelVec = normal.multiply(new_seperateVel);

    b1.vel = b1.vel.add(sepeperateVelVec);
    b2.vel = b2.vel.add(sepeperateVelVec.multiply(-1));
  }

  momentumDisplay(){
    //let momentum = 
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
