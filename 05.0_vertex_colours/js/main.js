"use strict";

const VERTEX_SHADER_SOURCE = `
    attribute vec2 a_position;
    attribute vec3 a_colour;

    varying vec3 v_colour;
    varying vec2 v_position;

    void main() {
        v_colour = a_colour;
        v_position = a_position;
        gl_Position = vec4(a_position, 0.0, 1.0);
    }
`;

const FRAGMENT_SHADER_SOURCE = `
    #define PI 3.1415926538

    precision mediump float;

    varying vec3 v_colour;
    varying vec2 v_position;

    uniform float u_time;

    vec3 generateColour (float t) {
        vec3 offsets = vec3(0.00, 0.33, 0.67);
        vec3 h = vec3(0.5);
        return h + (h * cos(2.0 * PI * (offsets + t)));
    }

    void main() {
        //gl_FragColor = vec4(normalize(v_colour), 1.0);
        //vec3 a = vec3(1, 0, 0);
        //vec3 b = vec3(0, 0, 0);
        //float factor = clamp(length(v_position), 0.0, 1.0);
        //vec3 c = generateColour(factor * 2.0);
        //vec3 c = vec3(sin(factor * 50.0));
        //gl_FragColor = vec4(c, 1.0);
        //vec3 c = mix(a, b, factor * 1.0);
        //gl_FragColor = vec4(c, 1.0);

        gl_FragColor = vec4(cos(v_colour * 100.0 + u_time * 5.0) * v_colour, 1.0);
    }
`;

function generateColour (t) {
    const r = 0.5 + 0.5 * Math.cos(2 * Math.PI * (1.0 * t + 0.00));
    const g = 0.5 + 0.5 * Math.cos(2 * Math.PI * (1.0 * t + 0.33));
    const b = 0.5 + 0.5 * Math.cos(2 * Math.PI * (1.0 * t + 0.67));

    return {
        r: r,
        g: g,
        b: b,
    };
}

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
    const colourAttribute = gl.getAttribLocation(program, "a_colour");
    const timeUniform = gl.getUniformLocation(program, "u_time");

    // Setup buffers
    const positions = new Float32Array([
        0, 0.75,
        -0.75, -0.75,
        0.75, -0.75,
    ]);
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
    const colours = new Float32Array([
        1, 0, 0,
        0, 1, 0,
        0, 0, 1,
    ]);
    const colourBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colourBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, colours, gl.STATIC_DRAW);

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

        gl.bindBuffer(gl.ARRAY_BUFFER, colourBuffer);
        gl.vertexAttribPointer(colourAttribute, 3, type, normalize, stride, offset);
        gl.enableVertexAttribArray(colourAttribute);
    }

    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    const render = function (time) {
        Util.resizeCanvas(canvas);
        gl.viewport(0, 0, canvas.width, canvas.height);

        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.uniform1f(timeUniform, time);

        gl.drawArrays(gl.TRIANGLES, 0, positions.length / 2);
    };

    const animate = function (milliseconds) {
        window.requestAnimationFrame(animate);

        const seconds = milliseconds / 1000;
        render(seconds);
    };

    animate();
}

// Taken from:
// https://iquilezles.org/www/articles/palettes/palettes.htm

