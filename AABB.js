export default class AABB{

    constructor(minX,minY,maxX,maxY){
        this.min = new Vec2(minX,minY);
        this.max = new Vec2(maxX,maxY);
    }

}