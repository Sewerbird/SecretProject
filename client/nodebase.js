//Nodebase.js
var _ = require("lodash");
var graphlib = require("graphlib");
var Graph = graphlib.Graph;
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
		'water_floor01',
		'grass_floor01',
		'denizen'
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
//Returns an array of WorldNode uids and all links outbound
Nodebase.prototype.queryNear = function(targetUID, meters){
	var self = this;

	var result_nodes = {};
	var result_links = [];

	/*
		result_nodes : all nodes within @meters of the center of the targetted node
		result_links : all links of the result_nodes, even if they lead to unreturned nodes
	 */
	var tgtNode = self.wholeWorld.node(targetUID)
	if(tgtNode){
		result_nodes[targetUID] = tgtNode;
		var toExplore = _.map(self.wholeWorld.outEdges(targetUID), function(edge){
			return {
				src : self.wholeWorld.node(edge.v),
				dst : self.wholeWorld.node(edge.w),
				edge : {v:edge.v,w:edge.w,transform:self.wholeWorld.edge(edge)}
			}
		})
		_.forEach(toExplore,function(explored){
			result_nodes[explored.edge.w] = explored.dst
			result_links.push(explored.edge)
			var dst_edges = self.wholeWorld.outEdges(explored.dst);
			_.forEach(dst_edges,function(dst_edge){
				result_links.push({v:dst_edge.v, v:dst_edge.w, transform:self.wholeWorld.edge(dst_edge)});
			})
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
Nodebase.prototype.populateNode = function(node_id, go){
	var self = this;
	if(self.wholeWorld.hasNode(node_id))
	{
		self.wholeWorld.node(node_id).addGO(go);
	}
}
Nodebase.prototype.exportToJSON = function(){
	var self = this;
	return graphlib.json.write(self.wholeWorld);
}
Nodebase.prototype.importFromJSON = function(json){
	var self = this;
	self.wholeWorld = graphlib.json.read(json);
}
module.exports = Nodebase;