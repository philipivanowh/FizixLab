import PhysicsWorld from "./PhysicsWorld.js";

export default class Scene {
    constructor(iterations = 8) {
        this.objects = [];
        this.physicsWorld = new PhysicsWorld();
        this.iterations = iterations;
    }

    add(obj) {
        this.objects.push(obj);
        if (obj.physicsBody) {
            this.physicsWorld.addBody(obj.physicsBody);
            if (typeof obj.syncFromPhysics === "function") {
                obj.syncFromPhysics();
            }
        }
    }

    draw(renderer) {
        this.objects.forEach(object => {
            renderer.drawShape(object);
        });
    }

    update(dt) {
        this.physicsWorld.step(dt, this.iterations);

        this.objects.forEach(object => {
            if (typeof object.syncFromPhysics === "function") {
                object.syncFromPhysics();
            }

            if (typeof object.update === "function") {
                object.update(dt, this);
            }
        });
    }
}

