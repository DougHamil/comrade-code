// Define box 2d API
CONST(this,'b2Vec2',Box2D.Common.Math.b2Vec2);
CONST(this,'b2BodyDef',Box2D.Dynamics.b2BodyDef);
CONST(this,'b2Body',Box2D.Dynamics.b2Body);
CONST(this,'b2FixtureDef',Box2D.Dynamics.b2FixtureDef);
CONST(this,'b2Fixture',Box2D.Dynamics.b2Fixture);
CONST(this,'b2World',Box2D.Dynamics.b2World);
CONST(this,'b2MassData',Box2D.Collision.Shapes.b2MassData);
CONST(this,'b2PolygonShape',Box2D.Collision.Shapes.b2PolygonShape);
CONST(this,'b2CircleShape',Box2D.Collision.Shapes.b2CircleShape);
CONST(this,'b2DebugDraw',Box2D.Dynamics.b2DebugDraw);
CONST(this,'SCALE',30);


CONST(this,'getObjectClass',function(obj){
    if (obj && obj.constructor && obj.constructor.toString) {
        var arr = obj.constructor.toString().match(
            /function\s*(\w+)/);
		console.log(arr);
        if (arr && arr.length == 2) {
            return arr[1];
        }
    }

    return undefined;
});

CONST(this,'callLater',function(fun, time){
	var self = this;
	var func = fun;
	setTimeout(function(){func.call(self);},time);
});

CONST(this,'constifyFunctions',function(obj, prot){
	// Make all functions constant
	for(var p in obj){
		// Const only functions that aren't marked <<unconst>> or in the protected array
		var ok = !prot || (prot && prot.indexOf(p) == -1);
		if(ok && typeof obj[p] == 'function' && obj[p].toString().indexOf("<<unconst>>") == -1)
			CONST(obj,p,obj[p]);
	}
});

function CONST(obj, name, value) {

  // IE 9 does not support defineGetter
  if(obj.__defineGetter__) {
    obj.__defineGetter__(name, function() { return value; });
    obj.__defineSetter__(name, function() {
        throw new Error(name + " is a constant");
    });
  } else {
   Object.defineProperty(obj, name, {
	get:function(){return value;},
	set:function(){throw new Error(name + " is a constant!");}
	});
  }
}


Storage.prototype.setObject = function(key, value) {
    this.setItem(key, JSON.stringify(value));
}

Storage.prototype.getObject = function(key) {
    var value = this.getItem(key);
    return value && JSON.parse(value);
}

// X_browser support for request animframe
window.requestAnimFrame = (function(){
          return  window.requestAnimationFrame       || 
                  window.webkitRequestAnimationFrame || 
                  window.mozRequestAnimationFrame    || 
                  window.oRequestAnimationFrame      || 
                  window.msRequestAnimationFrame     || 
                  function(/* function */ callback, /* DOMElement */ element){
                    window.setTimeout(callback, 1000 / 60);
                  };
    })();

// Allows easy removal of element from an array
Array.prototype.remove= function(){
    var what, a= arguments, L= a.length, ax;
    while(L && this.length){
        what= a[--L];
        while((ax= this.indexOf(what))!= -1){
            this.splice(ax, 1);
        }
    }
    return this;
}


// Define indexOf for IE
if(!Array.prototype.indexOf) {
    Array.prototype.indexOf = function(needle) {
        for(var i = 0; i < this.length; i++) {
            if(this[i] === needle) {
                return i;
            }
        }
        return -1;
    };
}
