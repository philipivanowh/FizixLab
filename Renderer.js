var vertexShaderSource = `#version 300 es

// an attribute is an input (in) to a vertex shader.
// It will receive data from a buffer
in vec2 a_position;

// Used to pass in the resolution of the canvas
uniform vec2 u_resolution;

//translation to add to position
uniform vec2 u_translation;

// all shaders have a main function
void main() {

  vec2 position = a_position + u_translation;

  // convert the position from pixels to 0.0 to 1.0
  vec2 zeroToOne = position / u_resolution;

  // convert from 0->1 to 0->2
  vec2 zeroToTwo = zeroToOne * 2.0;

  // convert from 0->2 to -1->+1 (clipspace)
  vec2 clipSpace = zeroToTwo - 1.0;

  gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
}
`;

var fragmentShaderSource = `#version 300 es

// fragment shaders don't have a default precision so we need
// to pick one. highp is a good default. It means "high precision"
precision highp float;

// we need to declare an output for the fragment shader
uniform vec4 u_color;
out vec4 outColor;

void main() {
  // Just set the output to a constant redish-purple
  outColor = u_color;
}
`;

export default class Renderer {
    constructor(canvas) {
        this.gl = canvas.getContext("webgl2");
        if (!this.gl) throw new Error("WebGL2 not supported");

        this.program = this.createProgramFromSources(this.gl, [
            vertexShaderSource,
            fragmentShaderSource,
        ]);

        this.positionBuffer = this.gl.createBuffer();

        // Create a vertex array object (attribute state)
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
        this.gl.vertexAttribPointer(this.positionAttributeLocation, 2, this.gl.FLOAT, false, 0, 0);

        this.gl.clearColor(0.15, 0.16, 0.2, 1.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);

        this.gl.useProgram(this.program);
    }

    createShader(gl, type, source) {
        var shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if (success) {
            return shader;
        }

        console.log(gl.getShaderInfoLog(shader)); // eslint-disable-line
        gl.deleteShader(shader);
        return undefined;
    }

    createProgram(gl, vertexShader, fragmentShader) {
        var program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        var success = gl.getProgramParameter(program, gl.LINK_STATUS);
        if (success) {
            return program;
        }

        console.log(gl.getProgramInfoLog(program)); // eslint-disable-line
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

        // resize canvas
        gl.canvas.width = gl.canvas.clientWidth;
        gl.canvas.height = gl.canvas.clientHeight;

        // update viewport and uniform
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.useProgram(this.program);
        gl.uniform2f(this.resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

        // clear screen

        this.gl.clearColor(0.15, 0.16, 0.2, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
    }

    drawBox(box) {
        const gl = this.gl;

        const r = box.color[0];
        const g = box.color[1];
        const b = box.color[2];
        const color = this.normalizeColor(r, g, b);
        gl.uniform4f(this.colorUniformLocation, color[0], color[1], color[2], color[3]);
        gl.bindVertexArray(this.vao);
        // console.log(box.getRect());

        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array(box.getRect()),
            gl.DYNAMIC_DRAW
        );

         // Set the translation.
        gl.uniform2f(this.translationUniformLocation, box.pos.x, box.pos.y);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
}
