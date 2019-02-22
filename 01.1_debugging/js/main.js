"use strict";

window.setTimeout(start);

function start () {
	test("hello");

	const a = new Vector3(1.0, 2.0, 3.0);
	Vector3.mul(a, 2.0);
}

function test (a) {
	check(isString(a));

	const x = 3.0;
	const y = 3.0;

	check(x === y);
}

class Vector3 {
	constructor (x, y, z) {
		check(isNumber(x, y, z));
		this.x = x;
		this.y = y;
		this.z = z;
	}

	static mul (v, s) {
		check(isVector3(v), isNumber(s));
		v.x *= s;
		v.y *= s;
		v.z *= s;
	}
}
const isVector3 = newCheck(function (v) {
	return v instanceof Vector3;
});
