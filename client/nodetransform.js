/*
	Converts codes into a a bitcode representing a transform

	makeTransform("TL3") means:
		"Take the target node's left side top corner and align it to the source node's top left corner. 
		 Then slide the target node 3 units away from the corner"
	"T" is topside is 11, "L" is leftside is 00, "B" is bottomside is 01, "R" is rightside is 10
	The offset is a signed integer in [-2048..2047=2^11-1]
	The transform is then represented as a 16-bit number:
		000000000011 11  00
		   offset    src tgt   = 60
 */
 var NodeTransform = function(){

 }
NodeTransform.encodeTransform = function(srcCode){
	var a = srcCode[0];
	var b = srcCode[1];

	var offset = parseInt(srcCode.substr(2,srcCode.length))
	offset = offset << 4;
	var src = (a=="T"?3:(a=="R"?2:(a=="B"?1:0))) << 2
	var tgt = (b=="T"?3:(b=="R"?2:(b=="B"?1:0)))

	return src | tgt | offset
}
NodeTransform.decodeTransform = function(num){
	var offset = num >> 4
	var s = (num & 12) >> 2
	var t = num & 3

	var src = (s==3?"T":(s==2?"R":(s==1?"B":"L")))
	var tgt = (t==3?"T":(t==2?"R":(t==1?"B":"L")))

	return ""+src+tgt+offset
}
//Converts src->tgt transform code to be relative to the target (tgt->src)
NodeTransform.invertTransform = function(num){
	var offset = num >> 4;
	var srcSide = (num & 12) >> 2
	var tgtSide = num & 3
	return ((~offset + 1) << 4) | (tgtSide << 2) | srcSide
}
NodeTransform.interpretTransform = function(srcNode,tgtNode,transformCode){
	var offset = transformCode >> 4
	var srcSide = (transformCode & 12) >> 2
	var tgtSide = transformCode & 3

	var L1 = srcNode.extent.w/2
	var T1 = srcNode.extent.h/2
	var L2 = tgtNode.extent.w/2
	var T2 = tgtNode.extent.h/2

	//Corner
	if(srcSide == 0)
	{ 
		dx = - L1
		dy = - T1
	}
	else if(srcSide == 1)
	{ 
		dx = - L1
		dy =   T1
	}
	else if(srcSide == 2)
	{ 
		dx =   L1
		dy =   T1
	}
	else if(srcSide == 3)
	{ 
		dx =   L1
		dy = - T1
	}
	//Rotation
	if(srcSide == tgtSide)
	{
		rot = 180
	}
	else if((srcSide%2 == 0) == (tgtSide%2 == 0))
	{
		rot = 0
	}
	else
	{
		rot = 90 * (srcSide - tgtSide)
		var tmp = L2
		L2 = T2
		T2 = tmp
	}
	//Translate
	if(srcSide == 0)
	{ 
		dx += - L2
		dy +=  T2 + offset
	}
	else if(srcSide == 1)
	{ 
		dx +=   L2 + offset
		dy +=   T2
	}
	else if(srcSide == 2)
	{ 
		dx +=   L2
		dy += - T2 - offset
	}
	else if(srcSide == 3)
	{ 
		dx += - L2 - offset
		dy += - T2
	}
	
	var result = tgtNode.transform.add(dx,dy,0,0)
	result.rot = rot;
	result.id = tgtNode.transform;
	tgtNode.transform = result;
}

module["exports"] = NodeTransform