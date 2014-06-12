console.log("jQuery installer for Envelope");
var args = process.argv;

// http://stackoverflow.com/questions/3954438/remove-item-from-array-by-value
Array.prototype.remove = function() {
	var what, a = arguments, L = a.length, ax;
	while (L && this.length) {
		what = a[--L];
		while ((ax = this.indexOf(what)) !== -1) {
			this.splice(ax, 1);
		}
	}
	return this;
};

args.shift();
args.shift();

var modules = args[0].split(","),
	output = args[1],
	version = args[2];

var allModules = ["css", "ajax", "effects"];
modules.forEach(function(mod){
	allModules.remove(mod);
});

var modString = "";
allModules.forEach(function(mod){
	modString += "-" + mod + ":";
});
modString = modString.substr(0, modString.length-1);

console.log("Version", version, "is going to be installed");

var spawn = require('child_process').spawn;
function call(cmd, args, fn){
	console.log(">", cmd, args.join(" "));
	var c = spawn(cmd, args, { stdio: [process.stdin, process.stdout, process.stderr] });
	c.on("exit", function(err){
		if(err) process.exit(1);
		fn();
	});
}

call("wget", ["https://github.com/jquery/jquery/archive/"+version+".zip", "-O", "jquery.zip"], function(){
	call("unzip", ['-o', 'jquery.zip'], function(){
		console.log("About to build version requested");
		process.chdir("jquery-" + version);
		call("npm", ['install'], function(){
			call("grunt", ['custom:' + modString], function(){
				console.log("Built!");
				call("cp", ['dist/jquery.js', output], function(){
					console.log("Done!");
				});
			});
		});
	});
});