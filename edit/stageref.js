goog.provide('ccode.edit.StageRef');

ccode.edit.StageRef = function(ele, ed){
	this.stage = undefined;
	this.api = undefined;
	this.el = $(ele);
	this.title = $(ele+" .title");
	this.list = $(ele+" #stagereflist");
	this.editor = ed;
	this.el.draggable({ containment: 'document' });
	this.listItems = [];
	this.hovered = undefined;
	this.activeEl = undefined;
	this.activeEntity = undefined;
	var list = this.list;
	this.el.dblclick(function(e){
		list.slideToggle('fast');
	});
}

ccode.edit.StageRef.prototype.getStageObjects = function(){
	if(!this.stage || !this.api) return [];

	var out = [];
	var l = this.api.length;
	for(var i =0; i < l; i++)
	{
		var ent = this.api[i];
		out.push(ent.obj);
	}
	
	return out;
}

ccode.edit.StageRef.prototype.getEntityElement = function(o){
	var idx = this.getIndexOfEntity(o);
	
	if(idx == -1 || idx >= this.listItems.length) return null;
	
	return this.listItems[idx];
}

ccode.edit.StageRef.prototype.setStage = function(s) {
	this.stage = s;
	
	// Get the api
	this.api = this.stage.getAPI();
	
	// Set the title to the title of this stage
	this.title.html(this.stage.__name);
	
	// Clear anything that was in the list
	this.list.empty();
	
	this.listItems = [];
	
	// Go through each item in the api and add to the list
	var l = this.api.length;
	for(var i =0; i < l; i++)
	{
		var ent = this.api[i];

		var item= $('<a class="item" index="'+i+'"></a>');
		var inner = $('<div  class="text"></div>').appendTo(item);
		$('<div class="heading">'+ent.obj.name+'</div>').appendTo(inner);
		$('<div class="desc">'+ent.desc+'</div>').appendTo(inner);
		$('<img src="'+ent.img+'"></img>').appendTo(item);
		
		item.click(
			{obj:ent.obj,name:ent.name},
			function(event){
			// When this is clicked, we set the target function
			__glob.editor.setActiveEntity(event.data.obj);
		});
		this.list.append(item);
		
		this.listItems.push(item);
	}
	
	this.editor.setTargetObject(undefined);
}

ccode.edit.StageRef.prototype.getObjectIndex = function(e)
{
	var l = this.api.length;
	for(var i =0; i < l; i++)
	{
		if(e == this.api[i].obj)
			return i;
	}
	return -1;
}

ccode.edit.StageRef.prototype.setHover = function(e){
	
	if(this.hovered)
	{
		this.hovered.removeClass('hovered');
	}
	this.hovered = undefined;
	if(e)
	{
		
		var index = this.getIndexOfEntity(e);
		if(index >= 0 && index < this.api.length)
		{
			this.hovered = this.listItems[index];
		}
	}
	
	if(this.hovered)
		this.hovered.addClass('hovered');
	
}

ccode.edit.StageRef.prototype.setActiveEntity = function(e){
	
	var index = this.getIndexOfEntity(e);
	this.activeEntity = e;
	if(index >= 0 && index < this.api.length)
	{
		
		var ent = this.api[index];
		if(this.activeEl)
			this.activeEl.removeClass('active');
		this.activeEl = this.listItems[index];
		this.activeEl.addClass('active');
		this.editor.setTargetObject(ent.obj);
	}
	
}

ccode.edit.StageRef.prototype.getEntityName= function(e){
	if(e.name)
	{
		return e.name
	}
}

ccode.edit.StageRef.prototype.getIndexOfEntity = function(e){
	if(this.stage)
		return this.stage.getAPIIndexOfEntity(e);
	else
		return -1;
}
