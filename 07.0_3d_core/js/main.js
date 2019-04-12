"use strict";

const VERTEX_SHADER_SOURCE = `
    attribute vec3 a_position;

    uniform mat4 u_world;
    uniform mat4 u_camera;
    uniform mat4 u_projection;

    void main () {
        gl_Position = u_projection * u_camera * u_world * vec4(a_position, 1.0);
    }
`;

const FRAGMENT_SHADER_SOURCE = `
    precision highp float;

    uniform vec3 u_colour;

    void main () {
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

    const program = Util.createProgram(gl, VERTEX_SHADER_SOURCE, FRAGMENT_SHADER_SOURCE);
    gl.useProgram(program);

    const postionAttribute = gl.getAttribLocation(program, "a_position");
    const worldUniform = gl.getUniformLocation(program, "u_world");
    const cameraUniform = gl.getUniformLocation(program, "u_camera");
    const projectionUniform = gl.getUniformLocation(program, "u_projection");
    const colourUniform = gl.getUniformLocation(program, "u_colour");

    gl.enableVertexAttribArray(postionAttribute);

    const squarePositions = new Float32Array([
        -1, 0, -1,
        -1, 0,  1,

        -1, 0,  1,
         1, 0,  1,

         1, 0,  1,
         1, 0, -1,

         1, 0, -1,
        -1, 0, -1,
    ]);
    const squareBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, squareBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, squarePositions, gl.STATIC_DRAW);

    const uniforms = {
        world: worldUniform,
        colour: colourUniform,
    };

    const geometry = {
        buffer: squareBuffer,
        start: 0,
        numPoints: squarePositions.length / 3,
        attribute: postionAttribute,
        size: 3,
        type: gl.FLOAT,
        normalize: false,
        stride: 0,
        offset: 0,
        primitive: gl.LINES,
    };

    const squareGameObject = new GameObject(geometry);
    squareGameObject.colour[0] = 0;
    squareGameObject.colour[1] = 1;
    squareGameObject.colour[2] = 1;

    const square2GameObject = new GameObject(geometry);
    square2GameObject.colour[0] = 1;
    square2GameObject.colour[1] = 0;
    square2GameObject.colour[2] = 1;
    square2GameObject.position[0] = 3;

    squareGameObject.children.push(square2GameObject);

    const render = function (t) {
        Util.resizeCanvas(canvas);

        const aspect = canvas.width / canvas.height;

        const projection = glMatrix.mat4.create();
        glMatrix.mat4.perspective(projection, Math.PI / 2.0, aspect, 0.1, 100.0);
        gl.uniformMatrix4fv(projectionUniform, false, projection);
        const camera = glMatrix.mat4.create();
        glMatrix.mat4.lookAt(camera, [4, 2, 3], [0, 0, 0], [0, 1, 0]);
        gl.uniformMatrix4fv(cameraUniform, false, camera);

        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);

        squareGameObject.rotation[1] = t;
        square2GameObject.rotation[1] = t;

        squareGameObject.draw(gl, glMatrix.mat4.create(), uniforms);

        /*
        // Square
        {
            const world = glMatrix.mat4.create();
            gl.uniformMatrix4fv(worldUniform, false, world);

            gl.uniform3fv(colourUniform, [1, 0, 1]);

            gl.bindBuffer(gl.ARRAY_BUFFER, squareBuffer);
            gl.vertexAttribPointer(postionAttribute, 3, gl.FLOAT, false, 0, 0);
            gl.drawArrays(gl.LINES, 0, squarePositions.length / 3);
        }

        // Square
        {
            const world = glMatrix.mat4.create();
            glMatrix.mat4.fromTranslation(world, [2, 0, 0]);
            gl.uniformMatrix4fv(worldUniform, false, world);

            gl.uniform3fv(colourUniform, [1, 0, 0]);

            gl.bindBuffer(gl.ARRAY_BUFFER, squareBuffer);
            gl.vertexAttribPointer(postionAttribute, 3, gl.FLOAT, false, 0, 0);
            gl.drawArrays(gl.LINES, 0, squarePositions.length / 3);
        }

        // Square
        {
            const world = glMatrix.mat4.create();
            glMatrix.mat4.fromTranslation(world, [0, 0, 2]);
            gl.uniformMatrix4fv(worldUniform, false, world);

            gl.uniform3fv(colourUniform, [0, 1, 0]);

            gl.bindBuffer(gl.ARRAY_BUFFER, squareBuffer);
            gl.vertexAttribPointer(postionAttribute, 3, gl.FLOAT, false, 0, 0);
            gl.drawArrays(gl.LINES, 0, squarePositions.length / 3);
        }
        */
    };

    const animate = function (milliseconds) {
        window.requestAnimationFrame(animate);

        const seconds = milliseconds / 1000;
        render(seconds);
    };

    animate(0);
}
