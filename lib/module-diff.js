/*
Diff based modules for Envelope.
 */

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



};