goog.provide('ccode.draw.Line');
goog.require('ccode.draw.Entity');


ccode.draw.Line = function(sx, sy, ex, ey, strokeStyle, width)
{
	ccode.draw.Entity.call(this);
	this.startx = sx;
	this.starty = sy;
	this.endx = ex;
	this.endy = ey;
	this.width = width;
	this.strokeStyle = (strokeStyle ||  __glob.ctx.strokeStyle);
};

goog.inherits(ccode.draw.Line, ccode.draw.Entity);

ccode.draw.Line.prototype.drawInternal = function(ctx) {

	var oldStyle = ctx.strokeStyle;
	var oldWidth = ctx.lineWidth;
	ctx.lineWidth = this.width;
	ctx.strokeStyle = this.strokeStyle;
	ctx.moveTo(this.startx, this.starty);
	ctx.lineTo(this.endx, this.endy);
	ctx.stroke();
	ctx.strokeStyle = oldStyle;
	ctx.lineWidth = oldWidth;
}
