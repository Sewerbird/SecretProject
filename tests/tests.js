module("Basic Initialization");

test("Main creates canvas of correct size specified and respects defaults", function(){
	var main1 = (new Main({viewX:600,viewY:300,viewID:"viewPort"})).start()
	var main2 = (new Main({viewX:600,viewY:300,viewID:"viewPort2"})).start()
	var main3 = (new Main()).start()
})