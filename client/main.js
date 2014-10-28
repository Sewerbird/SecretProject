var _ = require("lodash");
var Camera = require("./camera.js");
var NodeBase = require("./nodebase.js"); 
var WorldGen = require("./worldgen.js");
var WorkingSet = require("./workingset.js");

Main = function(options){
	var self = this;

	//Create Camera
	self.camera = new Camera(options.viewID?options.viewID:"screen", self);
	//Load terrain
	self.nodebase = new NodeBase();
	WorldGen.random(self.nodebase);
}
Main.prototype.start = function(){
	var self = this;
	console.log("Main Started ");
	//Set up a player
	self.workingset = new WorkingSet(self.nodebase)
	setInterval(_.bind(self.workingset.update,self.workingset), 1000)
	self.camera.setViewState(self.workingset)//TODO: plug in an actual viewState here
}