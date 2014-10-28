//Nodebase.js
var _ = require("lodash");
var Graph = require("graphlib").Graph;
var Location = require("./nodelocation.js");
var Transform = require("./nodetransform.js");
var WorldGen = require("./worldgen.js");
var WorldNode = require("./worldnode.js");
var WorldLink = require("./worldlink.js");
var PIXI = require("./lib/pixi.js")
var GameObject = require("./gameobject.js");

var Nodebase = function(){
	var self = this;
	self.instant = (new Date()).getTime()
	self.nodes = []
	self.links = []
	self.workingSet = new Graph({directed: true});
	self.loadAssets();
	self.generator = new WorldGen();
	self.generator.random(self);
	self.loadWorkingSet("targetUID");
}

/*
	Instantiates world nodes as renderable elements.
	//TODO: make this intelligently adapt to node eviction from working set
 */
Nodebase.prototype.loadWorkingSet = function(){
	var self = this
	_.forEach(self.nodes, function(node,k){
		self.nodes[k] = GameObject(node,[
			GameObject.Locatable({
				position:{x:node.transform.x,y:node.transform.y}
			}),
			GameObject.Drawable({
				texture:self.assetMap[node.nodeRef],
				sprite:{
					anchor:{x:0.5,y:0.5}
				}
			}),
			GameObject.Selectable({

			}),
			GameObject.Debuggable({

			})
		])
	})
}
/*
	Accumulate and apply transforms for the working set wrt the camera node
 */
Nodebase.prototype.layoutWorkingSet = function(targetNode,depth){
	var self = this;
	//TODO: Root is assumed to be first element. Change to use @targetNode
	_.forEach(self.nodes,function(node){
		node.laidOut = false;
		node.transform = new Location(0,0,0,0,node.transform.id)
	})
	var start = self.nodes[Math.floor(self.nodes.length / 2)];
	start.laidOut = true;
	var toCheckQueue = [];
	var node = undefined;
	var i = 0;
	while(!_.isEmpty(toCheckQueue) || start )
	{
		i++
		if(i > depth || i > 200)
		{
			toCheckQueue = [];
			return
		}
		if(start)
		{
			node = start;
			parent = start = transform = undefined;
		}
		else
		{
			var deq = toCheckQueue.shift()
			node = self.workingSet.node(deq.w)
			parent = self.workingSet.node(deq.v)
			transform = self.workingSet.edge(deq)
		}
		if(parent && transform !== undefined && !node.laidOut)
		{
			node.transform = parent.transform
			Transform.interpretTransform(parent,node,transform);
			node.laidOut = true;
			node.setDebugText(i+":"+Transform.decodeTransform(transform))
		}
		_.forEach(self.workingSet.outEdges(node.id), function(outEdge){
			tgt = self.workingSet.node(outEdge.w)
			if(!_.contains(toCheckQueue,outEdge) && !tgt.laidOut)
			{
				toCheckQueue.push(outEdge);
			}
		})
	}
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
Nodebase.prototype.queryGameObjects = function(worldCoord){
	var self = this;
	var desDeep = Math.floor(((new Date).getTime() - self.instant)/100)
	self.depth = self.depth?self.depth:3;
	if(desDeep > self.depth && desDeep < 200)
	{
		self.layoutWorkingSet("foo",self.depth);
		self.depth = desDeep;
	}
	return _.shuffle(self.nodes);//Make this instead a workingSet
}

//Find the WorldNode associated with the provided @uid
Nodebase.prototype.queryID = function(uid){
	return null;
}

//Find all WorldNodes within @meters distance of a @nodelocation
//Returns an array of WorldNode uids
Nodebase.prototype.queryNear = function(nodelocation, meters){
	var self = this;

	var results = [nodelocation.uid]
	var here = self.queryID(nodelocation.uid);

}

//Adds a node to the working set
Nodebase.prototype.declareNode = function(node){
	var self = this;
	self.nodes.push(node);
	self.workingSet.setNode(node.id,node);
}
//Adds a link to the working set
Nodebase.prototype.declareLink = function(nodeA,nodeB,transform){
	var self = this;
	self.workingSet.setEdge(nodeB.id,nodeA.id,Transform.encodeTransform(transform))
	self.workingSet.setEdge(nodeA.id,nodeB.id,Transform.invertTransform(Transform.encodeTransform(transform)))
}

module.exports = Nodebase;