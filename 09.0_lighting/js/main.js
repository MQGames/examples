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
    //attribute vec3 a_normal;

    uniform mat4 u_world;
    uniform mat4 u_camera;
    uniform mat4 u_projection;
    //uniform mat3 u_normal;

    varying vec3 v_colour;
    //varying vec3 v_normal;
    //varying vec3 v_cameraSpacePosition;

    void main () {
        v_colour = a_colour;
        //v_normal = u_normal * a_normal;

        //v_cameraSpacePosition = (u_camera * u_world * vec4(a_position, 1.0)).xyz;

        gl_Position = u_projection * u_camera * u_world * vec4(a_position, 1.0);
    }
`;

const LIT_COLOURED_FRAGMENT = `
    precision highp float;

    //uniform vec3 u_lightDirection;
    //uniform vec3 u_lightColour;
    //uniform vec3 u_ambientLight;
    //uniform vec3 u_specular;
    //uniform float u_specularPower;

    uniform vec4 u_colour;

    varying vec3 v_colour;
    //varying vec3 v_normal;
    //varying vec3 v_cameraSpacePosition;

    void main () {
        vec3 material = u_colour.rgb * v_colour;

        gl_FragColor = vec4(material, u_colour.a);

        /*
        vec3 normal = normalize(v_normal);

        vec3 diffuse = u_lightColour * max(0.0, dot(normalize(normal), u_lightDirection));
        vec3 viewDirection = normalize(-v_cameraSpacePosition);
        vec3 halfway = normalize(viewDirection + u_lightDirection);
        vec3 specular = u_lightColour * pow(max(dot(halfway, normal), 0.0), u_specularPower);

        vec3 final = material * (u_ambientLight + diffuse) + specular;
        gl_FragColor = vec4(final, u_colour.a);
        */
    }
`;

/*
const NORMAL_VERTEX = `
    attribute vec3 a_position;
    attribute vec3 a_normal;

    uniform mat4 u_world;
    uniform mat4 u_camera;
    uniform mat4 u_projection;
    uniform mat3 u_normal;

    varying vec3 v_normal;

    void main () {
        v_normal = u_normal * a_normal;
        gl_Position = u_projection * u_camera * u_world * vec4(a_position, 1.0);
    }
`;

const NORMAL_FRAGMENT = `
    precision highp float;

    varying vec3 v_normal;

    void main () {
        gl_FragColor = vec4(v_normal, 1.0);
    }
`;
*/

let correct_normals = false;

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
    const sphereGeometry = generateSphereSolidGeometry(gl, 16, 32, true);

    const sphereUniformValuesA = [
        { name: "u_colour", value: [1.0, 1.0, 1.0, 1.0] },
        { name: "u_specular", value: [1.0, 1.0, 1.0] },
        { name: "u_specularPower", value: 20.0 },
    ];
    const sphereGameObjectA = new GameObject(gl, sphereGeometry, LIT_COLOURED_VERTEX, LIT_COLOURED_FRAGMENT, sphereUniformValuesA, false);
    sphereGameObjectA.position[1] = 0.5;
    sphereGameObjectA.scale[0] = 1.5;
    sphereGameObjectA.scale[1] = 1.5;
    sphereGameObjectA.scale[2] = 1.5;
    gridGameObject.children.push(sphereGameObjectA);
    //addNormalsVisualization(gl, sphereGameObjectA);

    /*
    const sphereUniformValuesB = [
        { name: "u_colour", value: [0.2, 1.0, 0.2, 1.0] },
        { name: "u_specular", value: [1.0, 1.0, 1.0] },
        { name: "u_specularPower", value: 20.0 },
    ];
    const sphereGameObjectB = new GameObject(gl, sphereGeometry, LIT_COLOURED_VERTEX, LIT_COLOURED_FRAGMENT, sphereUniformValuesB, false);
    sphereGameObjectB.position[0] = -2.0;
    sphereGameObjectB.position[1] = 0.5;
    sphereGameObjectB.scale[0] = 1.5;
    sphereGameObjectB.scale[1] = 1.5;
    sphereGameObjectB.scale[2] = 1.5;
    gridGameObject.children.push(sphereGameObjectB);
    //addNormalsVisualization(gl, sphereGameObjectB);

    const sphereUniformValuesC = [
        { name: "u_colour", value: [0.2, 0.2, 1.0, 1.0] },
        { name: "u_specular", value: [1.0, 1.0, 1.0] },
        { name: "u_specularPower", value: 20.0 },
    ];
    const sphereGameObjectC = new GameObject(gl, sphereGeometry, LIT_COLOURED_VERTEX, LIT_COLOURED_FRAGMENT, sphereUniformValuesC, false);
    sphereGameObjectC.position[0] = 2.0;
    sphereGameObjectC.position[1] = 0.5;
    sphereGameObjectC.scale[0] = 1.5;
    sphereGameObjectC.scale[1] = 1.5;
    sphereGameObjectC.scale[2] = 1.5;
    gridGameObject.children.push(sphereGameObjectC);
    */

    // Cubes
    const cubeUniformValuesB = [
        { name: "u_colour", value: [1.0, 0.0, 0.0, 1.0] },
        { name: "u_specular", value: [1.0, 1.0, 1.0] },
        { name: "u_specularPower", value: 20.0 },
    ];
    const cubeGeometryB = generateCubeSolidGeometry(gl, true);
    const cubeGameObjectB = new GameObject(gl, cubeGeometryB, LIT_COLOURED_VERTEX, LIT_COLOURED_FRAGMENT, cubeUniformValuesB, false);
    cubeGameObjectB.position[1] = 0.6;
    cubeGameObjectB.position[2] = -2.0;
    gridGameObject.children.push(cubeGameObjectB);
    //addNormalsVisualization(gl, cubeGameObjectB);

    // Setup
    gl.clearColor(0, 0, 0, 1);

    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.FRONT);
    gl.enable(gl.DEPTH_TEST);

    const CAMERA_DIST = 3.0;

    const update = function (t) {
        //cubeGameObjectB.rotation[1] = t;
        //sphereGameObjectA.scale[1] = 2.5 + Math.sin(t * 0.75) * 1.5;
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
                //0.0,
                //2.0,
                //3.0,
            ],
            [0, 0, 0],
            [0, 1, 0]
        );

        //const lightDirection = glMatrix.vec4.create();
        //glMatrix.vec4.set(lightDirection, Math.cos(-t), 1.0, Math.sin(-t), 0.0);
        //glMatrix.vec4.transformMat4(lightDirection, lightDirection, camera);
        //glMatrix.vec4.normalize(lightDirection, lightDirection);

        const renderInfo = {
            projection: projection,
            camera: camera,
            //lightDirection: [lightDirection[0], lightDirection[1], lightDirection[2]],
            //lightColour: [1.0, 1.0, 1.0],
            //ambientLight: [0.1, 0.1, 0.1],
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
