goog.provide('ccode.game.Cabbage');
goog.require('ccode.draw.PhysSprite');

ccode.game.Cabbage = function(x,y,size){
	var posVec = new b2Vec2(x,y);
	var fixConf = {};
	if(size)
	{
		fixConf.shape =  new b2CircleShape(size/SCALE);
		//fixConf.shape.SetAsBox((size / SCALE) / 2, (size/SCALE) / 2);
	}
	var vsize = size*2;
	ccode.draw.PhysSprite.call(this,"media/game/comrade_cabbage.png",
		function(){this.setSize(vsize,vsize);},
		{position:posVec,type:b2Body.b2_dynamicBody},
		fixConf, "media/audio/thump.wav"
	);
	this.className = "Cabbage";
}
goog.inherits(ccode.game.Cabbage,ccode.draw.PhysSprite);
