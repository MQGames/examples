"use strict";

const VERTEX_SHADER_SOURCE = `
    attribute vec4 aPosition;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;
    uniform float uLocked;
    uniform mat4 uExampleModelMatrix;
    uniform mat4 uExampleViewMatrix;
    uniform mat4 uExampleProjectionMatrix;

    varying vec4 vExampleClipSpacePosition;

    void main() {
        if (uLocked == 1.0) {
            vExampleClipSpacePosition = vec4(0.0, 0.0, 0.0, 1.0);
            gl_Position = uProjectionMatrix * uModelViewMatrix * aPosition;
        }
        else {
            vExampleClipSpacePosition = uExampleProjectionMatrix * uExampleViewMatrix * uExampleModelMatrix * aPosition;
            gl_Position = uProjectionMatrix * uModelViewMatrix * vExampleClipSpacePosition;
        }
    }
`;

const FRAGMENT_SHADER_SOURCE = `
    precision highp float;

    uniform vec3 uColour;
    uniform float uLocked;
    uniform float uExampleClip;

    varying vec4 vExampleClipSpacePosition;

    void main() {
        if (uLocked == 1.0) {
            gl_FragColor = vec4(uColour, 1.0);
        }
        else {
            float inverseClip = 1.0 - uExampleClip;
            inverseClip *= inverseClip;
            inverseClip *= inverseClip;
            float clip = 1.0 - inverseClip;

            float x = vExampleClipSpacePosition.x;
            float y = vExampleClipSpacePosition.y;
            float z = vExampleClipSpacePosition.z;
            float w = mix(100.0, vExampleClipSpacePosition.w, clip);
            if (-w < x && x < w &&
                -w < y && y < w &&
                -w < z && z < w) {
                    gl_FragColor = vec4(uColour, 1.0);
                }
            else {
                discard;
            }
        }
    }
`;

const ANIMATION_SPEED = 2.0;
const SPIN_SPEED = 1.0;

// Local -> World -> View -> Projection -> Clip -> Perspective Divide -> NDC -> Screen

const Steps = {
    LOCAL: 0.0,
    WORLD: 1.0,
    VIEW: 2.0,
    PROJECTION: 3.0,
    CLIP: 4.0,
    SCREEN: 5.0,
};

const global = {
    gl: null,
    canvas: null,
    objects: [],
    exampleView: null,
    exampleProjection: null,
    lastTime: 0.0,
    currentLerp: Steps.LOCAL,
    targetLerp: Steps.LOCAL,
    progressingForwards: true,
    spinCube: null,
};
const isGlobal = newCheck(function (g) {
    return g === global;
});

let time = 0.0;

