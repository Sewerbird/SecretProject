//Nodebase.js
var _ = require("lodash");
var Graph = require("graphlib").Graph;
var Location = require("./nodelocation.js");
var WorldGen = require("./worldgen.js");
var WorldNode = require("./worldnode.js");
var WorldLink = require("./worldlink.js");
var ModLib = new (require("./modulelibrary.js"))();
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
			ModLib.Locatable({
				position:{x:node.transform.x,y:node.transform.y}
			}),
			ModLib.Drawable({
				texture:self.assetMap[node.nodeRef],
				sprite:{
					anchor:{x:0.5,y:0.5}
				}
			}),
			ModLib.Selectable({

			}),
			ModLib.Debuggable({

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
	var start = self.nodes[Math.floor(Math.random() * self.nodes.length)];
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
		console.log("laying out at depth ",depth);
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
			self.interpretTransform(parent,node,transform);
			node.laidOut = true;
			node.setDebugText(i+":"+self.decodeTransform(transform))
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
	self.workingSet.setEdge(nodeB.id,nodeA.id,self.encodeTransform(transform))
	self.workingSet.setEdge(nodeA.id,nodeB.id,self.invertTransform(self.encodeTransform(transform)))
}
/*
	Converts codes into a a bitcode representing a transform

	makeTransform("TL3") means:
		"Take the target node's left side top corner and align it to the source node's top left corner. 
		 Then slide the target node 3 units away from the corner"
	"T" is topside is 11, "L" is leftside is 00, "B" is bottomside is 01, "R" is rightside is 10
	The offset is a signed integer in [-2048..2047=2^11-1]
	The transform is then represented as a 16-bit number:
		000000000011 11  00
		   offset    src tgt   = 60
 */
Nodebase.prototype.encodeTransform = function(srcCode){
	var a = srcCode[0];
	var b = srcCode[1];

	var offset = parseInt(srcCode.substr(2,srcCode.length))
	offset = offset << 4;
	var src = (a=="T"?3:(a=="R"?2:(a=="B"?1:0))) << 2
	var tgt = (b=="T"?3:(b=="R"?2:(b=="B"?1:0)))

	return src | tgt | offset
}
Nodebase.prototype.decodeTransform = function(num){
	var offset = num >> 4
	var s = (num & 12) >> 2
	var t = num & 3

	var src = (s==3?"T":(s==2?"R":(s==1?"B":"L")))
	var tgt = (t==3?"T":(t==2?"R":(t==1?"B":"L")))

	return ""+src+tgt+offset
}
//Converts src->tgt transform code to be relative to the target (tgt->src)
Nodebase.prototype.invertTransform = function(num){
	var offset = num >> 4;
	var srcSide = (num & 12) >> 2
	var tgtSide = num & 3
	return ((~offset + 1) << 4) | (tgtSide << 2) | srcSide
}
Nodebase.prototype.interpretTransform = function(srcNode,tgtNode,transformCode){
	var offset = transformCode >> 4
	var srcSide = (transformCode & 12) >> 2
	var tgtSide = transformCode & 3

	var L1 = srcNode.extent.w/2
	var T1 = srcNode.extent.h/2
	var L2 = tgtNode.extent.w/2
	var T2 = tgtNode.extent.h/2

	//Corner
	if(srcSide == 0)
	{ 
		dx = - L1
		dy = - T1
	}
	else if(srcSide == 1)
	{ 
		dx = - L1
		dy =   T1
	}
	else if(srcSide == 2)
	{ 
		dx =   L1
		dy =   T1
	}
	else if(srcSide == 3)
	{ 
		dx =   L1
		dy = - T1
	}
	//Rotation
	if(srcSide == tgtSide)
	{
		rot = 180
	}
	else if((srcSide%2 == 0) == (tgtSide%2 == 0))
	{
		rot = 0
	}
	else
	{
		rot = 90 * (srcSide - tgtSide)
		var tmp = L2
		L2 = T2
		T2 = tmp
	}
	//Translate
	if(srcSide == 0)
	{ 
		dx += - L2
		dy +=  T2 + offset
	}
	else if(srcSide == 1)
	{ 
		dx +=   L2 + offset
		dy +=   T2
	}
	else if(srcSide == 2)
	{ 
		dx +=   L2
		dy += - T2 - offset
	}
	else if(srcSide == 3)
	{ 
		dx += - L2 - offset
		dy += - T2
	}
	
	var result = tgtNode.transform.add(dx,dy,0,0)
	result.rot = rot;
	result.id = tgtNode.transform;
	tgtNode.transform = result;
}
module.exports = Nodebase;