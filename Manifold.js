export default class Manifold{
    constructor(bodyA, bodyB,normal,depth,contact1,contact2,contactCount){
        this.bodyA = bodyA;
        this.bodyB = bodyB;
        this.depth = depth;
        this.normal = normal;
        this.contact1 = contact1;
        this.contact2 = contact2;
        this.contactCount = contactCount;
    }
}