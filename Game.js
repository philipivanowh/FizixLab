import Box from "./Box.js";

class Game{
  b1 = new Box(100,100,100,100, {r:1.0, g:0.5, b:1.0, a:1.0});
  ground = new Box(50,1000,1000,200,{r:1.0, g:1.0, b:1.0, a:1.0});

  constructor(){
    this.canvas = document.getElementById("game");
    this.renderer = new Renderer(canvas);
    this.width = canvas.width;
    this.height = canvas.height;
  }

  update(){
    this.b1.update();
  }

  draw(){
    this.b1.draw(this.renderer);
    this.b2.draw(this.renderer)
  }

  loop(){
    update();
    draw();
  }
}

var game = new Game();
game.loop();