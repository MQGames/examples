"use strict";

const VERTEX_SHADER_SOURCE = `
    attribute vec3 a_position;

    uniform mat4 u_object;
    uniform mat4 u_camera;
    uniform mat4 u_projection;

    void main() {
        gl_Position = u_projection * u_camera * u_object * vec4(a_position, 1.0);
    }
`;

const FRAGMENT_SHADER_SOURCE = `
    precision mediump float;

    uniform vec3 u_colour;

    void main() {
        gl_FragColor = vec4(u_colour, 1.0);
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
    const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
    const objectLocation = gl.getUniformLocation(program, "u_object");
    const cameraLocation = gl.getUniformLocation(program, "u_camera");
    const projectionLocation = gl.getUniformLocation(program, "u_projection");
    const colourLocation = gl.getUniformLocation(program, "u_colour");

    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.useProgram(program);

    // Setup geometry
    const cubeGeometry = generateCubeGeometry(gl);
    const gridGeometry = generateGridGeometry(gl, 10.0, 10);

    gl.clearColor(0.1, 0.1, 0.1, 1.0);

    const drawGeometry = function (geometry) {
        gl.bindBuffer(gl.ARRAY_BUFFER, geometry.buffer);
        gl.vertexAttribPointer(positionAttributeLocation, geometry.size, geometry.type, geometry.normalize, geometry.stride, geometry.offset);
        gl.drawArrays(geometry.primitive, geometry.startIndex, geometry.endIndex);
    };

    const projectionMatrix = glMatrix.mat4.create();
    const cameraMatrix = glMatrix.mat4.create();
    const objectMatrix = glMatrix.mat4.create();

    const orthographicSize = 3.0;
    const orthographicDepth = 100.0;

    const cameraDistance = 2.0;
    const cameraHeight = 2.0;
    const cameraRotationSpeed = 0.2;

    const objectRotationAxis = [0.5, 1.0, 0.5];

    const render = function (seconds) {
        check(isNumber(seconds));

        Util.resizeCanvas(canvas);

        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clear(gl.COLOR_BUFFER_BIT);

        const aspect = canvas.width / canvas.height;

        // Projection setup
        //glMatrix.mat4.ortho(projectionMatrix, -aspect * orthographicSize, aspect * orthographicSize, -orthographicSize, orthographicSize, -orthographicDepth, orthographicDepth);
        glMatrix.mat4.perspective(projectionMatrix, Math.PI / 2.0, aspect, 0.1, 100.0);

        // Camera setup
        const eye = [
            Math.cos(seconds * cameraRotationSpeed) * cameraDistance,
            cameraHeight,
            Math.sin(seconds * cameraRotationSpeed) * cameraDistance,
        ];
        const centre = [
            0.0,
            0.5,
            0.0,
        ];
        const up = [
            0.0,
            1.0,
            0.0,
        ];
        glMatrix.mat4.lookAt(cameraMatrix, eye, centre, up);

        // Grid
        {
            glMatrix.mat4.identity(objectMatrix);

            gl.uniformMatrix4fv(objectLocation, false, objectMatrix);
            gl.uniformMatrix4fv(cameraLocation, false, cameraMatrix);
            gl.uniformMatrix4fv(projectionLocation, false, projectionMatrix);

            gl.uniform3fv(colourLocation, [0.2, 0.2, 0.2]);

            drawGeometry(gridGeometry);
        }

        // Cube
        {
            glMatrix.mat4.fromTranslation(objectMatrix, [0.0, 1.0, 0.0]);
            glMatrix.mat4.rotateX(objectMatrix, objectMatrix, objectRotationAxis[0] * seconds);
            glMatrix.mat4.rotateY(objectMatrix, objectMatrix, objectRotationAxis[1] * seconds);
            glMatrix.mat4.rotateZ(objectMatrix, objectMatrix, objectRotationAxis[2] * seconds);

            gl.uniformMatrix4fv(objectLocation, false, objectMatrix);
            gl.uniformMatrix4fv(cameraLocation, false, cameraMatrix);
            gl.uniformMatrix4fv(projectionLocation, false, projectionMatrix);

            gl.uniform3fv(colourLocation, [0.0, 1.0, 0.0]);

            drawGeometry(cubeGeometry);
        }
    };

    const animate = function (milliseconds) {
        window.requestAnimationFrame(animate);

        const seconds = milliseconds / 1000;
        render(seconds);
    };

    animate();
}

function generateCubeGeometry (gl) {
    check(isContext(gl));

    const positions = new Float32Array([
        // x
        -0.5, -0.5, -0.5,
         0.5, -0.5, -0.5,
        -0.5,  0.5, -0.5,
         0.5,  0.5, -0.5,
        -0.5, -0.5,  0.5,
         0.5, -0.5,  0.5,
        -0.5,  0.5,  0.5,
         0.5,  0.5,  0.5,

        // y
        -0.5, -0.5, -0.5,
        -0.5,  0.5, -0.5,
         0.5, -0.5, -0.5,
         0.5,  0.5, -0.5,
        -0.5, -0.5,  0.5,
        -0.5,  0.5,  0.5,
         0.5, -0.5,  0.5,
         0.5,  0.5,  0.5,

        // z
        -0.5, -0.5, -0.5,
        -0.5, -0.5,  0.5,
         0.5, -0.5, -0.5,
         0.5, -0.5,  0.5,
        -0.5,  0.5, -0.5,
        -0.5,  0.5,  0.5,
         0.5,  0.5, -0.5,
         0.5,  0.5,  0.5,
    ]);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    return {
        buffer: buffer,

        primitive: gl.LINES,

        startIndex: 0,
        endIndex: positions.length / 3,

        size: 3,
        type: gl.FLOAT,
        normalize: false,
        stride: 0,
        offset: 0,
    };
}

function generateGridGeometry (gl, size, numDivisions) {
    check(isContext(gl), isNumber(size, numDivisions));

    const positions = [];

    const halfSize = size / 2.0;

    const total = numDivisions * 2 + 1;
    for (let i = 0; i < total; i++) {
        const t = (i / (total - 1)) - 0.5;
        const value = t * size;

        // X axis
        positions.push(-halfSize);
        positions.push(0.0);
        positions.push(value);
        positions.push(halfSize);
        positions.push(0.0);
        positions.push(value);

        // Z axis
        positions.push(value);
        positions.push(0.0);
        positions.push(-halfSize);
        positions.push(value);
        positions.push(0.0);
        positions.push(halfSize);
    }

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    return {
        buffer: buffer,

        primitive: gl.LINES,

        startIndex: 0,
        endIndex: positions.length / 3,

        size: 3,
        type: gl.FLOAT,
        normalize: false,
        stride: 0,
        offset: 0,
    };
}
