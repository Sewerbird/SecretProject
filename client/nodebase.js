//Nodebase.js
var _ = require("lodash");

var Nodebase = function(){
	var self = this;

	self.nodes = []
}

Nodebase.prototype.load = function(toLoad){
	_.forEach(toLoad, function(tgt){
		self.nodes.push(tgt);
	})
}


module.exports = Nodebase;