import Vec2  from "./Vec2";

class Box extends Entity{
    #pos = new Vec2();
    #vel = new Vec2();
    #acc = new Vec2(0.1,0.1);
    color = { r: 1.0, g: 0.0, b: 0.0, a: 1.0 }; // Red
    
    constructor(x,y,width,height,color){
        super(x,y,width,height);
        this.color = color;
    }

    update(){

        this.vel.x+=this.acc.x;
        this.vel.y+=this.acc.y;

        this.pos.x+=this.vel.x;
        this.pos.y+=this.vel.y;

    }

    draw(renderer){
        renderer.drawRect(this.x,this.y,this.width,this.height,color);
    }

}