//ObjectModules
var _ = require("lodash");
var PIXI = require("./lib/pixi.js");

var ModuleLibrary = function(){
	
}

ModuleLibrary.prototype.Locatable = function(settings){
	return function(gameObject){
		gameObject.position = settings.position;
		if(!gameObject.getWorldCoord) gameObject.getWorldCoord = function(){return this.position}
		gameObject.isLocatable = true;
		return gameObject
	}
}
ModuleLibrary.prototype.Drawable = function(settings){
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
			var inbetween = gameObject.getWorldCoord();
			//Translate worldCoord to screenspace
			inbetween.x = inbetween.x * 64
			inbetween.y = inbetween.y * 64
			gameObject.sprite.position = inbetween
			gameObject.sprite.rotation = inbetween.rot!==undefined?inbetween.rot * Math.PI / 180:Math.PI/5*Math.random()
		}
		return gameObject
	}
}
ModuleLibrary.prototype.Selectable = function(settings){
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

module.exports = ModuleLibrary;