export default class Vec2 {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  add(v2) {
    return new Vec2(this.x + v2.x, this.y + v2.y);
  }

  subtract(v2) {
    return new Vec2(this.x - v2.x, this.y - v2.y);
  }

  multiply(factor){
    return new Vec2(this.x * factor, this.y * factor);
  }

  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  static dot(v1,v2){
    return v1.x * v2.x + v1.y * v2.y;
  }

  normalize() {
    if(this.length() > 0){
        return new Vec2(this.x/this.length(),this.y/this.length());
    }
    return new Vec2(0,0);
  }
}
