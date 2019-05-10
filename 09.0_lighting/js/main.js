"use strict";

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

    // Spheres
    const sphereGeometry = generateSphereSolidGeometry(gl, 16, 32, false);

    const sphereUniformValues = [
        { name: "u_colour", value: [0.0, 0.0, 1.0, 1.0] },
        { name: "u_specular", value: [1.0, 1.0, 1.0] },
        { name: "u_specularPower", value: 100.0 },
    ];
    const sphereGameObject = new GameObject(gl, sphereGeometry, LIT_COLOURED_VERTEX, LIT_COLOURED_FRAGMENT, sphereUniformValues, false);
    sphereGameObject.position[1] = 0.5;
    sphereGameObject.position[2] = 1.0;
    sphereGameObject.scale[0] = 1.5;
    sphereGameObject.scale[1] = 1.5;
    sphereGameObject.scale[2] = 1.5;
    gridGameObject.children.push(sphereGameObject);

    // Un-comment this to see the normals for the sphere.
    //addNormalsVisualization(gl, sphereGameObject);

    // Cubes
    const cubeUniformValues = [
        { name: "u_colour", value: [1.0, 0.0, 0.0, 1.0] },
        { name: "u_specular", value: [1.0, 1.0, 1.0] },
        { name: "u_specularPower", value: 20.0 },
    ];
    const cubeGeometry = generateCubeSolidGeometry(gl, false);
    const cubeGameObject = new GameObject(gl, cubeGeometry, LIT_COLOURED_VERTEX, LIT_COLOURED_FRAGMENT, cubeUniformValues, false);
    cubeGameObject.position[1] = 0.6;
    cubeGameObject.position[2] = -1.0;
    gridGameObject.children.push(cubeGameObject);

    // Un-comment this to see the normals for the sphere.
    //addNormalsVisualization(gl, cubeGameObject);

    // Setup
    gl.clearColor(0, 0, 0, 1);

    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.FRONT);
    gl.enable(gl.DEPTH_TEST);

    const CAMERA_DIST = 3.0;

    const update = function (t) {
        cubeGameObject.rotation[1] = t * 0.5;
    };

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
                2.0,
                Math.sin(t * 0.2) * CAMERA_DIST,
            ],
            [0, 0, 0],
            [0, 1, 0]
        );

        // We transform our light direction by the camera matrix to get it in camera coordinates.
        const lightDirection = glMatrix.vec3.create();
        glMatrix.vec3.set(lightDirection, 1.0, 0.8, 0.2);
        const camera3 = glMatrix.mat3.create();
        glMatrix.mat3.fromMat4(camera3, camera);
        glMatrix.vec3.transformMat3(lightDirection, lightDirection, camera3);
        glMatrix.vec3.normalize(lightDirection, lightDirection);

        const renderInfo = {
            projection: projection,
            camera: camera,
            lightDirection: lightDirection,
            lightColour: [1.0, 1.0, 1.0],
            ambientLight: [0.1, 0.1, 0.1],
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
        update(seconds);
        render(seconds);
    };

    animate(0);
}
