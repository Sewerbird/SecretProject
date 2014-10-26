//WorldNode.js
var _ = require("lodash");
var Location = require("./nodelocation.js");
var WorldNode = function(){
	var self = this;

	self.id = Math.random();	//UUID identifying the node in the world map
	self.neighbors = [];		//WorldNodes this node abutts
	self.links = [];
	self.goList = [];			//Game object IDs on this node
	self.nodeRef = "testNode8x8";	//Asset associated with this world node
	self.extent = {h:8,w:8};	//Extent (meters) on the horizontal 2d plane
	self.transform = new Location(0,0,0,0,self.id)	//Transform to apply to world node asset (typically rotation) in meters and degrees
}

WorldNode.prototype.instantiate = function(){
	var self = this;

	self.sprite = null; //TODO: load/reference a sprite with the right asset
}

WorldNode.prototype.link = function(link){
	var self = this;

	self.links.push(link);
}
WorldNode.prototype.getWorldCoord = function(){
	var self = this;
	return _.clone(self.transform);
}


module.exports = WorldNode;