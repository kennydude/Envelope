/**
 * Created by kennydude on 11/06/2014.
 */
var dbg = require("debug"),
	fs = require("fs"),
	async = require("async"),
	utils = require("./utils"),
	path = require("path");
dbg.enable("envelope");
dbg.enable("error");

var log = dbg("envelope"),
	debug = dbg("debug"),
	error = dbg("error");
error.log = console.error.bind(console);

var config = { // TODO
	"repos" : [
		"http://localhost/~kennydude/envelope/"
	]
};

log("Envelope Package Manager");

var program = require("commander");
program.version("0.0.1");

program
	.command("install")
	.description("Install Packages")
	.action(function () {
		debug("CWD:", process.cwd());

		try {
			var packageFile = JSON.parse(fs.readFileSync(path.join(process.cwd(), "package.json")));
			debug("Package file read correctly");
		} catch(e){
			error("package.json file could not be read!");
			process.exit(1);
		}

		if(!packageFile['envelopes']){
			error("package.json file does not contain any envelopes");
			process.exit(1);
		}

		var tasks = [];
		for(var file in packageFile.envelopes) {
			var envelope = packageFile.envelopes[file];
			tasks.push({"key":file,"value":envelope});
		}

		utils.prepareRepos(config, function(){
			async.each(tasks, function(item, next){
				debug("%s now being processed", file);



				next();
			}, function(){
				debug("Envelopes installed");
			});
		});
	});


program.parse(process.argv);