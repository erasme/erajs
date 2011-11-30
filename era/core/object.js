/**
*	@class Object class from which every Era classes derives.
*	It handles inheritance, serialization, dump function, manages events connections.
*/
Core.Object = function() {
};

Core.Object.prototype.classType = 'Core.Object';

/**
*	Change default object toString
*/
Core.Object.prototype.toString = function() {
	return "[object "+this.classType+"]";
};

/**
*	Add dump method to objects to allow object
*	content to be displayed in the console
*	@param {String} filter Regex filter of the dump
*/
Core.Object.prototype.dump = function(filter) {
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

/**
*	Display all objects properties
*	@param {mixed} obj Object to dump
*	@param {String} filter Regex filter of the dump
*/
Core.Object.dump = function(obj, filter) {
	if(filter != undefined)
		filter = new RegExp(filter,'i');
	console.log(obj+':');
	for(var prop in obj) {
		try {
			var test = true;
			if(filter != undefined)
				test = filter.test(prop);
			if(test)
				console.log(prop+' => '+obj[prop]);
		} catch(err) {}
	}
};

/**
*	Serialize a javascript object into a string
*	to deserialize, just use JSON.parse
*/
Core.Object.prototype.serialize = function() {
	return JSON.stringify(this);
};

/** 
*	@private
* 	INTERNAL: dont use. Usefull function for the object constructor.
*/
Core.Object.prototype.constructorHelper = function(config, proto) {
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

/**
*	Extend a Class to create a new class.
*	@param {String} classType The full class name with the namespace
*	@param {String} classDefine The object with the class members (methods, properties and constructor)
*	@param {String} classOverride An object with the members (fields and methods) that need to be overrided in parents classes. It will trow an error if overrided members are not declare here.
*	@param {String} classStatic An object with all the static members.
*/
Function.prototype.extend = function(classType, classDefine, classOverride, classStatic) {
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
	var func = eval("( "+classType+" = function(config) { this.constructorHelper.call(this, config); this.autoConfig(config); } )");
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

	// inherit static methods
	for(var prop in func['base'].constructor) {
		if(typeof(func['base'].constructor[prop]) == 'function') {
			func[prop] = func['base'].constructor[prop];
		}
	}

	if(classStatic != undefined) {
		for(var prop in classStatic)
			func[prop] = classStatic[prop];
	}

	for(var prop in classDefine) {
		if(prop == 'constructor')
			func.prototype['__constructor'] = classDefine[prop];
		else {
			if((typeof(classDefine[prop]) == 'object') && (classDefine[prop] != null))
				throw('object are not allowed in classDefine ('+prop+'). Create object in the constructor');

			if(prop in func.prototype)
				throw('Try to override '+prop+' on class '+classType+'. Use classOverride you want to do it');

			func.prototype[prop] = classDefine[prop];
		}
	}
	if(classDefine['constructor'] === Object.prototype.constructor)
		 func.prototype['__constructor'] = undefined;
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

	if((classStatic != undefined) && ('constructor' in classStatic))
		classStatic.constructor.call(func);

	return func;
};

/**
*	@return {Boolean} Whether or not an object is or derives from the class Type of the calling instance.
*/ 
Function.prototype.hasInstance = function(obj) {
	if((typeof(obj) != 'object') || (obj == null) || (obj.constructorHelper != Core.Object.prototype.constructorHelper))
		return false;

	var current = obj;
	while(current != undefined) {
		if(current.classType == this.prototype.classType)
			return true;
		current = current.__baseclass__;
	}
	return false;
};

/**
* @return true if the current object is class or subclass of
* the given class name
*/
Core.Object.prototype.isSubclassOf = function(parentClassName) {
	var current = this;
	while(current != undefined) {
		if(current.classType == parentClassName)
			return true;
		current = current.__baseclass__;
	}
	return false;
};

/**
*	Declare supported events on this class
*	@param {String} events List of all class events
*	@example this.addEvents('press', 'down', 'up');
*/
Core.Object.prototype.addEvents = function() {
	if(this.events == undefined)
		this.events = [];
	for(var i = 0; i < arguments.length; i++)
		this.events[arguments[i]] = [];
};

/**
*	Fire the eventName event. All given arguments are passed to the
*	registered methods.
*	@param {String} eventName Name of the event to fire. Must have been registred with {@link Core.Object#addEvents} before.
*/
Core.Object.prototype.fireEvent = function(eventName) {
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

/** 
* Connect a method to the eventName event of the obj object. The method will
* be called in the current element scope.
*	@param {mixed} obj
*	@param {String} eventName
*	@param {function} method
*	@param capture
*/
Core.Object.prototype.connect = function(obj, eventName, method, capture) {
	/**#nocode+ Avoid Jsdoc warnings...*/
	if(capture == undefined)
		capture = false;
	if('addEventListener' in obj) {
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
	else if('attachEvent' in obj) {
		var wrapper = function() {
			return arguments.callee.callback.apply(arguments.callee.scope, arguments);
		}
		wrapper.scope = this;
		wrapper.callback = method;
		wrapper.eventName = eventName;
		wrapper.capture = capture;
		obj.attachEvent(eventName, wrapper);
		if(obj.events == undefined)
			obj.events = [];
		obj.events.push(wrapper);
	}
	else {
		var signal = { scope: this, method: method, capture: capture };
		obj.events[eventName].push(signal);
	}
	/**#nocode-*/ 
};


/**
* Disconnect the current object from the eventName event on obj.
*	@param {mixed} obj
*	@param {String} eventName
*	@param {function} method
*/
Core.Object.prototype.disconnect = function(obj, eventName, method) {
	if('removeEventListener' in obj) {
		for(var i = 0; (obj.events != undefined) && (i < obj.events.length); i++) {
			var wrapper = obj.events[i];
			if((wrapper.scope == this) && (wrapper.eventName == eventName)) {
				if((method != undefined) && (wrapper.callback != method))
					continue;
				obj.removeEventListener(wrapper.eventName, wrapper, wrapper.capture);
				obj.events.splice(i, 1);
				i--;
			}
		}
	}
	else if('detachEvent' in obj) {
		for(var i = 0; (obj.events != undefined) && (i < obj.events.length); i++) {
			var wrapper = obj.events[i];
			if((wrapper.scope == this) && (wrapper.eventName == eventName)) {
				if((method != undefined) && (wrapper.callback != method))
					continue;
				obj.detachEvent(wrapper.eventName, wrapper);
				obj.events.splice(i, 1);
				i--;
			}
		}
	}
	else {
		for(var i = 0; (obj.events != undefined) && (i < obj.events[eventName].length); i++) {
			var signal = obj.events[eventName][i];
			if(signal.scope == this) {
				if((method != undefined) && (signal.method != method))
					continue;
				obj.events[eventName].splice(i, 1);
				i--;
			}
		}
	}
};

Core.Object.scopeHelper = function(config, scope) {
	if('scope' in config)
		scope = config.scope;
	else if('type' in config)
		config.scope = scope;
	for(var prop in config) {
		var val = config[prop];
		if((typeof(val) == 'object') && (val !== null)) {
			if(val.constructor == Array)
				Core.Object.scopeHelper(val, scope);
			else if(val.constructor == Object)
				Core.Object.scopeHelper(val, scope);
		}
	}
};

Core.Object.prototype.autoConfig = function(config) {
	if(config == undefined)
		return;
	Core.Object.scopeHelper(config, this);
	var scope = ('scope' in config)?config.scope:this;
	for(var prop in config) {
		// look for name
		if(prop == 'name') {
			scope[config.name] = this;
			delete(config.name);
			continue;
		}
		// look for normal properties
		var func = 'set'+prop.charAt(0).toUpperCase()+prop.substr(1);
		if((func in this) && (typeof(this[func]) == 'function')) {
			this[func].call(this, config[prop]);
			delete(config[prop]);
		}
		// look for attached properties
		else if(prop.indexOf('.') != -1) {
			var props = prop.split('.');
			var current = window;
			for(var i = 0; i < props.length - 1; i++) {
				current = current[props[i]];
			}
			var c = props[props.length-1];
			var func = 'set'+c.charAt(0).toUpperCase()+c.substr(1);
			if((func in current) && (typeof(current[func] == 'function'))) {
				current[func].call(current, this, config[prop]);
				delete(config[prop]);
			}
			else
				throw('Attached property \''+prop+'\' not found');
		}
		else if(prop.indexOf('on') == 0) {
			var eventName = prop.charAt(2).toLowerCase()+prop.substr(3);
			if((this.events != undefined) && (eventName in this.events)) {
//#if DEBUG
				if(typeof(config[prop]) != 'function')
					throw('function is need to connect to the \''+eventName+'\' on '+this.classType);
//#end
				scope.connect(this, eventName, config[prop]);
				delete(config[prop]);
			}
			else
				throw('event \''+eventName+'\' not found on '+this.classType);
		}
		else if(prop != 'scope')
			throw('Property \''+prop+'\' not found on '+this.classType);
	}
};


Core.Object.create = function(element, scope) {
	if(scope === undefined)
		scope = this;
	if(element == undefined)
		return undefined;
	else if(typeof(element) == 'string') {
		if('parse' in this)
			return this.parse(element);
		else
			throw('static parse need to be defined in class '+this.prototype.classType+' to create from a string');
	}
	else if(Core.Object.hasInstance(element))
		return element;
	else {
		if(!('scope' in element))
			element.scope = scope;
		var type = element.type;
//#if DEBUG
		if('type' in element && type == undefined)
			throw('Cannot create object of type undefined');
//#end
		if(type == undefined)
			type = this;
//#if DEBUG
		else {
			var current = type;
			while((current !== undefined) && (current !== this)) {
				if(current.base == undefined)
					throw('Expecting class '+this.prototype.classType+' got '+type.prototype.classType);
				current = current.base.constructor;
			}
		}
//#end
		delete(element.type);
		return new type(element);
	}
};


