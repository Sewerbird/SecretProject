var Camera = require("./camera.js");
var NodeBase = require("./nodebase.js"); 

Main = function(options){
	var self = this;

	//Create Camera
	self.camera = new Camera(options.viewID?options.viewID:"screen", self);

	//Load terrain
	self.nodebase = new NodeBase();
	self.nodebase.loadAssets();
}
Main.prototype.start = function(){
	var self = this;
	console.log("Main Started ");
	self.nodebase.random();
	self.camera.setViewState(self.nodebase)//TODO: plug in an actual viewState here
}