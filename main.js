goog.require('ccode.edit.Editor');
goog.require('ccode.draw.EntityManager');
goog.require('ccode.draw.Sprite');

// Globals
var __glob = {
	FRAME_TIME_SEC:1/60,
	FRAME_TIME_MS:1/60*1000,
	INITIAL_STAGE:'Stage0',
	ENABLE_DEBUG_DRAW:false,
	nextGUID:0,
	canvas:null,
	ctx:null,
	editor:null,
	entityManager:null,
	paused:false,
	stage:null,
	mousePos:[0,0],
	mouseInCanvas:false,
	physWorld:null,
	physBodiesToRemove:[],
	getNextGUID:function(){
		return this.nextGUID++;
	},
	onKeyPress:function(e){
		console.log(e);
		console.log(e.which);
	},
	onPauseButton:function(){
		this.paused = !this.paused
		if(this.paused)
		{
			$("#pause").addClass('play');
			$("#pause").html('<img src="media/site/play.png"></img>');
		}
		else
		{
			$("#pause").removeClass('play');
			$("#pause").html('<img src="media/site/pause.png"></img>');
		}
	},
	initAndSetStage:function(s,p){
		
		// Clean up old stage
		if(this.stage)
			this.stage.cleanup();
		// Init state
		s.create(this.entityManager);
		this.stage = s;
		this.editor.setStage(s);
		if(p){
			this.setStagePhase(p);
		} else {
			this.setStagePhase(0);
		}

		if(s.__className == '') {
			console.error("Stage classname is undefined!");
		} else {
			localStorage.setItem('currentStage',s.__className);
		}
	},
	downloadStage:function(s,p){
		console.log("Downloading stage: "+'stages/'+s+'.js');
		var sname = s;
		var phase = p;
		$.get('stages/'+s+'.js',undefined,function(data){
			console.log("Received stage: "+sname);
			// Create the stage
			var s = new ccode.game[sname]();
			__glob.initAndSetStage(s,phase);
		},'script').error(function(err)
		{
			// Sometimes, the error gets called, but the status
			// was ok.
			if(err.status == 200)
			{
				console.log("Received stage with error: "+sname);
				var s = new ccode.game[sname]();
				__glob.initAndSetStage(s);
			} else {
				console.log("Error downloading stage:");console.log(err);
			}
		});

	},
	onReset:function(){
		$("#confirmdialog").dialog({width:400,resizable:false,
			buttons: { 
				"Yes": function() { __glob.resetStage();$(this).dialog("close"); },
				"No":function(){$(this).dialog("close"); } }});
	},
	resetStage:function(){
		if(this.stage)
		{
			this.stage.reset(this.entityManager);
			this.editor.setStage(this.stage);
		}
	},
	setStagePhase:function(p){
		this.stage.setPhase(p);
		localStorage.setItem('currentPhase',p);
	},
	addContactListener:function(callbacks) {
	    var listener = new Box2D.Dynamics.b2ContactListener;
	    if (callbacks.BeginContact) listener.BeginContact = function(contact) {
	        callbacks.BeginContact(contact.GetFixtureA().GetBody().GetUserData(),
	                               contact.GetFixtureB().GetBody().GetUserData());
	    }
	    if (callbacks.EndContact) listener.EndContact = function(contact) {
	        callbacks.EndContact(contact.GetFixtureA().GetBody().GetUserData(),
	                             contact.GetFixtureB().GetBody().GetUserData());
	    }
	    if (callbacks.PostSolve) listener.PostSolve = function(contact, impulse) {
	        callbacks.PostSolve(contact.GetFixtureA().GetBody().GetUserData(),
	                             contact.GetFixtureB().GetBody().GetUserData(),
	                             impulse.normalImpulses[0]);
	    }
	    this.physWorld.SetContactListener(listener);
	    return listener;
	}

}
$(window).resize(function() {
	/*
	
	$('#reset').css({left:$(window).width()-$('#reset').outerWidth(true),top:$('#pause').offset().top+$('#pause').outerHeight(false)});
	$('#save').css({left:$(window).width()-$('#save').outerWidth(true),top:$('#reset').offset().top+$('#reset').outerHeight(false)});
	
	//$('#logo').css({left:$(__glob.canvas).offset().left - $('#logo').width(),top:$('#logo').outerWidth()/2});
	*/
	$('#buttons').css({left:0,top:$(window).height()-$('#buttons').outerHeight(true)});
	$('#logo2').css({left:$(window).width()-$('#logo2').width()-50,top:$(window).height() - $('#logo2').height()});
});

