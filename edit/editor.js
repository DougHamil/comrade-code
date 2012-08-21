goog.provide('ccode.edit.Editor');
goog.require('ccode.edit.StageRef');
goog.require('ccode.edit.APIRef');


ccode.edit.Editor = function(elid){
	
	this.CLASS_WIDE_FUNCTION = false;			// If true, changing a function definition changes it for all instances of its class.
	this.TOGGLE_TIME = 300;						// Time (in ms) for editor toggle animation
	this.codeStorage = {};						// Persistant storage of code
	this.dirty = true;							// Has text changed since last caja?
	this.targetObject = undefined;				// Target object that we're coding
	this.targetName = '';						// Name of the target object
	this.targetFunction = undefined;			// Target function that we're coding
	this.targetSignature = '';					// Function signature of the target function
	this.prearea = $(elid+" #prearea");			// <div> above the editor
	this.postarea = $(elid +" #postarea");		// <div> below the editor
	this.apiref = new ccode.edit.APIRef();		// <div> for apireference info
	this.el = $(elid);
	this.isToggling = false;					// Is the editor toggling?
	this.stageref = new ccode.edit.StageRef("#stageref",this);
	this.doFunction = '';						// Keep track of the last "do" script written
	this.errdialog = $("#errdialog").dialog({width:400,resizable:false,autoOpen:false,buttons: { "Ok": function() { $(this).dialog("close"); } }});
	this.storedAPI = {};
	this.doButton = $("#save");
	this.stageBlacklist = [];
	this.__storedFunctions = [];
	this.sanitizer = new ccode.edit.Sanitizer();	

	// Retrieve the stored do function, if there was one stored
	if(localStorage.getItem('editorDoFunction')) {
		this.doFunction = localStorage.getItem('editorDoFunction');
	}
	
	var hotKeyFunc = function(cm){
		if(!__glob.__runPressed)
		{
			__glob.editor.save();
			__glob.__runPressed = true;
		}
	}

	CodeMirror.keyMap.pcDefault["Ctrl-Enter"] = hotKeyFunc;
	CodeMirror.keyMap.macDefault["Cmd-Enter"] = hotKeyFunc;
	$(document).keyup(function(e){if(e.which == 13)__glob.__runPressed = false;});
	
	// Init codemirror editor
	this.codeMirror = CodeMirror.fromTextArea($(elid+" #textarea").get(0), {
		mode:"javascript",
		lineNumbers:true,
		onChange:function(){this.dirty = true;},
		onKeyEvent:function(cm,e) {
			if(e.type == 'keyup' && e.which == 13)
			{
				__glob.__runPressed = false;	
			}
		}
	});

	this.setTargetObject(undefined);
};


ccode.edit.Editor.prototype.storeFunctions = function(){
	// Go through each object on the stage
	var objs = this.stageref.getStageObjects();
	
	var l = objs.length;
	this.__storedFunctions = [];
	for(var i = 0; i < l; i++)
	{
		var s = {obj:objs[i],funcs:[]};
		
		// Get the api
		var api = objs[i].getAPI().funcs;
		// Go through each exposed function
		for(var f in api)
		{
			// Does this object function have any of the fixed functions?
			var ll = SANITIZE_FUNCTION_FUNCTIONS.length;
			for(var ii = 0; ii < ll; ii++)
			{
				var funName = SANITIZE_FUNCTION_FUNCTIONS[ii];
				
				if(s.obj[f][funName])
				{
					// Store it
					s.funcs.push({funcName:f,subfuncName:funName,func:s.obj[f][funName]});
				}
			}			
		}

		this.__storedFunctions.push(s);
	}
}

ccode.edit.Editor.prototype.recoverFunctions = function(){
	var l = this.__storedFunctions.length;
	
	for(var i = 0; i < l; i++)
	{
		var s = this.__storedFunctions[i];
		
		var ll = s.funcs.length;
		
		for(var ii = 0; ii < ll; ii++)
		{
			var f = s.funcs[ii];
			s.obj[f.funcName][f.subfuncName] = f.func;
		}
	}
}


ccode.edit.Editor.prototype.setLocked = function(p){this.codeMirror.setOption('readOnly',p);}
ccode.edit.Editor.prototype.setCode = function(str,clear){
	this.codeMirror.setValue(str);
	this.save(true);					// Save the code, but don't run it
}

ccode.edit.Editor.prototype.getCode = function(){
	return this.codeMirror.getValue();
}

ccode.edit.Editor.prototype.markText = function(from,to,className){
	console.log(this.codeMirror.getValue());
	return this.codeMirror.markText(from,to,className);
}

/*
 * Run once the code has been cajoled. This will change our target object's
 * target function to the cajoled code.
 */
ccode.edit.Editor.prototype.setFunction = function(fun) {

	if(this.CLASS_WIDE_FUNCTION) {	// If true, the function set will be applied to all objects of the class.
		function recFindAndSet(obj,name,fun)
		{
			// Do we have a proto and was it not found in that proto?
			if(obj.__proto__ && !recFindAndSet(obj.__proto__,name,fun)) {
				if(obj[name])
				{
					obj[name] = fun;
					return true;
				}
			}
			return false;
		}

		recFindAndSet(this.targetObject, this.targetFunction, fun);
	} else {

		if(this.targetObject != undefined && this.targetFunction != undefined)
			this.targetObject[this.targetFunction] = fun;
	}
};


/*
 * Sanitize the current codeMirror text
 */
