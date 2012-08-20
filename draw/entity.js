goog.provide("ccode.draw.Entity");

ccode.draw.Entity = function() {	
	this.guid = __glob.getNextGUID();
	this.x = 0;
	this.y = 0;
	this.depth = 0;
	this.scalex = 1;
	this.scaley = 1;
	this.rotation = 0;
	this.children = [];
	this.parent = undefined;
	this.children.push(this);
	this.className = "Entity";
	this.apifuncs = {};
	this.apiprops = {};
	this.collBox ={x:0,y:0,w:0,h:0};
	this.selectable = true;
	this.body = undefined;
	this.fix = undefined;
	this.ready = true;
	this.visible = true;
	this.updatable = true;
	this.name = "";

}

ccode.draw.Entity.prototype.constify = function(){
	constifyFunctions(this, this.editableFuncs);
}
ccode.draw.Entity.prototype.addAPIFunc = function(f,d) {
	this.apifuncs[f] = d;
	
	// Be sure to constify if it's not editable
	if(!d.edit) {
		try{
		CONST(this,f,this[f]);
		}catch(e){/* Already CONSTed*/}
	} else {
		// If it's editable, we need to add it to our protected functions list
		if(!this.editableFuncs)this.editableFuncs = [];
		this.editableFuncs.push(f);
	}

}
ccode.draw.Entity.prototype.addAPIProp = function(p,d){	this.apiprops[p] = d;}
ccode.draw.Entity.prototype.removeAPIFunc = function(f){delete this.apifuncs[f];}
ccode.draw.Entity.prototype.removeAPIProp = function(p){delete this.apiprops[p];}
ccode.draw.Entity.prototype.getAPI = function(){
	
	// Our API is required, we need to constify now to protected ourself
	try{
	this.constify();
	}catch(err){/*already consted*/}
	return {funcs:this.apifuncs,props:this.apiprops};
}

ccode.draw.Entity.prototype.getClassName = function(){
	return this.className;
}

ccode.draw.Entity.prototype.getCanvasSpaceCollBox = function(){
	// First, get our position in canvas space (considering scene graph)
	var pos = this.getCanvasSpacePosition();
	var sca = this.getCanvasSpaceScale();
	
	// Calculate actual collision box using final scale and position
	var box = {x:pos[0]+this.collBox.x,y:pos[1]+this.collBox.y,w:this.collBox.w*sca[0],h:this.collBox.h*sca[1]};
	return box;
}

/*
 * Returns true if collBox contains canvas space coordinate (x,y)
 */
ccode.draw.Entity.prototype.contains = function(x,y){
	
	if(!this.ready || !this.selectable) return false;

	var fixDef = new b2FixtureDef;
	var bodyDef = new b2BodyDef;
	
	bodyDef.type = b2Body.b2_staticBody;
	
	var pos = this.getCanvasSpacePosition();
	var sca = this.getCanvasSpaceScale();
	var rot = this.getCanvasSpaceRotation();
	
	// positions the center of the object (not upper left!)
	//console.log(pos);
	bodyDef.position.x = (pos[0]) / SCALE;
	bodyDef.position.y = (pos[1]) / SCALE;
	bodyDef.angle = rot;
	fixDef.shape = new b2PolygonShape;
	fixDef.isSensor = true;
       
	// half width, half height.
	//console.log(sca);
	fixDef.shape.SetAsBox((this.collBox.w*sca[0] / SCALE) / 2, (this.collBox.h*sca[1]/SCALE) / 2);
	
	if(this.fix)
		this.body.DestroyFixture(this.fix);
	if(this.body)
		__glob.physWorld.DestroyBody(this.body);
	
	this.body = __glob.physWorld.CreateBody(bodyDef);
	this.fix = this.body.CreateFixture(fixDef);
	//console.log(body);
	return this.fix.TestPoint(new b2Vec2(x/SCALE,y/SCALE));
}

