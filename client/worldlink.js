//worldlink.js
var _ = require("lodash");

var WorldLink = function(src,tgt,transform){
	var self = this;

	self.src = src;
	self.tgt = tgt;
	self.transform = transform;
}

module.exports = WorldLink;