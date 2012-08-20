goog.provide('ccode.draw.Sprite');
goog.require('ccode.draw.Entity');

ccode.draw.Sprite = function(img, callback) {
	ccode.draw.Entity.call(this);
	this.activeAnim = undefined;
	this.anims = undefined;
	this.frameTime = 0;
	this.currentFrame = undefined;
	this.curentFrameIdx = 0;
	this.ready = false;
	this.img = document.createElement("img");
	this.loadcallback = callback;
	var self = this;
	this.img.onload = function(e) {self.onLoad(e);}
	this.img.setAttribute("src",img);
	this.className = "Sprite";
	this.drawRect = {x:0,y:0,w:0,h:0};

}
goog.inherits( ccode.draw.Sprite,ccode.draw.Entity);

ccode.draw.Sprite.prototype.setSize = function(x,y){
	this.collBox.w = x;
	this.collBox.h = y;
	this.drawRect.w = x;
	this.drawRect.h = y;
}

ccode.draw.Sprite.prototype.onLoad = function(e,docb){
	this.collBox.w = this.img.width;
	this.collBox.h = this.img.height;
	this.drawRect.w = this.img.width;
	this.drawRect.h = this.img.height;
	this.ready = true;
	if(!docb && this.loadcallback)
		this.loadcallback();
}
/*
 * Sets this sprite's animations. 
 * 
 * @param anims a map of animation names to frame objects
 */
ccode.draw.Sprite.prototype.setAnimations = function(anims){
	this.anims = anims;
}

/*
 * Sets this sprite's active animation
 * 
 * @param anim the name of an animation to make active
 */
ccode.draw.Sprite.prototype.setActiveAnimation = function(anim){
	if(this.anims)
	{
		// Store active animation
		this.activeAnim = this.anims[anim];
		// Reset timer
		this.frameTime = 0;
		// Store current frame as first frame
		this.currentFrame = this.activeAnim.frames[0];
		this.currentFrameIdx = 0;	
	}
}


ccode.draw.Sprite.prototype.updateInternal = function(dt) {
		
	// Don't do anything if we aren't done loading!
	if(!this.ready) return;
	
	if(this.activeAnim != undefined) {
		
		// How long have we been on our frame?
		this.frameTime += dt;
		
		// Time to switch frames?
		if(this.frameTime >= this.activeAnim.frameRate)
		{
			// Increment or wrap frame
			this.currentFrameIdx = this.currentFrameIdx >= this.activeAnim.frames.length - 1 ? 0 : this.currentFrameIdx + 1;
			this.currentFrame = this.activeAnim.frames[this.currentFrameIdx];
			this.collBox.w = this.currentFrame.w;
			this.collBox.h = this.currentFrame.h;
			// Reset our frame time
			this.frameTime = 0;
		}
	}
}

ccode.draw.Sprite.prototype.drawInternal = function(ctx) {

	// Don't do anything if we aren't done loading!
	if(!this.ready) return;
	
 	if(this.currentFrame)
 	{
		var cf = this.currentFrame;
		//console.log(cf.x);
		ctx.drawImage(this.img, 
			cf.x, cf.y, cf.w, cf.h,								// Source rectangle	(image space)
			-cf.w/2, -cf.h/2, cf.w, cf.h);									// Destination rectangle (entity space)
	}
	else
	{
		// Just draw the image if this sprite isn't animated.
		ctx.drawImage(this.img,-this.drawRect.w/2,-this.drawRect.h/2,this.drawRect.w,this.drawRect.h);
	}
}