function start () {
    // Setup context
    const canvas = document.getElementById("_canvas_");
    const gl = canvas.getContext("webgl");
    if (gl === null) {
        window.alert("WebGL not supported!");
        return;
    }

    setupRenderSettings(gl);

    // User Interface
    {
        const text = document.getElementById("_space-name_");
        text.innerText = targetToName(global.targetLerp);

        const previous = document.getElementById("_space-previous_");
        previous.addEventListener("click", function () {
            if (global.targetLerp > Steps.LOCAL) {
                global.targetLerp -= 1.0;
                text.innerText = targetToName(global.targetLerp);
            }
        });

        const next = document.getElementById("_space-next_");
        next.addEventListener("click", function () {
            if (global.targetLerp < Steps.SCREEN) {
                global.targetLerp += 1.0;
                text.innerText = targetToName(global.targetLerp);
            }
        });
    }

    // Line program
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER_SOURCE);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SOURCE);
    const program = createProgram(gl, vertexShader, fragmentShader);
    const programInfo = {
        program: program,
        attributeLocations: {
            position: gl.getAttribLocation(program, "aPosition"),
        },
        uniformLocations: {
            projectionMatrix: gl.getUniformLocation(program, "uProjectionMatrix"),
            modelViewMatrix: gl.getUniformLocation(program, "uModelViewMatrix"),
            colour: gl.getUniformLocation(program, "uColour"),
            locked: gl.getUniformLocation(program, "uLocked"),
            exampleModelMatrix: gl.getUniformLocation(program, "uExampleModelMatrix"),
            exampleViewMatrix: gl.getUniformLocation(program, "uExampleViewMatrix"),
            exampleProjectionMatrix: gl.getUniformLocation(program, "uExampleProjectionMatrix"),
            exampleClip: gl.getUniformLocation(program, "uExampleClip"),
        },
    };

    // Line Geometry
    const lineGeometry = generateLineGeometry(gl);
    const boxGeometry = generateCubeGeometry(gl, 1.0);
    const boxGeometryW = generateCubeGeometry(gl, 1.0);

    const gridGeometry = generateGridGeometry(gl, 10.0, 10);

    const rotZ = glMatrix.mat4.create();
    glMatrix.mat4.fromZRotation(rotZ, Math.PI / 2.0);
    const rotY = glMatrix.mat4.create();
    glMatrix.mat4.fromYRotation(rotY, -Math.PI / 2.0);

    const gridMatrix = glMatrix.mat4.create();
    glMatrix.mat4.fromTranslation(gridMatrix, [0.0, -0.001, 0.0]);

    const xAxis = {
        geometry: lineGeometry,
        programInfo: programInfo,
        matrix: glMatrix.mat4.create(),
        locked: true,
        colour: [1.0, 0.0, 0.0],
        morph: false,
    };
    const yAxis = {
        geometry: lineGeometry,
        programInfo: programInfo,
        matrix: rotZ,
        locked: true,
        colour: [0.0, 1.0, 0.0],
        morph: false,
    };
    const zAxis = {
        geometry: lineGeometry,
        programInfo: programInfo,
        matrix: rotY,
        locked: true,
        colour: [0.0, 0.0, 1.0],
        morph: false,
    };
    const grid = {
        geometry: gridGeometry,
        programInfo: programInfo,
        matrix: gridMatrix,
        locked: true,
        colour: [0.3, 0.3, 0.3],
        morph: false,
    };

    const view = glMatrix.mat4.create();
    glMatrix.mat4.lookAt(view, [2.5, 1.5, 2.0], [0.0, 0.0, 0.0], [0.0, 1.0, 0.0]);
    const viewInverse = glMatrix.mat4.create();
    glMatrix.mat4.invert(viewInverse, view);
    global.exampleView = view;

    const nearSize = 0.5;
    const near = 0.5;
    const far = 10.0;
    const projection = glMatrix.mat4.create();
    glMatrix.mat4.frustum(projection, -nearSize, nearSize, -nearSize, nearSize, near, far);
    global.exampleProjection = projection;

    let bias = 0.0001;
    const biasedNearSize = nearSize - bias;
    const biasedNear = near + bias;
    const biasedFar = far - bias;
    const frustumGeometry = generateFrustumGeometry(gl, biasedNearSize, biasedNear, biasedFar);

    const smallBoxMatrix = glMatrix.mat4.create();
    glMatrix.mat4.fromScaling(smallBoxMatrix, [0.2, 0.2, 0.2]);

    const topBoxMatrix = glMatrix.mat4.create();
    glMatrix.mat4.fromTranslation(topBoxMatrix, [0.0, 0.6, 0.0]);
    glMatrix.mat4.multiply(topBoxMatrix, topBoxMatrix, smallBoxMatrix);

    const bigBoxMatrix = glMatrix.mat4.create();
    glMatrix.mat4.fromScaling(bigBoxMatrix, [4.0, 4.0, 4.0]);

    const frustum = {
        geometry: frustumGeometry,
        programInfo: programInfo,
        matrix: viewInverse,
        locked: false,
        colour: [1.0, 1.0, 1.0],
        morph: true,
    };
    const box = {
        geometry: boxGeometry,
        programInfo: programInfo,
        matrix: glMatrix.mat4.create(),
        locked: false,
        colour: [1.0, 1.0, 0.0],
        morph: true,
    };
    const topBox = {
        geometry: boxGeometryW,
        programInfo: programInfo,
        matrix: topBoxMatrix,
        locked: false,
        colour: [1.0, 1.0, 0.0],
        morph: true,
    };
    const bigBox = {
        geometry: boxGeometry,
        programInfo: programInfo,
        matrix: bigBoxMatrix,
        locked: false,
        colour: [1.0, 0.0, 1.0],
        morph: true,
    };

    global.gl = gl;
    global.canvas = canvas;
    global.objects = [xAxis, yAxis, zAxis, grid, box, topBox, bigBox, frustum];
    global.spinCube = box;

    animate(0);
}

