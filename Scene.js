
export default class Scene {
    constructor() {
        this.objects = [];
    }

    add(obj) {
        this.objects.push(obj);
    }

    draw(renderer) {
        this.objects.forEach(object => {
            renderer.drawShape(object);
        });
    }

    update(dt) {
        this.objects.forEach(object => {
            object.update(dt,this);
        });
    }
}