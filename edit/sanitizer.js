goog.provide('ccode.edit.Sanitizer');

CONST(this,'SANITIZE_BLACKLIST',[
	'__glob',
	'__doFrame',
	'__parser',
	'SCALE',
	'document',
	//'window',
	'prototype',
	'localStorage',
	'eval',
	'ccode',
	'$'
]);

CONST(this,'SANITIZE_FUNCTION_FUNCTIONS',[		// Functions of the editable functions which shouldn't be...edited.
	'toString'
]);

ccode.edit.Sanitizer = function() {

};

ccode.edit.Sanitizer.prototype.sanitize = function(code) {

	return this.sanitizeAST(this.parse(code));
};

/*
 * Sanitizes a user script
 */
ccode.edit.Sanitizer.prototype.parse = function(str){
	return __parser.parse(str); 
};

ccode.edit.Sanitizer.prototype.getNameOfNode = function(par,node){
	if(typeof node == typeof'str'){			// Terminating nodes are just strings
		return {left:par,right:node};
	}
	else if(node[0] == 'dot')
	{
		var left = this.getNameOfNode(par,node[1]).right;
		return this.getNameOfNode(left,node[2]);
	}
	else if(node[0] == 'name') {
		return {left:par,right:node[1]};
	}
};

ccode.edit.Sanitizer.prototype.traverseNode = function(node, i, d){
	if(!d) d = [];
	if(typeof node == typeof'str'){			// Terminating nodes are just strings
		return {node:node,tree:d};
	}
	else if(node[0] == 'dot')
	{
		d.push(node);
		return this.traverseNode(node[i],i,d);
	}
	else if(node[0] == 'name') {
		return {node:node[1],tree:d};
	}	
};

ccode.edit.Sanitizer.prototype.traverseNode2 = function(node, d){
	if(!d) d = [];

	if(typeof node == typeof'str'){			// Terminating nodes are just strings
		d.push(node);
		return d;
	}
	else if(node[0] == 'name') {
		d.push(node[1]);
		return d;
	}
	else if(node[0] == 'string'){
		d.push(node[1]);
		return d;
	}
	else if(node[0] == 'dot' || node[0] == 'sub')
	{
		d = d.concat(this.traverseNode2(node[1]));
		return d.concat(this.traverseNode2(node[2]));
	}	
};

ccode.edit.Sanitizer.prototype.sanitizeTree = function(a){

	if(!a) return '';
	var a0 = a[0];
	var a1 = a[1];

	// Check for invalid assignment at this node
	if(a0 == 'assign')
	{
		var chain = this.traverseNode2(a[2]);			// Get chain of "dots": a.b.c.d.e
		if(chain.length > 2)					// There were more than two "dots" or redirections
		{
			var obj = chain[chain.length-3];		// Object is third to last
			var func = chain[chain.length-2];		// Func is second to last
			var badFunc = chain[chain.length-1];		// This is the function we need to make sure isn't changed!
			if(SANITIZE_FUNCTION_FUNCTIONS.indexOf(badFunc) != -1 
					&& __glob.editor.isStageObject(obj) 
					&& __glob.editor.isStageObjectFunction(obj,func)) {

				return "You can't reassign the "+badFunc+" function of "+obj+"'s "+func+" function";
			}				
		}
	}
	else if(a0 == 'name' && (SANITIZE_BLACKLIST.indexOf(a1) != -1 || __glob.editor.stageBlacklist.indexOf(a1) != -1))
	{
		return 'Invalid object name: '+a1;
	}
	else if(typeof a == 'object')
	{
		for(var i = 0; i < a.length; i++)
		{
			if(typeof a[i] == 'object')
			{
				var ret = this.sanitizeTree(a[i]);
				if(ret != '')
					return ret;
			}
		}
	}
	return '';
}

ccode.edit.Sanitizer.prototype.sanitizeAST = function(ast) {

	var retVal = {sanitary:true, messages:[]};

	// There will be a message if the source code has an error
	if(ast.message)
	{
		retVal.sanitary = false;
		retVal.messages.push(ast.message); 
		return retVal;
	}
	
	var error = this.sanitizeTree(ast);

	if(error !== '')
		retVal.sanitary = false;

	retVal.messages.push(error);
	
	return retVal;
};
