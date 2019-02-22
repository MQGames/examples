
// The "use strict"; part below will enable some extra checks by the browser.You almost always want to enable this!
// It needs to be the first statement of code in order to work. For more info see:
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
"use strict";

// Code out here just runs top to bottom when the browser _loads_ this current script.
// If you're trying to reference other code from other scripts here that hasn't actually been loaded by the browser yet,
// it'll break complaining it doesn't know anything about a particular identifier.
console.log("Hello! I'm out in the open!");

// Use this space to define global variables and constants.
const DEFAULT_VALUE = 3.0;

function start () {
	printToConsole("testing 1 2 3");

	// I'm a constant, I can't be re-assigned.
	const x = 10;
	// x = 2; // Error!

	// I'm a normal variable, I can be re-assigned.
	let y = 3;
	y = 6;

	// Use const as frequently as you can. Try to only use let if you need to.

	// Usual types
	const b = true;   // Boolean
	const s = "woah"; // String
	const n = 3.6;    // Number (Everything is floating point)

	const tilly = new Stuff("Tilly", 100.0);
	const borris = new Stuff("Borris", 65.0);
	const orangeDoom = new Stuff("Orange Doom", 100.0);

	tilly.print();

	Stuff.compare(tilly, borris);
	Stuff.compare(tilly, orangeDoom);
};

function printToConsole (message) {
	console.log("I'm inside the printToConsole function!");
	console.log("Your message: " + message + ".");
	console.error("I'm an error. I give a stack trace (VERY USEFUL FOR DEBUGGING). Use me where you think things might go wrong.");
};

// Creating "classes".
class Stuff {

	// Constructor is special keyword.
	constructor (name, size) {
		// Use this keyword to assign to object variables.
		this.name = name;
		this.size = size;
	}

	// Normal methods.
	print () {
		const text = "This is a big pile of stuff named " + this.name + ". " + this.name + " is rather big at " + this.size + " metric tonnes.";
		console.log(text);
	}

	// Static methods.
	static compare (a, b) {
		// Regular if.
		// Use tripple equals to make sure they are also of the same type. Never use double equals!
		if (a.size === b.size) {
			console.log("The piles of stuff " + a.name + " and " + b.name + " are exactly the same size.");
		}
		else {
			// Inline (terneray) if.
			const bigger = (a.size > b.size) ? a : b;
			console.log("Out of the piles of stuff " + a.name + " and " + b.name + ", " + bigger.name + " is the biggest at " + bigger.size + " metric tonnes.");
		}
	}
}
