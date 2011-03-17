
//
// Change default object toString
//
Object.prototype.toString = function() {
	if(this.classType != undefined)
		return "[object "+this.classType+"]";
	else
		return "[object Object]";
};

//
// Add dump method to objects to allow object
// content to be displayed in the console
//
Object.prototype.dump = function(filter) {
	if(filter != undefined)
		filter = new RegExp(filter,'i');
	console.log(this+':');
	for(var prop in this) {
		try {
			var test = true;
			if(filter != undefined)
				test = filter.test(prop);
			if(test)
				console.log(prop+' => '+this[prop]);
		} catch(err) {}
	}
};

//
// Serialize a javascript object into a string
// to deserialize, just use eval
//
Object.prototype.serialize = function() {
	var res = '';
	var first = true;
	var isArray = (this.constructor.toString().indexOf('function Array()') != -1);
	for(var prop in this) {
		try {
			var propValue = this[prop];
			if((typeof(propValue) != 'number') && (typeof(propValue) != 'string') && (typeof(propValue) != 'object'))
				continue;
			if(first)
				first = false;
			else
				res += ", ";
			if(!isArray)
				res += prop+": ";
			if(typeof(propValue) == 'object')
				res += propValue.serialize();
			else if(typeof(propValue) == 'number')
				res += propValue;
			else if(typeof(propValue) == 'string')
				res += "'"+propValue.replace("'","\\'")+"'";
		} catch(err) {}
	}
	if(isArray)
		res = '[ '+res+' ]';
	else
		res = '{ '+res+' }';
	return res;
};

//
// INTERNAL: dont use. Usefull function for the object constructor.
//
Object.prototype.constructorHelper = function(config, proto) {
	if(proto == undefined)
		proto = this.__proto__;
	if(proto == undefined)
		return;
	if(config == undefined)
		config = {};
	if(proto.__baseclass__ != undefined)
		this.constructorHelper.call(this, config, proto.__baseclass__);
	else
		if(proto.__proto__ != undefined)
			this.constructorHelper.call(this, config, proto.__proto__);
	if(proto.__constructor != undefined)
		proto.__constructor.call(this, config);
}; 

//
// Extend a Class to create a new class.
// classType: the full class name with the namespace
// classDefine: the object with the class define (method, properties and constructor)
// classOverride: an object with the method that need to be overrided in parents classes
//
Function.prototype.extend = function(classType, classDefine, classOverride) {
	var tab = classType.split('.');
	var namespace = "";
	var current = window;
	for(var i = 0; i < tab.length-1; i++) {
		if(namespace != "")
			namespace += ".";
		namespace += tab[i];
		if(current[tab[i]] == undefined)
			current[tab[i]] = {};
		current = current[tab[i]];
	}
	var shortName = tab[tab.length-1];

	var func = eval("( "+classType+" = function "+shortName+" (config) { this.constructorHelper.call(this, config); } )");
	if(navigator.isIE) {
		for(var prop in this.prototype) {
			func.prototype[prop] = this.prototype[prop];
		}
		func.prototype['__proto__'] = func.prototype;
	}
	else {
		func.prototype.__proto__ = this.prototype;
	}
	func.prototype['__baseclass__'] = this.prototype;
	func['base'] = this.prototype;
	for(var prop in classDefine) {
		if(prop == 'constructor')
			func.prototype['__constructor'] = classDefine[prop];
		else {
			if((typeof(classDefine[prop]) == 'object') && (classDefine[prop] != null))
				throw('object are not allowed in classDefine ('+prop+'). Create object in the constructor');

			if(func.prototype[prop] != undefined) {
				if(func.prototype[prop] != classDefine[prop])
					throw('Try to override '+prop+' on class '+classType+'. Use classOverride you want to do it');
			}
			else {
				func.prototype[prop] = classDefine[prop];
			}
		}
	}
	if((navigator.isIE) && (classDefine.constructor !== Object.prototype.constructor))
			func.prototype['__constructor'] = classDefine.constructor;
	if(classOverride != undefined) {
		for(var prop in classOverride) {
			if((typeof(classOverride[prop]) == 'object') && (classOverride[prop] != null))
				throw('object are not allowed in classOverride ('+prop+'). Create object in the constructor');
			func.prototype[prop] = classOverride[prop];
		}
	}
	func.prototype.classType = classType;
	return func;
};

