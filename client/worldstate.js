//worldstate.js
var _ = require('lodash');
var Hyperstore = require('backwire-hyperstore');

/*
	Abstraction object for game elements to modify gamestate, regardless of if that state is loaded.
 */

 var WorldState = function(session_identifier){
 	var NIDS = []; //currently loaded spatial subdivisions
 	var GOIDS = []; //gameobjects to maintain in reified state
 	var ViewStates = []; //reify/calculate world relative to tracked IDs
 	var myStore = Hyperstore.initialize('MonsterWire',["Entities"+session_identifier])
 }

/* 	WorldState.queryGOID			#public

	Retrieves the instantiated state associated with the goid passed.
	The state is guaranteed to be synced to the specified game frame

	@goid : A proper GOID or array of GOID's
	@options : You may pass the following modifiers
		-'near' : distance in meters from goid to return objects

	@result : GameObject or array of GameObjects found
*/
 WorldState.prototype.queryGOID = function(goid, options){

 }

/*	WorldState.messageGOID			#public

	Sends the given message to the gameobject indicated by the goid.
	Sending a message to an object will result in local (or remote)
	changes as necessary, usually simply adding to the internal
	history of the the gameobject for compilation in the next frame.

	@goid : A proper GOID or array of GOID's
	@message : A proper message object to broadcast
	@options : You may pass the following modifiers
		-'near' : distance in meters from goids to broadcast to nearby gameobjects

	@result : List of GOID's broadcasted to
*/
 WorldState.prototype.messageGOID = function(goid, message, options){

 }

/*  WorldState.declareViewState			#public

	Declares a view on the specified gameobject. This view will 
	subscribe to all nodes within a certain distance of the gameobject,
	and is intended to serve as a logical container for all the action
	taking place near a gameobject that a player might be interested in.

	Fundamentally, the WorldState only maintains reified objects for 
	gameobjects that are referenced by a ViewState

	@goid : A proper GOID to create a ViewState on
	@options : You may pass the following modifiers
		-

	@result : reference to a ViewState
*/
 WorldState.prototype.declareViewState = function(goid, options){
 	
 	this.ViewStates.push(new WorldState.ViewState(goid,options));
 }

/*  WorldState.queryGameObjects			#public

	Retrieves reified instances of all gameobjects associated with the
	ViewState tracking @goid. This array is to be treated as immutable:
	a snapshot that is not to be altered.

	//TODO: make result actually immutable

	@goid : A proper GOID associated with a ViewState

	@result : an array of gameobjects
*/

 WorldState.prototype.queryGameObjects = function(goid){

 }

/*  WorldState.ViewState 				#protected

	An inner class that holds the parameters for figuring out what the
	WorldState should maintain in reified form, with a few convenience
	methods built in.

	@goid : A proper GOID to associate the ViewState with
	@options : 
*/
 WorldState.ViewState = function(goid, options){
 	this.goid = goid;
 	_.extend(this,options);
 }

module.exports = WorldState;