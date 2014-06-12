/**
 * Created by kennydude on 11/06/2014.
 */
var dbg = require("debug"),
	fs = require("fs"),
	async = require("async"),
	utils = require("./utils"),
	tmp = require("tmp"),
	path = require("path");
dbg.enable("envelope");
dbg.enable("error");

var log = dbg("envelope"),
	debug = dbg("debug"),
	error = dbg("error");
error.log = console.error.bind(console);

console.error = error;
console.debug = debug;

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
				log("%s now being processed", item.key);
				var extension = path.extname(item.key),
					file = "";

				async.each(item.value, function(part, next){
					var url = config.packages[part['name']] + "/index.json";
					utils.getURL(url, function(err, versions){
						if(err != null){
							error("Could not download module information!");
							error("URL: %s", url);
							process.exit(1);
						}

						if(versions['*'] !== undefined && Object.keys(versions).length == 1){
							if(!part['version']){
								error("Build script based modules require versions to be provided. Please modify");
								error("your package.json file accordingly");
								process.exit(1);
							}

							// Build script!
							debug("Build script required for this package");

							tmp.tmpName(function(err, tmpfile) {
								if (err != null) {
									error("Could not open temp file!");
									process.exit(1);
								}
								tmp.dir(function (err, temppath) {
									if (err != null) {
										error("Could not open temp directory!");
										process.exit(1);
									}

									var url = config.packages[part['name']] + "/" + versions['*'];
									utils.getURL(url, function (err, script) {
										if (err != null) {
											error("Could not download build script!");
											error("URL: %s", url);
											process.exit(1);
										}

										fs.writeFileSync(path.join(temppath, "script.js"), script);

										var cmd = "node"; // TODO: Possibly allow others?
										utils.call(cmd, [ "script.js", part.modules.join(","), tmpfile, part.version ], function () {
											file += fs.readFileSync(tmpfile);
											next();
										}, temppath);
									});
								});
							});
							return;
						}

						// If we do not have a version provided, add one
						if(!part['version']){
							var versionNumbers = Object.keys(versions);
							versionNumbers.sort(utils.sortVersionNumbers);
							versionNumbers = versionNumbers.reverse();

							debug(versionNumbers);
							part['version'] = versionNumbers[0];
						}
						// If the package version is not provided, throw up
						if(!versions[ part.version ]){
							error("Version %s of %s is not available", part.version, part.name);
							process.exit(1);
						}

						debug("Downloading version %s of %s", part.version, part.name);
						var url = config.packages[part['name']] + "/" + part.version + "/module.json";
						utils.getURL(url, function(err, module){
							if(err != null){
								error("Could not download module information!");
								error("URL: %s", url);
								process.exit(1);
							}

							module.repo = config.packages[part['name']] + "/" + part.version;
							debug(module);

							require("./module-" + module.style)(module, part, function(result){
								file += result + "\n";
								next();
							});
						});
					});
				}, function(){
					next();
					fs.writeFileSync(path.join(process.cwd(), item.key), file);
				});
			}, function(){
				debug("Envelopes installed");
			});
		});
	});


program.parse(process.argv);