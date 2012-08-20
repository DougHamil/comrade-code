goog.provide('ccode.game.Stage');

ccode.game.Stage = function(){
	this.__api = [];
	this.__name = "";
	this.__phase = 0;
	this.__className = '';
	constifyFunctions(this);
}

/*
 * Creates the stage and the entities within it.
 * Provided an entity manager.
 */
ccode.game.Stage.prototype.create = function(entMan){}
ccode.game.Stage.prototype.cleanup = function(entMan){}
ccode.game.Stage.prototype.reset = function(entMan){}
ccode.game.Stage.prototype.onPhase = function(p){}

ccode.game.Stage.prototype.update =function(dt){}

ccode.game.Stage.prototype.setPhase = function(p){this.__phase = p; this.onPhase(p);}

ccode.game.Stage.prototype.expose = function(desc,img,p,n){
	
	// Is it already added as a property of this object?
	var found = false;
	var name = p;
	for(var e in this)
	{
		if(this[e] == p)
		{
			name = e;
			// Set the name
			CONST(this[e],'name',e);
			//this[e].name = e;
			found = true;
			break;
		}
	}
	
	// Was it not already added as a property?
	if(!found)
	{
		CONST(this,n,p);
		CONST(this[n],'name',n);
	}
	
	// Constify
	//CONST(this,name,this[name]);
	this.__api.push({desc:desc,obj:p,img:img});
}

ccode.game.Stage.prototype.isExposedObjectFunction = function(o,f) {
	// First, is this even our object?
	if(!this[o]) return false;
	
	// Does the object have an api?
	if(!this[o].getAPI) return;
	
	// Next, is the function part of our object's api?
	return this[o].getAPI().funcs[f];
	
}

/*
 * Returns an API of the elements of this stage
 */
ccode.game.Stage.prototype.getAPI = function(){
	return this.__api;
}

ccode.game.Stage.prototype.getAPIIndexOfEntity = function(e){
	var l = this.__api.length;
	for(var i = 0; i < l; i++)
	{
		if(this.__api[i].obj == e)
			return i;
	}
}
