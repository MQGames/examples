
/*

Click and drag to move the camera.

*/

"use strict";

const VERTEX_SHADER_SOURCE = `
    attribute vec2 a_position;

    uniform mat3 u_object;

    void main() {
        vec3 ndc = u_object * vec3(a_position, 1.0);
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

let objectX = 0;
let objectY = 0;
let objectRot = 0;

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
        xInput.value = objectX;
        xInput.addEventListener("input", function () {
            objectX = Number.parseFloat(xInput.value);
        });
        const yInput = document.getElementById("_y_");
        yInput.value = objectY;
        yInput.addEventListener("input", function () {
            objectY = Number.parseFloat(yInput.value);
        });
        const rotInput = document.getElementById("_rot_");
        rotInput.value = objectRot;
        rotInput.addEventListener("input", function () {
            objectRot = Number.parseFloat(rotInput.value);
        });
    }

    // Setup shaders
    const program = Util.createProgram(gl, VERTEX_SHADER_SOURCE, FRAGMENT_SHADER_SOURCE);
    const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
    const objectLocation = gl.getUniformLocation(program, "u_object");
    const colourLocation = gl.getUniformLocation(program, "u_colour");

    gl.enableVertexAttribArray(positionAttributeLocation);

    // Setup buffers
    const triangleArray = [
        0.0, 0.0,
        0.5, 0.0,
        0.0, 0.5,
    ];
    const triangleBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleArray), gl.STATIC_DRAW);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    const objectMatrix = new Float32Array([
        1.0, 0.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 0.0, 1.0,
    ]);

    const update = function () {
        const cos = Math.cos(objectRot);
        const sin = Math.sin(objectRot);

        objectMatrix[0] = cos;
        objectMatrix[1] = sin;
        objectMatrix[3] = -sin;
        objectMatrix[4] = cos;
        objectMatrix[6] = objectX;
        objectMatrix[7] = objectY;
    };

    const render = function () {
        check(isNumber(objectX, objectY, objectRot));

        Util.resizeCanvas(canvas);

        gl.viewport(0, 0, canvas.width, canvas.height);

        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.useProgram(program);
        gl.bindBuffer(gl.ARRAY_BUFFER, triangleBuffer);
        gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

        gl.uniformMatrix3fv(objectLocation, false, objectMatrix);
        gl.uniform3fv(colourLocation, [1.0, 0.0, 0.0]);

        gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const animate = function () {
        window.requestAnimationFrame(animate);
        update();
        render();
    };

    animate();
}


