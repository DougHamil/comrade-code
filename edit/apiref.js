goog.provide('ccode.edit.APIRef');

ccode.edit.APIRef = function(){
	this.object = undefined;
	this.el = $("#apiref");
	this.list = $("#apireflist");
	this.title = $("#apiref .title");
	this.el.css({left:$('#canvas').width()+$('#canvas').offset().left+20, top:0});
	this.el.draggable({ containment: 'document' });
}

ccode.edit.APIRef.prototype.setObject = function(o){
	this.object = o;
	this.build();
	
};

ccode.edit.APIRef.prototype.build = function(){
	
	// Clear the api reference
	this.list.empty();
	
	// Is the targetobject defined?
	if(this.object)
	{
		
		this.title.html(this.object.name);
		// Go through each property of the 
		var api = this.object.getAPI();

		this.list.append('<b>Properties:</b>');
		// Go through all of the properties
		for(var p in api.props)
		{
			var nm = api.props[p].name ? api.props[p].name : p;
			this.list.append('<a class="item" editable="false"><div class="heading">'+nm+'</div> <div class="desc">'+api.props[p].desc+'</div></a>');

		}
		
		this.list.append('<b>Functions:</b>');
		// Go through all of the functions
		for(var p in api.funcs)
		{
			// Build the item...
			var item= $('<a class="item" func="'+p+'" editable='+api.funcs[p].edit+'></a>');
			
			// If they specified a custom name, use that
			if(api.funcs[p].name)
				$('<div class="heading">'+api.funcs[p].name+'</div>').appendTo(item);
			else
			{
				// Get the sig
				var funs = this.object[p].toString();
				var sig = funs.substring(funs.indexOf('('),funs.indexOf(')')+1);
				$('<div class="heading">'+p+sig+'</div>').appendTo(item);
			}
				
			$('<div class="desc">'+api.funcs[p].desc+'</div>').appendTo(item);
			this.list.append(item);
			
			// Add click response
			if(api.funcs[p].edit)
			{
				item.click(
					{obj:this.object,func:p},
					function(event){
					// When this is clicked, we set the target function
					__glob.editor.setTargetFunction(event.data.func);
				});
			}
		}
		this.el.show();
	} else { // Current object is undefined..
		this.title.html("No object selected");
		this.el.hide();
	}
};