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
		result_nodes : all nodes within @meters of the center of the targetted node
		result_links : all links of the result_nodes, even if they lead to unreturned nodes
	 */
	var tgtNode = self.wholeWorld.node(targetUID)
	if(tgtNode){
		result_nodes.push(tgtNode);
		var toExplore = _.map(self.wholeWorld.outEdges(targetUID), function(edge){
			return {
				src : self.wholeWorld.node(edge.v),
				dst : self.wholeWorld.node(edge.w),
				edge : {v:edge.v,w:edge.w,transform:self.wholeWorld.edge(edge)}
			}
		})
		_.forEach(toExplore,function(explored){
			result_nodes.push(explored.dst)
			result_links.push(explored.edge)
			var dst_edges = self.wholeWorld.outEdges(explored.edge.w);
			_.forEach(dst_edges,function(dst_edge){
				result_links.push({v:dst_edge.v, v:dst_edge.w, transform:self.wholeWorld.edge(dst_edge)});
			})
		})
	}
	//Give the UID of a target node and the transform reaching it, recurse while x and y are on-screen
	function flood(flood_UID, flooded_Transform, inherited_x, inherited_y){
		var flood_node = self.wholeWorld.node(flood_UID);
		//Base case
		if(inherited_x > meters || inherited_y > meters) return flood_node;

		var xContrib = wISh?flood_node.extent.h:flood_node.extent.w;
		var yContrib = wISh?flood_node.extent.w:flood_node.extent.h;
		var out_edges = self.wholeWorld.outEdges(flood_UID);
		_.forEach(out_edges, function(out_edge){
			var edge_t = self.wholeWOrld.edge(out_edge)
			result_links.push({v:out_edge.v, w:out_edge.w, transform: edge_t});
			flood(out_edge.w, Transform.isRotationToSide(edge_t)?!wISh:wISh, inherited_x + xContrib, inherited_y + yContrib)
		})
	}

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