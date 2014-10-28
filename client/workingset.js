var _ = require('lodash');
var Graph = require('graphlib').Graph
var GameObject = require('./gameobject.js')
var Transform = require('./nodetransform.js')

var WorkingSet = function(nodebase){
	var self = this;

	self.targetNode = "0"
	self.frustrumSize = 10
	self.nodebase = nodebase
	self.workingGraph = new Graph({directed: true})
	self.workingNodes = []
}
/*
	Instantiates world nodes as renderable elements.
	//TODO: make this intelligently adapt to node eviction from working set
 */
WorkingSet.prototype.update = function(){
	var self = this
	self.workingNodes = self.nodebase.queryNear(self.targetNode, self.frustrumSize).nodes
	_.forEach(self.workingNodes, function(node,k){
		self.workingNodes[k] = GameObject(node,[
			GameObject.Locatable({
				position:{x:node.transform.x,y:node.transform.y}
			}),
			GameObject.Drawable({
				texture:self.nodebase.assetMap[node.nodeRef],
				sprite:{
					anchor:{x:0.5,y:0.5}
				}
			}),
			GameObject.Selectable({

			}),
			GameObject.Debuggable({

			})
		])
		self.workingGraph.setNode(k,self.workingNodes[k])
	})
}
/*
	Accumulate and apply transforms for the working set wrt the camera node
 */
WorkingSet.prototype.layout = function(targetNode,depth){
	var self = this;
	//TODO: Root is assumed to be first element. Change to use @targetNode

	_.forEach(self.workingNodes,function(node){
		node.laidOut = false;
		node.transform = new Transform(0,0,0,0,node.transform.id)
	})

	var start = self.workingNodes[Math.floor(self.workingNodes.length / 2)];
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
			node = self.workingGraph.node(deq.w)
			parent = self.workingGraph.node(deq.v)
			transform = self.workingGraph.edge(deq)
		}
		if(parent && transform !== undefined && !node.laidOut)
		{
			node.transform = parent.transform
			Transform.interpretTransform(parent,node,transform);
			node.laidOut = true;
			node.setDebugText(i+":"+Transform.decodeTransform(transform))
		}
		_.forEach(self.workingGraph.outEdges(node.id), function(outEdge){
			tgt = self.workingGraph.node(outEdge.w)
			if(!_.contains(toCheckQueue,outEdge) && !tgt.laidOut)
			{
				toCheckQueue.push(outEdge);
			}
		})
	}
}
WorkingSet.prototype.queryGameObjects = function(worldCoord){
	var self = this;

	return self.workingNodes;
}
module.exports = WorkingSet;