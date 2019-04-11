"use strict";

class GameObject {
    constructor (geometry, material) {
        this.geometry = geometry;
        this.material = material;
        this.children = [];
    }

    addChild (child) {
        check(isGameObject(child));

        this.children.push(child);
    }

    drawSelfAndChildren (gl) {

    }
}
const isGameObject = newCheck(function (g) {
    return g instanceof GameObject;
});
