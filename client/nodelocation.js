//Nodelocation
var _ = require("lodash");

var nLoc = function(x,y,z,rot,uid){
	var self = this;
	if(x && _.isNumber(x.x))
	{
		self = _.extend(self,x)
	}
	else
	{
		self.x = x;
		self.y = y;
		self.z = z;
		self.uid = uid;
		self.rot = rot;
	}
}

nLoc.prototype.getDistance = function(other, cubed){
	var self = this;

	//Same node: same coordinate space, so simple to compute
	if(self.uid == other.uid){
		var situ = Math.pow(self.x-other.x,2) + Math.pow(self.y-other.y,2) + Math.pow(self.z-other.z,2)
		if(cubed) return situ
		else return Math.pow(situ,1/3)
	}
	//Different nodes
	else
	{
		return undefined;//TODO expand logic here to handle between-node distances
	}
}
nLoc.prototype.add = function(x,y,z,rot,uid){
	var self = this;
	var result = new nLoc(self.x,self.y,self.z,self.rot);
	var other;
	if(x && _.isNumber(x.x))
	{
		other = x;
	}
	else
	{
		other = new nLoc(x,y,z,rot)
	}
	result.x += other.x;
	result.y += other.y;
	result.z += other.z;
	result.rot = (result.rot + other.rot) % 360
	result.uid = uid?uid:self.uid;
	return result;
}
nLoc.prototype.sub = function(x,y,z,rot,uid){
	return this.add(_.isNumber(x)?-x:x,_.isNumber(x)?-y:y,_.isNumber(x)?-z:z,-rot,uid);
}
module.exports = nLoc;