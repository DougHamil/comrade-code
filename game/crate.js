goog.provide('ccode.game.Crate');
goog.require('ccode.draw.PhysSprite');

ccode.game.Crate = function(x,y,size){
	var posVec = new b2Vec2(x,y);
	var fixConf = {density:1};
	if(size)
	{
		fixConf.shape =  new b2PolygonShape;
		fixConf.shape.SetAsBox((size / SCALE) / 2, (size/SCALE) / 2);
	}
	var vsize = size;
	ccode.draw.PhysSprite.call(this,"media/game/crate.png",
		function(){this.setSize(vsize,vsize);},
		{position:posVec,type:b2Body.b2_dynamicBody},
		fixConf, "media/audio/thump.wav"
	);
	this.className = "Crate";
}
goog.inherits(ccode.game.Crate,ccode.draw.PhysSprite);
