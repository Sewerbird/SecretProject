//WorldNode.js
var _ = require("lodash");
var Transform = require("./nodetransform.js");
var WorldNode = function(){
	var self = this;

	self.id = Math.random();	//UUID identifying the node in the world map
	self.neighbors = [];		//WorldNodes this node abutts
	self.links = [];
	self.goList = [];			//Game object IDs on this node
	self.nodeRef = "testNode8x8";	//Asset associated with this world node
	self.extent = {h:8,w:8};	//Extent (meters) on the horizontal 2d plane
	self.transform = new Transform(0,0,0,0,self.id)	//Transform to apply to world node asset (typically rotation) in meters and degrees
}
//Returns a copy of the transform, which has presumably been laid out by the working set.
//The coord returned is in meters measured from the workingset's targetNode's center, or default if not laid out.
WorldNode.prototype.getWorldCoord = function(){
	var self = this;
	return _.clone(self.transform);
}
WorldNode.prototype.containsPoint = function(transform){
	var self = this;
	if(transform.uid == self.id)
	{
	//TODO: make robust under rotation
		if(transform.x < self.extent.w/2 && transform.x > -self.extent.w/2 &&
			transform.y < self.extent.h/2 && transform.y > -self.extent.h/2)
			return true;
	}
	return false
}
WorldNode.prototype.addGO = function(gameObject, options){
	var self = this;
	if(options == undefined){
		self.goList.push(gameObject);
	}
}

module.exports = WorldNode;