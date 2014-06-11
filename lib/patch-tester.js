console.log("TEST PATCHER");
console.log("Run node lib/patch-tester.js AND have jQuery 2.1.1 built using generator");

var fs = require("fs");


var original = fs.readFileSync("repo/jquery/2.1.1/jquery-full.js").toString(),
	diff = fs.readFileSync("repo/jquery/2.1.1/jquery-ajax.diff").toString();

var patch = require("./patch");

console.log("Original Lines: " + original.split("\n").length);

original = patch(original, diff);

console.log("New Lines: " + original.split("\n").length);

fs.writeFileSync("test.js", original);