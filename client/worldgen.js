//worldgen.js
var WorldNode = require("./worldnode.js");
var GameObject = require("./gameobject.js");
var Transform = require("./nodetransform.js");

var WorldGen = function(){

}

WorldGen.random = function(tgtNodebase){
	var fullWorld = [];

	var rows = 10;
	var cols = 10;

	for(var k = 0; k < rows * cols; k++)
	{
		var wn = new WorldNode();
		wn.id = "foo-"+k
		tgtNodebase.declareNode(wn);
		if(k % cols > 0)//link to left
			tgtNodebase.declareLink(wn,fullWorld[k-1],"RL0");
		if(k >= cols)//link to above
			tgtNodebase.declareLink(wn,fullWorld[(k-cols)],"BT0");

		//make torus world
		if(k % cols == cols - 1)//link to right for wrap around if furthest right
			tgtNodebase.declareLink(wn,fullWorld[k - cols + 1],"LR0");
		if(k >= (rows * cols) - cols)
			tgtNodebase.declareLink(wn,fullWorld[k % cols],"TB0");

		fullWorld[k] = wn
	}
	var test_denizen = new GameObject({},[
			GameObject.Locatable({
				transform : new Transform(3,1,3,0,"foo-0")
			}),
			GameObject.Drawable({
				texture:tgtNodebase.assetMap['denizen'],
				sprite:{
					anchor:{x:0.5,y:0.5}
				}
			}),
			GameObject.Selectable({}),
			GameObject.Mobile({})
		])
	tgtNodebase.populateNode("foo-0",test_denizen);
}
module.exports = WorldGen