//GameObject.js
var _ = require("lodash");
var PIXI = require("./lib/pixi.js")

var GameObject = function(init, modules){
	if(!modules) modules = [Locatable]
	_.forEach(modules, function(module){
		init = module(init)
	})
	return init;
}
GameObject.Locatable = function(settings){
	return function(gameObject){
		//Set Class
		gameObject.isLocatable = true;
		//Set Members
		if(!gameObject.transform) gameObject.transform = settings.transform;
		if(!gameObject.getLocalCoord) gameObject.getLocalCoord = function(){return this.transform}
		return gameObject
	}
}
GameObject.Drawable = function(settings){
	return function(gameObject){
		//Set Class
		if(!gameObject.isLocatable) throw "Drawable must be Locatable first";
		gameObject.isDrawable = true;
		//Set Members
		gameObject.ownedSprites = settings.ownedSprites;
		gameObject.sprite = new PIXI.Sprite(settings.texture);
		_.extend(gameObject.sprite, settings.sprite);
		gameObject.instate = function(drawTo){
			if(gameObject.isDrawableInstated || !drawTo)
				return;
			drawTo.addChild(gameObject.sprite)
			if(gameObject.goList)
			{
				_.forEach(gameObject.goList, function(go){
					gameObject.sprite.addChild(go.sprite);
				})
			}
			gameObject.isDrawableInstated = true;
		}
		gameObject.draw = function(drawTo){
			if(!gameObject.isDrawableInstated) 
				gameObject.instate(drawTo)
			var inbetween = gameObject.getLocalCoord();
			//Translate worldCoord to screenspace
			gameObject.sprite.position = {x:inbetween.x * 64,y:inbetween.y * 64}
			gameObject.sprite.rotation = inbetween.rot!==undefined?inbetween.rot * Math.PI / 180:Math.PI/5*Math.random()
			if(gameObject.goList)
			{
				_.forEach(gameObject.goList, function(go){
					go.sprite.position = {x: go.transform.x * 64, y:go.transform.y * 64}
				})
			}
		}
		return gameObject
	}
}
GameObject.Selectable = function(settings){
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

GameObject.Debuggable = function(settings){
	return function(gameObject){
		if(!gameObject.isDrawable) throw "Debuggable must be Drawable first";
		gameObject.debugText = new PIXI.Text("",{font:"120px Arial", fill:"cyan"})
		gameObject.sprite.addChild(gameObject.debugText)
		gameObject.setDebugText = function(text){
			gameObject.debugText.setText(text)
		}
		return gameObject;
	}
}
GameObject.Mobile = function(settings){
	return function(gameObject){
		if(!gameObject.isLocatable) throw "Debuggable must be Locatable first";
		gameObject.isMobile = true;
		gameObject.move = function(x,y){
			gameObject.transform.x += 0.5 * (Math.random() - 0.5)
			gameObject.transform.y += 0.5 * (Math.random() - 0.5)
		}
		return gameObject;
	}
}
GameObject.KeyboardResponsive = function(settings){
	return function(gameObject){
		return gameObject;
	}
}

module.exports = GameObject;