ccode.draw.Entity.prototype.getCanvasSpaceDepth = function(){
	if(this.parent)
	{
		return this.depth + this.parent.getCanvasSpaceDepth();
	}
	
	return this.depth;
}
ccode.draw.Entity.prototype.getCanvasSpaceScale = function(){
	if(this.parent)
	{
		var pp = this.parent.getCanvasSpaceScale();
		return [this.scalex*pp[0],this.scaley*pp[1]];
	}
	
	return [this.scalex,this.scaley];
}

ccode.draw.Entity.prototype.getCanvasSpacePosition = function(){
	if(this.parent)
	{
		var pp = this.parent.getCanvasSpacePosition();
		var ps = this.parent.getCanvasSpaceScale();
		var pr = this.parent.getCanvasSpaceRotation();
		var dist = Math.sqrt((this.x*ps[0])*(this.x*ps[0]) + (this.y*ps[1])*(this.y*ps[1]));
		return [(dist)*Math.cos(pr)+pp[0],(dist)*Math.sin(pr)+pp[1]];
		//var dist = Math.sqrt((this.x)*(this.x) + (this.y)*(this.y));
		//return [(dist*ps[0])*Math.cos(pr)+pp[0],(dist*ps[1])*Math.sin(pr)+pp[1]];
	}
	
	return [this.x,this.y];
}
ccode.draw.Entity.prototype.getCanvasSpaceRotation = function(){
	if(this.parent)
	{
		var pp = this.parent.getCanvasSpaceRotation();
		return this.rotation+pp;
	}
	
	return this.rotation;
}

ccode.draw.Entity.prototype.addChild = function(ent)
{
	
	if(ent.getClassName() == "PhysicalSprite")
	{
		console.error("Attempted to add a physical sprite as a child entity, this won't work!");
		return;
	}
	
	// Does this entity already have a parent?
	if(ent.parent)
	{
		ent.removeFromParent();
	}
	
	this.children.push(ent);
	ent.parent = this;
	
	this.doSort();
	
	__glob.entityManager.computeFlattened();
}

ccode.draw.Entity.prototype.removeChild = function(ent)
{
	this.children.remove(ent);
	ent.parent = undefined;
	__glob.entityManager.computeFlattened();
}

ccode.draw.Entity.prototype.removeFromParent = function()
{
	if(this.parent)
		this.parent.removeChild(this);
	else
		__glob.entityManager.removeEntity(this);
}

ccode.draw.Entity.prototype.destroy = function(){
	if(this.fix)
		this.body.DestroyFixture(this.fix);
	if(this.body)
		__glob.physWorld.DestroyBody(this.body);
	this.removeFromParent();
}

ccode.draw.Entity.prototype.doSort = function(){
	this.children.sort(function(a,b){return a.depth - b.depth;})
}

ccode.draw.Entity.prototype.setDepth = function(d){
	this.depth = d;
	
	if(this.parent != undefined)
		this.parent.doSort();
	else
		__glob.entityManager.doSort();
}

ccode.draw.Entity.prototype.update = function(deltaTime) {
	
	// Don't update if we're not updatable
	if(!this.updatable) return;
	
	for(var i = 0; i < this.children.length; i++)
	{
		if(this.children[i] == this)
			this.updateInternal(deltaTime);
		else
			this.children[i].update(deltaTime);
	}	
}

ccode.draw.Entity.prototype.draw = function(ctx) {
	
	// Don't draw if we're not visible!
	if(!this.visible)
	{ 
	
		return;
	}
	
	ctx.save();
	ctx.translate(this.x, this.y);
	ctx.rotate(this.rotation);
	ctx.scale(this.scalex, this.scaley);
	
	
	// Draw all children (which includes this, for sorting)
	for(var i = 0; i < this.children.length; i++)
	{		
		if(this.children[i] == this)
			this.drawInternal(ctx);
		else
			this.children[i].draw(ctx);
	}
	ctx.restore();
	
}

ccode.draw.Entity.prototype.updateInternal = function(dt){}					// Subclasses implement this to handle updates
ccode.draw.Entity.prototype.drawInternal = function(ctx){}					// Subclasses implement this to handle drawing

