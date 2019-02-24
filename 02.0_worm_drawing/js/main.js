
/*

Click and drag to create colourful worms!

*/

"use strict";

const VERTEX_SHADER_SOURCE = `
    attribute vec2 a_position;
    attribute float a_size;
    attribute vec3 a_colour;

    uniform vec2 u_screenDimensions;

    varying vec3 v_colour;

    vec2 screenToNdc (vec2 screen, vec2 screenDimensions) {
        return vec2(screen.x / (screenDimensions.x * 0.5) - 1.0, (screen.y / (screenDimensions.y * 0.5) - 1.0) * -1.0);
    }

    void main() {
        v_colour = a_colour;
        vec2 ndc = screenToNdc(a_position.xy, u_screenDimensions);
        gl_Position = vec4(ndc, 0.0, 1.0);
        gl_PointSize = a_size;
    }
`;

const FRAGMENT_SHADER_SOURCE = `
    precision mediump float;

    varying vec3 v_colour;

    void main() {
        gl_FragColor = vec4(v_colour, 1.0);
    }
`;

const MAX_POINTS = 10000;
const POSITIONS_SIZE = 2;
const SIZES_SIZE = 1;
const COLOURS_SIZE = 3;
const positionsArray = new Float32Array(MAX_POINTS * POSITIONS_SIZE);
const sizesArray = new Float32Array(MAX_POINTS * SIZES_SIZE);
const coloursArray = new Float32Array(MAX_POINTS * COLOURS_SIZE);
const colourSpeed = 0.01;

let currentPoints = 0;
let currentPointIndex = 0;
let mousePressed = false;
let lastMouseX = 0;
let lastMouseY = 0;
let colourT = 0.0;

function start () {
    // Setup context
    const canvas = document.getElementById("_canvas_");
    const gl = canvas.getContext("webgl");
    if (gl === null) {
        window.alert("WebGL not supported!");
        return;
    }

    // User interaction
    {
        canvas.addEventListener("mousedown", function (event) {
            mousePressed = true;
            lastMouseX = event.x;
            lastMouseY = event.y;
        });
        canvas.addEventListener("mouseup", function () {
            mousePressed = false;
        });
        canvas.addEventListener("mousemove", function (event) {
            if (mousePressed) {
                // Update buffers
                {
                    positionsArray[currentPointIndex * POSITIONS_SIZE + 0] = event.x;
                    positionsArray[currentPointIndex * POSITIONS_SIZE + 1] = event.y;

                    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
                    gl.bufferSubData(gl.ARRAY_BUFFER, 0, positionsArray);

                    const manhattanDistance = Math.abs(event.x - lastMouseX) + Math.abs(event.y - lastMouseY);
                    sizesArray[currentPointIndex * SIZES_SIZE + 0] = manhattanDistance * 1.5;

                    gl.bindBuffer(gl.ARRAY_BUFFER, sizeBuffer);
                    gl.bufferSubData(gl.ARRAY_BUFFER, 0, sizesArray);

                    const colour = generateColour(colourT);
                    coloursArray[currentPointIndex * COLOURS_SIZE + 0] = colour.r;
                    coloursArray[currentPointIndex * COLOURS_SIZE + 1] = colour.g;
                    coloursArray[currentPointIndex * COLOURS_SIZE + 2] = colour.b;

                    gl.bindBuffer(gl.ARRAY_BUFFER, colourBuffer);
                    gl.bufferSubData(gl.ARRAY_BUFFER, 0, coloursArray);
                }
                
                // Increment values
                {
                    if (currentPoints < MAX_POINTS) {
                        currentPoints += 1;
                    }
                    currentPointIndex = (currentPointIndex + 1) % MAX_POINTS;

                    lastMouseX = event.x;
                    lastMouseY = event.y;

                    colourT = (colourT + colourSpeed) % 1.0;
                }
            }
        });
    }

    // Setup shaders
    const program = Util.createProgram(gl, VERTEX_SHADER_SOURCE, FRAGMENT_SHADER_SOURCE);
    const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
    const sizeAttributeLocation = gl.getAttribLocation(program, "a_size");
    const colourAttributeLocation = gl.getAttribLocation(program, "a_colour");
    const screenDimensionsLocation = gl.getUniformLocation(program, "u_screenDimensions");

    // Setup buffers
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positionsArray, gl.DYNAMIC_DRAW);
    const sizeBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, sizeBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, sizesArray, gl.DYNAMIC_DRAW);
    const colourBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colourBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, coloursArray, gl.DYNAMIC_DRAW);

    // Specify which shader to use
    gl.useProgram(program);

    // Prepare position buffer
    {
        const type = gl.FLOAT;   // the data is 32bit floats
        const normalize = false; // don't normalize the data
        const stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
        const offset = 0;        // start at the beginning of the buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.vertexAttribPointer(positionAttributeLocation, POSITIONS_SIZE, type, normalize, stride, offset);
        gl.enableVertexAttribArray(positionAttributeLocation);

        gl.bindBuffer(gl.ARRAY_BUFFER, sizeBuffer);
        gl.vertexAttribPointer(sizeAttributeLocation, SIZES_SIZE, type, normalize, stride, offset);
        gl.enableVertexAttribArray(sizeAttributeLocation);

        gl.bindBuffer(gl.ARRAY_BUFFER, colourBuffer);
        gl.vertexAttribPointer(colourAttributeLocation, COLOURS_SIZE, type, normalize, stride, offset);
        gl.enableVertexAttribArray(colourAttributeLocation);
    }

    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    const render = function () {
        Util.resizeCanvas(canvas);
        gl.viewport(0, 0, canvas.width, canvas.height);

        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.uniform2fv(screenDimensionsLocation, [canvas.width, canvas.height]);

        const primitiveType = gl.POINTS;
        const offset = 0;
        const count = currentPoints;
        if (currentPoints > 0) {
            gl.drawArrays(primitiveType, offset, count);
        }
    };

    const animate = function () {
        window.requestAnimationFrame(animate);
        render();
    };

    animate();
}

// Taken from:
// https://iquilezles.org/www/articles/palettes/palettes.htm
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
