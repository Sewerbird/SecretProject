var _ = require("lodash");
var Camera = require("./camera.js");
var PIXI = require("./lib/pixi.js");

Main = function(options){
	var self = this;

	//Create Camera
	self.camera = new Camera(options.viewID?options.viewID:"screen", self);

	//Load
	self.gameObjects = [];
	self.loadAssets();
}
Main.prototype.queryGameObjects = function(worldCoord){
	var self = this;
	return self.gameObjects;
}
Main.prototype.start = function(){
	var self = this;
	console.log("Main Started ");
	self.genRandomMap();
	self.camera.setViewState(self)//TODO: plug in an actual viewState here
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
		gameObject.sprite = new PIXI.Sprite(settings.texture);
		_.extend(gameObject.sprite, settings.sprite);

		gameObject.instate = function(drawTo){
			if(gameObject.isDrawableInstated || !drawTo)
				return;
			drawTo.addChild(gameObject.sprite)
			gameObject.isDrawableInstated = true;
		}
		gameObject.draw = function(drawTo){
			if(!gameObject.isDrawableInstated) 
				gameObject.instate(drawTo)
			gameObject.sprite.position = gameObject.getWorldCoord()
		}
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