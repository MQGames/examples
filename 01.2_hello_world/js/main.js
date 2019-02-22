
// Heavily inspired by:
// https://webglfundamentals.org/webgl/lessons/webgl-fundamentals.html
// https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial

// The "use strict"; part below will enable some extra checks by the browser.You almost always want to enable this!
// It needs to be the first statement of code in order to work. For more info see:
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
"use strict";

const VERTEX_SHADER_SOURCE = `
	attribute vec4 aPosition;

	void main() {
		gl_Position = aPosition;
	}
`;

const FRAGMENT_SHADER_SOURCE = `
	precision mediump float;

	void main() {
		gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
	}
`;

// Because JS will run as soon as you include it in your HTML, just wait a frame before we start doing anything.
// There are other ways (defer="defer", etc), but they lead to problems of their own.
window.setTimeout(start);

function start () {
	// Setup context
	const canvas = document.getElementById("_canvas_");
	const gl = canvas.getContext("webgl");
	if (gl === null) {
		window.alert("WebGL not supported!");
		return;
	}

	// Setup shaders
	const vertexShader = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER_SOURCE);
	const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SOURCE);
	const program = createProgram(gl, vertexShader, fragmentShader);
	const positionAttributeLocation = gl.getAttribLocation(program, "aPosition");

	// Setup vertex position buffer
	const positions = [
		0.0, 0.0,
		0.8, 0.0,
		0.0, 0.4,
	];
	const positionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

	// Prepare the screen for drawing
	gl.viewport(0, 0, canvas.width, canvas.height);
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT);
	
	// Specify which shader to use
	gl.useProgram(program);

	// Prepare position buffer
	{
		const size = 2;          // 2 components per iteration
		const type = gl.FLOAT;   // the data is 32bit floats
		const normalize = false; // don't normalize the data
		const stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
		const offset = 0;        // start at the beginning of the buffer
		gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
		gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);
		gl.enableVertexAttribArray(positionAttributeLocation);
	}

	// Draw the triangle
	{
		const primitiveType = gl.TRIANGLES;
		const offset = 0;
		const count = 3;
		gl.drawArrays(primitiveType, offset, count);
	}
}

function createShader (gl, type, source) {
	check(isContext(gl), isString(source));

	const shader = gl.createShader(type);
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
	if (!success) {
		console.error(gl.getShaderInfoLog(shader));
		gl.deleteShader(shader);
		return null;
	}

	return shader;
}

function createProgram (gl, vertexShader, fragmentShader) {
	check(isContext(gl), isShader(vertexShader), isShader(fragmentShader));

	const program = gl.createProgram();
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);

	const success = gl.getProgramParameter(program, gl.LINK_STATUS);
	if (!success) {
		console.error(gl.getProgramInfoLog(program));
		gl.deleteProgram(program);
		return null;
	}

	return program;
}
