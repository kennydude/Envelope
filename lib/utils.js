/**
 * Created by kennydude on 11/06/2014.
 */
module.exports = exports = {};

var debug = require("debug")("debug"),
	async = require("async");

exports.prepareRepos = function(config, fn){
	debug("Prepare Repos");

	async.each(config.repos, function(repo, next){

		// TODO: Cache repo/index.json

	}, function(){
		debug("Repos ready");
		fn();
	});
};