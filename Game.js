"use strict";





function main() {
  const canvas = document.querySelector("#canvas");
  const gl = canvas.getContext("webgl2");
  if (!gl) return alert("WebGL2 not supported");

  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = createShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentShaderSource
  );

  const program = createProgram(gl, vertexShader, fragmentShader);
  const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
  var resolutionUniformLocation = gl.getUniformLocation(
    program,
    "u_resolution"
  );

  var colorUniformLocation = gl.getUniformLocation(program, "u_color");

  // Create a buffer
  var positionBuffer = gl.createBuffer();

  // Create a vertex array object (attribute state)
  var vao = gl.createVertexArray();
  
  gl.bindVertexArray(vao);

  // and make it the one we're currently working with

  // Turn on the attribute
  gl.enableVertexAttribArray(positionAttributeLocation);

  // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  var groundPos = createRectangle(20, 800, 1580, 100);


  var boxTransform = [100,100];
  var boxPos = createRectangle(boxTransform[0],boxTransform[1],100,100);

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(groundPos), gl.STATIC_DRAW);

  var size = 2; // 2 components per iteration
  var type = gl.FLOAT; // the data is 32bit floats
  var normalize = false; // don't normalize the data
  var stride = 0; // 0 = move forward size * sizeof(type) each iteration to get the next position
  var offset = 0; // start at the beginning of the buffer
  gl.vertexAttribPointer(
    positionAttributeLocation,
    size,
    type,
    normalize,
    stride,
    offset
  );

  // manual resize
  gl.canvas.width = gl.canvas.clientWidth;
  gl.canvas.height = gl.canvas.clientHeight;
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  gl.clearColor(0.15, 0.16, 0.2, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  

  gl.useProgram(program);

  gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

  gl.uniform4f(colorUniformLocation, 0, 0, 0, 1);


  //draw 50 random rectangles in random colros

  var primitiveType = gl.TRIANGLES;
  var offset = 0;
  var count = 6;
  

  gl.drawArrays(primitiveType, offset, count);

  
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boxPos), gl.STATIC_DRAW);
  
  gl.uniform4f(colorUniformLocation, 1, 1, 1, 1);
  

  
  gl.drawArrays(primitiveType, offset, count);



}


// Returns a random integer from 0 to range - 1.
function randomInt(range) {
  return Math.floor(Math.random() * range);
}

// Fills the buffer with the values that define a rectangle.

function createRectangle(x, y, width, height) {
  return [
    x,y,
    x + width,y,
    x,y + height,
    x,y + height,
    x + width,y + height,
    x + width,y,
  ];
}

class shape{

}

main();
