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
*	@param {string} filter Regex filter of the dump
*/
Core.Object.prototype.dump = function(filter) {
	if(filter !== undefined)
		filter = new RegExp(filter, 'i');
	console.log(this+':');
	for(var prop in this) {
		try {
			var test = true;
			if(filter !== undefined)
				test = filter.test(prop);
			if(test)
				console.log(prop+' => '+this[prop]);
		} catch(err) {}
	}
};

/**
*	Display all objects properties
*	@param {mixed} obj Object to dump
*	@param {string} filter Regex filter of the dump
*/
Core.Object.dump = function(obj, filter) {
	if(filter !== undefined)
		filter = new RegExp(filter,'i');
	console.log(obj+':');
	for(var prop in obj) {
		try {
			var test = true;
			if(filter !== undefined)
				test = filter.test(prop);
			if(test)
				console.log(prop+' => '+obj[prop]);
		} catch(err) {}
	}
};

/**
*	Return the difference object between obj1 and obj2
*	undefined if there is no differences
*	@param {mixed} obj1 Object
*	@param {mixed} obj2 Object
*	@param {string} filter Regex filter of the dump
*/
Core.Object.diff = function(obj1, obj2) {
	var diff = {};
	var empty = true;
	for(var prop in obj2) {
		if((prop in obj1) && (obj2[prop] !== obj1[prop])) {
			diff[prop] = obj2[prop];
			empty = false;
		}
	}
	if(empty)
		return undefined;
	else
		return diff;
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
*	INTERNAL: dont use. Usefull function for the object constructor.
*/
Core.Object.prototype.constructorHelper = function(config, proto) {
//	console.log(this+'.constructorHelper config: '+config+', proto: '+proto+', this.__proto___: '+this.__proto__);
	if(proto === undefined)
		proto = this;
	if((proto === undefined) || (proto === null))
		return;
	if(config === undefined)
		config = {};
	if(proto.__baseclass__ !== undefined)
		this.constructorHelper.call(this, config, proto.__baseclass__);
	if(proto.__constructor !== undefined)
		proto.__constructor.call(this, config);
};

/**
*	Extend a Class to create a new class.
*	@param {string} classType The full class name with the namespace
*	@param {string} classDefine The object with the class members (methods, properties and constructor)
*	@param {string} classOverride An object with the members (fields and methods) that need to be overrided in parents classes. It will trow an error if overrided members are not declare here.
*	@param {string} classStatic An object with all the static members.
*/
Function.prototype.extend = function(classType, classDefine, classOverride, classStatic) {
	var prop;
	var tab = classType.split('.');
	var namespace = '';
	var current = window;
	for(var i = 0; i < tab.length-1; i++) {
		if(namespace !== '')
			namespace += '.';
		namespace += tab[i];
		if(current[tab[i]] === undefined)
			current[tab[i]] = {};
		current = current[tab[i]];
	}
	var func = eval("( "+classType+" = function(config) { this.constructorHelper.call(this, config); this.autoConfig(config); } )");

	func.prototype = Object.create(this.prototype);
	func.prototype.constructor = func;
	func.prototype.__baseclass__ = this.prototype;
	func.base = this.prototype;

	// inherit static methods
	for(prop in func.base.constructor) {
		if(typeof(func.base.constructor[prop]) === 'function') {
			func[prop] = func.base.constructor[prop];
		}
	}

	if(classStatic !== undefined) {
		for(prop in classStatic)
			func[prop] = classStatic[prop];
	}

	if(classDefine !== undefined) {
		for(prop in classDefine) {
			if(prop === 'constructor')
				func.prototype.__constructor = classDefine[prop];
			else {
				if((typeof(classDefine[prop]) === 'object') && (classDefine[prop] !== null))
					throw('object are not allowed in classDefine ('+prop+'). Create object in the constructor');

				if(prop in func.prototype)
					throw('Try to override '+prop+' on class '+classType+'. Use classOverride you want to do it');

				func.prototype[prop] = classDefine[prop];
			}
		}
		if(classDefine.constructor === Object.prototype.constructor)
			func.prototype.__constructor = undefined;
		if((navigator.isIE) && (classDefine.constructor !== Object.prototype.constructor))
			func.prototype.__constructor = classDefine.constructor;
	}
	else {
		func.prototype.__constructor = undefined;
	}

	if(classOverride !== undefined) {
		for(prop in classOverride) {
			if((typeof(classOverride[prop]) === 'object') && (classOverride[prop] !== null))
				throw('object are not allowed in classOverride ('+prop+'). Create object in the constructor');
			func.prototype[prop] = classOverride[prop];
		}
	}
	func.prototype.classType = classType;

	if((classStatic !== undefined) && ('constructor' in classStatic))
		classStatic.constructor.call(func);

	return func;
};

/**
*	@return {Boolean} Whether or not an object is or derives from the class Type of the calling instance.
*/ 
Function.prototype.hasInstance = function(obj) {
	if((typeof(obj) !== 'object') || (obj === null) || (obj.constructorHelper !== Core.Object.prototype.constructorHelper))
		return false;

	var current = obj;
	while(current !== undefined) {
		if(current.classType === this.prototype.classType)
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
	while(current !== undefined) {
		if(current.classType === parentClassName)
			return true;
		current = current.__baseclass__;
	}
	return false;
};

/**
*	Declare supported events on this class
*	@param {string} events List of all class events
*	@example this.addEvents('press', 'down', 'up');
*/
Core.Object.prototype.addEvents = function() {
	if(this.events === undefined)
		this.events = [];
	for(var i = 0; i < arguments.length; i++)
		this.events[arguments[i]] = [];
};

/**
*	Test is an event is supported on this class
*	@param {string} event
*	@example this.hasEvent('press');
*/
Core.Object.prototype.hasEvent = function(event) {
	return (this.events !== undefined) && (event in this.events);
};

/**
*	Fire the eventName event. All given arguments are passed to the
*	registered methods.
*	@param {string} eventName Name of the event to fire.
*   Must have been registred with {@link Core.Object#addEvents} before.
*/
Core.Object.prototype.fireEvent = function(eventName) {
	var i;
	var args = [];
	for(i = 1; i < arguments.length; i++)
		args[i-1] = arguments[i];
	var handled = false;
	var eventListeners = this.events[eventName];
	if(eventListeners !== undefined) {
		// copy the listeners because the events handlers might
		// change the connected events
		eventListeners = eventListeners.slice();
		// send capture events first
		for(i = 0; (i < eventListeners.length) && !handled; i++) {
			if(eventListeners[i].capture === true) {
				handled = eventListeners[i].method.apply(eventListeners[i].scope, args);
				if(handled === undefined)
					handled = false;
			}
		}
		for(i = 0; (i < eventListeners.length) && !handled; i++) {
			if(eventListeners[i].capture !== true) {
				handled = eventListeners[i].method.apply(eventListeners[i].scope, args);
				if(handled === undefined)
					handled = false;
			}
		}

	}
	else if(DEBUG)
		throw('Event \''+eventName+'\' not found on ' + this);
	return handled;
};

/** 
* Connect a method to the eventName event of the obj object. The method will
* be called in the current element scope.
*	@param {mixed} obj
*	@param {string} eventName
*	@param {function} method
*	@param capture
*/
Core.Object.prototype.connect = function(obj, eventName, method, capture) {
	var wrapper;
	/**#nocode+ Avoid Jsdoc warnings...*/
	if(capture === undefined)
		capture = false;
	if(DEBUG && (typeof(method) !== 'function'))
		throw('Invalid method to connect on event \''+eventName+'\'');
	
	if('addEventListener' in obj) {
		wrapper = function() {
			return wrapper.callback.apply(wrapper.scope, arguments);
			//return arguments.callee.callback.apply(arguments.callee.scope, arguments);
		};
		wrapper.scope = this;
		wrapper.callback = method;
		wrapper.eventName = eventName;
		wrapper.capture = capture;
		obj.addEventListener(eventName, wrapper, capture);
		if(obj.events === undefined)
			obj.events = [];
		obj.events.push(wrapper);
	}
	else {
		var signal = { scope: this, method: method, capture: capture };
		var eventListeners = obj.events[eventName];
		if(eventListeners !== undefined)
			eventListeners.push(signal);
		else if(DEBUG)
			throw('Event \''+eventName+'\' not found on ' + obj);
	}
	/**#nocode-*/ 
};
	
Core.Object.prototype.getEventHandlers = function(eventName) {
	var eventListeners = this.events[eventName];
	if(eventListeners !== undefined)
		return eventListeners.slice();
	else
		return [];
};


/**
* Disconnect the current object from the eventName event on obj.
*	@param {mixed} obj
*	@param {string} eventName
*	@param {function} method
*/
Core.Object.prototype.disconnect = function(obj, eventName, method) {
	var wrapper; var i; var signal;
	if('removeEventListener' in obj) {
		for(i = 0; (obj.events !== undefined) && (i < obj.events.length); i++) {
			wrapper = obj.events[i];
			if((wrapper.scope === this) && (wrapper.eventName === eventName)) {
				if((method !== undefined) && (wrapper.callback !== method))
					continue;
				obj.removeEventListener(wrapper.eventName, wrapper, wrapper.capture);
				obj.events.splice(i, 1);
				i--;
			}
		}
	}
	else {
		for(i = 0; (obj.events !== undefined) && (i < obj.events[eventName].length); i++) {
			signal = obj.events[eventName][i];
			if(signal.scope == this) {
				if((method !== undefined) && (signal.method !== method))
					continue;
				obj.events[eventName].splice(i, 1);
				i--;
			}
		}
	}
};

Core.Object.prototype.autoConfig = function(config) {
	if(config === undefined)
		return;
	var func;

	for(var prop in config) {
		// look for normal properties
		func = 'set'+prop.charAt(0).toUpperCase()+prop.substr(1);
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
			func = 'set'+c.charAt(0).toUpperCase()+c.substr(1);
			if((func in current) && (typeof(current[func] == 'function'))) {
				current[func].call(current, this, config[prop]);
				delete(config[prop]);
			}
			else if(DEBUG)
				throw('Attached property \''+prop+'\' not found');
		}
		else if(DEBUG && (prop !== 'type'))
			throw('Property \''+prop+'\' not found on '+this.classType);
	}
};

Core.Object.create = function(element) {
	if(element === undefined)
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
		var type = element.type;
		if(DEBUG && ('type' in element && type === undefined))
			throw('Cannot create object of type undefined');
		if(type === undefined)
			type = this;
		else if(DEBUG) {
			var current = type;
			while((current !== undefined) && (current !== this)) {
				if(current.base === undefined)
					throw('Expecting class '+this.prototype.classType+' got '+type.prototype.classType);
				current = current.base.constructor;
			}
		}
		return new type(element);
	}
};


