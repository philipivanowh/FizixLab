#version 300 es

// an attribute is an input (in) to a vertex shader.
// It will receive data from a buffer
in vec2 a_position;

// Used to pass in the resolution of the canvas
uniform vec2 u_resolution;

//translation to add to position
uniform vec2 u_translation;
uniform float u_pointSize;


// all shaders have a main function
void main() {

  vec2 position = a_position + u_translation;

  gl_PointSize = u_pointSize;

  // convert the position from pixels to 0.0 to 1.0
  vec2 zeroToOne = position / u_resolution;
  
  // convert to 0–2 then -1–+1
  vec2 clipSpace = zeroToOne * 2.0 - 1.0;

  gl_Position = vec4(clipSpace, 0, 1);
}

