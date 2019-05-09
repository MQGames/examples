"use strict";

class GeometryAttribute {
    constructor (attributeName, pointer, array, size, type, normalize, stride, offset) {
        check(isString(name), isBuffer(pointer), isFloat32Array(array), isNumber(size, type, stride, offset), isBoolean(normalize));

        this.attributeName = attributeName;
        this.pointer = pointer;
        this.array = array;
        this.size = size;
        this.type = type;
        this.normalize = normalize;
        this.stride = stride;
        this.offset = offset;
    }
}
const isGeometryAttribute = newCheck(function (g) {
    return g instanceof GeometryAttribute;
});

class Geometry {
    constructor (primitive, startIndex, numVerticies, buffers) {
        check(isNumber(primitive, startIndex, numVerticies), isArray(buffers));

        this.primitive = primitive;
        this.startIndex = startIndex;
        this.numVerticies = numVerticies;
        this.buffers = buffers;
    }

    getBufferByAttributeName (attributeName) {
        for (let i = 0; i < this.buffers.length; i++) {
            const buffer = this.buffers[i];
            if (buffer.attributeName === attributeName) {
                return buffer;
            }
        }

        console.error("Unable to find buffer with attribute name: " + attributeName);
        return null;
    }
}
const isGeometry = newCheck(function (g) {
    return g instanceof Geometry;
});

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

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const geometryAttributes = [
        new GeometryAttribute("a_position", positionBuffer, positions, 3, gl.FLOAT, false, 0, 0),
    ];
    return new Geometry(gl.LINES, 0, positions.length / 3, geometryAttributes);
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

    const geometryAttributes = [
        new GeometryAttribute("a_position", positionBuffer, positions, 3, gl.FLOAT, false, 0, 0),
        new GeometryAttribute("a_normal", normalBuffer, normals, 3, gl.FLOAT, true, 0, 0),
        new GeometryAttribute("a_colour", colourBuffer, colours, 3, gl.FLOAT, false, 0, 0),
    ];
    return new Geometry(gl.TRIANGLES, 0, positions.length / 3, geometryAttributes);
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

    const positionsArray = new Float32Array(positions);
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positionsArray, gl.STATIC_DRAW);

    const geometryAttributes = [
        new GeometryAttribute("a_position", positionBuffer, positionsArray, 3, gl.FLOAT, false, 0, 0),
    ];
    return new Geometry(gl.LINES, 0, positions.length / 3, geometryAttributes);
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

    const positionsArray = new Float32Array(positions);
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positionsArray, gl.STATIC_DRAW);

    const normals = new Float32Array(positionsArray.length);
    for (let i = 0; i < positionsArray.length; i++) {
        normals[i] = positionsArray[i] * 2.0;
    }

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

    const geometryAttributes = [
        new GeometryAttribute("a_position", positionBuffer, positionsArray, 3, gl.FLOAT, false, 0, 0),
        new GeometryAttribute("a_normal", normalBuffer, normals, 3, gl.FLOAT, true, 0, 0),
        new GeometryAttribute("a_colour", colourBuffer, colours, 3, gl.FLOAT, false, 0, 0),
    ];
    return new Geometry(gl.TRIANGLES, 0, positions.length / 3, geometryAttributes);
}

function generateNormals (gl, inputGeometry) {
    check(isContext(gl), isGeometry(inputGeometry));

    const numVerticies = inputGeometry.numVerticies * 2;
    const positions = new Float32Array(numVerticies * 3);
    const normals = new Float32Array(numVerticies * 3);

    console.log(inputGeometry);
    console.log(numVerticies);

    const inputPositionBuffer = inputGeometry.getBufferByAttributeName("a_position");
    const inputNormalBuffer = inputGeometry.getBufferByAttributeName("a_normal");
    for (let i = 0; i < inputGeometry.numVerticies; i++) {
        const positionIndex = i * 3;
        const normalIndex = i * 3;

        // A
        positions[positionIndex * 2 + 0] = inputPositionBuffer.array[positionIndex + 0];
        positions[positionIndex * 2 + 1] = inputPositionBuffer.array[positionIndex + 1];
        positions[positionIndex * 2 + 2] = inputPositionBuffer.array[positionIndex + 2];
        normals[normalIndex * 2 + 0] = 0.0;
        normals[normalIndex * 2 + 1] = 0.0;
        normals[normalIndex * 2 + 2] = 0.0;
        
        // B
        positions[positionIndex * 2 + 3] = inputPositionBuffer.array[positionIndex + 0];
        positions[positionIndex * 2 + 4] = inputPositionBuffer.array[positionIndex + 1];
        positions[positionIndex * 2 + 5] = inputPositionBuffer.array[positionIndex + 2];
        normals[normalIndex * 2 + 3] = inputNormalBuffer.array[normalIndex + 0];
        normals[normalIndex * 2 + 4] = inputNormalBuffer.array[normalIndex + 1];
        normals[normalIndex * 2 + 5] = inputNormalBuffer.array[normalIndex + 2];
    }

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);

    const geometryAttributes = [
        new GeometryAttribute("a_position", positionBuffer, positions, 3, gl.FLOAT, false, 0, 0),
        new GeometryAttribute("a_normal", normalBuffer, normals, 3, gl.FLOAT, true, 0, 0),
    ];
    return new Geometry(gl.LINES, 0, positions.length / 3, geometryAttributes);
};

function addNormalsVisualization (gl, inputGameObject) {
    check(isContext(gl), isGameObject(inputGameObject));

    const NORMAL_VERTEX = `
        const float NORMAL_SCALING = 0.2;

        attribute vec3 a_position;
        attribute vec3 a_normal;

        uniform mat4 u_world;
        uniform mat4 u_camera;
        uniform mat4 u_projection;
        uniform mat3 u_normal;

        void main () {
            vec3 rotatedNormal = u_normal * a_normal;
            gl_Position = u_projection * u_camera * u_world * vec4(a_position + (rotatedNormal * NORMAL_SCALING), 1.0);
        }
    `;

    const NORMAL_FRAGMENT = `
        precision highp float;

        uniform vec4 u_colour;

        void main () {
            gl_FragColor = u_colour;
        }
    `;

    const geometry = generateNormals(gl, inputGameObject.geometry);
    const uniforms = [
        { name: "u_colour", value: [1.0, 1.0, 0.0, 1.0] },
    ];
    const normalGameObject = new GameObject(gl, geometry, NORMAL_VERTEX, NORMAL_FRAGMENT, uniforms, false);
    inputGameObject.children.push(normalGameObject);
}
