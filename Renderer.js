import  Vec2  from "./Vec2";


class Renderer {
  constructor(canvas) {
    this.gl = canvas.getContext("webgl2");
    if ((!this, gl)) throw new Error("WebGL2 not supported");
    const gl = this.gl;

    //Shaders
    const vertexShaderSource = `
#version 300 es
in vec2 a_position;

uniform vec2 u_resolution;

void main() {
  // convert the position from pixels to 0.0 to 1.0
    vec2 zeroToOne = a_position / u_resolution;
 
    // convert from 0->1 to 0->2
    vec2 zeroToTwo = zeroToOne * 2.0;
 
    // convert from 0->2 to -1->+1 (clip space)
    vec2 clipSpace = zeroToTwo - 1.0;
 
    gl_Position = vec4(clipSpace * vec2(1,-1), 0, 1);
}`;

    const fragmentShaderSource = `
#version 300 es
precision highp float;

uniform vec4 u_color;

out vec4 outColor;
void main() {
  outColor = u_color;
}`;

    this.vs = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);

    this.fs = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    this.program = createProgram(gl, vs, fs);

    //Locations
    this.positionLoc = gl.getAttribLocation(this.program, "a_position");
    this.resolutionLoc = gl.getUniformLocation(this.program, "u_resolution");
    this.colorLoc = gl.getUniformLocation(this.program, "u_color");

    //Buffers
    this.vao = gl.createVertexArray();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.enableVertexAttribArray(this.positionLoc);
    gl.vertexAttribPointer(this.positionLoc, 2, gl.FLOAT, false, 0, 0);

    gl.useProgram(this.program);
    gl.uniform2f(this.resolutionLoc, canvas.width, canvas.height);
  }

  clear() {
    const gl = this.gl;
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0.1, 0.12, 0.16, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
  }

  drawRect(x, y, w, h, color) {
    const gl = this.gl;
    gl.bindVertexArray(this.vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    GLUtils.setRectangle(gl, x, y, w, h);
    gl.uniform4fv(this.colorLoc, color);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
    }
    return shader;
  }

  createProgram(gl, vs, fs) {
    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(prog));
      gl.deleteProgram(prog);
    }
    return prog;
  }

  drawRect(x,y,w,h,color){
    this.gl.bindVertexArray(this.vao);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER,this.buffer);
    this.gl.bufferData(
        this.gl.ARRAY_BUFFER, 
        new Float32Array([
        x, y,
        x + w, y,
        x, y + h,
        x, y + h,
        x + w, y + h,
        x + w, y
    ])
    ,gl.DYNAMIC_DRAW);

    this.gl.uniform4fv(this.colorLoc,color);
    this.gl.drawArrays(this.gl.TRIANGLES,0,6);
  }
}
