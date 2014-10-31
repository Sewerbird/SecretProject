//worldgen.js
var WorldNode = require("./worldnode.js");

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
}
module.exports = WorldGen