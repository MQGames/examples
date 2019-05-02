"use strict";

const BASIC_VERTEX = `
    attribute vec3 a_position;

    uniform mat4 u_world;
    uniform mat4 u_camera;
    uniform mat4 u_projection;

    void main () {
        gl_Position = u_projection * u_camera * u_world * vec4(a_position, 1.0);
    }
`;

const BASIC_FRAGMENT = `
    precision highp float;

    uniform vec3 u_colour;

    void main () {
        gl_FragColor = vec4(u_colour, 1.0);
    }
`;

const COLOURED_VERTEX = `
    attribute vec3 a_position;
    attribute vec3 a_colour;

    uniform mat4 u_world;
    uniform mat4 u_camera;
    uniform mat4 u_projection;

    varying vec3 v_colour;

    void main () {
        v_colour = a_colour;
        gl_Position = u_projection * u_camera * u_world * vec4(a_position, 1.0);
    }
`;

const COLOURED_FRAGMENT = `
    precision highp float;

    uniform vec4 u_colour;

    varying vec3 v_colour;

    void main () {
        gl_FragColor = vec4(u_colour.rgb * v_colour, u_colour.a);
    }
`;

function start () {
    // Setup context
    const canvas = document.getElementById("_canvas_");
    const gl = canvas.getContext("webgl", {
        //antialias: true,
    });
    if (gl === null) {
        window.alert("WebGL not supported!");
        return;
    }

    // Grid
    const gridUniformValues = [
        { name: "u_colour", value: [0.4, 0.4, 0.4] },
    ];
    const gridGeometry = generateGridGeometry(gl, 10.0, 10);
    const gridGameObject = new GameObject(gl, gridGeometry, BASIC_VERTEX, BASIC_FRAGMENT, gridUniformValues, false);

    // Cube A
    const cubeUniformValuesA = [
        { name: "u_colour", value: [1.0, 1.0, 1.0, 1.0] },
    ];
    const cubeGeometryA = generateCubeSolidGeometry(gl, true);
    const cubeGameObjectA = new GameObject(gl, cubeGeometryA, COLOURED_VERTEX, COLOURED_FRAGMENT, cubeUniformValuesA, false);
    cubeGameObjectA.position[1] = 0.5;
    gridGameObject.children.push(cubeGameObjectA);

    // Cube B
    const cubeUniformValuesB = [
        { name: "u_colour", value: [1.0, 0.0, 0.0, 1.0] },
    ];
    const cubeGeometryB = generateCubeSolidGeometry(gl, true);
    const cubeGameObjectB = new GameObject(gl, cubeGeometryB, COLOURED_VERTEX, COLOURED_FRAGMENT, cubeUniformValuesB, false);
    cubeGameObjectB.position[0] = 1.5;
    cubeGameObjectB.position[1] = 0.5;
    gridGameObject.children.push(cubeGameObjectB);

    // Cube C
    const cubeUniformValuesC = [
        { name: "u_colour", value: [0.0, 1.0, 0.0, 1.0] },
    ];
    const cubeGeometryC = generateCubeSolidGeometry(gl, true);
    const cubeGameObjectC = new GameObject(gl, cubeGeometryC, COLOURED_VERTEX, COLOURED_FRAGMENT, cubeUniformValuesC, false);
    cubeGameObjectC.position[0] = -1.5;
    cubeGameObjectC.position[1] = 0.5;
    gridGameObject.children.push(cubeGameObjectC);

    /*
    // Cube D
    const cubeUniformValuesD = [
        { name: "u_colour", value: [0.0, 1.0, 0.5, 0.5] },
    ];
    const cubeGeometryD = generateCubeSolidGeometry(gl, false);
    const cubeGameObjectD = new GameObject(gl, cubeGeometryD, COLOURED_VERTEX, COLOURED_FRAGMENT, cubeUniformValuesD, true);
    cubeGameObjectD.position[1] = 0.5;
    cubeGameObjectD.position[2] = -1.5;
    gridGameObject.children.push(cubeGameObjectD);

    // Cube E
    const cubeUniformValuesE = [
        { name: "u_colour", value: [1.0, 1.0, 0.0, 0.5] },
    ];
    const cubeGeometryE = generateCubeSolidGeometry(gl, false);
    const cubeGameObjectE = new GameObject(gl, cubeGeometryE, COLOURED_VERTEX, COLOURED_FRAGMENT, cubeUniformValuesE, true);
    cubeGameObjectE.position[1] = 0.5;
    cubeGameObjectE.position[2] = 1.5;
    gridGameObject.children.push(cubeGameObjectE);
    */

    // Setup
    gl.clearColor(0, 0, 0, 1);

    //gl.enable(gl.CULL_FACE);
    //gl.cullFace(gl.FRONT);
    //gl.enable(gl.DEPTH_TEST);

    const render = function (t) {
        Util.resizeCanvas(canvas);

        const aspect = canvas.width / canvas.height;

        const projection = glMatrix.mat4.create();
        glMatrix.mat4.perspective(projection, Math.PI / 2.0, aspect, 0.1, 100.0);

        const camera = glMatrix.mat4.create();
        glMatrix.mat4.lookAt(camera, [Math.cos(t * 0.2) * 2.0, 2, Math.sin(t * 0.2) * 2.0], [0, 0, 0], [0, 1, 0]);

        const renderInfo = {
            projection: projection,
            camera: camera,
        };

        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        cubeGameObjectA.rotation[1] = t;

        // Opaque
        //gl.depthMask(true);
        //gl.disable(gl.BLEND);
        gridGameObject.draw(gl, glMatrix.mat4.create(), renderInfo, false);

        // Transparent
        //gl.depthMask(false);
        //gl.enable(gl.BLEND);
        //gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gridGameObject.draw(gl, glMatrix.mat4.create(), renderInfo, true);
    };

    const animate = function (milliseconds) {
        window.requestAnimationFrame(animate);

        const seconds = milliseconds / 1000;
        render(seconds);
    };

    animate(0);
}
