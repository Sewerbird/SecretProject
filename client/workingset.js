var _ = require('lodash');
var Graph = require('graphlib').Graph
var GameObject = require('./gameobject.js')
var Transform = require('./nodetransform.js')

//The Working Set is the logical set of 'loaded' elements available for simulation and display
var WorkingSet = function(target, nodebase){
	var self = this;

	self.target = target;
	if(target.isLocatable)
		self.targetNode = target.transform.uid;
	else
		self.targetNode = "foo-0"

	self.frustrumSize = 10
	self.nodebase = nodebase
	self.workingGraph = new Graph({directed: true})
	self.workingNodes = {}
	self.needsReset = true;
}
/*
	Instantiates world nodes as renderable elements.
	//TODO: make this intelligently adapt to node eviction from working set
 */
WorkingSet.prototype.update = function(){
	var self = this
	if(self.needsReset)
	{
		//_.forEach(self.workingNodes,function(node){
		//	node.cache()
		//})
		var received = self.nodebase.queryNear(self.targetNode, self.frustrumSize)
		self.workingNodes = received.nodes//TODO: don't throw out baby with bathwater on update. Cache/Retain nodes.
		_.forEach(self.workingNodes, function(node,k){
			self.workingNodes[node.id] = GameObject(node,[
				GameObject.Locatable({
					transform:node.transform
				}),
				GameObject.Drawable({
					texture:self.nodebase.assetMap[node.nodeRef],
					sprite:{
						anchor:{x:0.5,y:0.5}
					}
				}),
				GameObject.Selectable(),
				GameObject.Debuggable()
			])
			self.workingGraph.setNode(node.id,self.workingNodes[node.id])
		})
		_.forEach(received.links, function(edge,k){
			if(!self.workingGraph.hasEdge(edge)){
				//Add this non-existing edge
				self.workingGraph.setEdge(edge.v,edge.w,edge.transform)
			}
		})
		self.layout(10);
		self.needsReset = false;
	}
	else{
		_.forEach(self.workingNodes, function(node,k){
			if(node.goList){
				_.forEach(node.goList, function(go){
					if(go.isMobile)
						go.move();
					if(node.containsPoint(go.transform))
						console.log("INSIDE OF ",node.id);
					else
					{
						_.forEach(self.workingNodes, function(nodeToCheck){
							if(nodeToCheck.containsPoint(go.transform))
							{
								node.removeGO(go);
								go.transform = go.transform.sub(nodeToCheck.transform);
								go.transform.uid = nodeToCheck.id;
								nodeToCheck.addGO(go);
								self.targetNode = nodeToCheck.id
								self.needsReset = true;
								self.update();
								self.layout(10)
								console.log("INSIDE OF",nodeToCheck.id);
							}
						})
					}
				})
			}
		})
	}
}
/*
	Accumulate and apply transforms for the working set wrt the camera node
 */
WorkingSet.prototype.layout = function(depth){
	var self = this;
	//TODO: Root is assumed to be first element. Change to use @targetNode

	_.forEach(self.workingNodes,function(node){
		node.laidOut = false;
		node.transform = new Transform(0,0,0,0,node.transform.id)
	})

	var start = self.workingGraph.node(self.targetNode);
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
			_.forEach(node.goList, function(go){
				if(go.isLocatable)
					go.transform = node.transform.add(go.transform);
			})
			node.laidOut = true;
			//node.setDebugText(i+":"+Transform.decodeTransform(transform))
		}
		_.forEach(self.workingGraph.outEdges(node.id), function(outEdge){
			tgt = self.workingGraph.node(outEdge.w)
			if(!_.contains(toCheckQueue,outEdge) && tgt && !tgt.laidOut)
			{
				toCheckQueue.push(outEdge);
			}
		})
	}
}
WorkingSet.prototype.queryGameObjects = function(){
	var self = this;

	return self.workingNodes;
}
module.exports = WorkingSet;