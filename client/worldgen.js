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
	//Root Generation Node
	var a = new WorldNode();
	a.nodeRef = "testNode8x8"
	a.extent.w = 1;
	a.extent.h = 1;

	var rows = 10;
	var cols = 10;

	for(var k = 0; k < rows * cols; k++)
	{
		var wn = new WorldNode();
		tgtNodebase.declareNode(wn);
		if(k%20 > 0)//not leftedge, link left
		{
			tgtNodebase.declareLink(wn,fullWorld[k-1],"LR0")
		}
		else if(Math.floor(k/20) > 0)//not topedge, link up
		{
			tgtNodebase.declareLink(wn,fullWorld[k-cols],"TB0");
		}
		fullWorld[k] = wn
	}
}
module.exports = WorldGen