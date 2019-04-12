"use strict";

class GameObject {
    constructor (geometry) {
        this.position = new Float32Array([0, 0, 0]);
        this.rotation = new Float32Array([0, 0, 0]);
        this.scale = new Float32Array([1, 1, 1]);

        this.colour = new Float32Array([1, 0, 0]);

        this.children = [];

        this.geometry = geometry;
    }

    draw (gl, parentMatrix, uniforms) {
        const local = glMatrix.mat4.create();
        glMatrix.mat4.fromTranslation(local, this.position);
        glMatrix.mat4.rotateX(local, local, this.rotation[0]);
        glMatrix.mat4.rotateY(local, local, this.rotation[1]);
        glMatrix.mat4.rotateZ(local, local, this.rotation[2]);
        glMatrix.mat4.scale(local, local, this.scale);

        glMatrix.mat4.multiply(local, parentMatrix, local);

        gl.uniformMatrix4fv(uniforms.world, false, local);
        gl.uniform3fv(uniforms.colour, this.colour);

        const g = this.geometry;
        gl.bindBuffer(gl.ARRAY_BUFFER, g.buffer);
        gl.vertexAttribPointer(g.attribute, g.size, g.type, g.normalize, g.stride, g.offset);
        gl.drawArrays(g.primitive, g.start, g.numPoints);

        for (let i = 0; i < this.children.length; i++) {
            const child = this.children[i];
            child.draw(gl, local, uniforms);
        }
    }
}
const isGameObject = newCheck(function (g) {
    return g instanceof GameObject;
});
