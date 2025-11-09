export default class Vec2 {
  
  static ZERO = new Vec2(0, 0);
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  clone() {
    return new Vec2(this.x, this.y);
  }

  add(v2) {
    return new Vec2(this.x + v2.x, this.y + v2.y);
  }

  subtract(v2) {
    return new Vec2(this.x - v2.x, this.y - v2.y);
  }

  multiply(factor) {
    return new Vec2(this.x * factor, this.y * factor);
  }

  divide(factor) {
    if (factor === 0) 
      throw new Error("Cannot divide by zero");
    
    return new Vec2(this.x / factor, this.y / factor);
  }

  negate() {
    return new Vec2(-this.x, -this.y);
  }

  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  normalize() {
    const len = this.length();
    if (len === 0) {
      return Vec2.ZERO;
    }
    return new Vec2(this.x / len, this.y / len);
  }

  equals(other) {
    return this.x === other.x && this.y === other.y;
  }

  static dot(v1, v2) {
    return v1.x * v2.x + v1.y * v2.y;
  }

  static cross(v1, v2) {
    return v1.x * v2.y - v1.y * v2.x;
  }

  static distance(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
}
