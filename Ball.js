import Vec2 from "./Vec2.js";
import bodyType from "./Rigidbody.js";
import Shape from "./Shape.js";

export default class Ball extends Shape{
  constructor(pos,vel,acc,radius, color, mass, bodyType) {
    super(pos);
    this.vel = vel;
    this.acc = acc;
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
