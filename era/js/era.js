
// Define Era namespace
var Era = {};

//
// Define namespaces
//
Era.namespace = function(namespace) {
	var tab = namespace.split('.');
	var current = window;
	for(var i = 0; i < tab.length; i++) {
		if(current[tab[i]] == undefined)
			current[tab[i]] = {};
		current = current[tab[i]];
	}
};

Era.idGenerator = 0;

//
// Define the base class of all classes
//
Era.Object = function(config) {
	this.id = ++Era.idGenerator;
	this.events = {};
	this.specialEvents = {};
};

//
// The constructor of the parent class of the current class.
// The superConstructor MUST be called in the constructor of
// each class.
//
Era.Object.prototype.superConstructor = function() {
	if(this.currentsuperclass == undefined)
		this.currentsuperclass = this.superclass;
	else
		this.currentsuperclass = this.currentsuperclass.prototype.superclass;

	if(this.currentsuperclass != undefined)
		this.currentsuperclass.apply(this, arguments);
	else
		Era.Object.prototype.constructor.apply(this, arguments);
};

//
// Declare supported events on this class
//
Era.Object.prototype.addEvents = function() {
	for(var i = 0; i < arguments.length; i++)
		this.events[arguments[i]] = [];
};

//
// Declare an event that is handled with the given functions
// for connect and disconnect.
//
Era.Object.prototype.addSpecialEvent = function(eventName, connectFunction, disconnectFunction) {
	this.events[eventName] = [];
	this.specialEvents[eventName] = { connect: connectFunction, disconnect: disconnectFunction };
};

//
// Fire the eventName event. All given arguments are passed to the
// registered methods.
//
Era.Object.prototype.fireEvent = function(eventName) {
	var args = [];
	for(var i = 1; i < arguments.length; i++)
		args[i-1] = arguments[i];
	for(var i = 0; i < this.events[eventName].length; i++) {
		this.events[eventName][i].method.apply(this.events[eventName][i].scope, args);
	}
};

//
// Connect a method to the eventName event of the obj object. The method will
// be called in the current element scope.
//
Era.Object.prototype.connect = function(obj, eventName, method, capture) {
	if(capture == undefined)
		capture = false;
	if(obj.addEventListener != undefined) {
		var wrapper = function() {
			arguments.callee.callback.apply(arguments.callee.scope, arguments);
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
			arguments.callee.callback.apply(arguments.callee.scope, arguments);
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
		if(obj.specialEvents[eventName] != undefined)
			obj.specialEvents[eventName].connect.call(obj, eventName, capture, (obj.events[eventName].length == 1));
	}
};

//
// Disconnect the current object from the eventName event on obj.
//
Era.Object.prototype.disconnect = function(obj, eventName) {
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
				if(obj.specialEvents[eventName] != undefined)
					obj.specialEvents[eventName].disconnect.call(obj, eventName, signal.capture, (obj.events[eventName].length == 0));
				break;
			}
		}
	}
};

//
// Check if the current object is a subclass of the given
// parentClass.
//
Era.Object.prototype.isSubclass = function(parentClass) {	
	var currentsuperclass = this.superclass;
	while(currentsuperclass != undefined) {
		if(currentsuperclass == parentClass)
			return true;
		else
			currentsuperclass = currentsuperclass.prototype.superclass;
	}
	return false;
};

//
// Check if obj is an Era.Object
//
Era.isObject = function(obj) {
	if(obj == undefined)
		return false;
	if(obj.superclass == undefined)
		return false;
	return true;
};

Era.classNames = {};

//
// Extend a class. typeName is the short name of the class
// that is used when using Era.create. baseClass is the parent
// class to extend and classDefine is a JSON object that define
// the new class.
//
Era.extend = function(typeName, baseClass, classDefine) {

	var classFunction;
	if(classDefine.constructor != undefined)
 		classFunction = classDefine.constructor;
	else
		throw('contructor MUST be defined for class definition');

	for(var prop in baseClass.prototype)
		classFunction.prototype[prop] = baseClass.prototype[prop];
	for(var prop in classDefine) {
		if((typeof(classDefine[prop]) == 'object') && (classDefine[prop] != null))
			throw('object are not allowed in classDefine ('+prop+'). Create object in the constructor');
		else if((typeof(classDefine[prop]) == 'function') && (classFunction.prototype[prop] != undefined) && (prop != 'constructor') && (!prop.match('^virtual')))
			throw('method '+prop+' override. Only virtual method can be overrided');
		classFunction.prototype[prop] = classDefine[prop];
	}
	classFunction.prototype.superclass = baseClass;
	classFunction.prototype.type = typeName;

	Era.classNames[typeName] = classFunction;
	return classFunction;
};

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
Era.namespace('Era.util');

Era.util.dump = function(obj) {
	console.log('Dump '+obj+':');
	for(var prop in obj) {
		try {
			console.log(prop+' => '+obj[prop]);
		} catch(err) {}
	}
};

Era.util.dumpstr = function(obj) {
	var str = 'Dump '+obj+':<br>\n';
	for(var prop in obj)
		str += prop+' => '+obj[prop]+'<br>\n';
};


Era.util.delayedcall = function(timeout, callback, scope) {
	new Era.DelayedTask({ delay: timeout, callback: callback, scope: scope });
};

