goog.provide('ccode.draw.PhysSprite');
goog.require('ccode.draw.Sprite');

ccode.draw.PhysSprite = function(img, callback, bodyconf, fixconf, sound){
	ccode.draw.Sprite.call(this,img,callback);
	this.className = "PhysicalSprite";
	CONST(this,'bodyconf',bodyconf);

	this.fixconf = fixconf;
	this.bodyconf.userData = this;
	this.addAPIFunc("pushUp",{desc:'Applies an upward force of <code class="param">x</code> magnitude.',edit:true});
	this.addAPIFunc("setPosition",{desc:'Sets the object\'s position to x,y',edit:true});
	this.addAPIProp("body",{desc:"Physical body of the object."});

	this.sound = (sound && new Audio(sound)) || undefined;
}

goog.inherits(ccode.draw.PhysSprite,ccode.draw.Sprite);

ccode.draw.PhysSprite.prototype.pushUp = function(x)
{
	this.body.ApplyForce(new b2Vec2(0,-x),this.body.GetPosition());
}

ccode.draw.PhysSprite.prototype.setPosition = function(x,y){
	if(this.body)
	{
		this.body.clearForce();
		this.body.SetPosition(new b2Vec2(x,y));
	}
}

ccode.draw.PhysSprite.prototype.destroy = function() {
	ccode.draw.Sprite.prototype.destroy.call(this);
}

ccode.draw.PhysSprite.prototype.onLoad = function(e){
	ccode.draw.Sprite.prototype.onLoad.call(this,e,true);
	// Generate the shape from the image size
	var fixDef = new b2FixtureDef;
	var bodyDef = new b2BodyDef;
	
	fixDef.density = 0.01;
	fixDef.friction = 1.0;
	fixDef.restitution = 0.3;
	
	// Apply any body def config options
	for(var c in this.bodyconf)
	{
		bodyDef[c] = this.bodyconf[c];
	}

	// Apply any fixture def otions
	for(var c in this.fixconf)
	{
		fixDef[c] = this.fixconf[c];
	}
	
	// If no shape was given, assume they want a bounding box around the image
	if(!fixDef.shape)
	{
		fixDef.shape =  new b2PolygonShape;
		fixDef.shape.SetAsBox((this.drawRect.w / SCALE) / 2, (this.drawRect.h/SCALE) / 2);
	}
	
	if(this.fix)
		this.body.DestroyFixture(this.fix);
	if(this.body)
		__glob.physWorld.DestroyBody(this.body);
	
	this.body = __glob.physWorld.CreateBody(bodyDef);
	this.fix = this.body.CreateFixture(fixDef);
	
	// Make const
	CONST(this,'fix',this.fix);
	CONST(this,'body',this.body);
	// Do callback
	if(this.loadcallback)
		this.loadcallback();
}

/*
 * We override the Entity.contains because it generates a body and fixture
 * in the call, our body and fixture is pre-generated and is constantly updated.
 */
ccode.draw.PhysSprite.prototype.contains = function(x,y){

	return this.fix.TestPoint(new b2Vec2(x/SCALE,y/SCALE));
}


ccode.draw.PhysSprite.prototype.updateInternal = function(dt){
	
	// Don't do anything if we aren't done loading!
	if(!this.ready) return;
	
	// Call super class
	ccode.draw.Sprite.prototype.updateInternal.call(this,dt);
	
	var pos = this.body.GetPosition();
	this.x = pos.x * SCALE;
	this.y = pos.y * SCALE;
	this.rotation = this.body.GetAngle();
}
