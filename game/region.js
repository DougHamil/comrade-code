goog.provide('ccode.game.Region');
goog.require('ccode.draw.Entity');

ccode.game.Region = function(x,y, width, height, drawConf, callbackTarget, callback) {

	ccode.draw.Entity.call(this);
	var fixDef = new b2FixtureDef;
	var bodyDef = new b2BodyDef;

	bodyDef.userData = this;
	bodyDef.position = new b2Vec2((x+width/2)/SCALE,(y+height/2)/SCALE);
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
	this.drawConf = drawConf;
	this.collisionCallbackTarget = callbackTarget;
	this.collisionCallback = callback;
	this.isVisible = this.drawConf !== undefined;
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
	this.selectable = false;
};

goog.inherits(ccode.game.Region, ccode.draw.Entity);

ccode.game.Region.prototype.destroy = function(){
	if(this.body)
		__glob.physBodiesToRemove.push(this.body);
};

ccode.game.Region.prototype.drawInternal = function(ctx){
	if(!this.isVisible)
		return;
	
	var oldConf = {};	
	for(var c in this.drawConf)
	{
		if(ctx[c])
		{
			oldConf = ctx[c];
			ctx[c] = this.drawConf[c];
		}	
	}

	if(this.drawConf.filled)
	{
		ctx.fillRect(this.x, this.y, this.width, this.height);
	}
	else
	{
		ctx.strokeRect(this.x, this.y, this.width, this.height);
	}

	for(var c in oldConf)
	{
		ctx[c] = oldConf[c];
	}
};