Era.util.isGecko = (navigator.userAgent.match(/Gecko\//i) != null);
Era.util.isWebkit = (navigator.userAgent.match(/WebKit\//i) != null);
Era.util.isIE = (navigator.userAgent.match(/MSIE/i) != null);
Era.util.isOpera =  ((navigator.userAgent == undefined) || (navigator.userAgent.match(/Opera\//i) != null));

Era.util.iPad = (navigator.userAgent.match(/iPad/i) != null);
Era.util.iPhone = (navigator.userAgent.match(/iPhone/i) != null);


Era.DelayedTask = Era.extend('era-delayedtask', Era.Object, {
	delay: 1,
	scope: undefined,
	callback: undefined,
	arguments: undefined,
	isDone: false,

	constructor: function(config) {
		this.superConstructor(config);
		if(config && (config.delay != undefined))
			this.delay = config.delay;
		if(config && (config.scope != undefined))
			this.scope = config.scope;
		if(config && (config.arguments != undefined))
			this.arguments = config.arguments;
		if(config && (config.callback != undefined))
			this.callback = config.callback;
		else
			throw('callback MUST be given for a DelayedTask');

		var wrapper = function() {
			arguments.callee.delayedtask.handle = undefined;
			arguments.callee.delayedtask.callback.apply(arguments.callee.delayedtask.scope, arguments.callee.delayedtask.arguments);
			arguments.callee.delayedtask.isDone = true;
		}
		wrapper.delayedtask = this;
		this.handle = setTimeout(wrapper, this.delay * 1000);
	},

	abort: function() {
		if(this.handle != undefined) {
			clearTimeout(this.handle);
			this.handle = undefined;
		}
	},
});


Era.Timer = Era.extend('era-timer', Era.Object, {
	interval: 1,
	scope: undefined,
	callback: undefined,
	arguments: undefined,

	constructor: function(config) {
		this.superConstructor(config);
		if(config && (config.interval != undefined))
			this.interval = config.interval;
		if(config && (config.scope != undefined))
			this.scope = config.scope;
		if(config && (config.arguments != undefined))
			this.arguments = config.arguments;
		if(config && (config.callback != undefined))
			this.callback = config.callback;
		else
			throw('callback MUST be given for a Timer');

		this.wrapper = function() {
			var timer = arguments.callee.timer;
			timer.callback.apply(timer.scope, timer.arguments);
			if(timer.handle != undefined)
				timer.handle = setTimeout(timer.wrapper, timer.interval * 1000);
		}
		this.wrapper.timer = this;
		this.handle = setTimeout(this.wrapper, this.interval * 1000);
	},

	abort: function() {
		if(this.handle != undefined) {
			clearTimeout(this.handle);
			this.handle = undefined;
		}
	},
});


Era.Mouse = Era.extend('mouse', Era.Object, {
	pageX: 0,
	pageY: 0,
	elementCapture: undefined,

	constructor: function(config) {
		this.superConstructor(config);
	},

	//
	// Capture all mouse event to send them to element
	// until mouse release called.
	//
	capture: function(element) {
		if(this.elementCapture != undefined)
			throw('mouse capture already done on element (type: '+this.elementCapture.type+', id: '+this.elementCapture.id+', newid: '+element.id+')');

		this.elementCapture = element;

		this.connect(window, 'mousedown', function(event) {
			event.stopPropagation();
			this.pageX = event.pageX;
			this.pageY = event.pageY;
			this.elementCapture.fireEvent('mousedown', this, event.button);
		}, true);

		this.connect(window, 'mousemove', function(event) {
			event.stopPropagation();
			this.pageX = event.pageX;
			this.pageY = event.pageY;
			this.elementCapture.fireEvent('mousemove', this);
		}, true);

		this.connect(window, 'mouseup', function(event) {
			event.stopPropagation();
			this.pageX = event.pageX;
			this.pageY = event.pageY;
			this.elementCapture.fireEvent('mouseup', this, event.button);
		}, true);
	},
	
	// Release the current mouse event capture
	//
	release: function() {
		if(this.elementCapture != undefined) {
			this.disconnect(window, 'mousedown');
			this.disconnect(window, 'mousemove');
			this.disconnect(window, 'mouseup');
			this.elementCapture = undefined;
		}
		else
			throw('mouse capture release but no element capture the mouse');
	},

	//
	// Return the mouse position in the coordinate of the given element
	//
	getPosition: function(element) {
		return element.pointFromPage({ x: this.pageX, y: this.pageY });
	},

	//
	// Return x position of the mouse in the coordinate of the given element
	//
	getX: function(element) {
		return this.getPosition(element).x;
	},

	//
	// Return y position of the mouse in the coordinate of the given element
	//
	getY: function(element) {
		return this.getPosition(element).y;
	},

	//
	// Return x position of the mouse in the coordinate page
	//
	getPageX: function() {
		return this.pageX;
	},

	//
	// Return y position of the mouse in the coordinate page
	//
	getPageY: function() {
		return this.pageY;
	},

	//
	// Return the mouse position in the coordinate of the page
	//
	getPagePosition: function() {
		return { x: this.pageX, y: this.pageY };
	},
});

//
// The mouse defined in the system
//
Era.mouse = new Era.Mouse();


Era.Touch = Era.extend('touch', Era.Object, {

	constructor: function(config) {
		this.superConstructor(config);
	},

//	capture: function(element) {
//	},
	
//	release: function() {
//	},

	getId: function() {
	},

	getX: function(element) {
	},

	getY: function(element) {
	},

	getPageX: function() {
	},

	getPageY: function() {
	},
});


Era.HttpRequest = Era.extend('era-httprequest', Era.Object, {
	url: undefined,
	method: 'GET',

	constructor: function(config) {
		this.superConstructor(config);
		if(config && (config.url != undefined))
			this.url = config.url;
		else
			throw('url MUST be given for an HttpRequest');
		if(config && (config.method != undefined))
			this.method = config.method;

		this.request = new XMLHttpRequest();
		this.request.open(this.method, this.url, true);

		var wrapper = function() {
			var httprequest = arguments.callee.httprequest;
			if(httprequest.request.readyState == 4) {
				if(httprequest.request.status == 200)
					httprequest.fireEvent('done');
				else
					httprequest.fireEvent('error', httprequest.request.status);
			}
		}
		wrapper.httprequest = this;
		this.request.onreadystatechange = wrapper;

		this.addEvents('error', 'done');
	},

	abort: function() {
		this.request.abort();
	},

	send: function() {
		this.request.send.apply(this.request, arguments);
	},

	getResponseText: function() {
		return this.request.responseText;
	},

	getResponseJSON: function() {
		var res;
		try {
			res = eval('('+this.getResponseText()+')');
		}
		catch(err) {
			res = undefined;
		}
		return res;
	},

});


// Define the base class for all GUI elements
Era.Element = Era.extend('element', Era.Object, {

	opacity: 1,
	resizable: false,
	x: 0,
	y: 0,

	constructor: function(config) {
		this.superConstructor(config);
		this.ui = this.virtualRender();
		this.ui.element = this;
		this.ui.id = this.id;

		if(config != undefined) {
			if(config.baseCls)
				this.addClass(config.baseCls);
			else
				this.addClass(this.type);

			if((config.width != undefined) || (config.height != undefined))
				this.setSize(config.width, config.height);
			if(config.resizable != undefined)
				this.setResizable(config.resizable);
			if(config && (config.x != undefined))
				this.setX(config.x);
			if(config && (config.y != undefined))
				this.setY(config.y);
			if(config.left != undefined)
				this.setLeft(config.left);
			if(config.right != undefined)
				this.setRight(config.right);
			if(config.top != undefined)
				this.setTop(config.top);
			if(config.bottom != undefined)
				this.setBottom(config.bottom);
			if(config.opacity != undefined)
				this.setOpacity(config.opacity);
		}
		else {
			this.addClass(this.type);
		}
		this.addSpecialEvent('mousedown',
			function(signalName, capture, first) {
				if(first) {
					this.connect(this.ui, 'mousedown', function(event) {
						event.stopPropagation();
						Era.mouse.pageX = event.pageX;
						Era.mouse.pageY = event.pageY;
						this.fireEvent('mousedown', Era.mouse, event.button);
					}, false);
				}
			},
			function(signalName, capture, last) {
				if(last) {
					this.disconnect(this.ui, 'mousedown');
				}
			}
		);

		this.addSpecialEvent('mouseup',
			function(signalName, capture, first) {
				if(first) {
					this.connect(this.ui, 'mouseup', function(event) {
						event.stopPropagation();
						Era.mouse.pageX = event.pageX;
						Era.mouse.pageY = event.pageY;
						this.fireEvent('mouseup', Era.mouse, event.button);
					}, false);
				}
			},
			function(signalName, capture, last) {
				if(last) {
					this.disconnect(this.ui, 'mouseup');
				}
			}
		);

		this.addSpecialEvent('mousemove',
			function(signalName, capture, first) {
				if(first) {
					this.connect(this.ui, 'mousemove', function(event) {
						event.stopPropagation();
						Era.mouse.pageX = event.pageX;
						Era.mouse.pageY = event.pageY;
						this.fireEvent('mousemove', Era.mouse, event.button);
					}, false);
				}
			},
			function(signalName, capture, last) {
				if(last) {
					this.disconnect(this.ui, 'mousemove');
				}
			}
		);

		this.addSpecialEvent('touchstart',
			function(signalName, capture, first) {
				if(first) {
					this.connect(this.ui, 'touchstart', function(event) {
						event.preventDefault();
						this.fireEvent('touchstart', event);
					});
				}
			},
			function(signalName, capture, last) {
				if(last) {
					this.disconnect(this.ui, 'touchstart');
				}
			}
		);

		this.addSpecialEvent('touchmove',
			function(signalName, capture, first) {
				if(first) {
					this.connect(this.ui, 'touchmove', function(event) {
						event.preventDefault();
						this.fireEvent('touchmove', event);
					});
				}
			},
			function(signalName, capture, last) {
				if(last) {
					this.disconnect(this.ui, 'touchmove');
				}
			}
		);

		this.addSpecialEvent('touchend',
			function(signalName, capture, first) {
				if(first) {
					this.connect(this.ui, 'touchend', function(event) {
						event.preventDefault();
						this.fireEvent('touchend', event);
					});
				}
			},
			function(signalName, capture, last) {
				if(last) {
					this.disconnect(this.ui, 'touchend');
				}
			}
		);

		if(config && config.hidden)
			this.hide(undefined);
	},

	//
	// Return the parent of the current element.
	//
	getParent: function() {
		var uiElement = this.ui;
		do {
			if(uiElement.parentElement != undefined)
				uiElement = uiElement.parentElement;
			else
				uiElement = uiElement.parentNode;
		} while((uiElement != undefined) && (uiElement.element == undefined));

		if(uiElement == undefined)
			return undefined;
		else
			return uiElement.element;
	},

	//
	// Create the corresponding HTML element for the
	// current element. Override this if you want something
	// else than a div.
	//
	virtualRender: function() {
		return document.createElement('div');
	},

	//
	// Return true if the given class is applied to the current element
	// CSS class
	//
	checkClass: function(className) {
		if((this.ui.className == undefined) || (this.ui.className == ''))
			return false;
		var classes = this.ui.className.split(' ');
		for(var i = 0; i < classes.length; i++) {
			if(classes[i] == className)
				return true;
		}
		return false;
	},

	//
	// Add CSS class to the current element
	//
	addClass: function(className) {
		if(!this.ui.className)
			this.ui.className = className;
		else
			if(!this.checkClass(className))
				this.ui.className += ' '+className;
	},

	//
	// Remove CSS class to the current element
	//
	removeClass: function(className) {
		if(className == undefined)
			return;
		if(this.ui.className) {
			var classes = this.ui.className.split(' ');
			var tmp = '';
			for(var i = 0; i < classes.length; i++) {
				if((classes[i] == className) || (classes[i] == ''))
					continue;
				if(tmp != '')
					tmp += ' ';
				tmp += classes[i];
			}
			this.ui.className = tmp;
		}
	},

	//
	// Replace CSS class to the current element
	//
	replaceClass: function(oldClassName, newClassName) {
		if(!this.ui.className)
			this.ui.className = newClassName;
		else {
			var classes = this.ui.className.split(' ');
			var tmp = '';
			for(var i = 0; i < classes.length; i++) {
				if(classes[i] == '')
					continue;
				if(tmp != '')
					tmp += ' ';
				if(classes[i] == oldClassName)
					tmp += newClassName;
				else
					tmp += classes[i];
			}
			this.ui.className = tmp;
		}
	},

	//
	// Set the size of the current element. The size will include the content,
	// the margin and the border. When the size if defined, the element is
	// fixed size and no more resizable.
	//
	setSize: function(width, height) {
		if(width != undefined)
			this.ui.style.width = width+'px';
		else
			this.ui.style.width = '';
		if(height != undefined)
			this.ui.style.height = height+'px';
		else
			this.ui.style.height = '';
	},

	setResizable: function(resizable) {
		this.resizable = resizable;
		if(Era.util.isWebkit)
			this.ui.style.webkitBoxFlex = resizable ? 1 : 0;
		else if(Era.util.isGecko)
			this.ui.style.MozBoxFlex = resizable ? 1 : 0;
	},

	getResizable: function() {
		return this.resizable;
	},

	setTop: function(topDistance) {
		this.ui.style.position = 'absolute';
		if(topDistance != undefined)
			this.ui.style.top = topDistance+'px';
		else
			this.ui.style.top = '';
	},

	setBottom: function(bottomDistance) {
		this.ui.style.position = 'absolute';
		if(bottomDistance != undefined)
			this.ui.style.bottom = bottomDistance+'px';
		else
			this.ui.style.bottom = '';
	},

	setLeft: function(leftDistance) {
		this.ui.style.position = 'absolute';
		if(leftDistance != undefined)
			this.ui.style.left = leftDistance+'px';
		else
			this.ui.style.left = '';
	},

	setRight: function(rightDistance) {
		this.ui.style.position = 'absolute';
		if(rightDistance != undefined)
			this.ui.style.right = rightDistance+'px';
		else
			this.ui.style.right = '';
	},

	//
	// Set the position of the element, relative to its parent
	// position. If the position is set, the element leave the normal
	// document flow to be absolute positionned.
	// ex: setPosition(xpos, ypos)
	// ex: setPosition({x: xpos, y: ypos})
	//
	setPosition: function() {
		if(arguments.length == 1) {
			this.x = arguments[0].x;
			this.y = arguments[0].y;
		}
		else {
			this.x = arguments[0];
			this.y = arguments[1];
		}
		// return to the normal flow
		if((this.x == undefined) || (this.y == undefined)) {
			this.ui.style.position = 'relative';
			this.ui.style.webkitTransform = '';
		}
		else {
			this.ui.style.position = 'absolute';
			this.ui.style.left = '0px';
			this.ui.style.top = '0px';
			this.ui.style.right = '';
			this.ui.style.bottom = '';
			this.ui.style.webkitTransform = 'translate3d('+this.x+'px,'+this.y+'px,0px)';
		}
	},

	//
	// If the position was set, return the current element position.
	// return: { x: xpos, y: ypos }
	//
	getPosition: function() {
		return { x: this.x, y: this.y };
	},
	
	//
	// Like setPosition but only modify x value
	//
	setX: function(x) {
		this.setPosition(x, this.y);
	},

	//
	// Like getPosition but only return x value
	//
	getX: function() {
		return this.x;
	},

	//
	// Like setPosition but only modify y value
	//
	setY: function(y) {
		this.setPosition(this.x, y);
	},

	//
	// Like getPosition but only return y value
	//
	getY: function() {
		return this.y;
	},

	getWidth: function() {
		return this.ui.offsetWidth;
	},

	getHeight: function() {
		return this.ui.offsetHeight;
	},

	getSize: function() {
		return { width: this.ui.offsetWidth, height: this.ui.offsetHeight };
	},

	getTotalSize: function() {
		var marginLeft = new Number(this.ui.style.marginLeft.replace('px', ''));
		var marginRight = new Number(this.ui.style.marginRight.replace('px', ''));
		var marginTop = new Number(this.ui.style.marginTop.replace('px', ''));
		var marginBottom = new Number(this.ui.style.marginBottom.replace('px', ''));
		var totalSize = this.getSize();
		totalSize.width += marginLeft + marginRight;
		totalSize.height += marginTop + marginBottom;
		return totalSize;
	},

	setPadding: function() {
		if(arguments.length == 1)
			this.ui.style.padding = arguments[0]+'px';
		else if(arguments.length == 2)
			this.ui.style.padding = arguments[0]+'px '+arguments[1]+'px';
		else if(arguments.length == 4)
			this.ui.style.padding = arguments[0]+'px '+arguments[1]+'px '+arguments[2]+'px '+arguments[3]+'px';
	},

	//
	// Set the current element margin. Margin count in getTotalSize
	// but not in getSize.
	//
	setMargin: function() {
		if(arguments.length == 1)
			this.ui.style.margin = arguments[0]+'px';
		else if(arguments.length == 2)
			this.ui.style.margin = arguments[0]+'px '+arguments[1]+'px';
		else if(arguments.length == 4)
			this.ui.style.margin = arguments[0]+'px '+arguments[1]+'px '+arguments[2]+'px '+arguments[3]+'px';
	},

	//
	// Return the current margin of the current element.
	// Returned object format: { left: value, right: value, top: value, bottom: value }
	//
	getMargin: function() {
		return {
			left: new Number(this.ui.style.marginLeft.replace('px', '')),
			right: new Number(this.ui.style.marginRight.replace('px', '')),
			top: new Number(this.ui.style.marginTop.replace('px', '')),
			bottom: new Number(this.ui.style.marginBottom.replace('px', ''))
		};
	},

	//
	// Set the opacity of the current element
	// (value between 0.0 and 1.0)
	//
	setOpacity: function(opacity) {
		this.opacity = opacity;
		this.ui.style.opacity = opacity;
	},

	//
	// Define how to hide the current element. This
	// can be overrided in subclass if needed.
	//
	virtualHide: function(anim) {
		if(this.showAnim != undefined) {
			this.showAnim.abort();
			this.showAnim = undefined;
		}
		this.ui.style.pointerEvents = 'none';

		if(anim != undefined) {
			anim = Era.create(anim);
			anim.setMode('out');

			this.showAnim = anim;
			this.connect(anim, 'done', function() {
				this.showAnim = undefined;
				this.ui.style.opacity = 0;
			});
			anim.run(this);
		}
		else {
			this.ui.style.opacity = 0;
		}
	},

	//
	// Hide the current element. It will no more be visible
	// (and will not react to events). An anim can be provided.
	//
	hide: function() {
		if(!this.checkClass('hidden')) {
			this.addClass('hidden');
			// dont cumulate anims
			if(this.flashAnim != undefined) {
				this.flashAnim.abort();
				this.flashAnim = undefined;
			}
			this.virtualHide.apply(this, arguments);
		}
	},

	//
	// Define how to set the current element
	// visible. Can be overrided in descendant class
	// if needed.
	//
	virtualShow: function(anim) {
		if(this.showAnim != undefined) {
			this.showAnim.abort();
			this.showAnim = undefined;
		}
		this.ui.style.pointerEvents = '';
		this.ui.style.opacity = '';

		if(anim != undefined) {
			anim = Era.create(anim);
			anim.setMode('in');

			this.showAnim = anim;
			this.connect(anim, 'done', function() {
				this.showAnim = undefined;
			});
			anim.run(this);
		}
	},

	//
	// Show the current element. After show, the current
	// element is visible (and will react to events).
	// An anim can be provided.
	//
	show: function() {
		if(this.checkClass('hidden')) {
			this.removeClass('hidden');
			// dont cumulate anims
			if(this.flashAnim != undefined) {
				this.flashAnim.abort();
				this.flashAnim = undefined;
			}
			this.virtualShow.apply(this, arguments);
		}
	},

	//
	// True if the current element is not hidden
	//
	getIsVisible: function() {
		return(!this.checkClass('hidden'));
	},

	//
	// Animate the current element to attract the attention.
	//
	flash: function(anim) {
		if(this.flashAnim != undefined) {
			this.flashAnim.abort();
			this.flashAnim = undefined;
		}

		if(anim != undefined) {
			anim = Era.create(anim);
			this.flashAnim = anim;
			this.connect(anim, 'done', function() {
				this.flashAnim = undefined;
			});
			anim.run(this);
		}
	},

	//
	// Convert the given point from the current element
	// coordinate to the page coordinate. point is defined
	// like this: { x: value, y: value }
	//
	pointToPage: function(point) {
		return window.webkitConvertPointFromNodeToPage(this.ui, new WebKitPoint(point.x, point.y));
	},

	//
	// Convert the given point from page coordinate to
	// the current element coordinate. point is defined
	// like this: { x: value, y: value }
	//
	pointFromPage: function(point) {
		return window.webkitConvertPointFromPageToNode(this.ui, new WebKitPoint(point.x, point.y));
	},

	//
	// Convert the given point from given element coordinate to
	// the current element coordinate. point is defined
	// like this: { x: value, y: value }
	//
	pointFromElement: function(element, point) {
		return this.pointFromPage(element.pointToPage(point));
	},

	//
	// Convert the given point from current element coordinate to
	// the given element coordinate. point is defined
	// like this: { x: value, y: value }
	//
	pointToElement: function(element, point) {
		return element.pointFromPage(this.pointToPage(point));
	},
});


Era.namespace('Era.Anims');

Era.Anims.Anim = Era.extend('anim', Era.Object, {
	delay: 0,
	duration: 0.25,
	invert: false,
	mode: 'in',

	constructor: function(config) {
		this.superConstructor(config);
		if(config && (config.duration != undefined))
			this.duration = config.duration;
		if(config && (config.delay != undefined))
			this.delay = config.delay;
		if(config && (config.invert != undefined))
			this.invert = config.invert;
		if(config && (config.mode != undefined))
			this.mode = config.mode;
		this.addEvents('done', 'abort');
	},

	virtualBeforeRun: function(element) {
	},

	virtualOnRun: function(element) {
		throw('virtualOnRun MUST be implemented in each Anim');
	},

	virtualOnAbort: function(element) {
	},

	virtualAfterRun: function(element) {
	},

	run: function(element) {
		if(this.element != undefined)
			throw('an Anim can\'t be run on several element at a time');

		this.element = element;
		this.virtualBeforeRun(element);
		this.runTask = new Era.DelayedTask({ scope: this, delay: 0, callback: function() {
			this.virtualOnRun(this.element);
			this.runTask = undefined;
			var delay = this.delay + this.duration;
			this.afterTask = new Era.DelayedTask({ scope: this, delay: delay, callback: function() {
				this.virtualAfterRun(this.element);
				this.element = undefined;
				this.afterTask = undefined;
				this.fireEvent('done');
			}});
		}});
	},

	abort: function() {
		if(this.element != undefined) {
			if(this.runTask != undefined) {
				this.runTask.abort();
				this.runTask = undefined;
			}
			if(this.afterTask != undefined) {
				this.afterTask.abort();
				this.afterTask = undefined;
			}
			this.virtualOnAbort(this.element);
			this.element = undefined;
			this.fireEvent('abort');
		}
	},

	setMode: function(mode) {
		this.mode = mode;
	},

	getMode: function() {
		return this.mode;
	},

	setInvert: function(invert) {
		this.invert = invert;
	},

	getInvert: function() {
		return this.invert;
	},
});


Era.Anims.Transition = Era.extend('transition', Era.Object, {
	delay: 0,
	duration: 0.25,
	invert: false,

	constructor: function(config) {
		this.superConstructor(config);
		if(config && (config.duration != undefined))
			this.duration = config.duration;
		if(config && (config.delay != undefined))
			this.delay = config.delay;
		if(config && (config.invert != undefined))
			this.invert = config.invert;
		this.addEvents('done', 'abort');
	},

	virtualBeforeRun: function(elementIn, elementOut) {
	},

	virtualOnRun: function(elementIn, elementOut) {
		throw('virtualOnRun MUST be implemented in each Anim');
	},

	virtualOnAbort: function(elementIn, elementOut) {
	},

	virtualAfterRun: function(elementIn, elementOut) {
	},

	run: function(elementIn, elementOut) {
		if((this.elementIn != undefined) || (this.elementOut != undefined))
			throw('an Anim can\'t be run on several element at a time');

		this.elementIn = elementIn;
		this.elementOut = elementOut;

		this.virtualBeforeRun(elementIn, elementOut);
		this.runTask = new Era.DelayedTask({ scope: this, delay: 0, callback: function() {
			this.virtualOnRun(this.elementIn, this.elementOut);
			this.runTask = undefined;
			var delay = this.delay + this.duration;
			this.afterTask = new Era.DelayedTask({ scope: this, delay: delay, callback: function() {
				this.virtualAfterRun(this.elementIn, this.elementOut);
				this.elementIn.show(undefined);
				this.elementOut.hide(undefined);
				this.elementIn = undefined;
				this.elementOut = undefined;
				this.afterTask = undefined;
				this.fireEvent('done');
			}});
		}});
	},

	abort: function() {
		if((this.elementIn != undefined) || (this.elementOut != undefined)) {
			if(this.runTask != undefined) {
				this.runTask.abort();
				this.runTask = undefined;
			}
			if(this.afterTask != undefined) {
				this.afterTask.abort();
				this.afterTask = undefined;
			}
			this.virtualOnAbort(this.elementIn, this.elementOut);
			this.elementIn = undefined;
			this.elementOut = undefined;
			this.fireEvent('abort');
		}
	},

	setInvert: function(invert) {
		this.invert = invert;
	},

	getInvert: function() {
		return this.invert;
	},
});


Era.Anims.Fade = Era.extend('fade', Era.Anims.Anim, {
	constructor: function(config) {
		this.superConstructor(config);
	},

	virtualBeforeRun: function(element) {
		if(this.mode == 'in')
			element.ui.style.opacity = 0;
		else
			element.ui.style.opacity = '';
	},

	virtualOnRun: function(element) {
		if(this.mode == 'in') {
			element.ui.style.webkitTransitionProperty = 'opacity';
			element.ui.style.webkitTransitionDuration = this.duration+'s';
			element.ui.style.webkitTransitionDelay = this.delay+'s';
			element.ui.style.opacity = '';
		}
		else {
			element.ui.style.webkitTransitionProperty = 'opacity';
			element.ui.style.webkitTransitionDuration = this.duration+'s';
			element.ui.style.webkitTransitionDelay = this.delay+'s';
			element.ui.style.opacity = 0;
		}
	},

	virtualOnAbort: function(element) {
		element.ui.style.webkitTransitionDuration = '';
		element.ui.style.webkitTransitionDelay = '';
		element.ui.style.webkitTransitionProperty = '';
		element.ui.style.opacity = '';
	},

	virtualAfterRun: function(element) {
		if(this.mode == 'in') {
			element.ui.style.webkitTransitionDuration = '';
			element.ui.style.webkitTransitionDelay = '';
			element.ui.style.webkitTransitionProperty = '';
			element.ui.style.opacity = '';
		}
		else {
			element.ui.style.webkitTransitionDuration = '';
			element.ui.style.webkitTransitionDelay = '';
			element.ui.style.webkitTransitionProperty = '';
			element.ui.style.opacity = 0;
		}
	},
});


Era.Anims.Slide = Era.extend('slide', Era.Anims.Anim, {
	direction: 'left',

	constructor: function(config) {
		this.superConstructor(config);
		if(config && (config.direction != undefined))
			this.direction = config.direction;
	},

	virtualBeforeRun: function(element) {
		var direction = this.direction;
		if(this.invert) {
			if(this.direction == 'left')
				direction = 'right';
			else if(this.direction == 'right')
				direction = 'left';
			else if(this.direction == 'top')
				direction = 'bottom';
			else if(this.direction == 'bottom')
				direction = 'top';
		}
		if(this.mode == 'in') {
			var size = element.getTotalSize();

			if(direction == 'left')
				element.ui.style.webkitTransform = 'translate3d('+(-size.width)+'px, 0px, 0px)';
			else if(direction == 'right')
				element.ui.style.webkitTransform = 'translate3d('+size.width+'px, 0px, 0px)';
			else if(direction == 'top')
				element.ui.style.webkitTransform = 'translate3d(0px, '+(-size.height)+'px, 0px)';
			else if(direction == 'bottom')
				element.ui.style.webkitTransform = 'translate3d(0px, '+size.height+'px, 0px)';
		}
		else {
			element.ui.style.webkitTransform = 'translate3d(0px, 0px, 0px)';
		}
	},

	virtualOnRun: function(element) {
		var direction = this.direction;
		if(this.invert) {
			if(this.direction == 'left')
				direction = 'right';
			else if(this.direction == 'right')
				direction = 'left';
			else if(this.direction == 'top')
				direction = 'bottom';
			else if(this.direction == 'bottom')
				direction = 'top';
		}

		if(this.mode == 'in') {
			element.ui.style.webkitTransitionProperty = '-webkit-transform';
			element.ui.style.webkitTransitionDuration = this.duration+'s';
			element.ui.style.webkitTransitionDelay = this.delay+'s';
			element.ui.style.webkitTransform = 'translate3d(0px, 0px, 0px)';
		}
		else {
			element.ui.style.webkitTransitionProperty = '-webkit-transform';
			element.ui.style.webkitTransitionDuration = this.duration+'s';
			element.ui.style.webkitTransitionDelay = this.delay+'s';

			var size = element.getTotalSize();

			if(direction == 'left')
				element.ui.style.webkitTransform = 'translate3d('+(-size.width)+'px, 0px, 0px)';
			else if(direction == 'right')
				element.ui.style.webkitTransform = 'translate3d('+size.width+'px, 0px, 0px)';
			else if(direction == 'top')
				element.ui.style.webkitTransform = 'translate3d(0px, '+(-size.height)+'px, 0px)';
			else if(direction == 'bottom')
				element.ui.style.webkitTransform = 'translate3d(0px, '+size.height+'px, 0px)';
		}
	},

	virtualOnAbort: function(element) {
		element.ui.style.webkitTransitionDuration = '';
		element.ui.style.webkitTransitionDelay = '';
		element.ui.style.webkitTransitionProperty = '';
		element.ui.style.webkitTransform = '';
	},

	virtualAfterRun: function(element) {
		element.ui.style.webkitTransitionDuration = '';
		element.ui.style.webkitTransitionDelay = '';
		element.ui.style.webkitTransitionProperty = '';
		element.ui.style.webkitTransform = '';
	},
});


Era.Anims.Flip = Era.extend('flip', Era.Anims.Anim, {
	orientation: 'horizontal',

	constructor: function(config) {
		this.superConstructor(config);
		if(config && (config.orientation != undefined))
			this.orientation = config.orientation;
	},

	virtualBeforeRun: function(element) {
		element.getParent().ui.style.overflow = 'visible';
		element.ui.style.zIndex = element.ui.style.zIndex+1;
		if(this.mode == 'in') {
			if(this.orientation == 'horizontal')
				element.ui.style.webkitTransform = 'rotateY(-90deg)';
			else
				element.ui.style.webkitTransform = 'rotateX(-90deg)';
		}
		else {
			if(this.orientation == 'horizontal')
				element.ui.style.webkitTransform = 'rotateY(0deg)';
			else
				element.ui.style.webkitTransform = 'rotateX(0deg)';
		}
	},

	virtualOnRun: function(element) {
		if(this.mode == 'in') {
			element.ui.style.webkitTransitionProperty = '-webkit-transform';
			element.ui.style.webkitTransitionDuration = this.duration+'s';
			element.ui.style.webkitTransitionDelay = this.delay+'s';

			if(this.orientation == 'horizontal')
				element.ui.style.webkitTransform = 'rotateY(0deg)';
			else
				element.ui.style.webkitTransform = 'rotateX(0deg)';
		}
		else {
			element.ui.style.webkitTransitionProperty = '-webkit-transform';
			element.ui.style.webkitTransitionDuration = this.duration+'s';
			element.ui.style.webkitTransitionDelay = this.delay+'s';
			if(this.orientation == 'horizontal')
				element.ui.style.webkitTransform = 'rotateY(90deg)';
			else
				element.ui.style.webkitTransform = 'rotateX(90deg)';
		}
	},

	virtualOnAbort: function(element) {
		element.ui.style.webkitTransitionDuration = '';
		element.ui.style.webkitTransitionDelay = '';
		element.ui.style.webkitTransitionProperty = '';
		element.ui.style.webkitTransform = '';
		element.ui.style.zIndex = element.ui.style.zIndex-1;
	},

	virtualAfterRun: function(element) {
		element.ui.style.webkitTransitionDuration = '';
		element.ui.style.webkitTransitionDelay = '';
		element.ui.style.webkitTransitionProperty = '';
		element.ui.style.webkitTransform = '';
		element.ui.style.zIndex = element.ui.style.zIndex-1;
	},
});


Era.Anims.MoveTo = Era.extend('moveto', Era.Anims.Anim, {
	x: 0,
	y: 0,

	constructor: function(config) {
		this.superConstructor(config);
		if(config && (config.x != undefined))
			this.x = config.x;
		if(config && (config.y != undefined))
			this.y = config.y;
	},

	virtualBeforeRun: function(element) {
	},

	virtualOnRun: function(element) {
		element.ui.style.webkitTransitionProperty = '-webkit-transform';
		element.ui.style.webkitTransitionDuration = this.duration+'s';
		element.ui.style.webkitTransitionDelay = this.delay+'s';
		element.ui.style.webkitTransform = 'translate3d('+this.x+'px,'+this.y+'px,0px)';
	},

	virtualOnAbort: function(element) {
		element.ui.style.webkitTransitionDuration = '';
		element.ui.style.webkitTransitionDelay = '';
		element.ui.style.webkitTransitionProperty = '';
	},

	virtualAfterRun: function(element) {
		element.ui.style.webkitTransitionDuration = '';
		element.ui.style.webkitTransitionDelay = '';
		element.ui.style.webkitTransitionProperty = '';
		element.setPosition(this.x, this.y);
	},
});


Era.Anims.CrossFade = Era.extend('crossfade', Era.Anims.Transition, {
	constructor: function(config) {
		this.superConstructor(config);
	},

	virtualBeforeRun: function(elementIn, elementOut) {
		elementIn.ui.style.opacity = 0;
		elementOut.ui.style.opacity = '';
	},

	virtualOnRun: function(elementIn, elementOut) {
		elementIn.ui.style.webkitTransitionProperty = 'opacity';
		elementIn.ui.style.webkitTransitionDuration = this.duration+'s';
		elementIn.ui.style.webkitTransitionDelay = this.delay+'s';
		elementIn.ui.style.opacity = '';

		elementOut.ui.style.webkitTransitionProperty = 'opacity';
		elementOut.ui.style.webkitTransitionDuration = this.duration+'s';
		elementOut.ui.style.webkitTransitionDelay = this.delay+'s';
		elementOut.ui.style.opacity = 0;
	},

	virtualOnAbort: function(elementIn, elementOut) {
		elementIn.ui.style.webkitTransitionDuration = '';
		elementIn.ui.style.webkitTransitionDelay = '';
		elementIn.ui.style.webkitTransitionProperty = '';
		elementIn.ui.style.opacity = '';

		elementOut.ui.style.webkitTransitionDuration = '';
		elementOut.ui.style.webkitTransitionDelay = '';
		elementOut.ui.style.webkitTransitionProperty = '';
		elementOut.ui.style.opacity = '';
	},

	virtualAfterRun: function(elementIn, elementOut) {
		elementIn.ui.style.webkitTransitionDuration = '';
		elementIn.ui.style.webkitTransitionDelay = '';
		elementIn.ui.style.webkitTransitionProperty = '';
		elementIn.ui.style.opacity = '';

		elementOut.ui.style.webkitTransitionDuration = '';
		elementOut.ui.style.webkitTransitionDelay = '';
		elementOut.ui.style.webkitTransitionProperty = '';
		elementOut.ui.style.opacity = 0;
	},
});


Era.Anims.TransSlide = Era.extend('transslide', Era.Anims.Transition, {
	direction: 'left',

	constructor: function(config) {
		this.superConstructor(config);
		if(config && (config.direction != undefined))
			this.direction = config.direction;
	},

	virtualBeforeRun: function(elementIn, elementOut) {
		this.transInAnim = Era.create({ type: 'slide', direction: this.direction, invert: this.invert, duration: this.duration, delay: this.delay });
		this.transOutAnim = Era.create({ type: 'slide', direction: this.direction, invert: !this.invert, duration: this.duration, delay: this.delay });
	},

	virtualOnRun: function(elementIn, elementOut) {
		elementIn.show(this.transInAnim);
		elementOut.hide(this.transOutAnim);
	},

	virtualOnAbort: function(elementIn, elementOut) {
		if(this.transInAnim != undefined) {
			this.transInAnim.abort();
			this.transInAnim = undefined;
		}
		if(this.transOutAnim != undefined) {
			this.transOutAnim.abort();
			this.transOutAnim = undefined;
		}
	},

	virtualAfterRun: function(elementIn, elementOut) {
		this.transInAnim = undefined;
		this.transOutAnim = undefined;
	},
});


Era.Anims.CardFlip = Era.extend('cardflip', Era.Anims.Transition, {
	orientation: 'horizontal',

	constructor: function(config) {
		this.superConstructor(config);
		if(config && (config.orientation != undefined))
			this.orientation = config.orientation;
	},

	virtualBeforeRun: function(elementIn, elementOut) {
		this.transInAnim = Era.create({ type: 'flip', orientation: this.orientation, invert: !this.invert, duration: (this.duration/2), delay: (this.delay+(this.duration/2)) });
		this.transOutAnim = Era.create({ type: 'flip', orientation: this.orientation, invert: this.invert, duration: (this.duration/2), delay: this.delay });
	},

	virtualOnRun: function(elementIn, elementOut) {
		elementOut.hide(this.transOutAnim);
		elementIn.show(this.transInAnim);
	},

	virtualOnAbort: function(elementIn, elementOut) {
		if(this.transInAnim != undefined) {
			this.transInAnim.abort();
			this.transInAnim = undefined;
		}
		if(this.transOutAnim != undefined) {
			this.transOutAnim.abort();
			this.transOutAnim = undefined;
		}
	},

	virtualAfterRun: function(elementIn, elementOut) {
		this.transInAnim = undefined;
		this.transOutAnim = undefined;
	},
});


Era.Anims.Bounce = Era.extend('bounce', Era.Anims.Anim, {
	direction: 'top',

	constructor: function(config) {
		this.superConstructor(config);
		if(config && (config.direction != undefined))
			this.direction = config.direction;
	},

	virtualBeforeRun: function(element) {
		element.ui.style.webkitAnimationName = 'none';
	},

	virtualOnRun: function(element) {
		var direction = this.direction;
		if(this.invert) {
			if(this.direction == 'left')
				direction = 'right';
			else if(this.direction == 'right')
				direction = 'left';
			else if(this.direction == 'top')
				direction = 'bottom';
			else if(this.direction == 'bottom')
				direction = 'top';
		}
		element.ui.style.webkitAnimationName = 'bounce'+this.direction;
		element.ui.style.webkitAnimationDuration = this.duration+'s';
		element.ui.style.webkitAnimationDelay = this.delay+'s';
		element.ui.style.webkitAnimationIterationCount = '1';
		element.ui.style.webkitAnimationTimingFunction = 'cubic-bezier(0.25, 0.1, 0.25, 1)';
		element.ui.style.webkitAnimationDirection = 'normal';
	},

	virtualOnAbort: function(element) {
		element.ui.style.webkitAnimationName = 'none';
		element.ui.style.webkitAnimationDuration = '';
		element.ui.style.webkitAnimationDelay = '';
		element.ui.style.webkitAnimationIterationCount = '';
		element.ui.style.webkitAnimationTimingFunction = '';
		element.ui.style.webkitAnimationDirection = '';
	},

	virtualAfterRun: function(element) {
		element.ui.style.webkitAnimationName = 'none';
		element.ui.style.webkitAnimationDuration = '';
		element.ui.style.webkitAnimationDelay = '';
		element.ui.style.webkitAnimationIterationCount = '';
		element.ui.style.webkitAnimationTimingFunction = '';
		element.ui.style.webkitAnimationDirection = '';
	},
});


Era.Anims.Inflate = Era.extend('inflate', Era.Anims.Anim, {

	constructor: function(config) {
		this.superConstructor(config);
	},

	virtualBeforeRun: function(element) {
		element.ui.style.webkitAnimationName = 'none';
	},

	virtualOnRun: function(element) {
		element.ui.style.webkitAnimationName = 'inflate';
		element.ui.style.webkitAnimationDuration = this.duration+'s';
		element.ui.style.webkitAnimationDelay = this.delay+'s';
		element.ui.style.webkitAnimationIterationCount = '1';
		element.ui.style.webkitAnimationTimingFunction = 'cubic-bezier(0.25, 0.1, 0.25, 1)';
		element.ui.style.webkitAnimationDirection = 'normal';
	},

	virtualOnAbort: function(element) {
		element.ui.style.webkitAnimationName = 'none';
		element.ui.style.webkitAnimationDuration = '';
		element.ui.style.webkitAnimationDelay = '';
		element.ui.style.webkitAnimationIterationCount = '';
		element.ui.style.webkitAnimationTimingFunction = '';
		element.ui.style.webkitAnimationDirection = '';
	},

	virtualAfterRun: function(element) {
		element.ui.style.webkitAnimationName = 'none';
		element.ui.style.webkitAnimationDuration = '';
		element.ui.style.webkitAnimationDelay = '';
		element.ui.style.webkitAnimationIterationCount = '';
		element.ui.style.webkitAnimationTimingFunction = '';
		element.ui.style.webkitAnimationDirection = '';
	},
});


Era.Anims.Boing = Era.extend('boing', Era.Anims.Anim, {

	constructor: function(config) {
		this.superConstructor(config);
	},

	virtualBeforeRun: function(element) {
		element.ui.style.webkitAnimationName = 'none';
		if(this.mode == 'in')
			element.ui.style.webkitTransform = 'scale(0)';
		else
			element.ui.style.webkitTransform = 'scale(1)';
	},

	virtualOnRun: function(element) {
		if(this.mode == 'in') {
			element.ui.style.webkitAnimationName = 'inflateshow';
		}
		else {
			element.ui.style.webkitAnimationName = 'inflatehide';
		}
		element.ui.style.webkitAnimationDuration = this.duration+'s';
		element.ui.style.webkitAnimationDelay = this.delay+'s';
		element.ui.style.webkitAnimationIterationCount = '1';
		element.ui.style.webkitAnimationTimingFunction = 'cubic-bezier(0.25, 0.1, 0.25, 1)';
		element.ui.style.webkitAnimationDirection = 'normal';
	},

	virtualOnAbort: function(element) {
		element.ui.style.webkitAnimationName = 'none';
		element.ui.style.webkitAnimationDuration = '';
		element.ui.style.webkitAnimationDelay = '';
		element.ui.style.webkitAnimationIterationCount = '';
		element.ui.style.webkitAnimationTimingFunction = '';
		element.ui.style.webkitAnimationDirection = '';
		element.ui.style.webkitTransform = '';
	},

	virtualAfterRun: function(element) {
		element.ui.style.webkitAnimationName = 'none';
		element.ui.style.webkitAnimationDuration = '';
		element.ui.style.webkitAnimationDelay = '';
		element.ui.style.webkitAnimationIterationCount = '';
		element.ui.style.webkitAnimationTimingFunction = '';
		element.ui.style.webkitAnimationDirection = '';
		element.ui.style.webkitTransform = '';
	},
});


Era.Hl = Era.extend('hl', Era.Element, {
	constructor: function(config) {
		this.superConstructor(config);
	},
});

Era.Container = Era.extend('container', Era.Element, {
	align: 'stretch',

	constructor: function(config) {
		this.superConstructor(config);
		this.children = [];
		if(config && (config.align != undefined))
			this.setAlign(config.align);
		if(config && (config.pack != undefined))
			this.setPack(config.pack);
	},

	virtualOnAdd: function(child) {
	},

	add: function(child) {
		this.children.push(child);
		this.ui.appendChild(child.ui);
		this.virtualOnAdd(child);
	},

	addFirst: function(child) {
		if(this.ui.firstChild == undefined) 
			this.add(child);
		else {
			this.children.unshift(child);
			this.ui.insertBefore(child.ui, this.ui.firstChild);
			this.virtualOnAdd(child);
		}
	},

	addCentered: function(child) {
		var vbox = new Era.VBox({ resizable: true, pack: 'center', align: 'center' });
		vbox.add(child);
		this.add(vbox);
		return vbox;
	},

	virtualOnRemove: function(child) {
	},

	remove: function(child) {
		var pos = this.getChildPosition(child);
		if(pos != -1) {
			this.children.splice(pos, 1);
			this.ui.removeChild(child.ui);
			this.virtualOnRemove(child);
		}
	},

	replace: function(oldChild, newChild, transition) {
		if(oldChild == newChild)
			return;

		var pos = this.getChildPosition(oldChild);
		if(pos == -1)
			throw('oldChild not a child of the container');

		this.children.splice(pos, 1, newChild);
		if(transition == undefined) {
			this.ui.replaceChild(newChild.ui, oldChild.ui);
			this.virtualOnRemove(oldChild);
			this.virtualOnAdd(newChild);
		}
		else {
			transition = Era.create(transition);

			if(oldChild.replaceTransition != undefined)
				oldChild.replaceTransition.abort();

			newChild.replaceTransition = transition;
			newChild.hide(undefined);
			newChild.ui.style.position = 'absolute';
			newChild.ui.style.width = oldChild.ui.offsetWidth+'px';
			newChild.ui.style.height = oldChild.ui.offsetHeight+'px';

			newChild.ui.style.left = oldChild.ui.style.left;
			newChild.ui.style.top = oldChild.ui.style.top;

			this.ui.insertBefore(newChild.ui, oldChild.ui);

			this.connect(transition, 'done', function() {
				newChild.replaceTransition = undefined;
				this.ui.removeChild(oldChild.ui);
				newChild.ui.style.position = 'relative';
				newChild.ui.style.width = oldChild.ui.style.width;
				newChild.ui.style.height = oldChild.ui.style.height;
				newChild.ui.style.left = oldChild.ui.style.left;
				newChild.ui.style.top = oldChild.ui.style.top;
				this.virtualOnRemove(oldChild);
				this.virtualOnAdd(newChild);
			});
			this.connect(transition, 'abort', function() {
				newChild.replaceTransition = undefined;
				this.ui.removeChild(oldChild.ui);
				newChild.ui.style.position = 'relative';
				newChild.ui.style.width = oldChild.ui.style.width;
				newChild.ui.style.height = oldChild.ui.style.height;
				newChild.ui.style.left = oldChild.ui.style.left;
				newChild.ui.style.top = oldChild.ui.style.top;
				this.virtualOnRemove(oldChild);
				this.virtualOnAdd(newChild);
			});

			transition.run(newChild, oldChild);
		}
	},

	getChildPosition: function(child) {
		var i;
		for(i = 0; (i < this.children.length) && (this.children[i] !== child); i++) {}
		if(i < this.children.length)
			return i;
		else
			return -1;
	},

	clearChildren: function() {
		for(i = 0; i < this.children.length; i++) {
			var child = this.children[i];
			this.ui.removeChild(child.ui);
			this.virtualOnRemove(child);
		}
		this.children = [];
	},

	setAlign: function(align) {
		if(Era.util.isWebkit)
			this.ui.style.webkitBoxAlign = align;
		else if(Era.util.isGecko)
			this.ui.style.MozBoxAlign = align;
	},

	getAlign: function() {
		if(Era.util.isWebkit)
			return this.ui.style.webkitBoxAlign;
		else if(Era.util.isGecko)
			return this.ui.style.MozBoxAlign;
	},

	setPack: function(pack) {
		if(Era.util.isWebkit)
			this.ui.style.webkitBoxPack = pack;
		else if(Era.util.isGecko)
			this.ui.style.MozBoxPack = pack;
	},

	getPack: function() {
		if(Era.util.isWebkit)
			return this.ui.style.webkitBoxPack;
		else if(Era.util.isGecko)
			return this.ui.style.MozBoxPack;
	},
});



Era.SingleContainer = Era.extend('singlecontainer', Era.Element, {
	align: 'stretch',

	constructor: function(config) {
		this.superConstructor(config);
		this.ui.style.position = 'relative';
		this.child = undefined;
	},

	getChild: function() {
		return this.child;
	},

	setChild: function(child) {
		if(this.child != undefined)
			this.ui.removeChild(this.child.ui);
		this.child = child;
		if(this.child != undefined)
			this.ui.appendChild(this.child.ui);
	},

	clearChild: function() {
		if(this.child != undefined) {
			this.ui.removeChild(this.child.ui);
			this.child = undefined;
		}
	},

	replaceChild: function(newChild, transition) {
		if(this.child == newChild)
			return;

		var oldChild = this.child;
		this.child = newChild;

		if(transition == undefined) {
			this.ui.replaceChild(newChild.ui, oldChild.ui);
		}
		else {
			transition = Era.create(transition);

			if(oldChild.replaceTransition != undefined)
				oldChild.replaceTransition.abort();

			newChild.replaceTransition = transition;
			newChild.hide(undefined);
			newChild.ui.style.position = 'absolute';
			newChild.ui.style.width = oldChild.ui.offsetWidth+'px';
			newChild.ui.style.height = oldChild.ui.offsetHeight+'px';

			newChild.ui.style.left = oldChild.ui.style.left;
			newChild.ui.style.top = oldChild.ui.style.top;

			this.ui.insertBefore(newChild.ui, oldChild.ui);

			this.connect(transition, 'done', function() {
				newChild.replaceTransition = undefined;
				this.ui.removeChild(oldChild.ui);
				newChild.ui.style.position = 'relative';
				newChild.ui.style.width = oldChild.ui.style.width;
				newChild.ui.style.height = oldChild.ui.style.height;
				newChild.ui.style.left = oldChild.ui.style.left;
				newChild.ui.style.top = oldChild.ui.style.top;
			});
			this.connect(transition, 'abort', function() {
				newChild.replaceTransition = undefined;
				this.ui.removeChild(oldChild.ui);
				newChild.ui.style.position = 'relative';
				newChild.ui.style.width = oldChild.ui.style.width;
				newChild.ui.style.height = oldChild.ui.style.height;
				newChild.ui.style.left = oldChild.ui.style.left;
				newChild.ui.style.top = oldChild.ui.style.top;
			});
			transition.run(newChild, oldChild);
		}
	},

	setAlign: function(align) {
		this.align = align;
		this.ui.style.webkitBoxAlign = this.align;
	}
});




Era.VBox = Era.extend('vbox', Era.Container, {
	constructor: function(config) {
		this.superConstructor(config);
		this.addClass('vbox');
	},
});


Era.HBox = Era.extend('hbox', Era.Container, {
	constructor: function(config) {
		this.superConstructor(config);
		this.addClass('hbox');
	},
});

Era.OBox = Era.extend('obox', Era.Container, {
	invert: false,

	constructor: function(config) {
		this.superConstructor(config);
		if(config && config.invert)
			this.setInvert(config.invert);
		else
			this.applyMode();

		this.connect(Era.currentApp, 'orientationmodechanged', function(mode) {
			this.applyMode();
			if(mode == 'portrait')
				mode = 'vertical';
			else
				mode = 'horizontal';
			if(this.invert) {
				if(mode == 'vertical')
					mode = 'horizontal';
				else
					mode = 'vertical';
			}
			this.fireEvent('modechanged', this, mode);
		});
		this.addEvents('modechanged');
	},

	applyMode: function() {
		var mode = Era.currentApp.getOrientationMode();
		if(mode == 'landscape') {
			if(!this.invert)
				this.setHorizontal();
			else
				this.setVertical();
		}
		else {
			if(this.invert)
				this.setHorizontal();
			else
				this.setVertical();
		}
	},

	setHorizontal: function() {
		if(Era.util.isWebkit)
			this.ui.style.webkitBoxOrient = 'horizontal';
		else if(Era.util.isGecko)
			this.ui.style.MozBoxOrient = 'horizontal';
	},

	setVertical: function() {
		if(Era.util.isWebkit)
			this.ui.style.webkitBoxOrient = 'vertical';
		else if(Era.util.isGecko)
			this.ui.style.MozBoxOrient = 'vertical';
	},

	setInvert: function(invert) {
		this.invert = invert;
		this.applyMode();
	},
});

Era.FBox = Era.extend('fbox', Era.Container, {
	constructor: function(config) {
		this.superConstructor(config);
		this.addClass('fbox');
	},

	addText: function(text) {
		var textnode = document.createTextNode(text);
		this.ui.appendChild(textnode);
	},

	addNewline: function() {
		var newline = document.createElement('br');
		this.ui.appendChild(newline);
	},
});

Era.LBox = Era.extend('lbox', Era.Container, {
	constructor: function(config) {
		this.superConstructor(config);
		this.addClass('lbox');
//		this.ui.style.position = 'relative';
		this.children = [];
//		this.ui.style.overflow = 'hidden';
	},

	virtualOnAdd: function(child) {
		if(this.children.length > 1) {
			child.ui.style.position = 'absolute';
			child.ui.style.left = '0px';
			child.ui.style.right = '0px';
			child.ui.style.top = '0px';
			child.ui.style.bottom = '0px';
		}
	},

	virtualOnRemove: function(child) {
		// TODO
	},
});

Era.CBox = Era.extend('cbox', Era.Container, {

	transition: 'crossfade',

	wrap: false,

	constructor: function(config) {
		this.superConstructor(config);
		this.children = [];
		this.currentPosition = 0;
		if(config && (config.transition != undefined))
			this.transition = config.transition;
		if(config && (config.wrap != undefined))
			this.wrap = config.wrap;
	},

	virtualOnAdd: function(child) {
		if(this.children.length > 1) {
			child.ui.style.position = 'absolute';
			child.ui.style.left = '0px';
			child.ui.style.right = '0px';
			child.ui.style.top = '0px';
			child.ui.style.bottom = '0px';
		}

		var pos = this.getChildPosition(child);
		if(pos != this.currentPosition)
			child.hide();
	},

	virtualOnRemove: function(child) {
		// TODO
	},

	setCurrentPosition: function(pos, transition, invert) {
		if(pos != this.currentPosition) {
			var currentPosition = this.currentPosition;
			var current = this.children[this.currentPosition];
			var next = this.children[pos];

			if(invert == undefined)
				invert = false;
			if(transition == undefined)
				transition = this.transition;

			transition = Era.create(transition);
			transition.setInvert(invert);
			
			if(this.transitionAnim != undefined) {
				this.transitionAnim.abort();
				this.transitionAnim = undefined;
			}

			if(transition != undefined) {
				this.transitionAnim = transition;
				this.connect(this.transitionAnim, 'done', function() {
					this.transitionAnim = undefined;
				});
				this.transitionAnim.run(next, current);
			}
			else {
				current.hide(undefined);
				next.show(undefined);
			}
			this.currentPosition = pos;
		}
	},

	getCurrentPosition: function() {
		return this.currentPosition;
	},
	
	next: function(transition) {
		if(this.currentPosition < this.children.length -1)
			this.setCurrentPosition(this.currentPosition + 1, transition, false);
		else if(this.wrap)
			this.setCurrentPosition(0, transition, false);
	},
	
	previous: function(transition) {
		if(this.currentPosition > 0)
			this.setCurrentPosition(this.currentPosition - 1, transition, true);
		else if(this.wrap)
			this.setCurrentPosition(this.children.length -1, transition, true);
	},

	setTransition: function(transition) {
		this.transition = transition;
	},
});

Era.Grid = Era.extend('grid', Era.Element, {
	col: 1,
	row: 1,

	constructor: function(config) {
		this.superConstructor(config);
		this.addClass('grid');
		if(config && (config.col != undefined))
			this.col = config.col;
		if(config && (config.row != undefined))
			this.row = config.row;

		var tbody = document.createElement('tbody');
		
		for(var rowpos = 0; rowpos < this.row; rowpos++) {
			var row = document.createElement('tr');
			for(var colpos = 0; colpos < this.col; colpos++) {
				var cell = document.createElement('td');
				row.appendChild(cell);
			}
			tbody.appendChild(row);
		}

        this.ui.appendChild(tbody);

	},

	virtualRender: function() {
		return document.createElement('table');
	},

	attach: function(element, col, row, colspan, rowspan) {
		if(colspan == undefined)
			colspan = 1;
		if(rowspan == undefined)
			rowspan = 1;
		this.ui.tBodies[0].rows[row].cells[col].colSpan = colspan;
		this.ui.tBodies[0].rows[row].cells[col].rowSpan = rowspan;
		this.ui.tBodies[0].rows[row].cells[col].appendChild(element.ui);
	},
});

Era.ScrollingArea = Era.extend('scrollingarea', Era.SingleContainer, {

	constructor: function(config) {
		this.superConstructor(config);
		this.ui.style.overflow = 'auto';

		this.connect(this, 'mousedown', function(mouse, button) {
			if(button != 0)
				return;

			this.startMove = mouse.getPagePosition();

			mouse.capture(this);

			this.connect(this, 'mousemove', function(mouse) {
				var point = mouse.getPagePosition();
				var deltaMove = { x: point.x - this.startMove.x, y: point.y - this.startMove.y };

			});
			this.connect(this, 'mouseup', function(mouse, button) {
				if(button != 0)
					return;

				mouse.release();
				this.disconnect(this, 'mousemove');
				this.disconnect(this, 'mouseup');
			});
		});

	},

	
});



Era.AutoScaleBox = Era.extend('autoscalebox', Era.Element, {
	content: undefined,
	verticalAlign: 'center',
	horizontalAlign: 'center',

	constructor: function(config) {
		if(!config)
			config = {};
		config.resizable = true;
		this.superConstructor(config);
		this.ui.style.position = 'relative';

		this.contentArea = new Era.VBox();
		this.contentArea.ui.style.position = 'absolute';
		this.ui.appendChild(this.contentArea.ui);

		this.connect(this, 'resized', this.updatePosition);
		if(config && (config.verticalAlign != undefined))
			this.setVerticalAlign(config.verticalAlign);
		if(config && (config.horizontalAlign != undefined))
			this.setHorizontalAlign(config.horizontalAlign);
		if(config && (config.content != undefined))
			this.setContent(Era.create(config.content));
	},

	setContent: function(content) {
		if(this.content != undefined)
			this.contentArea.remove(this.content);

		this.content = content;
		this.contentArea.add(this.content);

		this.connect(this.content, 'resized', this.updatePosition);
		this.setVerticalAlign(this.verticalAlign);
		this.setHorizontalAlign(this.horizontalAlign);
	},

	updatePosition: function() {
		if(this.content != undefined) {
			var size = this.getSize();
			var contentSize = this.content.getTotalSize();

			var scaleX = size.width  / contentSize.width;
			var scaleY = size.height / contentSize.height;
			var scale = (scaleX < scaleY) ? scaleX : scaleY;

			this.contentArea.ui.style.webkitTransformOrigin = '0px 0px';
			this.contentArea.ui.style.webkitTransform = 'scale('+(scale)+')';

			if(this.horizontalAlign == 'left')
				this.contentArea.ui.style.left = '0px';
			else if(this.horizontalAlign == 'center')
				this.contentArea.ui.style.left = ((size.width - (contentSize.width * scale)) / 2)+'px';
			else
				this.contentArea.ui.style.left = (size.width - (contentSize.width * scale))+'px';

			if(this.verticalAlign == 'top')
				this.contentArea.ui.style.top = '0px';
			else if(this.verticalAlign == 'center')
				this.contentArea.ui.style.top = ((size.height - (contentSize.height * scale)) / 2)+'px';
			else
				this.contentArea.ui.style.top = (size.height - (contentSize.height * scale))+'px';
		}
	},

	setVerticalAlign: function(align) {
		this.verticalAlign = align;
		if(this.content != undefined)
			this.updatePosition();
	},

	setHorizontalAlign: function(align) {
		this.horizontalAlign = align;
		if(this.content != undefined)
			this.updatePosition();
	},
});


Era.Toolbar = Era.extend('toolbar', Era.HBox, {
	constructor: function(config) {
		this.superConstructor(config);
		this.addClass('toolbar');
	},
});

// Define the Button class.
Era.Button = Era.extend('button', Era.HBox, {
	isEnable: true,
	isDown: false,

	constructor: function(config) {
		this.superConstructor(config);
		this.addEvents('pressed', 'disabled', 'enabled');

		this.connect(this, 'mousedown', function(mouse, button) {
			if((button != 0) || (!this.isEnable))
				return;

			this.addClass('down');
			this.virtualOnDown();
			this.isDown = true;

			mouse.capture(this);

			this.connect(this, 'mousemove', function(mouse) {
				var point = mouse.getPosition(this);
				if((point.x > 0) && (point.x < this.getWidth()) && (point.y > 0) && (point.y < this.getHeight())) {
					if(!this.isDown) {
						this.isDown = true;
						this.addClass('down');
						this.virtualOnDown();
					}
				}
				else {
					if(this.isDown) {
						this.isDown = false;
						this.removeClass('down');
						this.virtualOnUp();
					}
				}
			});
			this.connect(this, 'mouseup', function(mouse, button) {
				if(button != 0)
					return;
				mouse.release();
				this.disconnect(this, 'mousemove');
				this.disconnect(this, 'mouseup');
				if(this.isDown) {
					this.isDown = false;
					this.removeClass('down');
					this.virtualOnUp();
					this.fireEvent('pressed', this);
				}
			});
		});

		this.connect(this, 'touchstart', function(event) {
			if(!this.isEnable)
				return;
			if(!this.isDown) {
				this.addClass('down');
				this.virtualOnDown();
				this.isDown = true;
			}
		});
		this.connect(this, 'touchmove', function(event) {
			var point = this.pointFromPage({ x: event.targetTouches[0].pageX, y: event.targetTouches[0].pageY });
			if((point.x > 0) && (point.x < this.getWidth()) && (point.y > 0) && (point.y < this.getHeight())) {
				if(!this.isDown) {
					this.isDown = true;
					this.addClass('down');
					this.virtualOnDown();
				}
			}
			else {
				if(this.isDown) {
					this.isDown = false;
					this.removeClass('down');
					this.virtualOnUp();
				}
			}
		});
		this.connect(this, 'touchend', function(event) {
			if(this.isDown) {
				this.isDown = false;
				this.removeClass('down');
				this.virtualOnUp();
				this.fireEvent('pressed', this);
			}
		});
		if(config != undefined) {
			if(config.text != undefined)
				this.setText(config.text);
			if(config.disabled)
				this.disable();
		}
	},

	setText: function(text) {
		this.add(new Era.Html({ html: text }));
	},

	disable: function() {
		if(this.isEnable) {
			this.isEnable = false;
			this.addClass('disabled');
			this.fireEvent('disabled', this);
		}
	},
	
	enable: function() {
		if(!this.isEnable) {
			this.isEnable = true;
			this.removeClass('disabled');
			this.fireEvent('enabled', this);
		}
	},

	virtualOnDown: function() {
	},

	virtualOnUp: function() {
	},
});

// Define the back Button class.
Era.ToggleButton = Era.extend('togglebutton', Era.HBox, {
	state1: 'ON',
	state2: 'OFF',

	constructor: function(config) {
		this.superConstructor(config);
		if((config != undefined) && (config.state1 != undefined))
			this.state1 = config.state1;
		if((config != undefined) && (config.state2 != undefined))
			this.state2 = config.state2;
		if((config != undefined) && (config.initial != undefined)) {
			if(config.initial == this.state1)			
				this.addClass('state1');
			else
				this.addClass('state2');
		}
		else
			this.addClass('state1');

		this.movebox = new Era.ToggleButtonMove({ resizable: true, state1: this.state1, state2: this.state2 });
		this.add(this.movebox);
		this.addEvents('changed');
	},

	getState: function() {
		if(this.checkClass('state1'))
			return this.state1;
		else
			return this.state2;
	},

	setState: function(state,fireevent) {
		if(this.getState() == state)
			return;
		if(state == this.state1)
			this.replaceClass('state2', 'state1');
		else if(state == this.state2)
			this.replaceClass('state1', 'state2');
		else
			throw('Possible states for the toggle button are ['+this.state1+'|'+this.state2+']');
		if((fireevent != undefined) && fireevent)
			this.fireEvent('changed', state);
	},
});


// Define the back Button class.
Era.ToggleButtonMove = Era.extend('togglebuttonmove', Era.HBox, {
	constructor: function(config) {
		if(config == undefined)
			config = {};
		config.align = 'center';
		this.superConstructor(config);

		this.slider = new Era.Element({ baseCls: 'togglebuttonslider' });
		this.add(this.slider);

		var hbox = new Era.HBox({ resizable: true });
		this.add(hbox);

		this.state2 = new Era.Html({ baseCls: 'togglebutton2', resizable: true, html: config.state2 });
		hbox.add(this.state2);

		this.state1 = new Era.Html({ baseCls: 'togglebutton1', resizable: true, html: config.state1 });
		hbox.add(this.state1);

		this.connect(this, 'touchstart', function(event) {
			this.start = this.pointToPage({ x: 0, y: 0 });
			this.startMove = { x: event.targetTouches[0].pageX, y: event.targetTouches[0].pageY };
			this.deltaX = 0;
			this.deltaSign = 0;
			this.ui.style.webkitTransitionDuration = '0s';
		});

		this.connect(this, 'touchmove', function(event) {
			this.lastTouch = { x: event.targetTouches[0].pageX, y: event.targetTouches[0].pageY };
			var deltaX = this.lastTouch.x - this.startMove.x;
			var pos = this.getParent().pointFromPage({ x: (this.start.x + deltaX), y: this.start.y });
			if(deltaX > this.deltaX)
				this.deltaSign = 1;
			else
				this.deltaSign = -1;
			this.deltaX = deltaX;
			this.limitMove(pos);
			this.ui.style.webkitTransform = 'translate3d('+pos.x+'px, 0px, 0px)';
		});

		this.connect(this, 'touchend', function(event) {
			this.ui.style.webkitTransitionDuration = '';
			this.ui.style.webkitTransform = '';

			if(this.deltaSign > 0)
				this.getParent().setState(this.getParent().state1, true);
			else if(this.deltaSign < 0)
				this.getParent().setState(this.getParent().state2, true);
		});

		this.connect(this, 'mousedown', function(mouse, button) {
			if(button != 0)
				return;

			this.isMouseDown = true;
			this.start = this.pointToPage({ x: 0, y: 0 });
			this.startMove = mouse.getPagePosition();
			this.ui.style.webkitTransitionDuration = '0s';
			this.deltaX = 0;
			this.deltaSign = 0;

			mouse.capture(this);

			this.connect(this, 'mousemove', function(mouse) {
				if(this.isMouseDown) {
					var pagePos = mouse.getPagePosition();
					var deltaX = pagePos.x - this.startMove.x;
					var pos = this.getParent().pointFromPage({ x: (this.start.x + deltaX), y: this.start.y });
					if(deltaX > this.deltaX)
						this.deltaSign = 1;
					else
						this.deltaSign = -1;
					this.deltaX = deltaX;
					this.limitMove(pos);
					this.ui.style.webkitTransform = 'translate3d('+pos.x+'px, 0px, 0px)';
				}
			});

			this.connect(this, 'mouseup', function(mouse) {
				mouse.release();
				this.isMouseDown = false;
				this.disconnect(this, 'mousemove');
				this.disconnect(this, 'mouseup');
				this.ui.style.webkitTransitionDuration = '';
				this.ui.style.webkitTransform = '';

				if(this.deltaSign > 0)
					this.getParent().setState(this.getParent().state1, true);
				else if(this.deltaSign < 0)
					this.getParent().setState(this.getParent().state2, true);
			});
		});
	},

	limitMove: function(pos) {
		var size = this.getParent().getSize();
		pos.y = 0;
		if(pos.x < 0)
			pos.x = 0;
		if(pos.x + this.slider.getWidth() + this.ui.offsetLeft*2 > size.width)
			pos.x = size.width - (this.slider.getWidth() + this.ui.offsetLeft*2);
	},
});


// Define the back Button class.
Era.BackButton = Era.extend('backbutton', Era.Button, {
	constructor: function(config) {
		this.superConstructor(config);
	},
});

Era.PlayButton = Era.extend('playbutton', Era.Button, {
	constructor: function(config) {
		this.superConstructor(config);
		this.add(new Era.Html({ baseCls: 'content', resizable: true }));
	},
});

Era.ReplayButton = Era.extend('replaybutton', Era.Button, {
	constructor: function(config) {
		this.superConstructor(config);
		this.add(new Era.Html({ baseCls: 'content', resizable: true }));
	},
});

Era.UnknownButton = Era.extend('unknownbutton', Era.Button, {
	constructor: function(config) {
		this.superConstructor(config);
		this.add(new Era.Html({ baseCls: 'content', resizable: true }));
	},
});

Era.Spacer = Era.extend('spacer', Era.Element, {
	constructor: function(config) {
		if(!config)
			config = { resizable: true };
		else
			config.resizable = true;
		this.superConstructor(config);
	},	
});

Era.Image = Era.extend('image', Era.Element, {
	src: undefined,
	filterGrayscale: false,
	loaddone: false,

	constructor: function(config) {
		this.superConstructor(config);
		if((config != undefined) && config.grayscale)
			this.filterGrayscale = true;
		if((config != undefined) && (config.src != undefined))
			this.setSrc(config.src);
		this.connect(this.ui, 'load', this.onLoad);
	},

	onLoad: function() {
		if(!this.loaddone) {
			this.loaddone = true;
			if(this.filterGrayscale)
				this.applyGrayscale();
		}
	},

	virtualRender: function() {
		return document.createElement('img');
	},

	setSrc: function(src) {
		this.loaddone = false;
		this.src = src;
		this.ui.src = src;
	},

	getGrayscale: function() {
		return this.filterGrayscale;
	},

	setGrayscale: function(grayscale) {
		if(grayscale != this.filterGrayscale) {
			this.filterGrayscale = grayscale;
			if(this.loaddone) {
				if(grayscale)
					this.applyGrayscale();
				else
					this.ui.src = this.src;
			}
		}
	},

	applyGrayscale: function() {
		var canvas = document.createElement('canvas');
		var context = canvas.getContext('2d');

		canvas.width = this.ui.naturalWidth;
		canvas.height = this.ui.naturalHeight;
		context.drawImage(this.ui, 0, 0);

		var pixels = context.getImageData(0, 0, this.ui.naturalWidth, this.ui.naturalHeight);
		for(var y = 0; y < this.ui.naturalHeight; y++) {
			for(var x = 0; x < this.ui.naturalWidth; x++) {
				var i = ((y * this.ui.naturalWidth) + x) * 4;
				var luminance = (0.299 * pixels.data[i]) + (0.587 * pixels.data[i + 1]) + (0.114 * pixels.data[i + 2]);
				pixels.data[i] = luminance;
				pixels.data[i + 1] = luminance;
				pixels.data[i + 2] = luminance;
			}
		}
		context.putImageData(pixels, 0, 0, 0, 0, this.ui.naturalWidth, this.ui.naturalHeight);
		this.ui.src = canvas.toDataURL();
	},

});

Era.Html = Era.extend('html', Era.Element, {
	constructor: function(config) {
		this.superConstructor(config);
		if((config != undefined) && (config.html != undefined))
			this.setHtml(config.html);
	},

	setHtml: function(html) {
		this.ui.innerHTML = html;
	},
});

Era.Canvas = Era.extend('canvas', Era.Container, {
	constructor: function(config) {
		this.superConstructor(config);
		this.addClass('canvas');
	},
});

Era.Dialog = Era.extend('dialog', Era.VBox, {
	popupElement: undefined,
	modal: false,
	autoclose: false,

	constructor: function(config) {
		if(config == undefined)
			config = {};
		this.superConstructor(config);
		if(config.modal)
			this.modal = true;
		if(config.autoclose)
			this.autoclose = true;

		this.addClass('dialog');
		this.addClass('hidden');
		this.ui.style.overflow = 'visible';

		this.anchor = new Era.DialogAnchorBox();
		this.anchor.add(new Era.DialogAnchor());
		this.anchor.setPosition(0, 0);
		this.add(this.anchor);
		this.connect(Era.currentApp, 'resized', this.updatePosition);
		this.connect(this.ui, 'DOMSubtreeModified', this.updatePosition);

		this.addEvents('closed');
	},

	updatePosition: function() {
		if(!this.checkClass('hidden')) {
			var appSize = Era.currentApp.getSize();
			var size = this.getSize();

			if(this.popupElement == undefined) {
				if(!this.getResizable())
					this.setPosition((appSize.width - size.width)/2, (appSize.height - size.height)/2);
			}
			else {
				var pagePoint = this.popupElement.pointToPage({ x: (this.popupElement.getWidth()/2), y: this.popupElement.getHeight() });
				var x = pagePoint.x - 30;
				// correct x to avoid offscreen
				if(pagePoint.x - 30 + size.width > appSize.width)
					x = appSize.width - (size.width + 10);

				if(this.getResizable()) {
					this.setPosition(undefined, undefined);
					this.setTop(pagePoint.y);
					this.setLeft(0);
					this.setRight(0);
					this.setBottom(0);
				}
				else
					this.setPosition(x, pagePoint.y);
				this.anchor.setPosition(pagePoint.x - x, -10);
			}
		}
	},

	virtualShow: function() {
		var element = undefined;
		var anim = undefined;
		if(arguments.length == 2) {
			element = arguments[0];
			anim = arguments[1];
		}
		else if(arguments.length == 1) {
			if(Era.isObject(arguments[0]) && arguments[0].isSubclass(Era.Element))
				element = arguments[0];
			else
				anim = arguments[0];
		}

		if(this.showAnim != undefined) {
			this.showAnim.abort();
			this.showAnim = undefined;
		}

		this.ui.style.pointerEvents = '';
		this.ui.style.opacity = 1;

		this.popupElement = element;

		if(this.modal || (this.popupElement != undefined)) {
			this.eventcatcher = new Era.DialogEventCatcher();
			Era.currentApp.add(this.eventcatcher);
			this.connect(this.eventcatcher, 'pressed', function() {
				if((this.popupElement != undefined) || (this.modal && this.autoclose))
					this.hide();
			});
		}
		// set the content in the body
		Era.currentApp.add(this);

		// popup
		if(this.popupElement != undefined) {
			this.updatePosition();
			this.anchor.show(undefined);
		}
		// center screen position
		else {
			this.anchor.hide(undefined);

			if(this.getResizable()) {
				this.setPosition(undefined, undefined);
				this.setLeft(0);
				this.setRight(0);
				this.setTop(0);
				this.setBottom(0);
			}
			else
				this.updatePosition();
		}

		if(anim != undefined) {
			anim = Era.create(anim);
			anim.setMode('in');

			this.showAnim = anim;
			this.connect(anim, 'done', function() {
				this.showAnim = undefined;
			});
			anim.run(this);
		}

		Era.util.delayedcall(0, this.updatePosition, this);
	},

	virtualHide: function(anim) {
		if(this.showAnim != undefined) {
			this.showAnim.abort();
			this.showAnim = undefined;
		}

		this.ui.style.pointerEvents = 'none';

		if(anim != undefined) {
			anim = Era.create(anim);
			anim.setMode('out');

			this.showAnim = anim;
			this.connect(anim, 'done', function() {
				this.showAnim = undefined;
				if(this.eventcatcher != undefined) {
					Era.currentApp.remove(this.eventcatcher);
					this.eventcatcher = undefined;
				}
				Era.currentApp.remove(this);
				this.fireEvent('closed');
			});
			anim.run(this);
		}
		else {
			if(this.eventcatcher != undefined) {
				Era.currentApp.remove(this.eventcatcher);
				this.eventcatcher = undefined;
			}
			Era.currentApp.remove(this);
			this.fireEvent('closed');
		}
	},
});

Era.DialogAnchorBox = Era.extend('dialoganchorbox', Era.VBox, {
	constructor: function(config) {
		this.superConstructor(config);
		this.ui.style.overflow = 'visible';
	},
});

Era.DialogAnchor = Era.extend('dialoganchor', Era.Element, {
	constructor: function(config) {
		this.superConstructor(config);
	},
});

Era.DialogEventCatcher = Era.extend('dialogeventcatcher', Era.Button, {
	constructor: function(config) {
		this.superConstructor(config);
		this.ui.style.position = 'absolute';
		this.ui.style.left = '0px';
		this.ui.style.right = '0px';
		this.ui.style.top = '0px';
		this.ui.style.bottom = '0px';
	},
});

Era.ModalDialog = Era.extend('modaldialog', Era.VBox, {
	autoclose: false,

	constructor: function(config) {
		if(config == undefined)
			config = {};
		this.superConstructor(config);
		if(config.autoclose)
			this.autoclose = true;

		this.addClass('modaldialog');
		this.addClass('hidden');
		this.ui.style.overflow = 'visible';

		this.addEvents('closed');
	},

	virtualShow: function(anim) {
		this.openAnim = anim;

		if(this.showAnim != undefined) {
			this.showAnim.abort();
			this.showAnim = undefined;
		}

		this.ui.style.pointerEvents = '';

		this.container = new Era.VBox({ baseCls: 'modaldialogcontainer', resizable: true, align: 'center', pack: 'center', left: 0, right: 0, top: 0, bottom: 0 });
		this.container.add(this);
		Era.currentApp.add(this.container);

		if(this.autoclose) {
			this.connect(this.container, 'mousedown', function(mouse, button) {
				if(button != 0)
					return;
				mouse.capture(this.container);
				this.connect(this.container, 'mouseup', function(mouse, button) {
					if(button != 0)
						return;
					mouse.release();
					this.disconnect(this.container, 'mouseup');
					this.onContainerPressed();
				});
			});
			this.connect(this.container, 'touchend', function(event) {
				this.onContainerPressed();
			});

			this.connect(this, 'mousedown', function(mouse, button) {});
			this.connect(this, 'touchend', function(event) {});
		}

		if(anim != undefined) {
			anim = Era.create(anim);
			anim.setMode('in');

			this.showAnim = anim;
			this.connect(anim, 'done', function() {
				this.showAnim = undefined;
			});
			anim.run(this.container);
		}
	},

	virtualHide: function(anim) {
		if(this.showAnim != undefined) {
			this.showAnim.abort();
			this.showAnim = undefined;
		}

		this.ui.style.pointerEvents = 'none';

		if(anim != undefined) {
			anim = Era.create(anim);
			anim.setMode('out');

			this.showAnim = anim;
			this.connect(anim, 'done', function() {
				this.showAnim = undefined;
				Era.currentApp.remove(this.container);
				this.fireEvent('closed');
			});
			anim.run(this.container);
		}
		else {
			Era.currentApp.remove(this.container);
			this.fireEvent('closed');
		}
	},

	onContainerPressed: function() {
		this.hide(this.openAnim);
	},
});


Era.InputText = Era.extend('inputtext', Era.Element, {
	constructor: function(config) {
		this.superConstructor(config);
		if(config && (config.size != undefined))
			this.setValueSize(config.size);

		this.addSpecialEvent('changed',
			function(signalName, capture, first) {
				if(first) {
					this.connect(this.ui, 'change', function(event) {
						event.stopPropagation();
						this.fireEvent('changed', this.getValue());
					}, false);
				}
			},
			function(signalName, capture, last) {
				if(last) {
					this.disconnect(this.ui, 'change');
				}
			}
		);
	},

	virtualRender: function() {
		var input = document.createElement('input');
		input.type = 'text';
		return input;
	},

	getValue: function() {
		return this.ui.value;
	},

	setValue: function(value) {
		this.ui.value = value;
	},

	setValueSize: function(size) {
		this.ui.size = size;
	},
});

Era.ProgressBar = Era.extend('progressbar', Era.VBox, {
	value: undefined,

	constructor: function(config) {
		this.superConstructor(config);
		this.addClass('novalue');
		this.content = new Era.ProgressBarContent();
		this.add(this.content);
		if((config != undefined) && (config.value != undefined))
			this.setValue(config.value);
	},

	getValue: function() {
		return this.value;
	},

	setValue: function(value) {
		if(value == undefined) {
			if(this.value != undefined) {
				this.value = undefined;
				this.addClass('novalue');
			}
		}
		else {
			if(this.value == undefined)
				this.removeClass('novalue');
			this.value = value;
			this.content.ui.style.webkitTransform = 'scaleX('+this.value+')';
		}
	},
});

Era.ProgressBarContent = Era.extend('progressbarcontent', Era.Element, {
	constructor: function(config) {
		this.superConstructor(config);
	},
});


Era.CacheLoadingDialog = Era.extend('cacheloadingdialog', Era.Dialog, {
	constructor: function(config) {
		if(config == undefined)
			config = {};
		config.modal = true;
		config.autoclose = false;
		this.superConstructor(config);

		this.vbox = new Era.VBox({ resizable: true });
		this.add(this.vbox);

		this.vbox.add(new Era.Html({ baseCls: 'cacheloadingdialogtitle', html: 'chargement en cours' }));

		this.progressbar = new Era.ProgressBar();
		this.vbox.add(this.progressbar);

		this.addEvents('done');

		var appcache = window.applicationCache;

		this.connect(appcache, 'cached', this.onCached);
		this.connect(appcache, 'error', this.onError);
		this.connect(appcache, 'progress', this.onProgress);
		this.connect(appcache, 'noupdate', this.onNoUpdate);
		this.connect(appcache, 'updateready', this.onUpdateReady);

		if(appcache.status == appcache.IDLE)
			appcache.update();
		else if(appcache.status == appcache.UPDATEREADY) {
			// swap to the new cached version
			window.applicationCache.swapCache();
			// reload the new version
			window.location.reload();
		}
	},

	onCached: function() {
		this.hide();
		this.fireEvent('done');
	},

	onError: function(error) {
		// probably a quota error. On iPad, the use can increase the cache quote. Reload
		// to continue the cache filling
		if(Era.util.iPad || Era.util.iPhone) {
			window.location.reload();
		}
		else {
			var errortext = new Era.Html({ baseCls: 'cacheloadingdialogerror', html: 'Erreur de mise en cache' });
			this.replace(this.vbox, errortext, { type: 'crossfade' });
		}		
	},

	onProgress: function(progress) {
		if((progress.total != undefined) && (progress.loaded != undefined))
			this.progressbar.setValue(progress.loaded / progress.total);
	},

	onNoUpdate: function() {
		this.hide();
		this.fireEvent('done');
	},

	onUpdateReady: function() {
		// swap to the new cached version
		window.applicationCache.swapCache();
		// reload the new version
		window.location.reload();
	},
});


// Define the App class. A web application always start
// with a App class as the main container
Era.App = Era.extend('app', Era.VBox, {
	orientation: 0,
	orientationmode: 'landscape',
	favicon: undefined,

	constructor: function(config) {
		Era.currentApp = this;

		this.superConstructor(config);
		this.addClass('app');

		if(config && (config.favicon != undefined))
			this.favicon = config.favicon;

		if(Era.util.iPad)
			this.addClass('ipad');

		this.connect(window, 'load', this.onWindowLoad);

		this.addSpecialEvent('resized',
			function(signalName, capture, first) {
				if(first)
					this.connect(window, 'resize', function() {
						this.fireEvent('resized', this.getWidth(), this.getHeight());
					});
			},
			function(signalName, capture, last) {
				if(last)
					this.disconnect(window, 'resize');
			}
		);

		if(Era.util.iPad) {
			this.orientation = window.orientation;
			if((this.orientation == 0) || (this.orientation == 180))
				this.orientationmode = 'portrait';

			this.connect(window, 'orientationchange', function(event) {
				this.orientation = window.orientation;
				this.fireEvent('orientationchanged', this.orientation);

				var neworientationmode = 'landscape';
				if((this.orientation == 0) || (this.orientation == 180))
					neworientationmode = 'portrait';
				if(neworientationmode != this.orientationmode) {
					this.orientationmode = neworientationmode;
					this.fireEvent('orientationmodechanged', this.orientationmode);
					// handle lock orientation
					if(this.lockedOrientationMode != undefined) {
						this.lockOrientationMode(this.lockedOrientationMode);
					}
				}
			});
		}
		this.addEvents('orientationchanged','orientationmodechanged', 'ready');
	},

	onWindowLoad: function() {
		if(Era.util.iPad || Era.util.iPhone) {
			// support app mode for iPad, iPod and iPhone
			var meta = document.createElement('meta');
			meta.name = 'apple-mobile-web-app-capable';
			meta.content = 'yes';
			document.getElementsByTagName("head")[0].appendChild(meta);
			// black status bar for iPhone
			meta = document.createElement('meta');
			meta.name = 'apple-mobile-web-app-status-bar-style';
			meta.content = 'black';
			document.getElementsByTagName("head")[0].appendChild(meta);
			// stop the scaling of the page
			meta = document.createElement('meta');
			meta.name = 'viewport';
			meta.content = 'width=device-width; initial-scale=1.0; maximum-scale=1.0; user-scalable=no';
			document.getElementsByTagName("head")[0].appendChild(meta);
			// set apple favicon
			if(this.favicon != undefined) {
				var link = document.createElement('link');
				link.rel = 'apple-touch-icon';
				link.href = this.favicon;
				document.getElementsByTagName("head")[0].appendChild(link);
			}
			// prevent Safari to handle touch event
			this.connect(document.body, 'touchstart', function(event) { event.preventDefault(); });
			this.connect(document.body, 'touchmove', function(event) { event.preventDefault(); });
			this.connect(document.body, 'touchend', function(event) { event.preventDefault(); });
		}
		// set the content in the body
		document.body.appendChild(this.ui);
		// handle lock orientation
		if(this.lockedOrientationMode != undefined)
			this.lockOrientationMode(this.lockedOrientationMode);
		// check for cache manifest
		if((navigator.onLine != undefined) && navigator.onLine && (window.applicationCache != undefined) && (window.applicationCache.status != undefined) && (window.applicationCache.status != window.applicationCache.UNCACHED)) {
			// handle cache loading
			this.cacheloadingdialog = new Era.CacheLoadingDialog();
			this.connect(this.cacheloadingdialog, 'done', this.onCacheLoaded);
			this.cacheloadingdialog.show();
		}
		else {
			// ok the app is ready
			this.fireEvent('ready');
		}
	},

	onCacheLoaded: function() {
		// ok the app is ready
		this.fireEvent('ready');
	},

	getOrientationMode: function() {
		return this.orientationmode;
	},

	getOrientation: function() {
		return this.orientation;
	},

	lockOrientationMode: function(mode) {
		if(Era.util.iPad) {
			this.lockedOrientationMode = mode;
			if(this.lockedOrientationMode == this.orientationmode) {
				this.ui.style.width = window.innerWidth+'px';
				this.ui.style.height = window.innerHeight+'px';
				this.ui.style.webkitTransform = '';
			}
			else {
				this.ui.style.width = window.innerHeight+'px';
				this.ui.style.height = window.innerWidth+'px';
				this.ui.style.webkitTransformOrigin = '0px 0px';
				this.ui.style.webkitTransform = 'rotate(90deg) translateY(-'+window.innerWidth+'px)';
			}
		}
	},
});


