//worldgen.js
var _ = require("lodash");
var Location = require("./nodelocation.js");
var NodeBase = require("./nodebase.js");
var WorldNode = require("./worldnode.js");
var WorldLink = require("./worldlink.js");

var WorldGen = function(){
	var self = this;
}

WorldGen.prototype.random = function(tgtNodebase){
	var self = this;
	var fullWorld = [];

	var rows = 10;
	var cols = 10;

	for(var k = 0; k < rows * cols; k++)
	{
		var wn = new WorldNode();
		wn.id = k
		tgtNodebase.declareNode(wn);
		if(k % cols > 0)//link to left
			tgtNodebase.declareLink(wn,fullWorld[k-1],"RL0");
		if(k % cols == cols -1)//link to right for wrap around if furthest right
			tgtNodebase.declareLink(wn,fullWorld[k-cols + 1],"LR0");
		if(k >= cols)//link to above
			tgtNodebase.declareLink(wn,fullWorld[(k-cols)],"BT0");
		fullWorld[k] = wn
	}
}
module.exports = WorldGen