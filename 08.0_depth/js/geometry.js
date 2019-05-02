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
         0.5,  0.5, -0.5,
         0.5, -0.5,  0.5,

         0.5,  0.5, -0.5,
         0.5,  0.5,  0.5,
         0.5, -0.5,  0.5,

        // y
        -0.5, -0.5, -0.5,
         0.5, -0.5, -0.5,
        -0.5, -0.5,  0.5,

         0.5, -0.5, -0.5,
         0.5, -0.5,  0.5,
        -0.5, -0.5,  0.5,

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
         0.5, -0.5,  0.5,
        -0.5,  0.5,  0.5,

         0.5, -0.5,  0.5,
         0.5,  0.5,  0.5,
        -0.5,  0.5,  0.5,
    ]);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

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
