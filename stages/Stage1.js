goog.provide('ccode.game.Stage1');
goog.require('ccode.game.Stage');
goog.require('ccode.draw.PhysSprite');
goog.require('ccode.draw.EntityManager');
goog.require('ccode.draw.Comrade');

ccode.game.Stage1 = function() {
	ccode.game.Stage.call(this);

	this.name ="Tutorial 02";
	this.groundBody = undefined;
	this.groundFix = undefined;
	this.comrade = undefined;
	this.className = 'Stage1';
}
goog.inherits(ccode.game.Stage1, ccode.game.Stage);

ccode.game.Stage1.prototype.create = function(entMan){
	var comrade = new ccode.draw.Comrade(128,__glob.canvas.height-128);
	/*
	comrade.say("Fellow man, join me on an adventure through the land of JavaScript.",10000,
		function(){
			
		},this);
	comrade.say("Look at that glowing api reference!",10000,
		function(){$('#stageref').addClass('glow');}, this,
		function(){
			$('#stageref').removeClass('glow');
			$('#buttons').slideToggle('slow');
			
	});
*/
	comrade.say("Welcome to stage 1!",2000,undefined,this,function(){
		setTimeout(function(){comrade.say("Test, this is",3000);},2000);}
	);
	
	entMan.addEntity(comrade);
	this.comrade = comrade;
	__glob.paused = false;
}

ccode.game.Stage1.prototype.cleanup = function(entMan){
	
	this.comrade.destroy();
}
