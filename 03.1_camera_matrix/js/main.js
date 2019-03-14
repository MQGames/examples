"use strict";

const VERTEX_SHADER_SOURCE = `
    attribute vec2 a_position;

    uniform mat3 u_object;
    uniform mat3 u_camera;

    void main() {
        vec3 ndc = u_camera * u_object * vec3(a_position, 1.0);
        gl_Position = vec4(ndc, 1.0);
    }
`;

const FRAGMENT_SHADER_SOURCE = `
    precision mediump float;

    uniform vec3 u_colour;

    void main() {
        gl_FragColor = vec4(u_colour, 1.0);
    }
`;

const NUM_TRIANGLES = 100;

let cameraX = 0;
let cameraY = 0;
let cameraRot = 0;

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
        const xInput = document.getElementById("_x_");
        xInput.value = cameraX;
        xInput.addEventListener("input", function () {
            cameraX = Number.parseFloat(xInput.value);
        });
        const yInput = document.getElementById("_y_");
        yInput.value = cameraY;
        yInput.addEventListener("input", function () {
            cameraY = Number.parseFloat(yInput.value);
        });
        const rotInput = document.getElementById("_rot_");
        rotInput.value = cameraRot;
        rotInput.addEventListener("input", function () {
            cameraRot = Number.parseFloat(rotInput.value);
        });
    }

    // Setup shaders
    const program = Util.createProgram(gl, VERTEX_SHADER_SOURCE, FRAGMENT_SHADER_SOURCE);
    const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
    const objectLocation = gl.getUniformLocation(program, "u_object");
    const cameraLocation = gl.getUniformLocation(program, "u_camera");
    const colourLocation = gl.getUniformLocation(program, "u_colour");

    gl.enableVertexAttribArray(positionAttributeLocation);

    // Setup buffers
    const triangleArray = [
        0.0, 0.0,
        0.1, 0.0,
        0.0, 0.1,
    ];
    const triangleBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleArray), gl.STATIC_DRAW);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    const objectPositions = new Float32Array(NUM_TRIANGLES * 2);
    for (let i = 0; i < objectPositions.length; i++) {
        objectPositions[i] = (Math.random() - 0.5) * 2.0;
    }
    const objectRotations = new Float32Array(NUM_TRIANGLES);
    for (let i = 0; i < objectRotations.length; i++) {
        objectRotations[i] = (Math.random() - 0.5) * Math.PI * 2.0;
    }

    const objectMatrix = new Float32Array([
        1.0, 0.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 0.0, 1.0,
    ]);
    const cameraMatrix = new Float32Array([
        1.0, 0.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 0.0, 1.0,
    ]);

    const render = function (seconds) {
        check(isNumber(seconds, cameraX, cameraY, cameraRot));

        Util.resizeCanvas(canvas);

        gl.viewport(0, 0, canvas.width, canvas.height);

        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.useProgram(program);
        gl.bindBuffer(gl.ARRAY_BUFFER, triangleBuffer);
        gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

        updateMatrix(cameraMatrix, -cameraX, -cameraY, -cameraRot, 1.0, 1.0);
        gl.uniformMatrix3fv(cameraLocation, false, cameraMatrix);

        for (let i = 0; i < NUM_TRIANGLES; i++) {
            const x = objectPositions[i + 0];
            const y = objectPositions[i + 1];
            const rot = objectRotations[i];

            const offset = Math.sin(seconds * 2.0 + x * 2.0) * 0.1;

            updateMatrix(objectMatrix, x + offset, y, rot + (offset * 10.0), 1.0, 1.0);

            gl.uniformMatrix3fv(objectLocation, false, objectMatrix);
            gl.uniform3fv(colourLocation, [1.0, 0.0, 0.0]);

            gl.drawArrays(gl.TRIANGLES, 0, 3);
        }
    };

    const animate = function (milliseconds) {
        window.requestAnimationFrame(animate);

        const seconds = milliseconds / 1000;
        render(seconds);
    };

    animate();
}

function updateMatrix (matrix, translateX, translateY, rotation, scaleX, scaleY) {
    check(isMat3(matrix), isNumber(translateX, translateX, rotation, scaleX, scaleY));

    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);

    matrix[0] = cos * scaleX;
    matrix[1] = sin * scaleY;
    matrix[3] = -sin * scaleX;
    matrix[4] = cos * scaleY;
    matrix[6] = translateX;
    matrix[7] = translateY;
}
