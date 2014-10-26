//GameObject.js
var _ = require("lodash");

var GameObject = function(init, modules){
	if(!modules) modules = [Locatable]
	_.forEach(modules, function(module){
		init = module(init)
	})
	return init;
}

module.exports = GameObject;