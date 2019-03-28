"use strict";

const VERTEX_SHADER_SOURCE = `
    attribute vec2 a_position;

    void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
    }
`;

const FRAGMENT_SHADER_SOURCE = `
    precision mediump float;

    void main() {
        gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
    }
`;

function start () {
    // Setup context
    const canvas = document.getElementById("_canvas_");
    const gl = canvas.getContext("webgl");
    if (gl === null) {
        window.alert("WebGL not supported!");
        return;
    }

    // Setup shaders
    const program = Util.createProgram(gl, VERTEX_SHADER_SOURCE, FRAGMENT_SHADER_SOURCE);
    const positionAttribute = gl.getAttribLocation(program, "a_position");

    // Setup buffers
    const positions = new Float32Array([
        0, 0.75,
        -0.75, -0.75,
        0.75, -0.75,
    ]);
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    // Specify which shader to use
    gl.useProgram(program);

    // Prepare position buffer
    {
        const type = gl.FLOAT;   // the data is 32bit floats
        const normalize = false; // don't normalize the data
        const stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
        const offset = 0;        // start at the beginning of the buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.vertexAttribPointer(positionAttribute, 2, type, normalize, stride, offset);
        gl.enableVertexAttribArray(positionAttribute);
    }

    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    const render = function () {
        Util.resizeCanvas(canvas);
        gl.viewport(0, 0, canvas.width, canvas.height);

        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.drawArrays(gl.TRIANGLES, 0, positions.length / 2);
    };

    const animate = function () {
        window.requestAnimationFrame(animate);

        render();
    };

    animate();
}
