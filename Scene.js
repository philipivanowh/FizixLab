
export default class Scene {
    constructor() {
        this.objects = [];
    }

    add(obj) {
        this.objects.push(obj);
    }

    draw(renderer) {
        this.objects.forEach(object => {
            renderer.drawBox(object);
        });
    }

    update(dt) {
        this.objects.forEach(object => {
            object.update(dt);
        });
    }
}

