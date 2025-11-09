// renderer.js
import Ball from "./Ball.js";
import Box from "./Box.js";

export default class Renderer {
  constructor(canvas, vertexShaderSource, fragmentShaderSource) {
    this.gl = canvas.getContext("webgl2");
    if (!this.gl) throw new Error("WebGL2 not supported");

    this.program = this.createProgramFromSources(this.gl, [
      vertexShaderSource,
      fragmentShaderSource,
    ]);

    this.positionBuffer = this.gl.createBuffer();
    this.vao = this.gl.createVertexArray();

    this.positionAttributeLocation = this.gl.getAttribLocation(
      this.program,
      "a_position"
    );
    this.resolutionUniformLocation = this.gl.getUniformLocation(
      this.program,
      "u_resolution"
    );
    this.colorUniformLocation = this.gl.getUniformLocation(
      this.program,
      "u_color"
    );
    this.translationUniformLocation = this.gl.getUniformLocation(
      this.program,
      "u_translation"
    );

    this.gl.bindVertexArray(this.vao);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
    this.gl.enableVertexAttribArray(this.positionAttributeLocation);
    this.gl.vertexAttribPointer(
      this.positionAttributeLocation,
      2,
      this.gl.FLOAT,
      false,
      0,
      0
    );

    this.gl.clearColor(0.15, 0.16, 0.2, 1.0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    this.gl.useProgram(this.program);
  }

  // --- helpers (unchanged) ---
  createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
    console.error(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return undefined;
  }

  createProgram(gl, vertexShader, fragmentShader) {
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (gl.getProgramParameter(program, gl.LINK_STATUS)) return program;
    console.error(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return undefined;
  }

  createProgramFromSources(gl, sources) {
    return this.createProgram(
      gl,
      this.createShader(gl, gl.VERTEX_SHADER, sources[0]),
      this.createShader(gl, gl.FRAGMENT_SHADER, sources[1])
    );
  }

  normalizeColor(r, g, b) {
    return [r / 255, g / 255, b / 255, 1];
  }

  clear() {
    const gl = this.gl;
    gl.canvas.width = gl.canvas.clientWidth;
    gl.canvas.height = gl.canvas.clientHeight;

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.useProgram(this.program);
    gl.uniform2f(this.resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

    this.gl.clearColor(0.15, 0.16, 0.2, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
  }

  drawShape(shape) {
    if (shape instanceof Ball) this.drawBall(shape);
    else if (shape instanceof Box) this.drawBox(shape);
  }

  drawBall(ball) {
    const gl = this.gl;
    const [r, g, b] = ball.color;
    const color = this.normalizeColor(r, g, b);
    gl.uniform4f(this.colorUniformLocation, color[0], color[1], color[2], color[3]);
    gl.bindVertexArray(this.vao);

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ball.getBall()), gl.DYNAMIC_DRAW);
    gl.uniform2f(this.translationUniformLocation, ball.pos.x, ball.pos.y);
    gl.drawArrays(gl.TRIANGLES, 0, ball.verticesSize);
  }

  drawBox(box) {
    const gl = this.gl;
    const [r, g, b] = box.color;
    const color = this.normalizeColor(r, g, b);
    gl.uniform4f(this.colorUniformLocation, color[0], color[1], color[2], color[3]);
    gl.bindVertexArray(this.vao);

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(box.getRect()), gl.DYNAMIC_DRAW);
    gl.uniform2f(this.translationUniformLocation, box.pos.x, box.pos.y);
    gl.drawArrays(gl.TRIANGLES, 0, box.verticesSize);
  }
}

// ---- NEW: async factory that loads your GLSL files and builds Renderer ----
export async function createRenderer(canvas) {
  const [vertexShaderSource, fragmentShaderSource] = await Promise.all([
    fetch("./Shader/vertexShader.glsl", { cache: "no-cache" }).then(r => r.text()),
    fetch("./Shader/fragmentShader.glsl", { cache: "no-cache" }).then(r => r.text()),
  ]);
  return new Renderer(canvas, vertexShaderSource, fragmentShaderSource);
}
