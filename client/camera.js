var PIXI = require("./lib/pixi.js")
var _ = require("lodash")

//Viewstate that camera monitors must implement a 'queryGameObjects()' function that returns an array of objects
//that have 'draw(pixiReference)' functions to draw themselves with to a PIXI.DisplayObjectContainer

//Morphs attributes of a DisplayObjectContainer in response to user mouse movements to pan/zoom the visible stage
//Effectively peers into @main, maintains a viewable region, and draws to @elementID canvas
var Camera = function(canvasID){
	var self = this;
	self.selected = undefined;
	self.viewSize = {x:800,y:400}
	self.pan = {x:150,y:150,minPanX:undefined,minPanY:undefined,maxPanX:undefined,maxPanY:undefined}
	self.zoom = 0.05
	self.maxZoom = 1.0
	self.minZoom = 0.05
	self.onDown = {x:undefined, y:undefined}
	//Setup canvas
	self.canvasID = canvasID
	self.renderer = PIXI.autoDetectRenderer(
	self.viewSize.x,
	self.viewSize.y,
	document.getElementById(self.canvasID));
	self.stage = new PIXI.Stage(0xDDDFFF);


	document.getElementById(canvasID).addEventListener('mousewheel',function(e){
		e.preventDefault();
		var diff = 0.05;
		var dir = (e.wheelDeltaY?(e.wheelDeltaY<0?-diff:diff):undefined)
		self.doZoom(dir);
	}, false)
	document.getElementById(canvasID).addEventListener('mousedown',function(e){
		self.onDown.x = e.clientX
		self.onDown.y = e.clientY
	})
	document.getElementById(canvasID).addEventListener('mousemove',function(e){
		if(self.onDown.x === undefined) return;
		self.doPan(self.onDown.x - e.clientX,self.onDown.y-e.clientY)
		self.onDown.x = e.clientX
		self.onDown.y = e.clientY
	})
	document.getElementById(canvasID).addEventListener('mouseup',function(e){
		self.onDown = {x:undefined, y:undefined}
	})
}
Camera.prototype.doZoom = function(dZ){
	var self = this;
	if(!_.isFinite(dZ)) return;
	self.zoom += dZ;
	self.zoom = Math.max(Math.min(self.maxZoom,self.zoom),self.minZoom)
}
Camera.prototype.doPan = function(dX,dY){
	var self = this;
	self.pan.x -= dX;
	self.pan.y -= dY;
} 
Camera.prototype.update = function(){
	var self = this;
	self.oToRender = self.viewState.queryGameObjects();
	self.gameScreen.position = {x:self.viewSize.x/2,y:self.viewSize.y/2}//self.pan
	self.gameScreen.scale = {x:self.zoom,y:self.zoom}
}
Camera.prototype.drawVisibleWorld = function(){
	var self = this;
	requestAnimFrame(_.bind(self.drawVisibleWorld,this))
	_.forEach(self.oToRender, function(child){
		if(child && child.draw)
			child.draw(self.gameScreen, 0, 0);
	})
	self.renderer.render(self.stage);
}
Camera.prototype.setViewState = function(viewState){
	var self = this;

	self.gameScreen = new PIXI.DisplayObjectContainer()
	self.gameScreen.scale = {x:0.2,y:0.2}
	self.gameScreen.interactive = true;
	self.viewState = viewState;	
	self.stage.addChild(self.gameScreen);

	//Animate
	requestAnimFrame(_.bind(self.drawVisibleWorld,this));
	setInterval(_.bind(self.update,this),100)
}
module.exports = Camera;