"use strict";

/*
class Geometry {
    constructor () {

    }
}
const isGeometry = newCheck(function (g) {
    return g instanceof Geometry;
});
*/

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
        primitive: gl.LINES,
        startIndex: 0,
        numVerticies: positions.length / 3,
        buffers: [
            {
                attributeName: "a_position",
                pointer: buffer,
                size: 3,
                type: gl.FLOAT,
                normalize: false,
                stride: 0,
                offset: 0,
            },
        ]
    };
}

function generateCubeSolidGeometry (gl, randomColours) {
    check(isContext(gl), isBoolean(randomColours));

    const positions = new Float32Array([
        // x
        -0.5, -0.5, -0.5,
        -0.5,  0.5, -0.5,
        -0.5, -0.5,  0.5,

        -0.5,  0.5, -0.5,
        -0.5,  0.5,  0.5,
        -0.5, -0.5,  0.5,

         0.5, -0.5, -0.5,
         0.5, -0.5,  0.5,
         0.5,  0.5, -0.5,

         0.5,  0.5, -0.5,
         0.5, -0.5,  0.5,
         0.5,  0.5,  0.5,

        // y
        -0.5, -0.5, -0.5,
        -0.5, -0.5,  0.5,
         0.5, -0.5, -0.5,

         0.5, -0.5, -0.5,
        -0.5, -0.5,  0.5,
         0.5, -0.5,  0.5,

        -0.5,  0.5, -0.5,
         0.5,  0.5, -0.5,
        -0.5,  0.5,  0.5,

         0.5,  0.5, -0.5,
         0.5,  0.5,  0.5,
        -0.5,  0.5,  0.5,

        // z
        -0.5, -0.5, -0.5,
         0.5, -0.5, -0.5,
        -0.5,  0.5, -0.5,

         0.5, -0.5, -0.5,
         0.5,  0.5, -0.5,
        -0.5,  0.5, -0.5,

        -0.5, -0.5,  0.5,
        -0.5,  0.5,  0.5,
         0.5, -0.5,  0.5,

         0.5, -0.5,  0.5,
        -0.5,  0.5,  0.5,
         0.5,  0.5,  0.5,
    ]);

    const normals = new Float32Array([
        // x
        -1.0,  0.0,  0.0,
        -1.0,  0.0,  0.0,
        -1.0,  0.0,  0.0,

        -1.0,  0.0,  0.0,
        -1.0,  0.0,  0.0,
        -1.0,  0.0,  0.0,

         1.0,  0.0,  0.0,
         1.0,  0.0,  0.0,
         1.0,  0.0,  0.0,

         1.0,  0.0,  0.0,
         1.0,  0.0,  0.0,
         1.0,  0.0,  0.0,

        // y
         0.0, -1.0,  0.0,
         0.0, -1.0,  0.0,
         0.0, -1.0,  0.0,

         0.0, -1.0,  0.0,
         0.0, -1.0,  0.0,
         0.0, -1.0,  0.0,

         0.0,  1.0,  0.0,
         0.0,  1.0,  0.0,
         0.0,  1.0,  0.0,

         0.0,  1.0,  0.0,
         0.0,  1.0,  0.0,
         0.0,  1.0,  0.0,

        // z
         0.0,  0.0, -1.0,
         0.0,  0.0, -1.0,
         0.0,  0.0, -1.0,

         0.0,  0.0, -1.0,
         0.0,  0.0, -1.0,
         0.0,  0.0, -1.0,

         0.0,  0.0,  1.0,
         0.0,  0.0,  1.0,
         0.0,  0.0,  1.0,

         0.0,  0.0,  1.0,
         0.0,  0.0,  1.0,
         0.0,  0.0,  1.0,
    ]);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);

    const colours = new Float32Array(positions.length);
    if (randomColours) {
        for (let i = 0; i < colours.length; i++) {
            colours[i] = Math.random();
        }
    }
    else {
        for (let i = 0; i < colours.length; i++) {
            colours[i] = 1.0;
        }
    }

    const colourBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colourBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, colours, gl.STATIC_DRAW);

    return {
        primitive: gl.TRIANGLES,
        startIndex: 0,
        numVerticies: positions.length / 3,
        buffers: [
            {
                attributeName: "a_position",
                pointer: positionBuffer,
                size: 3,
                type: gl.FLOAT,
                normalize: false,
                stride: 0,
                offset: 0,
            },
            {
                attributeName: "a_normal",
                pointer: normalBuffer,
                size: 3,
                type: gl.FLOAT,
                normalize: true,
                stride: 0,
                offset: 0,
            },
            {
                attributeName: "a_colour",
                pointer: colourBuffer,
                size: 3,
                type: gl.FLOAT,
                normalize: false,
                stride: 0,
                offset: 0,
            },
        ],
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
        primitive: gl.LINES,
        startIndex: 0,
        numVerticies: positions.length / 3,
        buffers: [
            {
                attributeName: "a_position",
                pointer: buffer,
                size: 3,
                type: gl.FLOAT,
                normalize: false,
                stride: 0,
                offset: 0,
            }
        ]
    };
}

