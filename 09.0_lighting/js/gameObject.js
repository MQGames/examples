"use strict";

class GameObject {
    constructor (gl, geometry, vertexShaderSource, fragmentShaderSource, uniformValues, transparent) {
        check(isContext(gl), isGeometry(geometry), isString(vertexShaderSource, fragmentShaderSource), isArray(uniformValues));

        this.position = new Float32Array([0, 0, 0]);
        this.rotation = new Float32Array([0, 0, 0]);
        this.scale = new Float32Array([1, 1, 1]);

        this.uniformValues = uniformValues;

        this.transparent = transparent;

        this.children = [];

        this.geometry = geometry;

        this.program = Util.createProgram(gl, vertexShaderSource, fragmentShaderSource);

        // Uniforms setup
        this.uniforms = [];
        const numUniforms = gl.getProgramParameter(this.program, gl.ACTIVE_UNIFORMS);
        for (let i = 0; i < numUniforms; i++) {
            const uniformInfo = gl.getActiveUniform(this.program, i);
            const uniform = {
                pointer: gl.getUniformLocation(this.program, uniformInfo.name),
                name: uniformInfo.name,
                type: uniformInfo.type,
                size: uniformInfo.size,
            };
            this.uniforms.push(uniform);
        }

        // Attributes setup
        this.attributes = [];
        const numAttibutes = gl.getProgramParameter(this.program, gl.ACTIVE_ATTRIBUTES);
        for (let i = 0; i < numAttibutes; i++) {
            const attributeInfo = gl.getActiveAttrib(this.program, i);
            const attribute = {
                pointer: gl.getAttribLocation(this.program, attributeInfo.name),
                name: attributeInfo.name,
                type: attributeInfo.type,
                size: attributeInfo.size,
            };
            this.attributes.push(attribute);
        }
    }

    getUniformByName (name) {
        check(isString(name));

        for (let i = 0; i < this.uniforms.length; i++) {
            const uniform = this.uniforms[i];
            if (uniform.name === name) {
                return uniform;
            }
        }

        //console.error("Unable to find uniform called: " + name);
        return null;
    }

    getAttibuteByName (name) {
        check(isString(name));

        for (let i = 0; i < this.attributes.length; i++) {
            const attribute = this.attributes[i];
            if (attribute.name === name) {
                return attribute;
            }
        }

        //console.error("Unable to find attribute called: " + name);
        return null;
    }

