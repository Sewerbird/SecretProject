//Nodebase.js
var _ = require("lodash");
var Location = require("./nodelocation.js");
var WorldGen = require("./worldgen.js");
var WorldNode = require("./worldnode.js");
var WorldLink = require("./worldlink.js");
var ModLib = new (require("./modulelibrary.js"))();
var PIXI = require("./lib/pixi.js")
var GameObject = require("./gameobject.js");

var Nodebase = function(){
	var self = this;

	self.nodes = []
	self.links = []
	self.workingSet = [];

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
	self.workingSet = _.map(nodes, function(node){
		return GameObject(node,[
			ModLib.Locatable({
				position:{x:a.transform.x,y:a.transform.y}
			}),
			ModLib.Drawable({
				texture:self.assetMap[a.nodeRef],
				sprite:{
					anchor:{x:0.5,y:0.5}
				}
			}),
			ModLib.Selectable({

			})
		])
	})
}
Nodebase.prototype.layoutWorkingSet = function(){
	//TODO: Root is assumed to be first element
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

//Adds a node to the dataset
Nodebase.prototype.declareNode = function(node){
	var self = this;
	self.nodes.push(node);
}
//Adds a link to the dataset
Nodebase.prototype.declareLink = function(nodeA,nodeB,transform){
	var self = this;
	var link = new WorldLink(nodeA,nodeB,transform)
	nodeA.link(link);
	nodeB.link(link);
	self.links.push(link);
	return link;
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
	return num >> 4 >0?~(num-16):(num >> 4 < 0?~num+16:~((num<<12) >>12)+16)
}
Nodebase.prototype.interpretTransform = function(srcNode,tgtNode,num){
	var offset = num >> 4
	var srcSide = (num & 12) >> 2
	var tgtSide = num & 3

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