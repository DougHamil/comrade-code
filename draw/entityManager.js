goog.provide("ccode.draw.EntityManager");

ccode.draw.EntityManager = function(ctx)
{
	this.ctx = ctx;
	this.entities = [];
	this.oldTime = 0;
	this.drawBounds = true;
	this.flattened = [];
}
ccode.draw.EntityManager.prototype.setDrawBound = function(p){
	this.drawBounds = p;
}
ccode.draw.EntityManager.prototype.addEntity = function(ent) {
	this.entities.push(ent);
	this.doSort();
	this.computeFlattened();
}

ccode.draw.EntityManager.prototype.removeEntity = function(ent) {
	this.entities.remove(ent);
	this.computeFlattened();
}

ccode.draw.EntityManager.prototype.computeFlattened = function(){
	function recFlatten(e,arr){
		arr.push(e);
		
		if(!e.children)
			return;
		var ll = e.children.length;
		for(var i = 0; i < ll; i++)
		{
			if(e != e.children[i]){
				recFlatten(e.children[i],arr);
			}
		}
	}
	
	this.flattened = [];
	// Add all entities to the flattened array
	var l = this.entities.length;
	for(var i = 0; i < l; i++)
	{
		recFlatten(this.entities[i],this.flattened);
	}
	
	// Now sort the array from highest to lowest depth
	this.flattened.sort(function(a,b){return b.getCanvasSpaceDepth() - a.getCanvasSpaceDepth();});
}

ccode.draw.EntityManager.prototype.doSort = function(){
	this.entities.sort(function(a,b){return a.depth - b.depth;})
}

ccode.draw.EntityManager.prototype.update = function(dt){
	// Go through each entity and draw
	var l = this.entities.length;
	for(var i = 0; i < l; i++)
	{
		//console.log(ent);
		this.entities[i].update(dt);
	}
}
ccode.draw.EntityManager.prototype.getEntityAt = function(x,y){

	var l = this.flattened.length;
	for(var i = 0; i < l; i++)
	{
		if(this.flattened[i].contains(x,y))
			return this.flattened[i];
	}
	
	return undefined;
}
ccode.draw.EntityManager.prototype.getSelectableEntityAt = function(x,y){

	var l = this.flattened.length;
	for(var i = 0; i < l; i++)
	{
		if(this.flattened[i].selectable && this.flattened[i].contains(x,y))
			return this.flattened[i];
	}
	
	return undefined;
}
ccode.draw.EntityManager.prototype.draw = function(){
	
	// Go through each entity and draw
	var l = this.entities.length;
	for(var i = 0; i < l; i++)
	{
		this.entities[i].draw(this.ctx);
	}
}