ccode.edit.Editor.prototype.save = function(skipRun) {

	this.storeFunctions();

	var sanitizeResult = this.sanitizer.sanitize(this.codeMirror.getValue());

	// If code is sanitary...
	if(sanitizeResult.sanitary) {

		// Run the code
		try{
			// If we were defining a function
			if(this.targetFunction)
				eval('__glob.editor.setFunction('+this.targetSignature+'{'+this.codeMirror.getValue()+'})');
			else{
				this.doFunction = this.codeMirror.getValue();
				// Store the function
				localStorage.setItem('editorDoFunction',this.doFunction);
				// And run in the context of the stage.
				eval('this.__tempFunc = function(){with(this){'+this.doFunction+'}};');
			}
		} catch(err) {
			this.displayError([err]);
			return false;
		}
	
		// We need to store the function code locally
		if(this.targetFunction && this.targetObject)
		{
			var name = this.targetFunction;
			var index = this.stageref.getObjectIndex(this.targetObject);
			var code = this.targetObject[this.targetFunction].toString();

			// Add it to our stored api
			this.storedAPI[index.toString()] = {name:name,code:code};
			
			// Save our stored API
			localStorage.setObject('editorAPI',this.storedAPI);
			
			// Now drop out of the function
			this.setTargetFunction(undefined);
		} else if(!skipRun) {
			try {
				this.__tempFunc.call(this.stageref.stage);
			} catch(err){
				this.displayError([err]);
			}
		}
	}

	this.recoverFunctions();
	this.dirty = false;
};

ccode.edit.Editor.prototype.displayError = function(errors) {

	$.noty.clearQueue();
	$.noty.closeAll();

	// Create noty message and add a glow to it
	for(var err in errors)
		noty({text:'Error: '+errors[err].toString(), timeout:false, layout:'bottom', type:'error'}).$bar.addClass('highlighttext');
};

ccode.edit.Editor.prototype.setStage = function(s)
{
	// Is this the stage we have existing code for?
	var oldStage = localStorage.getItem('editorStage');
	
	// Only load the API code if this was the stage we've stored the API for!
	if(oldStage && oldStage == s.__className && localStorage.getItem('editorAPI'))
	{
		// It matches the existing stage, we need to get the stored functions and apply them to the
		// objects in this stage's API
		this.storedAPI = localStorage.getObject('editorAPI');
		var api = s.getAPI();
		for(var index in this.storedAPI)
		{
			// Each index corresponds to the index of the object for the function
			var name = this.storedAPI[index].name;	// Get the name of the function
			var code = this.storedAPI[index].code;	// Get the code of the function

			// Assign the object's function/property
			try{
			if(api[parseInt(index)])
				eval('api[parseInt(index)].obj[name] = '+code+';');
			}catch(err){
				console.log("There was an error assigned cached function:");
				console.log(err);
			}
		}
		
	}

	localStorage.setItem('editorStage',s.__className);
	
	// Set our stage-specific blacklist
	this.stageBlacklist = [];
	for(var p in s)
	{
		// Lead with an underscore?
		if(p.indexOf('__') == 0)
		{
			this.stageBlacklist.push(p);
		}
	}
	
	// Forward it to our stageref
	this.stageref.setStage(s);
}

ccode.edit.Editor.prototype.setHover = function(e){
	this.stageref.setHover(e);
}
ccode.edit.Editor.prototype.setActiveEntity = function(e){
	this.stageref.setActiveEntity(e);
	
	var sel = this.codeMirror.getSelection();
	
	// Is the selected text the name of an object?
	if(this.isStageObject(sel) && e)
	{
		// Replace that text with the name of the selected object
		this.codeMirror.replaceSelection(this.stageref.getEntityName(e));
	}
}

ccode.edit.Editor.prototype.setTargetFunction = function(f,n) {
	this.targetFunction = f;
	if(!n) n = this.targetFunction;

	var funStr = this.targetFunction && this.targetObject ? this.targetObject[this.targetFunction].toString() : this.doFunction;

	if(this.targetFunction && this.targetObject)
		this.codeMirror.setValue(funStr.substring(funStr.indexOf('{')+1,funStr.length-1));
	else
		this.codeMirror.setValue(funStr);
	
	// Store the signature of the function
	this.targetSignature = funStr.substr(0,funStr.indexOf('{'));
	
	if(this.targetFunction)
	{
		this.prearea.html(this.targetObject.name+"."+n+" = "+this.targetSignature+" { ");
		this.postarea.html('}');
		this.doButton.html('Save');
		this.doButton.removeClass('run');
	}
	else
	{
		this.prearea.html('Run:');
		this.postarea.html('');
		this.doButton.html('Run');
		this.doButton.addClass('run');
	}
	

}

ccode.edit.Editor.prototype.setTargetObject = function(o) {
	this.targetObject = o;
	
	// Does the new target have the same function?
	if(this.targetObject && this.targetObject[this.targetFunction]){
			// Reopen this function
			this.setTargetFunction(this.targetFunction);
	} else {
		if(this.targetFunction || !this.targetObject)
			this.setTargetFunction(undefined);
	}

	this.apiref.setObject(o);
}

ccode.edit.Editor.prototype.isStageObjectFunction = function(o,f){
	if(this.stageref.stage)
		return this.stageref.stage.isExposedObjectFunction(o,f);
	return false;
}

ccode.edit.Editor.prototype.isStageObject = function(o){
	if(this.stageref.stage)
		return this.stageref.stage[o];
	
	return false;
}

ccode.edit.Editor.prototype.getEntityElement = function(o){
		return this.stageref.getEntityElement(o);
}
