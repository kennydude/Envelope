/*
Diff based modules for Envelope.
 */
var utils = require("./utils"),
	async = require("async"),
	patch = require("./patch");

module.exports = function(module, part, fn){

	var diffsToApply = [];

	if(module.diff == "negative"){
		// Negative means take the full module, then remove the diffs of modules not applied
		diffsToApply = Object.keys(module.modules);
		for(var x in part.modules){
			diffsToApply.remove(x);
		}
	} else{
		diffsToApply = part.modules;
	}

	// Start with base file
	utils.getURL(module.repo + "/" + module.main, function(err, xx){
		if(err != null){
			console.error("Failure to download file");
			process.exit(1);
		}

		var mainFile = xx;

		// Now apply diffs
		async.eachSeries(diffsToApply, function(diffName, next){
			utils.getURL(module.repo + "/" + module.modules[diffName], function(err, diffFile) {
				if (err != null) {
					console.error("Failure to download file");
					process.exit(1);
				}

				mainFile = patch(mainFile, diffFile);
				next();
			});
		}, function(){
			console.debug("Applied correct diffs");
			fn(mainFile);
		});
	});

};