    draw (gl, parentMatrix, renderInfo, transparentDrawing) {
        check(isContext(gl), isMat4(parentMatrix), isObject(renderInfo), isBoolean(transparentDrawing));

        // Compute matrix for this gameObject
        const local = glMatrix.mat4.create();
        glMatrix.mat4.fromTranslation(local, this.position);
        glMatrix.mat4.rotateX(local, local, this.rotation[0]);
        glMatrix.mat4.rotateY(local, local, this.rotation[1]);
        glMatrix.mat4.rotateZ(local, local, this.rotation[2]);
        glMatrix.mat4.scale(local, local, this.scale);
        glMatrix.mat4.multiply(local, parentMatrix, local);

        // Determine if we draw ourselves in this pass
        if (transparentDrawing === this.transparent) {
            // Switch to our program before doing anything else
            gl.useProgram(this.program);

            // Projection, Camera, World
            {
                const projectionUniform = this.getUniformByName("u_projection");
                gl.uniformMatrix4fv(projectionUniform.pointer, false, renderInfo.projection);
                const cameraUniform = this.getUniformByName("u_camera");
                gl.uniformMatrix4fv(cameraUniform.pointer, false, renderInfo.camera);
                const worldUniform = this.getUniformByName("u_world");
                gl.uniformMatrix4fv(worldUniform.pointer, false, local);
            }

            // Lighting
            const normalUniform = this.getUniformByName("u_normal");
            if (normalUniform !== null) {
                // Normal matrix
                if (correct_normals) {
                    //const normal4 = glMatrix.mat4.create();
                    //glMatrix.mat4.invert(normal4, local);
                    //glMatrix.mat4.transpose(normal4, normal4);
                    //const normal3 = glMatrix.mat3.create();
                    //glMatrix.mat3.fromMat4(normal3, normal4);
                    //const camera3 = glMatrix.mat3.create();
                    //glMatrix.mat3.fromMat4(camera3, renderInfo.camera);
                    //glMatrix.mat3.multiply(normal3, camera3, normal3);
                    //gl.uniformMatrix3fv(normalUniform.pointer, false, normal3);
                }
                else {
                    gl.uniformMatrix3fv(normalUniform.pointer, false, glMatrix.mat3.create());
                }

                // Light uniforms
                {
                    //const lightDirectionUniform = this.getUniformByName("u_lightDirection");
                    //if (lightDirectionUniform !== null) {
                    //    gl.uniform3fv(lightDirectionUniform.pointer, renderInfo.lightDirection);
                    //}
                    //const lightColourUniform = this.getUniformByName("u_lightColour");
                    //if (lightColourUniform !== null) {
                    //    gl.uniform3fv(lightColourUniform.pointer, renderInfo.lightColour);
                    //}
                    //const ambientLightUniform = this.getUniformByName("u_ambientLight");
                    //if (ambientLightUniform !== null) {
                    //    gl.uniform3fv(ambientLightUniform.pointer, renderInfo.ambientLight);
                    //}
                }
            }

            // Other uniforms
            for (let i = 0; i < this.uniformValues.length; i++) {
                const uniformValue = this.uniformValues[i];
                const uniform = this.getUniformByName(uniformValue.name);
                if (uniform !== null) {
                    switch (uniform.type) {
                        case gl.FLOAT: gl.uniform1f(uniform.pointer, uniformValue.value); break;
                        case gl.FLOAT_VEC2: gl.uniform2fv(uniform.pointer, uniformValue.value); break;
                        case gl.FLOAT_VEC3: gl.uniform3fv(uniform.pointer, uniformValue.value); break;
                        case gl.FLOAT_VEC4: gl.uniform4fv(uniform.pointer, uniformValue.value); break;
                        case gl.FLOAT_MAT2: gl.uniformMatrix2fv(uniform.pointer, false, uniformValue.value); break;
                        case gl.FLOAT_MAT3: gl.uniformMatrix3fv(uniform.pointer, false, uniformValue.value); break;
                        case gl.FLOAT_MAT4: gl.uniformMatrix4fv(uniform.pointer, false, uniformValue.value); break;
                        default: console.error("Unsupported uniform type!");
                    }
                }
            }

            // Enable and set up attributes
            for (let i = 0; i < this.geometry.buffers.length; i++)  {
                const g = this.geometry.buffers[i];

                gl.bindBuffer(gl.ARRAY_BUFFER, g.pointer);
                const attribute = this.getAttibuteByName(g.attributeName);
                if (attribute !== null) {
                    gl.enableVertexAttribArray(attribute.pointer);
                    gl.vertexAttribPointer(attribute.pointer, g.size, g.type, g.normalize, g.stride, g.offset);
                }
            }

            // Draw!
            gl.drawArrays(this.geometry.primitive, this.geometry.startIndex, this.geometry.numVerticies);

            // Disable attributes
            for (let i = 0; i < this.geometry.buffers.length; i++)  {
                const g = this.geometry.buffers[i];
                const attribute = this.getAttibuteByName(g.attributeName);
                if (attribute !== null) {
                    gl.disableVertexAttribArray(attribute.pointer);
                }
            }
        }

        // Draw children
        for (let i = 0; i < this.children.length; i++) {
            const child = this.children[i];
            child.draw(gl, local, renderInfo, transparentDrawing);
        }
    }
}
const isGameObject = newCheck(function (g) {
    return g instanceof GameObject;
});
