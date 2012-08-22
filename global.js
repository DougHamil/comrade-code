
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

var sayfunc = function(text)
{
	noty({text:text,dismissQueue:true, timeout:false, layout:'centerRight', type:'information'});//.$bar.addClass('highlighttext');
};

CONST(this, 'say', sayfunc);
