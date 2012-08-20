goog.provide('ccode.game.Region')

ccode.game.Region = function(x,y, width, height, callbackTarget, callback) {

	var fixDef = new b2FixtureDef;
	var bodyDef = new b2BodyDef;

	bodyDef.userData = this;
	bodyDef.position = new b2Vec2(x/SCALE,y/SCALE);
	bodyDef.type = b2Body.b2_staticBody;
	fixDef.shape = new b2PolygonShape;	
	fixDef.shape.SetAsBox((width/SCALE)/2, (height/SCALE)/2);
	fixDef.isSensor = true;
	if(this.fix && this.body)
		this.body.DestroyFixture(this.fix);
	if(this.body)
		__glob.physWorld.DestroyBody(this.body);

	this.body = __glob.physWorld.CreateBody(bodyDef);
	this.fix = this.body.CreateFixture(fixDef);

	CONST(this,'fix',this.fix);
	CONST(this,'body',this.body);

	this.collisionCallbackTarget = callbackTarget;
	this.collisionCallback = callback;
}

ccode.game.Region.prototype.destroy = function(){
	if(this.body)
		__glob.physBodiesToRemove.push(this.body);
	
	console.log("DESTROYED");
}

