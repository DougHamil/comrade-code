goog.provide('ccode.draw.Comrade');
goog.require('ccode.draw.Sprite');

ccode.draw.Comrade = function(x,y){
	var x = x;
	var y = y;
	ccode.draw.Sprite.call(this,"media/game/comrade01_sheet2x2.png",function(){
		this.x = x;
		this.y = y;
		
		var anims = {
			idle:{
				frameRate:100000,
				frames:[
					{x:0,y:0,w:256,h:256}
				]
			},
			talk:{
				frameRate:400,
				frames:[
					{x:0,y:0,w:256,h:256},
					{x:256,y:0,w:256,h:256},
					{x:0,y:256,w:256,h:256},
					{x:256,y:256,w:256,h:256}	
				]
			}
		};
		this.setAnimations(anims);
		this.setActiveAnimation('idle');
	});
	this.className = "Comrade";
	this.sayTimer = 0;
	this.speechBubble = new ccode.draw.Sprite('media/game/comrade_bubble.png');
	this.speechBubble.visible = false;
	this.speechBubble.selectable = false;
	this.speechOffset = 20;
	this.speechBubble.y = this.speechOffset;
	this.speechBubble.x = 25;
	this.addChild(this.speechBubble);
	this.sayEl = $('#comradebubble').hide();
	var self = this;
	this.sayEl.unbind('click');
	this.sayEl.click({self:self},function(e){if(!self.permSay)self.stopSay();});
	this.sayLog = [];
	this.activeSay = undefined;
	this.adjustHeightMax = y + 300;
	this.starty = y;
	this.lowerSpeed = (300/1000); // 200 units per sec
	this.constify();
	this.selectable = false;
	this.permSay = false;
	
}
goog.inherits(ccode.draw.Comrade,ccode.draw.Sprite);

ccode.draw.Comrade.prototype.say = function(str,time, cb, cbcaller, ecb){
	
	this.sayLog.push({str:str,time:time,cb:cb,cbcaller:cbcaller,ecb:ecb});
	return;
	
}

ccode.draw.Comrade.prototype.stopSay = function()
{
	// Set timer to 0 and disable perm say
	this.sayTimer = 1;
	this.permSay = false;
}

ccode.draw.Comrade.prototype.updateInternal = function(dt){
	ccode.draw.Sprite.prototype.updateInternal.call(this,dt);
	
	if(!this.ready) return;
	
	// Are we trying to say something, but not yet raised?
	// Then raise
	if((this.sayTimer > 0 || this.permSay || this.sayLog.length > 0) && this.y > this.starty)
	{
		this.y -= (dt*this.lowerSpeed);
	}
	// Are we currently saying something?
	else if(this.sayTimer > 0 || this.permSay)
	{
		this.sayTimer -= dt;
		
		// Has time run out, and are we not permanently saying something?
		if(this.sayTimer <= 0 && !this.permSay)
		{
			this.sayEl.hide();
			
			this.setActiveAnimation('idle');
			this.speechBubble.visible = false;
			
			// FIre off the end callback if there was one
			if(this.activeSay.ecb)
			{
				if(this.activeSay.cbcaller)
					this.activeSay.ecb.call(this.activeSay.cbcaller,this);
				else
					this.activeSay.ecb.call(this);
			}
		}
	}
	else
	{
		// Is there anything in the say log?
		if(this.sayLog.length > 0 )
		{
			var say = this.sayLog[0];
			this.sayLog.splice(0,1);
			this.sayTimer = say.time;
			
			// If time was <= 0 , then we are permanently saying something
			if(this.sayTimer <= 0)
				this.permSay = true;
			this.activeSay = say;
			var pos = this.getCanvasSpacePosition();
			var x = __glob.canvas.offsetLeft + pos[0] - 64;
			var y = __glob.canvas.offsetTop + pos[1]+this.speechOffset;
		
			this.sayEl.css({ top: y, left: x});
			this.sayEl.html(say.str);
			this.sayEl.show();
			this.speechBubble.visible = true;
			this.setActiveAnimation('talk');
			
			// Fire off the callback, if there is one
			if(say.cb && say.cbcaller)
				say.cb.call(say.cbcaller,this);
			else if(say.cb)
				say.cb.call(this);
		}
		else
		{
			// There is nothing to say, lower
			if(this.y < this.adjustHeightMax)
			{
				this.y += (dt*this.lowerSpeed);
			}
		}
		
		
	}
}