$(document).ready(function(){

	// Get canvas and resize to container width, 500px height
	__glob.canvas = document.getElementById("canvas");
	__glob.canvas.width = $("#editorcontainer").width();
	__glob.canvas.height = 500;
	// Prevent selection on canvas double click
	__glob.canvas.onselectstart = function(){return false;};
	$("#comradebubble").onselectstart = function(){return false;};
	$("#prearea").onselectstart = function(){return false;};
	$("#postarea").onselectstart = function(){return false;};
	// Position play/pause button on bottom right of window
	$(window).resize();
	$('#pause img').load(function(){$(window).resize();});
	$('#reset img').load(function(){$(window).resize();});
	
	$(__glob.canvas).mousemove(function(e){
		__glob.mousePos[0] = e.pageX - this.offsetLeft;
		__glob.mousePos[1] = e.pageY - this.offsetTop;
	});
	$(__glob.canvas).mouseenter(function(e){
		__glob.mouseInCanvas = true;
	});
	$(__glob.canvas).mouseleave(function(e){
		__glob.mouseInCanvas = false;
		__glob.editor.setHover(undefined);
	});
	$(__glob.canvas).dblclick(function(e){
		var e = __glob.entityManager.getSelectableEntityAt(__glob.mousePos[0],__glob.mousePos[1]);
		__glob.editor.setActiveEntity(e)
	});

	// Store reference to 2d context
	__glob.ctx = __glob.canvas.getContext('2d');
	
	// Create our physics world
	__glob.physWorld = new b2World(new b2Vec2(0,10),true);
	
	// Create our editor
	__glob.editor = new ccode.edit.Editor('#editor');
	
	// Create our entity manager
	__glob.entityManager = new ccode.draw.EntityManager(__glob.ctx);
	
	var debugDraw = new b2DebugDraw();
	debugDraw.SetSprite(__glob.ctx);
	debugDraw.SetDrawScale(SCALE);
	debugDraw.SetFillAlpha(0.3);
	debugDraw.SetLineThickness(1.0);
	debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
	__glob.physWorld.SetDebugDraw(debugDraw);
	
	// Download the first stage
	var sname = localStorage.getItem('currentStage');
	if(sname)
		__glob.downloadStage(sname, 0);
	else
		__glob.downloadStage(__glob.INITIAL_STAGE,localStorage.getItem('currentPhase'));
	
	__glob.addContactListener({
			BeginContact: function(objA, objB)
			{
				if (objA && objA.collisionCallback)
					objA.collisionCallback.call((objA.collisionCallbackTarget || objA), objB);
				if (objB && objB.collisionCallback)
					objB.collisionCallback.call((objB.collisionCallbackTarget || objB), objA);
			},

			PostSolve:function(objA,objB, imp){

				if(imp > 1)
				{
					// If the objects have sounds, play them
					if(objA && objA.sound) objA.sound.play();
					if(objB && objB.sound) objB.sound.play();
				}
			}
		});
	
	requestAnimFrame(__doFrame);
});

function __doFrame(){
	
	// Do nothing if we're paused
	if(__glob.paused) {
		requestAnimFrame(__doFrame);
		return;
	}
	
	// Remove any physics bodies
	for(body in __glob.physBodiesToRemove)
	{
		__glob.physWorld.DestroyBody(__glob.physBodiesToRemove[body]);
	}
	__glob.physWorld.Step(__glob.FRAME_TIME_SEC,10,10);
	
	__glob.entityManager.update(__glob.FRAME_TIME_MS);
	
	if(this.stage)
		this.stage.update(__glob.FRAME_TIME_MS);
	
	// Is mouse in canvas?
	if(__glob.mouseInCanvas)
	{
		// Get hovered entity:
		var e = __glob.entityManager.getSelectableEntityAt(__glob.mousePos[0],__glob.mousePos[1]);
		__glob.editor.setHover(e);
		//if(e)
			//console.log(e);		
	}
	
	// Use the identity matrix while clearing the canvas
	__glob.ctx.setTransform(1, 0, 0, 1, 0, 0);
	__glob.ctx.clearRect(0, 0, __glob.canvas.width, __glob.canvas.height);
	__glob.entityManager.draw();
	
	if(__glob.ENABLE_DEBUG_DRAW)
		__glob.physWorld.DrawDebugData();

	__glob.physWorld.ClearForces();
	
	requestAnimFrame(__doFrame);
}


