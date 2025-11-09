import Vec2 from './Vec2.js';

export default class Transform {
  constructor(position, angle) {
    this.position = position instanceof Vec2 ? position.clone() : new Vec2(position.x, position.y);
    this.sin = Math.sin(angle);
    this.cos = Math.cos(angle);
  }

  apply(vec) {
    const x = this.cos * vec.x - this.sin * vec.y + this.position.x;
    const y = this.sin * vec.x + this.cos * vec.y + this.position.y;
    return new Vec2(x, y);
  }
}
