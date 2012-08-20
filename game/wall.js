__glob.genWall = function(left, right, top, bottom) {
	
	var fd = new b2FixtureDef;
	var bd = new b2BodyDef;
	bd.type = b2Body.b2_staticBody;
	fd.shape =  new b2PolygonShape;
	fd.shape.SetAsBox((__glob.canvas.width / SCALE) / 2, (30/SCALE) / 2);
	
	var bleft = {},
		bright = {},
		btop = {},
		bbottom = {};
	if(left)
	{
		bd.position.x = -15/SCALE;
		bd.position.y = (__glob.canvas.height/2)/SCALE;
		bd.angle = Math.PI/2.0;
		
		bleft.body = __glob.physWorld.CreateBody(bd);
		bleft.fix = bleft.body.CreateFixture(fd);
	}
	
	if(right)
	{
		bd.position.x = (__glob.canvas.width+15)/SCALE;
		bd.position.y = (__glob.canvas.height/2)/SCALE;
		bd.angle = Math.PI/2.0;
		
		bright.body = __glob.physWorld.CreateBody(bd);
		bright.fix = bright.body.CreateFixture(fd);
	}
	
	if(top)
	{
		bd.position.x = (__glob.canvas.width/2)/SCALE;
		bd.position.y = (-15)/SCALE;
		bd.angle = 0;
		
		btop.body = __glob.physWorld.CreateBody(bd);
		btop.fix = btop.body.CreateFixture(fd);
	}
	
	if(bottom)
	{
		bd.position.x = (__glob.canvas.width/2)/SCALE;
		bd.position.y = (__glob.canvas.height+15)/SCALE;
		bd.angle = 0;
		
		bbottom.body = __glob.physWorld.CreateBody(bd);
		bbottom.fix = bbottom.body.CreateFixture(fd);
	}
	
	return {left:bleft,right:bright,top:btop,bottom:bbottom,destroy:function(){
		for(var e in this)
		{
			if(this[e].body) {
				this[e].body.DestroyFixture(this[e].fix);
				__glob.physWorld.DestroyBody(this[e].body);
			}
		}
	}};
}