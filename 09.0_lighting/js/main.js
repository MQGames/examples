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

const LIT_COLOURED_VERTEX = `
    attribute vec3 a_position;
    attribute vec3 a_colour;
    attribute vec3 a_normal;

    uniform mat4 u_world;
    uniform mat4 u_camera;
    uniform mat4 u_projection;

    varying vec3 v_colour;
    varying vec3 v_normal;

    void main () {
        v_colour = a_colour;
        v_normal = a_normal;
        gl_Position = u_projection * u_camera * u_world * vec4(a_position, 1.0);
    }
`;

const LIT_COLOURED_FRAGMENT = `
    precision highp float;

    const vec3 LIGHT_DIRECTION = normalize(vec3(1.0, 0.5, 0.25));

    uniform vec4 u_colour;

    varying vec3 v_colour;
    varying vec3 v_normal;

    void main () {
        vec3 diffuse = u_colour.rgb * v_colour;
        diffuse *= dot(normalize(v_normal), LIGHT_DIRECTION);
        gl_FragColor = vec4(diffuse, u_colour.a);
    }
`;

function start () {
    // Setup context
    const canvas = document.getElementById("_canvas_");
    const gl = canvas.getContext("webgl", {
        antialias: true,
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

    /*
    // Cube A
    const cubeUniformValuesA = [
        { name: "u_colour", value: [1.0, 1.0, 1.0, 1.0] },
    ];
    const cubeGeometryA = generateCubeSolidGeometry(gl, true);
    const cubeGameObjectA = new GameObject(gl, cubeGeometryA, LIT_COLOURED_VERTEX, LIT_COLOURED_FRAGMENT, cubeUniformValuesA, false);
    cubeGameObjectA.position[1] = 0.5;
    cubeGameObjectA.scale[0] = 2.0;
    cubeGameObjectA.scale[1] = 1.1;
    cubeGameObjectA.scale[2] = 2.0;
    gridGameObject.children.push(cubeGameObjectA);
    */
    const sphereUniformValuesA = [
        { name: "u_colour", value: [1.0, 1.0, 1.0, 1.0] },
    ];
    const sphereGeometryA = generateSphereSolidGeometry(gl, 16, 32, false);
    const sphereGameObjectA = new GameObject(gl, sphereGeometryA, LIT_COLOURED_VERTEX, LIT_COLOURED_FRAGMENT, sphereUniformValuesA, false);
    sphereGameObjectA.position[1] = 0.5;
    sphereGameObjectA.scale[0] = 1.5;
    sphereGameObjectA.scale[1] = 1.5;
    sphereGameObjectA.scale[2] = 1.5;
    gridGameObject.children.push(sphereGameObjectA);

    // Cube B
    const cubeUniformValuesB = [
        { name: "u_colour", value: [1.0, 0.0, 0.0, 1.0] },
    ];
    const cubeGeometryB = generateCubeSolidGeometry(gl, false);
    const cubeGameObjectB = new GameObject(gl, cubeGeometryB, LIT_COLOURED_VERTEX, LIT_COLOURED_FRAGMENT, cubeUniformValuesB, false);
    cubeGameObjectB.position[0] = 2.0;
    cubeGameObjectB.position[1] = 0.5;
    gridGameObject.children.push(cubeGameObjectB);

    /*
    // Cube C
    const cubeUniformValuesC = [
        { name: "u_colour", value: [0.0, 1.0, 0.0, 1.0] },
    ];
    const cubeGeometryC = generateCubeSolidGeometry(gl, true);
    const cubeGameObjectC = new GameObject(gl, cubeGeometryC, LIT_COLOURED_VERTEX, LIT_COLOURED_FRAGMENT, cubeUniformValuesC, false);
    cubeGameObjectC.position[0] = -1.5;
    cubeGameObjectC.position[1] = 0.5;
    gridGameObject.children.push(cubeGameObjectC);

    // Cube D
    const cubeUniformValuesD = [
        { name: "u_colour", value: [0.0, 0.5, 0.5, 0.5] },
    ];
    const cubeGeometryD = generateCubeSolidGeometry(gl, false);
    const cubeGameObjectD = new GameObject(gl, cubeGeometryD, LIT_COLOURED_VERTEX, LIT_COLOURED_FRAGMENT, cubeUniformValuesD, true);
    cubeGameObjectD.position[1] = 0.5;
    cubeGameObjectD.position[2] = -1.5;
    gridGameObject.children.push(cubeGameObjectD);

    // Cube E
    const cubeUniformValuesE = [
        { name: "u_colour", value: [0.5, 0.5, 0.0, 0.5] },
    ];
    const cubeGeometryE = generateCubeSolidGeometry(gl, false);
    const cubeGameObjectE = new GameObject(gl, cubeGeometryE, LIT_COLOURED_VERTEX, LIT_COLOURED_FRAGMENT, cubeUniformValuesE, true);
    cubeGameObjectE.position[1] = 0.5;
    cubeGameObjectE.position[2] = 1.5;
    gridGameObject.children.push(cubeGameObjectE);
    */

    // Setup
    gl.clearColor(0, 0, 0, 1);

    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.FRONT);
    gl.enable(gl.DEPTH_TEST);

    const CAMERA_DIST = 3.0;

    const render = function (t) {
        Util.resizeCanvas(canvas);

        const aspect = canvas.width / canvas.height;

        const projection = glMatrix.mat4.create();
        glMatrix.mat4.perspective(projection, Math.PI / 2.0, aspect, 0.1, 100.0);

        const camera = glMatrix.mat4.create();
        glMatrix.mat4.lookAt(
            camera,
            [
                Math.cos(t * 0.2) * CAMERA_DIST,
                //Math.cos(t * 0.3) * CAMERA_DIST + 1.0,
                2.0,
                Math.sin(t * 0.2) * CAMERA_DIST,
            ],
            [0, 0, 0],
            [0, 1, 0]
        );

        cubeGameObjectB.rotation[1] = t;

        const renderInfo = {
            projection: projection,
            camera: camera,
        };

        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // Opaque
        gl.depthMask(true);
        gl.disable(gl.BLEND);
        gridGameObject.draw(gl, glMatrix.mat4.create(), renderInfo, false);

        // Transparent
        gl.depthMask(false);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gridGameObject.draw(gl, glMatrix.mat4.create(), renderInfo, true);
    };

    const animate = function (milliseconds) {
        window.requestAnimationFrame(animate);

        const seconds = milliseconds / 1000;
        render(seconds);
    };

    animate(0);
}
