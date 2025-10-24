import Vec2 from "./Vec2.js";
import bodyType from "./Rigidbody.js";

const PIXELS_PER_METER = 100;
const GRAVITY = 9.8;

export default class Box {
  constructor(x, y, width, height, color, mass, bodyType) {
    this.pos = new Vec2(x, y);
    this.vel = new Vec2(0, 0);
    this.acc = new Vec2(0, 0);
    this.width = width;
    this.height = height;
    this.bodyType = bodyType;
    this.acc.y = GRAVITY * PIXELS_PER_METER;
    this.ground = 900;
    this.vel.y = 0;
    this.color = color;
    this.mass = mass || 1;
  }

  update(dt)
  {
    if(this.bodyType === bodyType.STATIC) return;

    if(this.bodyType === bodyType.DYNAMIC){     
        this.vel.x += this.acc.x * dt;
        this.vel.y += this.acc.y * dt;
        this.pos.x += this.vel.x * dt;
        this.pos.y += this.vel.y * dt;
    }
     console.log(this.pos.y);

    
  }

  getRect() {
    const w = this.width;
    const h = this.height;
    return [
      0, 0,
      w, 0,
      w, h,
      w, h,
      0, h,
      0, 0,
    ];
  }
}