//
// Declare supported events on this class
//
Object.prototype.addEvents = function() {
	if(this.events == undefined)
		this.events = [];
	for(var i = 0; i < arguments.length; i++)
		this.events[arguments[i]] = [];
};

//
// Fire the eventName event. All given arguments are passed to the
// registered methods.
//
Object.prototype.fireEvent = function(eventName) {
	var args = [];
	for(var i = 1; i < arguments.length; i++)
		args[i-1] = arguments[i];
	var handled = false;
	for(var i = 0; (i < this.events[eventName].length) && !handled; i++) {
		handled = this.events[eventName][i].method.apply(this.events[eventName][i].scope, args);
		if(handled == undefined)
			handled = false;
	}
	return handled;
};

//
// Connect a method to the eventName event of the obj object. The method will
// be called in the current element scope.
//
Object.prototype.connect = function(obj, eventName, method, capture) {
	if(capture == undefined)
		capture = false;
	if(obj.addEventListener != undefined) {
		var wrapper = function() {
			return arguments.callee.callback.apply(arguments.callee.scope, arguments);
		}
		wrapper.scope = this;
		wrapper.callback = method;
		wrapper.eventName = eventName;
		wrapper.capture = capture;
		obj.addEventListener(eventName, wrapper, capture);
		if(obj.events == undefined)
			obj.events = [];
		obj.events.push(wrapper);
	}
	else if(obj.attachEvent != undefined) {
		var wrapper = function() {
			return arguments.callee.callback.apply(arguments.callee.scope, arguments);
		}
		wrapper.scope = this;
		wrapper.callback = method;
		wrapper.eventName = eventName;
		wrapper.capture = capture;
		obj.attachEvent('on'+eventName, wrapper);
		if(obj.events == undefined)
			obj.events = [];
		obj.events.push(wrapper);
	}
	else {
		var signal = { scope: this, method: method, capture: capture };
		obj.events[eventName].push(signal);
	}
};

//
// Disconnect the current object from the eventName event on obj.
//
Object.prototype.disconnect = function(obj, eventName) {
	if(obj.removeEventListener != undefined) {
		for(var i = 0; i < obj.events.length; i++) {
			var wrapper = obj.events[i];
			if((wrapper.scope == this) && (wrapper.eventName == eventName)) {
				obj.removeEventListener(wrapper.eventName, wrapper, wrapper.capture);
				obj.events.splice(i, 1);
				break;
			}
		}
	}
	else {
		for(var i = 0; i < obj.events[eventName].length; i++) {
			var signal = obj.events[eventName][i];
			if(signal.scope == this) {
				obj.events[eventName].splice(i, 1);
				break;
			}
		}
	}
};

//
// Check if the current object is a subclass of the given
// parentClass.
//
Object.prototype.isSubclass = function(parentClassName) {
	var current = this;
	while(current != undefined) {
		if(current.classType == parentClassName)
			return true;
		current = current.__baseclass__;
	}
	return false;
};

/*

Era.classNames = {};


//
// Create an object from its JSON config. If config is already the object,
// return the object.
//
Era.create = function(config) {
	if(config == undefined)
		return undefined;
	else if(typeof(config) == 'string')
		return new Era.classNames[config]();
	else if(Era.isObject(config))
		return config;
	else {
		if(config.type == undefined)
			throw('config.type MUST be defined');
		return new Era.classNames[config.type](config);
	}
};
*/
