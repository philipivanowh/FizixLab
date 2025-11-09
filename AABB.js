import Vec2 from './Vec2.js';

export default class AABB {
  constructor(min, max) {
    this.min = min instanceof Vec2 ? min.clone() : new Vec2(min.x, min.y);
    this.max = max instanceof Vec2 ? max.clone() : new Vec2(max.x, max.y);
  }

  static fromValues(minX, minY, maxX, maxY) {
    return new AABB(new Vec2(minX, minY), new Vec2(maxX, maxY));
  }
}