function targetToName (target) {
    switch (target) {
        case Steps.LOCAL:
            return "Local";
        case Steps.WORLD:
            return "World/Model";
        case Steps.VIEW:
            return "Camera/View";
        case Steps.PROJECTION:
            return "Projection";
        case Steps.CLIP:
            return "Clipping & NDC";
        case Steps.SCREEN:
            return "Screen";
        default:
            return "Unknown";
    }
}

function setupRenderSettings (gl) {
    check(isContext(gl));

    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
}

function generateLineGeometry (gl) {
    check(isContext(gl));

    const positions = [
        0.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
    ];

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

function generateCubeGeometry (gl) {
    check(isContext(gl));

    const positions = [
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
    ];

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

function generateFrustumGeometry (gl, nearSize, near, far) {
    check(isContext(gl), isNumber(nearSize, near, far));

    const farSize = (far / near) * nearSize;
    const positions = [
        // x
        -nearSize, -nearSize, -near,
         nearSize, -nearSize, -near,
        -nearSize,  nearSize, -near,
         nearSize,  nearSize, -near,
        -farSize, -farSize, -far,
         farSize, -farSize, -far,
        -farSize,  farSize, -far,
         farSize,  farSize, -far,

        // y
        -nearSize, -nearSize, -near,
        -nearSize,  nearSize, -near,
         nearSize, -nearSize, -near,
         nearSize,  nearSize, -near,
        -farSize, -farSize, -far,
        -farSize,  farSize, -far,
         farSize, -farSize, -far,
         farSize,  farSize, -far,

        // z
        -nearSize, -nearSize, -near,
        -farSize, -farSize, -far,
         nearSize, -nearSize, -near,
         farSize, -farSize, -far,
        -nearSize,  nearSize, -near,
        -farSize,  farSize, -far,
         nearSize,  nearSize, -near,
         farSize,  farSize, -far,
    ];

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

function animate (milliseconds) {
    window.requestAnimationFrame(animate);

    resizeCanvas(global.canvas);

    const seconds = milliseconds / 1000;

    const deltaTime = seconds - global.lastTime;

    const sign = Math.sign(global.targetLerp - global.currentLerp);
    if (sign !== 0) {
        global.currentLerp += deltaTime * sign * ANIMATION_SPEED;
        if (Math.sign(global.targetLerp - global.currentLerp) !== sign) {
            global.currentLerp = global.targetLerp;
        }
    }

    glMatrix.mat4.fromYRotation(global.spinCube.matrix, seconds * SPIN_SPEED);

    render(global.gl, global.objects, seconds, global.exampleView, global.exampleProjection, global.currentLerp);

    global.lastTime = seconds;
}

function clamp01 (x) {
    check(isNumber(x));
    return Math.max(Math.min(x, 1.0), 0.0);
}


function smoothstep (x) {
    check(isNumber(x));
    return x * x * (3.0 - 2.0 * x);
}

function render (gl, objects, time, exampleView, exampleProjection, currentLerp) {
    check(isContext(gl), isArray(objects), isNumber(time, currentLerp), isMat4(exampleView, exampleProjection));

    const weights = {
        world: smoothstep(clamp01(currentLerp - Steps.LOCAL)),
        view: smoothstep(clamp01(currentLerp - Steps.WORLD)),
        projection: smoothstep(clamp01(currentLerp - Steps.VIEW)),
        clip: smoothstep(clamp01(currentLerp - Steps.PROJECTION)),
        screen: smoothstep(clamp01(currentLerp - Steps.CLIP)),
    };

    // Main
    {
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.clearColor(0.2, 0.2, 0.2, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        const fieldOfView = 60.0 * Math.PI / 180.0;
        const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
        const zNear = 0.1;
        const zFar = 100.0;
        const orbitProjectionMatrix = glMatrix.mat4.create();
        glMatrix.mat4.perspective(orbitProjectionMatrix, fieldOfView, aspect, zNear, zFar);

        const angle = time * 0.1;
        const distance = 6.0;

        const orbitViewMatrix = glMatrix.mat4.create();
        glMatrix.mat4.lookAt(orbitViewMatrix, [Math.sin(angle) * distance, distance * 0.3, Math.cos(angle) * distance], [0.0, 0.0, 0.0], [0.0, 1.0, 0.0]);

        const projectionMatrix = glMatrix.mat4.create();
        glMatrix.mat4.ortho(projectionMatrix, -aspect, aspect, -1.0, 1.0, 1.0, -1.0);
        lerpMatrix(projectionMatrix, orbitProjectionMatrix, projectionMatrix, weights.screen);

        const viewMatrix = glMatrix.mat4.create();
        lerpMatrix(viewMatrix, orbitViewMatrix, viewMatrix, weights.screen);

        const lerpedExampleView = glMatrix.mat4.create();
        lerpMatrix(lerpedExampleView, lerpedExampleView, exampleView, weights.view);

        const lerpedExampleProjection = glMatrix.mat4.create();
        lerpMatrix(lerpedExampleProjection, lerpedExampleProjection, exampleProjection, weights.projection);

        for (let i = 0; i < objects.length; i++) {
            const object3d = objects[i];

            // Geometry
            const geometry = object3d.geometry;
            gl.bindBuffer(gl.ARRAY_BUFFER, geometry.buffer);
            gl.vertexAttribPointer(object3d.programInfo.attributeLocations.position, geometry.size, geometry.type, geometry.normalize, geometry.stride, geometry.offset);
            gl.enableVertexAttribArray(object3d.programInfo.attributeLocations.position);

            // Matrix setup
            const modelViewMatrix = glMatrix.mat4.clone(object3d.matrix);
            glMatrix.mat4.multiply(modelViewMatrix, viewMatrix, modelViewMatrix);
            const lerpedExampleModel = glMatrix.mat4.create();
            lerpMatrix(lerpedExampleModel, lerpedExampleModel, object3d.matrix, weights.world);

            // Shaders & uniforms
            gl.useProgram(object3d.programInfo.program);
            if (object3d.locked) {
                gl.uniform1f(object3d.programInfo.uniformLocations.locked, 1.0);
                gl.uniformMatrix4fv(object3d.programInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix);
            }
            else {
                gl.uniform1f(object3d.programInfo.uniformLocations.locked, 0.0);
                gl.uniformMatrix4fv(object3d.programInfo.uniformLocations.modelViewMatrix, false, viewMatrix); // If it's an example, it's already had the model matrix applied.
            }
            gl.uniformMatrix4fv(object3d.programInfo.uniformLocations.projectionMatrix, false, projectionMatrix);
            gl.uniformMatrix4fv(object3d.programInfo.uniformLocations.exampleModelMatrix, false, lerpedExampleModel);
            gl.uniformMatrix4fv(object3d.programInfo.uniformLocations.exampleViewMatrix, false, lerpedExampleView);
            gl.uniformMatrix4fv(object3d.programInfo.uniformLocations.exampleProjectionMatrix, false, lerpedExampleProjection);
            gl.uniform1f(object3d.programInfo.uniformLocations.exampleClip, weights.clip);
            gl.uniform3fv(object3d.programInfo.uniformLocations.colour, object3d.colour);

            gl.drawArrays(geometry.primitive, geometry.startIndex, geometry.endIndex);
        }
    }

    // Preview
    {
        gl.enable(gl.SCISSOR_TEST);

        const size = 256;
        gl.scissor(gl.canvas.width - size, gl.canvas.height - size, size, size);
        gl.viewport(gl.canvas.width - size, gl.canvas.height - size, size, size);
        gl.clearColor(0.1, 0.1, 0.1, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        for (let i = 0; i < objects.length; i++) {
            const object3d = objects[i];

            if (object3d.locked) {
                continue;
            }

            gl.useProgram(object3d.programInfo.program);

            // Geometry
            const geometry = object3d.geometry;
            gl.bindBuffer(gl.ARRAY_BUFFER, geometry.buffer);
            gl.vertexAttribPointer(object3d.programInfo.attributeLocations.position, geometry.size, geometry.type, geometry.normalize, geometry.stride, geometry.offset);
            gl.enableVertexAttribArray(object3d.programInfo.attributeLocations.position);

            // Matrix setup
            const modelViewMatrix = glMatrix.mat4.clone(object3d.matrix);
            glMatrix.mat4.multiply(modelViewMatrix, exampleView, modelViewMatrix);
            const identityMatrix = glMatrix.mat4.create();

            // Shaders & uniforms
            gl.uniform1f(object3d.programInfo.uniformLocations.locked, 1.0);
            gl.uniformMatrix4fv(object3d.programInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix);
            gl.uniformMatrix4fv(object3d.programInfo.uniformLocations.projectionMatrix, false, exampleProjection);
            gl.uniformMatrix4fv(object3d.programInfo.uniformLocations.exampleModelMatrix, false, identityMatrix);
            gl.uniformMatrix4fv(object3d.programInfo.uniformLocations.exampleViewMatrix, false, identityMatrix);
            gl.uniformMatrix4fv(object3d.programInfo.uniformLocations.exampleProjectionMatrix, false, identityMatrix);
            gl.uniform1f(object3d.programInfo.uniformLocations.exampleClip, 0.0);
            gl.uniform3fv(object3d.programInfo.uniformLocations.colour, object3d.colour);

            gl.drawArrays(geometry.primitive, geometry.startIndex, geometry.endIndex);
        }

        gl.disable(gl.SCISSOR_TEST);
    }
}

function lerpMatrix (out, a, b, t) {
    const _t = 1.0 - t;
    out[ 0] = (a[ 0] * _t) + (b[ 0] * t);
    out[ 1] = (a[ 1] * _t) + (b[ 1] * t);
    out[ 2] = (a[ 2] * _t) + (b[ 2] * t);
    out[ 3] = (a[ 3] * _t) + (b[ 3] * t);
    out[ 4] = (a[ 4] * _t) + (b[ 4] * t);
    out[ 5] = (a[ 5] * _t) + (b[ 5] * t);
    out[ 6] = (a[ 6] * _t) + (b[ 6] * t);
    out[ 7] = (a[ 7] * _t) + (b[ 7] * t);
    out[ 8] = (a[ 8] * _t) + (b[ 8] * t);
    out[ 9] = (a[ 9] * _t) + (b[ 9] * t);
    out[10] = (a[10] * _t) + (b[10] * t);
    out[11] = (a[11] * _t) + (b[11] * t);
    out[12] = (a[12] * _t) + (b[12] * t);
    out[13] = (a[13] * _t) + (b[13] * t);
    out[14] = (a[14] * _t) + (b[14] * t);
    out[15] = (a[15] * _t) + (b[15] * t);
}

function resizeCanvas (canvas) {
    check(isCanvas(canvas));

    const cssToRealPixels = window.devicePixelRatio || 1.0;

    const displayWidth = Math.floor(canvas.clientWidth  * cssToRealPixels);
    const displayHeight = Math.floor(canvas.clientHeight * cssToRealPixels);

    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        return true;
    }
    else {
        return false;
    }
}

function createShader (gl, type, source) {
    check(isContext(gl), isString(source));

    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!success) {
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

function createProgram (gl, vertexShader, fragmentShader) {
    check(isContext(gl), isShader(vertexShader), isShader(fragmentShader));

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    const success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!success) {
        console.error(gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return null;
    }

    return program;
}
