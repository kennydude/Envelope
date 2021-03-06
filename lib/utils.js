/**
 * Created by kennydude on 11/06/2014.
 */
module.exports = exports = {};

var dbg = require("debug");
dbg.enable("error");

var	debug = dbg("debug"),
	async = require("async"),
	path = require("path"),
	request = require("superagent");

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

exports.prepareRepos = function(config, fn){
	debug("Prepare Repos");

	config.packages = {};
	async.each(config.repos, function(repo, next){

		exports.getURL(repo + "index.json", function(err, res){
			if(err != null){
				console.error("Repo %s could not be downloaded!", repo);
				process.exit(1);
			}
			for(var key in res){
				// TODO: Allow absolute URLs
				config.packages[key] = repo + res[key];
			}

			next();
		});

	}, function(){
		debug("Repos ready", config.packages);
		fn();
	});
};

exports.getURL = function(url, fn){
	debug("DL: %s", url);
	request
		.get(url)
		.set("User-Agent", "Envelope")
		.buffer(true)
		.end(function(err, res){
			if(err || res.status != 200){
				fn(err || res.status);
			} else{
				fn(null, res.type == "application/json" ? res.body : res.text);
			}
		});
};

exports.sortVersionNumbers = function(a,b){
	var pa = a.split("."),
		pb = b.split("."),
		max = Math.max(pa.length, pb.length);

	for(var i = 0; i < max; i++){
		var ca = a[i] || "0",
			cb = b[i] || "0";
		if(ca > cb){
			return 1;
		} else if(ca < cb){
			return -1;
		}
	}

	return 0;
};

var spawn = require('child_process').spawn;
exports.call = function(cmd, args, fn, cwd){
	console.log(">", cmd, args.join(" "));
	var c = spawn(cmd, args, { stdio: [process.stdin, process.stdout, process.stderr], cwd : cwd });
	c.on("exit", function(err){
		if(err) process.exit(1);
		fn();
	});
}