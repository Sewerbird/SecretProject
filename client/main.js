var _ = require("lodash");
var PIXI = require("./lib/pixi.js");

Main = function(options){
	var self = this;
	if(!options)options = {}
	self.renderer = PIXI.autoDetectRenderer(
		options.viewX?options.viewX:800,
		options.viewY?options.viewY:600,
		document.getElementById(options.viewID?options.viewID:"screen"));

	//Setup game view
	self.stage = new PIXI.Stage(0x888FFF);
	self.gameScreen = new PIXI.DisplayObjectContainer()
	self.gameScreen.scale = {x:0.2,y:0.2}
	self.gameScreen.interactive = true;
	self.stage.addChild(self.gameScreen);
	self.camera = new Camera(options.viewID?options.viewID:"screen",self.gameScreen, self);

	//Load
	self.gameObjects = [];
	self.loadAssets();

	//Animate
	requestAnimFrame(animate);
	function animate(){
		self.camera.update();
		requestAnimFrame(animate);
		_.forEach(self.gameObjects,function(child){
			if(child && child.draw)
				child.draw();
		})
		self.renderer.render(self.stage);
	};
}
Main.prototype.start = function(){
	var self = this;
	console.log("Main Started ");
	self.genRandomMap();
}
Main.prototype.genRandomMap = function(){
	var self = this;
	for(var i = 0; i < 200; i++){
		var r = Math.floor(Math.random()*3);
		var s = Math.random()>0.8;
		var x = i%20*300+150
		var y = Math.floor(i/20)*300+150
		var tex;
		if(r == 0) tex='grass1_tile'
		else if(r == 1) tex='grass2_tile'
		else if(r == 2) tex='water1_tile'
		self.gameObjects.push(
			new GameObject({},[
				Locatable({
					position:{x:x,y:y}
				}),
				Drawable({
					texture:self.assetMap[tex],
					sprite:{
						anchor:{x:0.5,y:0.5}
					}
				}),
				Selectable({

				})
				])
		);
		if(s)//shrubbery here
		{
			
			var shrub = new GameObject({},[
					Locatable({
						position:{x:x,y:y}
					}),
					Drawable({
						texture:self.assetMap[r != 2?'shrub_ent':'lily_ent'],
						sprite:{
							anchor:{x:0.5,y:0.5}
						}
					}),
					Selectable({

					})
				])
			self.gameObjects.push(shrub)
		}
	}
}
Main.prototype.loadAssets = function(){
	var self = this;
	var assetKeys = [
		'grass1_tile',
		'grass2_tile',
		'water1_tile',
		'shrub_ent',
		'lily_ent'
	]
	self.assetMap = {};
	_.forEach(assetKeys, function(key){
		self.assetMap[key] = PIXI.Texture.fromImage('img/'+key+".png");
	})
}

//Morphs attributes of a DisplayObjectContainer in response to user mouse movements to pan/zoom the visible stage
Camera = function(elementID, gameScreen, main){
	var self = this;
	self.main = main;
	self.selected = undefined;
	self.viewSize = {x:1200,y:600}
	self.pan = {x:0,y:0,minPanX:undefined,minPanY:undefined,maxPanX:undefined,maxPanY:undefined}
	self.zoom = 0.2
	self.maxZoom = 1.0
	self.minZoom = 0.05
	self.onDown = {x:undefined, y:undefined}
	self.worldScreen = gameScreen;
	document.getElementById(elementID).addEventListener('mousewheel',function(e){
		e.preventDefault();
		var diff = 0.05;
		var dir = (e.wheelDeltaY?(e.wheelDeltaY<0?-diff:diff):undefined)
		self.doZoom(dir);
	}, false)
	document.getElementById(elementID).addEventListener('mousedown',function(e){
		self.onDown.x = e.clientX
		self.onDown.y = e.clientY
	})
	document.getElementById(elementID).addEventListener('mousemove',function(e){
		if(self.onDown.x === undefined) return;
		self.doPan(self.onDown.x - e.clientX,self.onDown.y-e.clientY)
		self.onDown.x = e.clientX
		self.onDown.y = e.clientY
	})
	document.getElementById(elementID).addEventListener('mouseup',function(e){
		self.onDown = {x:undefined, y:undefined}
	})
}
Camera.prototype.doZoom = function(dZ){
	var self = this;
	if(!_.isFinite(dZ)) return;
	self.zoom += dZ;
	self.zoom = Math.max(Math.min(self.maxZoom,self.zoom),self.minZoom)
	console.log(self.zoom);

}
Camera.prototype.doPan = function(dX,dY){
	var self = this;
	self.pan.x -= dX;
	self.pan.y -= dY;
}
Camera.prototype.update = function(){
	var self = this;
	self.worldScreen.position = self.pan
	self.worldScreen.scale = {x:self.zoom,y:self.zoom}
}

////////////////////////
//Game Object Attributes
////////////////////////

GameObject = function(init, modules){
	var self = this;
	_.extend(self,init);
	if(!modules) modules = [Locatable]
	_.forEach(modules, function(module, init){
		self = module(self)
	})
}
Locatable = function(settings){
	return function(gameObject){
		gameObject.position = settings.position;
		gameObject.getWorldCoord = function(){return this.position}
		gameObject.isLocatable = true;
		return gameObject
	}
}
Drawable = function(settings){
	return function(gameObject){
		if(!gameObject.isLocatable) throw "Drawable must be Locatable first";
		gameObject.isDrawable = true;
		gameObject.draw = function(){
			gameObject.sprite.position = gameObject.getWorldCoord()
		}
		gameObject.sprite = new PIXI.Sprite(settings.texture);
		_.extend(gameObject.sprite, settings.sprite);
		myGame.gameScreen.addChild(gameObject.sprite)
		return gameObject
	}
}
Selectable = function(settings){
	return function(gameObject){
		if(!gameObject.isDrawable) throw "Selectable must be Drawable first";
		gameObject.isSelectable = true;
		gameObject.isSelected = false;
		gameObject.sprite.interactive = true;

		var filterSelected = new PIXI.ColorMatrixFilter();
		var colorMatrix =  [
		    1,0,0,0.15,
		    0,1,0,0.15,
		    0,0,1,0.15,
		    0,0,0,1
		];
		filterSelected.matrix = colorMatrix;
		gameObject.sprite.click = function(ev){
			if(gameObject.isSelected)
			{
				//deselect
				gameObject.sprite.filters = null;
				gameObject.onDeselect(ev);
				gameObject.isSelected = false;
			}
			else
			{
				//select
				console.log("WHAM!");
				gameObject.sprite.filters = [filterSelected];
				gameObject.onSelect(ev);
				gameObject.isSelected = true;
			}
		}
		gameObject.onSelect = gameObject.onSelect?gameObject.onSelect:(settings.onSelect?settings.onSelect:function(){})
		gameObject.onDeselect = gameObject.onDeselect?gameObject.onDeselect:(settings.onDeselect?settings.onDeselect:function(){})
		return gameObject
	}
}