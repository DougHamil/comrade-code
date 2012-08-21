goog.provide('ccode.game.Stage0');
goog.require('ccode.game.Stage');
goog.require('ccode.game.Crate');
goog.require('ccode.game.Cabbage');
goog.require('ccode.game.Region');
goog.require('ccode.draw.EntityManager');
goog.require('ccode.draw.Comrade');
goog.require('ccode.draw.Line');

ccode.game.Stage0 = function() {
	ccode.game.Stage.call(this);

	this.__name ="Tutorial 01";
	this.__groundBody = undefined;
	this.__groundFix = undefined;
	this.__className = 'Stage0';
}
goog.inherits(ccode.game.Stage0, ccode.game.Stage);

ccode.game.Stage0.prototype.create = function(entMan){
	var region = new ccode.game.Region(-10,0,__glob.canvas.width+20, 200,{filled:true,fillStyle:'red'}, this, function(other){
		console.log("Region was hit by ");
		console.log(other);
		console.log(region);
		entMan.removeEntity(region);
		region.destroy();
	});
	entMan.addEntity(region);

	for(var i = 0; i < 3; i++)
	{
		var g = new ccode.game.Crate(5+Math.random()*20, 10,32*(i+1));
		this.expose("A crate of the people.","media/game/crate.png",g,"gs"+i);
		entMan.addEntity(g);
	}
	
	for(var i = 0; i < 3; i++)
	{
		var g = new ccode.game.Cabbage(5+Math.random()*20, 10,32*(i+1));
		this.expose("A cabbage of the people.","media/game/comrade_cabbage.png",g,"cab"+i);
		entMan.addEntity(g);
	}
	
	this.__comrade = new ccode.draw.Comrade(128,__glob.canvas.height-128);
	//__glob.editor.setLocked('nocursor');
	
	
	__glob.editor.setCode('cab1.pushUp(100);');
	
	this.__comrade.say("Weclome, comrade. Let me help you get oriented with your surroundings.",2000,
		function(){}, this,
		function(){
			//__glob.downloadStage('Stage1');			
	});
	this.__comrade.say("First, notice the object list.",2000,
		function(){
			$('#stageref').addClass('glow');
		}, this);	
	
	this.__comrade.say("This shows you all of the objects that you can use.",2000,undefined,this,
		function(){
			$("#stageref").removeClass('glow');
			__glob.editor.getEntityElement(this.__api[0].obj).addClass('glow').one('click',
				function(){
					$(this).removeClass('glow');__glob.setStagePhase(1);
				}
			)
		}
	);
	this.__comrade.say('Select the <i>gs0</i> item by clicking on it. Select it to continue',0);
	
	entMan.addEntity(this.__comrade);

	this.__walls = __glob.genWall(true,true,true,true);
	
	// Close the pause/play buttons
	//$('#buttons').toggle();
	__glob.paused = false;
}

ccode.game.Stage0.prototype.onPhase = function(p){
	if(p == 1)
	{
		this.__comrade.stopSay();
		this.__comrade.say('Well done, comrade. You learn quickly.',2000);
		this.__comrade.say("Notice how the API reference changed to show the functions of the object you selected.",2000,
			function(){
				$('#apiref').addClass('glow');
			}, this,
			function(){
				$('#apiref').removeClass('glow');	
			}
		);
		this.__comrade.say("Down here is the code editor. This is where the magic happens.",2000,
			function(){
				$('#editor').addClass('whiteglow');
			}, this,
			function(){
				$('#editor').removeClass('whiteglow');	
			}
		);
		this.__comrade.say("Let me add some code to make our crate jump.",2000,
			function(){}, this,
			function(){
				__glob.editor.setCode('gs0.pushUp(1000);');
				this.__p0m = __glob.editor.markText({line:0,ch:0},{line:0,ch:10},'highlighttext');	
			}
		);
		this.__comrade.say("This little bit of code calls the <i>pushUp</i> method on our crate.",5000,
			function(){}, this,
			function(){
				//this.__p0m.clear();
				//this.__p0m = __glob.editor.markText({line:0,ch:0},{line:0,ch:9},'whiteglow');	
			}
		);
	}
};


ccode.game.Stage0.prototype.reset = function(entMan){
	this.cleanup(entMan);
	this.create(entMan);
}

ccode.game.Stage0.prototype.cleanup = function(entMan){
	
	console.log("Cleaning up!");
	var l = this.__api.length;
	for(var i = 0; i < l; i++)
	{
		this.__api[i].obj.destroy();
	}
	
	this.__comrade.destroy();
	this.__walls.destroy();
		
	this.__api.splice(0,this.__api.length);
}
