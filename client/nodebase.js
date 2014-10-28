//Nodebase.js
var _ = require("lodash");
var Graph = require("graphlib").Graph;
var Transform = require("./nodetransform.js");
var WorldGen = require("./worldgen.js");
var WorldNode = require("./worldnode.js");
var PIXI = require("./lib/pixi.js")
var GameObject = require("./gameobject.js");

var Nodebase = function(){
	var self = this;
	self.instant = (new Date()).getTime()
	self.nodes = []
	self.links = []
	self.loadAssets();
	self.wholeWorld = new Graph({directed:true});
}

Nodebase.prototype.loadAssets = function(){
	var self = this;
	var assetKeys = [
		'grass1_tile',
		'grass2_tile',
		'water1_tile',
		'shrub_ent',
		'lily_ent',
		'testNode8x8',
		'testNode8x4',
		'testNode8x2'
	]
	self.assetMap = {};
	_.forEach(assetKeys, function(key){
		self.assetMap[key] = PIXI.Texture.fromImage('img/'+key+".png");
	})
}

//Find the WorldNode associated with the provided @uid
Nodebase.prototype.queryID = function(uid){
	return null;
}

//Find all WorldNodes within @meters distance of a @nodelocation
//Returns an array of WorldNode uids
Nodebase.prototype.queryNear = function(targetUID, meters){
	var self = this;

	var result_nodes = [];
	var result_links = [];

	/*
		TODO: construct the return arrays. Should be
		 result_nodes : all nodes within @meters of the center of the targetted node
		 result_links : all links of the result_nodes, even if they lead to unreturned nodes
	 */
	 //DEBUG:
	 result_nodes.push(self.nodes[0])
	 
	return {nodes:result_nodes,links:result_links}
}

//Adds a node to the working set
Nodebase.prototype.declareNode = function(node){
	var self = this;
	self.nodes.push(node);
	self.wholeWorld.setNode(node.id,node);
}
//Adds a link to the working set
Nodebase.prototype.declareLink = function(nodeA,nodeB,transform){
	var self = this;
	self.wholeWorld.setEdge(nodeB.id,nodeA.id,Transform.encodeTransform(transform))
	self.wholeWorld.setEdge(nodeA.id,nodeB.id,Transform.invertTransform(Transform.encodeTransform(transform)))
}

module.exports = Nodebase;