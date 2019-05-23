"use strict";

const VERTEX_SHADER_SOURCE = `
    attribute vec3 a_position;
    attribute vec2 a_uv;

    uniform mat4 u_object;
    uniform mat4 u_camera;
    uniform mat4 u_projection;

    varying vec2 v_uv;

    void main() {
        v_uv = a_uv;
        gl_Position = u_projection * u_camera * u_object * vec4(a_position, 1.0);
    }
`;

const FRAGMENT_SHADER_SOURCE = `
    precision mediump float;

    uniform vec3 u_colour;
    uniform sampler2D u_texture;
    uniform sampler2D u_texture2;

    varying vec2 v_uv;

    void main() {
        vec4 t1 = texture2D(u_texture, vec2(v_uv.x, 1.0-v_uv.y) * 2.0);
        vec4 t2 = texture2D(u_texture2, vec2(v_uv.x, 1.0-v_uv.y) * 2.0);
        gl_FragColor = vec4(t1.a * t2.rgb, 1.0);
        //gl_FragColor = vec4(v_uv, 0.0, 1.0);
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

    // Setup shader
    const program = Util.createProgram(gl, VERTEX_SHADER_SOURCE, FRAGMENT_SHADER_SOURCE);
    const positionLocation = gl.getAttribLocation(program, "a_position");
    const uvLocation = gl.getAttribLocation(program, "a_uv");
    const objectLocation = gl.getUniformLocation(program, "u_object");
    const cameraLocation = gl.getUniformLocation(program, "u_camera");
    const projectionLocation = gl.getUniformLocation(program, "u_projection");
    const colourLocation = gl.getUniformLocation(program, "u_colour");
    const texture1Location = gl.getUniformLocation(program, "u_texture");
    const texture2Location = gl.getUniformLocation(program, "u_texture2");
    
    // Use shader
    gl.useProgram(program);

    // Enable attributes
    gl.enableVertexAttribArray(positionLocation);
    gl.enableVertexAttribArray(uvLocation);

    // Setup positions
    const positions = new Float32Array([
        -1.0, -1.0, 0.0,
        1.0, -1.0, 0.0,
        -1.0, 1.0, 0.0,

        -1.0, 1.0, 0.0,
        1.0, -1.0, 0.0,
        1.0, 1.0, 0.0,
    ]);
    const positionsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const uvs = new Float32Array([
        0.0, 0.0,
        1.0, 0.0,
        0.0, 1.0,

        0.0, 1.0,
        1.0, 0.0,
        1.0, 1.0,
    ]);
    const uvsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, uvsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, uvs, gl.STATIC_DRAW);

    // Create a texture
    {
        
        // Asynchronously load an image
        // Rust
        {
            const texture = gl.createTexture();
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, texture);

            // Fill the texture with a 1x1 blue pixel.
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]));

            const image = document.getElementById("_rust_");
            image.addEventListener("load", function() {
                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, texture);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
                gl.generateMipmap(gl.TEXTURE_2D);

                {
                    //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
                    //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                    //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
                    //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
                }
            });
        }
        

        // Bricks
        {
            const texture = gl.createTexture();
            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, texture);

            // Fill the texture with a 1x1 blue pixel.
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]));

            const image = document.getElementById("_face_");
            image.addEventListener("load", function() {
                gl.activeTexture(gl.TEXTURE1);
                gl.bindTexture(gl.TEXTURE_2D, texture);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
                gl.generateMipmap(gl.TEXTURE_2D);

                {
                    //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
                    //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
                    //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
                }
            });
        }
    }

    gl.clearColor(0.1, 0.1, 0.1, 1.0);

    const projectionMatrix = glMatrix.mat4.create();
    const cameraMatrix = glMatrix.mat4.create();
    const objectMatrix = glMatrix.mat4.create();

    const orthographicSize = 1.2;

    const render = function (seconds) {
        check(isNumber(seconds));

        Util.resizeCanvas(canvas);

        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clear(gl.COLOR_BUFFER_BIT);

        const aspect = canvas.width / canvas.height;

        // Projection setup
        glMatrix.mat4.ortho(projectionMatrix, -aspect * orthographicSize, aspect * orthographicSize, -orthographicSize, orthographicSize, -2.0, 2.0);

        //glMatrix.mat4.fromTranslation(objectMatrix, [0.5, 0.0, 0.0]);

        gl.uniformMatrix4fv(projectionLocation, false, projectionMatrix);
        gl.uniformMatrix4fv(cameraLocation, false, cameraMatrix);
        gl.uniformMatrix4fv(objectLocation, false, objectMatrix);

        gl.uniform3fv(colourLocation, [1.0, 1.0, 0.0]);

        gl.bindBuffer(gl.ARRAY_BUFFER, positionsBuffer);
        gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, uvsBuffer);
        gl.vertexAttribPointer(uvLocation, 2, gl.FLOAT, false, 0, 0);

        gl.uniform1i(texture1Location, 0);
        gl.uniform1i(texture2Location, 1);

        gl.drawArrays(gl.TRIANGLES, 0, 6);
    };

    const animate = function (milliseconds) {
        window.requestAnimationFrame(animate);

        const seconds = milliseconds / 1000;
        render(seconds);
    };

    animate();
}