function generateSphereSolidGeometry (gl, stepsLat, stepsLong, randomColours) {
    check(isContext(gl), isNumber(stepsLat, stepsLong), stepsLat >= 3, stepsLong >= 3, isBoolean(randomColours));

    const getPosition = function (azimuth, altitude) {
        const y = Math.sin(altitude);
        const factor = Math.sqrt(1.0 - (y * y));
        const x = Math.cos(azimuth) * factor;
        const z = Math.sin(azimuth) * factor;
        return [x / 2.0, y / 2.0, z / 2.0];
    };

    const positions = [];
    const normals = [];

    const stepAltitude = Math.PI / stepsLat;
    const stepAzimuth = Math.PI * 2.0 / stepsLong;

    const pushPoint = function (point) {
        positions.push(point[0]);
        positions.push(point[1]);
        positions.push(point[2]);
    };

    for (let lat = 0; lat < stepsLat; lat++) {
        const altitude = (stepAltitude * lat) - (Math.PI / 2.0);
        for (let long = 0; long < stepsLong; long++) {
            const azimuth = stepAzimuth * long;
            if (lat === 0) {
                const a = getPosition(azimuth, altitude + stepAltitude);
                const b = getPosition(azimuth + stepAzimuth, altitude + stepAltitude);

                pushPoint(a);
                pushPoint([0.0, -0.5, 0.0]);
                pushPoint(b);
            }
            else if (lat === stepsLat - 1) {
                const a = getPosition(azimuth, altitude);
                const b = getPosition(azimuth + stepAzimuth, altitude);

                pushPoint(a);
                pushPoint(b);
                pushPoint([0.0, 0.5, 0.0]);
            }
            else {
                const a = getPosition(azimuth, altitude);
                const b = getPosition(azimuth + stepAzimuth, altitude);
                const c = getPosition(azimuth, altitude + stepAltitude);
                const d = getPosition(azimuth + stepAzimuth, altitude + stepAltitude);

                // First triangle
                pushPoint(a);
                pushPoint(b);
                pushPoint(c);

                // Second triangle
                pushPoint(b);
                pushPoint(d);
                pushPoint(c);
            }
        }
    }

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    const colours = new Float32Array(positions.length);
    if (randomColours) {
        for (let i = 0; i < colours.length; i++) {
            colours[i] = Math.random();
        }
    }
    else {
        for (let i = 0; i < colours.length; i++) {
            colours[i] = 1.0;
        }
    }

    const colourBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colourBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, colours, gl.STATIC_DRAW);

    return {
        primitive: gl.TRIANGLES,
        startIndex: 0,
        numVerticies: positions.length / 3,
        buffers: [
            {
                attributeName: "a_position",
                pointer: positionBuffer,
                size: 3,
                type: gl.FLOAT,
                normalize: false,
                stride: 0,
                offset: 0,
            },
            {
                attributeName: "a_normal",
                pointer: positionBuffer,
                size: 3,
                type: gl.FLOAT,
                normalize: true,
                stride: 0,
                offset: 0,
            },
            {
                attributeName: "a_colour",
                pointer: colourBuffer,
                size: 3,
                type: gl.FLOAT,
                normalize: false,
                stride: 0,
                offset: 0,
            },
        ],
    };

    /*
    return {
        buffer: buffer,

        primitive: gl.TRIANGLES,

        startIndex: 0,
        endIndex: positions.length / 3,

        numComponents: 3,
        type: gl.FLOAT,
        normalize: false,
        stride: 0,
        offset: 0,
    };
    */
}
