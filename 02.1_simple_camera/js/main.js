
/*

Click and drag to move the camera.

*/

"use strict";

const VERTEX_SHADER_SOURCE = `
    attribute vec2 a_position;

    uniform vec2 u_objectPosition;
    uniform vec2 u_cameraPosition;
    uniform vec2 u_cameraDimensions;

    void main() {
        vec2 worldRelative = a_position + u_objectPosition;
        vec2 cameraRelative = worldRelative - u_cameraPosition;
        vec2 cameraStretched = cameraRelative / u_cameraDimensions;
        gl_Position = vec4(cameraStretched, 0.0, 1.0);
    }
`;

const FRAGMENT_SHADER_SOURCE = `
    precision mediump float;

    uniform vec3 u_colour;

    void main() {
        gl_FragColor = vec4(u_colour, 1.0);
    }
`;

const NUM_TRIANGLES = 200;

let cameraZoom = 1.0;
let cameraX = 0.0;
let cameraY = 0.0;

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
        const zoomInput = document.getElementById("_zoom_");
        zoomInput.value = cameraZoom;
        zoomInput.addEventListener("input", function () {
            cameraZoom = Number.parseFloat(zoomInput.value);
        });
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
    }

    // Setup shaders
    const program = Util.createProgram(gl, VERTEX_SHADER_SOURCE, FRAGMENT_SHADER_SOURCE);
    const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
    const objectPositionLocation = gl.getUniformLocation(program, "u_objectPosition");
    const cameraPositionLocation = gl.getUniformLocation(program, "u_cameraPosition");
    const cameraDimensionsLocation = gl.getUniformLocation(program, "u_cameraDimensions");
    const colourLocation = gl.getUniformLocation(program, "u_colour");

    // Setup buffers
    const triangleArray = [
        0.00, 0.00,
        0.06, 0.00,
        0.00, 0.06,
    ];
    const triangleBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleArray), gl.STATIC_DRAW);
    const rectangleArray = [
        -1.0, -1.0,
         1.0, -1.0,
         1.0,  1.0,
        -1.0,  1.0,
    ];
    const rectangleBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, rectangleBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(rectangleArray), gl.STATIC_DRAW);

    // Prepare position buffers
    {
        const size = 2;
        const type = gl.FLOAT;   // the data is 32bit floats
        const normalize = false; // don't normalize the data
        const stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
        const offset = 0;        // start at the beginning of the buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, triangleBuffer);
        gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);
        gl.enableVertexAttribArray(positionAttributeLocation);
    }
    {
        const size = 2;
        const type = gl.FLOAT;   // the data is 32bit floats
        const normalize = false; // don't normalize the data
        const stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
        const offset = 0;        // start at the beginning of the buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, rectangleBuffer);
        gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);
        gl.enableVertexAttribArray(positionAttributeLocation);
    }

    const objectPositions = new Float32Array(NUM_TRIANGLES * 2);
    for (let i = 0; i < objectPositions.length; i++) {
        objectPositions[i] = (Math.random() * 2.0) - 1.0;
    }

    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    const render = function () {
        check(isNumber(cameraZoom, cameraX, cameraY));

        Util.resizeCanvas(canvas);

        gl.clear(gl.COLOR_BUFFER_BIT);

        const halfWidth = canvas.width / 2.0;
        const aspect = halfWidth / canvas.height;

        // Right
        {
            gl.viewport(halfWidth, 0, halfWidth, canvas.height);

            gl.useProgram(program);
            gl.bindBuffer(gl.ARRAY_BUFFER, triangleBuffer);
            const size = 2;
            const type = gl.FLOAT;   // the data is 32bit floats
            const normalize = false; // don't normalize the data
            const stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
            const offset = 0;        // start at the beginning of the buffer
            gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);

            gl.uniform2fv(cameraPositionLocation, [cameraX, cameraY]);
            gl.uniform2fv(cameraDimensionsLocation, [aspect * cameraZoom, cameraZoom]);
            gl.uniform3fv(colourLocation, [1.0, 0.0, 0.0]);

            const primitiveType = gl.TRIANGLES;
            const count = 3;

            for (let i = 0; i < NUM_TRIANGLES; i++) {
                const index = i * 2;
                const x = objectPositions[index + 0];
                const y = objectPositions[index + 1];
                gl.uniform2fv(objectPositionLocation, [x, y]);

                gl.drawArrays(primitiveType, 0, count);
            }
        }

        // Left
        {
            gl.viewport(0, 0, halfWidth, canvas.height);

            gl.useProgram(program);

            const rightZoom = 3.0;
            
            // Triangles
            {
                gl.bindBuffer(gl.ARRAY_BUFFER, triangleBuffer);
                const size = 2;
                const type = gl.FLOAT;   // the data is 32bit floats
                const normalize = false; // don't normalize the data
                const stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
                const offset = 0;        // start at the beginning of the buffer
                gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);

                gl.uniform2fv(cameraPositionLocation, [0.0, 0.0]);
                gl.uniform2fv(cameraDimensionsLocation, [aspect * rightZoom, rightZoom]);
                gl.uniform3fv(colourLocation, [1.0, 0.0, 0.0]);

                const primitiveType = gl.TRIANGLES;
                const count = 3;

                for (let i = 0; i < NUM_TRIANGLES; i++) {
                    const index = i * 2;
                    const x = objectPositions[index + 0];
                    const y = objectPositions[index + 1];
                    gl.uniform2fv(objectPositionLocation, [x, y]);

                    gl.drawArrays(primitiveType, 0, count);
                }
            }
            
            // Rectangles
            {
                gl.bindBuffer(gl.ARRAY_BUFFER, rectangleBuffer);
                const size = 2;
                const type = gl.FLOAT;   // the data is 32bit floats
                const normalize = false; // don't normalize the data
                const stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
                const offset = 0;        // start at the beginning of the buffer
                gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);

                gl.uniform3fv(colourLocation, [0.0, 1.0, 1.0]);
                const zoomX = rightZoom / (cameraZoom * aspect);
                const zoomY = rightZoom / cameraZoom;
                gl.uniform2fv(cameraDimensionsLocation, [zoomX, zoomY]);

                const primitiveType = gl.LINE_LOOP;
                const count = 4;

                gl.uniform2fv(objectPositionLocation, [cameraX / cameraZoom, cameraY / cameraZoom]);

                gl.drawArrays(primitiveType, 0, count);
            }
        }
    };

    const animate = function () {
        window.requestAnimationFrame(animate);
        render();
    };

    animate();
}


