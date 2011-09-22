Ui.LBox.extend('Ui.App', 
/**@lends Ui.App#*/
{
	defs: undefined,
	styles: undefined,
	updateTask: undefined,
//	style: '../era/style/default/style.css',
//	styleloaded: false,
	loaded: false,
	focusElement: undefined,
//	hasFocus: false,
	arguments: undefined,
	autoscale: false,
	ready: false,

	layoutList: undefined,
	windowWidth: 0,
	windowHeight: 0,
	windowScale: 1,

	contentBox: undefined,
	content: undefined,

	dialogs: undefined,

	/**
	 * @constructs
	 * @ class Define the App class. A web application always start
	 * with a App class as the main container
	 * @extends Ui.LBox
	 */
	constructor: function(config) {
		this.addEvents('resize', 'ready', 'parentmessage');

		Ui.App.current = this;
		this.getDrawing().style.cursor = 'default';

		this.contentBox = new Ui.LBox();
		this.append(this.contentBox);

		if(config.autoscale != undefined)
			this.setAutoScale(config.autoscale);

//		this.getDrawing().style.position = 'fixed';

//		document.documentElement.style.padding = '0px';
//		document.documentElement.style.margin = '0px';
//		document.documentElement.style.border = '0px solid black';
//		document.documentElement.style.overflow = 'hidden';
//		document.documentElement.style.width = '100%';
//		document.documentElement.style.height = '100%';

		this.setTransformOrigin(0, 0);

//		this.connect(window, 'focus', this.onWindowFocus);
//		this.connect(window, 'blur', this.onWindowBlur);

		this.connect(window, 'load', this.onWindowLoad);
		this.connect(window, 'resize', this.onWindowResize);
		this.connect(window, 'selectstart', this.onWindowSelectStart);
		if(('onselectstart' in document) && ('attachEvent' in document))
			document.attachEvent('onselectstart', this.onWindowSelectStart);

		if('style' in config)
			this.setStyle(config.style);
		else
			this.setStyle(Ui.Styles['default']);

//		this.connect(window, 'keypress', this.onWindowKeyPress, true);
//		this.connect(window, 'keydown', this.onWindowKeyDown, true);
//		this.connect(window, 'keyup', this.onWindowKeyUp, true);
//		this.connect(window, 'mousedown', this.onWindowMouseDown);

//		this.connect(this.getDrawing(), 'focus', function() {
//			console.log('window has the focus');
//		});

		this.connect(window, 'focus', function(event) {
//			console.log('window focus '+event.target);
			this.focusElement = event.target;
		}, true);

//		this.connect(window, 'blur', function(event) {
//			console.log('window blur');
//		}, true);

		// prevent bad event handling
//		this.connect(window, 'mousedown', function(event) {
//			console.log('window mousedown');
//			if((event.target != undefined) && !((event.target.tagName == 'INPUT') || (event.target.tagName == 'TEXTAREA'))) {
//				event.preventDefault();
//				event.stopPropagation();
//				if((this.focusElement != undefined) && (this.focusElement != window))
//					this.focusElement.blur();
//				this.focusElement = undefined;
//			} else {
//				console.log('bad target '+event.target);
//			}
//		});
//		this.connect(window, 'mouseup', function(event) {
//			if((event.target != undefined) && !((event.target.tagName == 'INPUT') || (event.target.tagName == 'TEXTAREA'))) {
//				event.preventDefault();
//				event.stopPropagation();
//		});
//		this.connect(window, 'mousemove', function(event) {
//			if((event.target != undefined) && !((event.target.tagName == 'INPUT') || (event.target.tagName == 'TEXTAREA'))) {
//				event.preventDefault();
//				event.stopPropagation();
//			}
//		});

		this.connect(window, 'dragstart', function(event) { event.preventDefault(); });

		this.connect(window, 'dragenter', function(event) {	event.preventDefault();	return false; });
		this.connect(window, 'dragover', function(event) { event.dataTransfer.dropEffect = 'none';
			event.preventDefault();	return false; });
		this.connect(window, 'drop', function(event) { event.preventDefault(); return false; });

		this.connect(window, 'contextmenu', function(event) { event.preventDefault(); });
		if(('oncontextmenu' in document) && ('attachEvent' in document))
			document.attachEvent('oncontextmenu', function(event) { return false; });

//		this.connect(window, 'select', function(event) { event.preventDefault(); event.stopPropagation(); });
//		this.connect(window, 'scroll', function(event) { window.scrollTo(0, 0); });

		if('onorientationchange' in window)
			this.connect(window, 'orientationchange', this.onOrientationChange);

		// handle messages
		this.connect(window, 'message', this.onMessage);

		// check if arguments are available
		if((window.location.search != undefined) && (window.location.search != '')) {
			var base64 = undefined;
			var arguments = {};
			var tab = window.location.search.substring(1).split('&');
			for(var i = 0; i < tab.length; i++) {
				var tab2 = tab[i].split('=');
				if(tab2.length == 2) {
					var key = decodeURIComponent(tab2[0]);
					var val = decodeURIComponent(tab2[1]);
					if(key == 'base64')
						base64 = JSON.parse(val.fromBase64());
					else
						arguments[key] = val;
				}
			}
			if(base64 != undefined) {
				this.arguments = base64;
				for(var prop in arguments)
					this.arguments[prop] = arguments[prop];
			}
			else
				this.arguments = arguments;
		}
		else
			this.arguments = {};
	},

	/**#@+
	 * @private
	 */
	onWindowSelectStart: function(event) {
		var current;
		if('target' in event)
			current = event.target;
		else
			current = event.srcElement;
		var selectable = false;
		while((current != undefined) && (current != window)) {
			if('selectable' in current) {
				selectable = current.selectable;
				break;
			}
			current = current.parentNode;
		}
		if(!selectable) {
			if('preventDefault' in event)
				event.preventDefault();
			return false;
		}
		return true;
	},

	onWindowLoad: function() {
		if(navigator.iPad || navigator.iPhone || navigator.Android) {
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
			// prevent Safari to handle touch event
/*			this.connect(this.getDrawing(), 'touchstart', function(event) {
				if((event.target != undefined) && !((event.target.tagName == 'INPUT') || (event.target.tagName == 'TEXTAREA'))) {
					event.preventDefault();
					event.stopPropagation();
				}
			}, false);
			this.connect(this.getDrawing(), 'touchstart', function(event) {
				if((navigator.Android) && (event.touches.length >= 4)) {
					if((this.focusElement != undefined) && (this.focusElement != window) && (event.target != this.focusElement))
						this.focusElement.blur();
					this.focusElement = undefined;
				}
			}, true);
			this.connect(this.getDrawing(), 'touchmove', function(event) {
				if((event.target != undefined) && !((event.target.tagName == 'INPUT') || (event.target.tagName == 'TEXTAREA'))) {
					event.preventDefault();
					event.stopPropagation();
				}
			}, false);
			this.connect(this.getDrawing(), 'touchend', function(event) {
				if((event.target != undefined) && !((event.target.tagName == 'INPUT') || (event.target.tagName == 'TEXTAREA'))) {
					event.preventDefault();
					event.stopPropagation();
				}
			}, false);*/
		}
		this.loaded = true;
		this.onReady();

	},

	onWindowResize: function() {
//		console.log(this+'.onWindowResize start updateTask: '+this.updateTask+', measureValid: '+this.measureValid);

		this.fireEvent('resize', this);
		this.invalidateMeasure();

//		console.log(this+'.onWindowResize end updateTask: '+this.updateTask+', measureValid: '+this.measureValid);
	},

	onOrientationChange: function() {
		this.fireEvent('resize', this);
		this.invalidateMeasure();
	},

	/**#@-*/

/*	onWindowKeyPress: function(event) {
		console.log('onWindowKeyPress '+event.which+', focus: '+this.focusElement);

		event.preventDefault();
		Ui.Keyboard.current.shiftKey = event.shiftKey;
		Ui.Keyboard.current.altKey = event.altKey;
		Ui.Keyboard.current.ctrlKey = event.ctrlKey;
		Ui.Keyboard.current.altGraphKey = event.altGraphKey;
		Ui.Keyboard.current.metaKey = event.metaKey;

		if(navigator.isOpera) {
			if((event.which == 0) || (event.which == 8) || (event.which == 9))
				return;
			keychar = String.fromCharCode(event.which);
		}
		else {
			if(event.charCode == 0)
				return;
			keychar = String.fromCharCode(event.charCode);
		}
		if(Ui.Keyboard.current.elementCapture != undefined)
			Ui.Keyboard.current.elementCapture.fireEvent('keypress', Ui.Keyboard.current, keychar);
		else if(this.focusElement != undefined)
			this.focusElement.fireEvent('keypress', Ui.Keyboard.current, keychar);
	},

	onWindowKeyDown: function(event) {
		Ui.Keyboard.current.shiftKey = event.shiftKey;
		Ui.Keyboard.current.altKey = event.altKey;
		Ui.Keyboard.current.ctrlKey = event.ctrlKey;
		Ui.Keyboard.current.altGraphKey = event.altGraphKey;
		Ui.Keyboard.current.metaKey = event.metaKey;

		if(Ui.Keyboard.current.elementCapture != undefined) {
			event.preventDefault();
			Ui.Keyboard.current.elementCapture.fireEvent('keydown', Ui.Keyboard.current, event.which);
			return;
		}

		// check for tab = focus next element
		if(event.which == 9) {
			event.preventDefault();
			var next;
			if(this.focusElement != undefined) {
				if(event.shiftKey)
					next = this.findPreviousFocusable();
				else
					next = this.findNextFocusable();
			}
			else
				next = this.findFirstFocusable();
			if(next != undefined)
				next.focus();
		}
		else {
			if(event.which == 8)
				event.preventDefault();
			if(this.focusElement != undefined)
				this.focusElement.fireEvent('keydown', Ui.Keyboard.current, event.which);
		}
	},

	onWindowKeyUp: function(event) {
		Ui.Keyboard.current.shiftKey = event.shiftKey;
		Ui.Keyboard.current.altKey = event.altKey;
		Ui.Keyboard.current.ctrlKey = event.ctrlKey;
		Ui.Keyboard.current.altGraphKey = event.altGraphKey;
		Ui.Keyboard.current.metaKey = event.metaKey;

		if(Ui.Keyboard.current.elementCapture != undefined) {
			event.preventDefault();
			Ui.Keyboard.current.elementCapture.fireEvent('keyup', Ui.Keyboard.current, event.which);
			return;
		}

		if(event.which == 8)
			event.preventDefault();
		if(this.focusElement != undefined)
			this.focusElement.fireEvent('keyup', Ui.Keyboard.current, event.which);
	},
*/

	update: function() {
//		console.log(this+'.update start ('+(new Date()).getTime()+')');

//		console.log('window.update inner: '+window.innerWidth+' x '+window.innerHeight+', client: '+document.body.clientWidth+' x '+document.body.clientHeight);

//		window.scrollTo(0, 0);

//		console.log(window);
//		Core.Object.dump(window, 'scroll');

		// update measure
//		var innerWidth = window.innerWidth;
//		var innerHeight = window.innerHeight;

		var innerWidth = document.body.clientWidth;
		var innerHeight = document.body.clientHeight;



//		console.log('window.update('+innerWidth+' x '+innerHeight+') '+document.body.clientWidth+' x '+document.body.clientHeight+' '+window.title+', iframe ? '+(window.parent != window));

		// check if were are an iframe. Get the size from our parent if possible
		if(window.parent != window) {
			try {
				var frames = window.parent.document.getElementsByTagName("IFRAME");
				for(var i = 0; i < frames.length; i++) {
					if(frames[i].contentWindow === window) {
						innerWidth = new Number(frames[i].style.width.replace(/px$/, ''));
						innerHeight = new Number(frames[i].style.height.replace(/px$/, ''));
						break;
					}
				}
			} catch(e) {}
		}

		var size;
		if(this.autoscale) {
			// if window size changed, try to find a new scale
			if((this.windowWidth != innerWidth) || (this.windowHeight != innerHeight)) {
				var size = this.measure(innerWidth, innerHeight);
				if(size.width < innerWidth)
					size.width = innerWidth;
				if(size.height < innerHeight)
					size.height = innerHeight;
				this.windowScale = 1;
				if((size.width > innerWidth) || (size.height > innerHeight))
					this.windowScale = Math.max(size.width / innerWidth, size.height / innerHeight);
				size = this.measure(innerWidth * this.windowScale, innerHeight * this.windowScale);
				this.setTransform(Ui.Matrix.createScale(1/this.windowScale));
			}
			// try old scale
			else {
				size = this.measure(innerWidth * this.windowScale, innerHeight * this.windowScale);
				if((size.width > innerWidth * this.windowScale) || (size.height > innerHeight * this.windowScale)) {
					if(size.width < innerWidth)
						size.width = innerWidth;
					if(size.height < innerHeight)
						size.height = innerHeight;
					this.windowScale = 1;
					if((size.width > innerWidth) || (size.height > innerHeight))
						this.windowScale = Math.max(size.width / innerWidth, size.height / innerHeight);
					size = this.measure(innerWidth * this.windowScale, innerHeight * this.windowScale);
					this.setTransform(Ui.Matrix.createScale(1/scale));
				}
			}
		}
		else {
			this.windowScale = 1;
			size = this.measure(innerWidth, innerHeight);
		}
		this.windowWidth = innerWidth;
		this.windowHeight = innerHeight;

//		console.log(this+'.update size: '+this.windowWidth+' x '+this.windowHeight+', child: '+size.width+' x '+size.height);

		this.arrange(0, 0, Math.max(this.windowWidth * this.windowScale, size.width), Math.max(this.windowHeight * this.windowScale, size.height));

		// update arrange
//		while(this.layoutList != undefined) {
//			var next = this.layoutList.layoutNext;
//			this.layoutList.layoutValid = true;
//			this.layoutList.layoutNext = undefined;
//			this.layoutList.updateLayout();
//			this.layoutList = next;
//		}

//		console.log(this+'.update end ('+(new Date()).getTime()+')');

		if(navigator.iPad || navigator.iPhone) {
			var top = document.body.scrollTop;
			document.body.scrollLeft = 0;
			document.body.scrollTop = top;
		}

//		console.log(document.body.scrollLeft);

		this.updateTask = undefined;
	},

	getContent: function() {
		return this.content;
	},

	setContent: function(content) {
		if(this.content != content) {
			document.documentElement.style.padding = '0px';
			document.documentElement.style.margin = '0px';
			document.documentElement.style.border = '0px solid black';
			document.documentElement.style.overflow = 'hidden';
			document.documentElement.style.width = '100%';
			document.documentElement.style.height = '100%';

			if(this.content != undefined)
				this.contentBox.remove(this.content);
			if(content != undefined)
				this.contentBox.append(content);
			this.content = content;

			if((this.content != undefined) && this.ready) {
				document.body.style.padding = '0px';
				document.body.style.margin = '0px';
				document.body.style.border = '0px solid black';
				document.body.style.overflow = 'hidden';
				document.body.style.width = '100%';
				document.body.style.height = '100%';
				document.body.appendChild(this.getDrawing());
			}
		}
	},

	appendDialog: function(dialog) {
		if(this.dialogs == undefined) {
			this.dialogs = new Ui.LBox();
			this.append(this.dialogs);
		}
		this.dialogs.append(dialog);
	},

	removeDialog: function(dialog) {
		this.dialogs.remove(dialog);
		if(this.dialogs.getChildren().length == 0) {
			this.remove(this.dialogs);
			this.dialogs = undefined;
//			console.log('last dialog removed');
		}
	},

	/**
	 * Return the arguments given if any
	 */
	getArguments: function() {
		return this.arguments;
	},

	getAutoScale: function() {
		return this.autoscale;
	},

	/**
	 * Activate or not the autoscale. When
	 * autoscale is activated, if the content of the window
	 * is too big, downscale it to fill the window.
	 */
	setAutoScale: function(autoscale) {
		if(this.autoscale != autoscale) {
			this.autoscale = autoscale;
			if(!this.autoscale)
				this.setTransform(undefined);
			this.invalidateMeasure();
		}
	},

	onReady: function() {
		if(this.loaded) {
			this.ready = true;

			if(document.body == undefined) {
				this.htmlRoot = document.createElement('body');
				document.body = this.htmlRoot;
			}

			if(this.content != undefined) {
				document.body.style.padding = '0px';
				document.body.style.margin = '0px';
				document.body.style.border = '0px solid black';
				document.body.style.overflow = 'hidden';
				document.body.style.width = '100%';
				document.body.style.height = '100%';
				document.body.appendChild(this.getDrawing());
			}
/*
			this.forceKeyboard = document.createElement('input');
			this.forceKeyboard.setAttribute('type', 'text');
//			this.forceKeyboard.style.clip = 'rect(0px 0px 0px 0px)';
			this.forceKeyboard.style.position = 'fixed';
			this.forceKeyboard.style.right = '0px';
			this.forceKeyboard.style.bottom = '0px';
			this.forceKeyboard.style.width = '40px';
			this.forceKeyboard.style.height = '40px';
			this.forceKeyboard.style.background = 'black';

			this.forceKeyboard.style.webkitAppearance = 'none';

			this.connect(this.forceKeyboard, 'focus', function(event) {
				console.log('forceKeyboard has the focus');
	//			if(event.target == this.forceKeyboard)
//					this.forceKeyboard.style.bottom = '-50px';
			});

			this.connect(this.forceKeyboard, 'blur', function(event) {
//				this.forceKeyboard.style.bottom = '0px';
			});

			this.connect(this.forceKeyboard, 'keypress', this.onWindowKeyPress, true);
			this.connect(this.forceKeyboard, 'keydown', this.onWindowKeyDown, true);
			this.connect(this.forceKeyboard, 'keyup', this.onWindowKeyUp, true);
*/

//			document.body.appendChild(this.forceKeyboard);

			this.update();
			this.setIsLoaded(true);
			this.fireEvent('ready');
		}
	},

	onMessage: function(event) {
		if(parent === event.source) {
			event.preventDefault();
			event.stopPropagation();

			var msg = JSON.parse(event.data);
			this.fireEvent('parentmessage', msg);
		}
	},

	sendMessageToParent: function(msg) {
		parent.postMessage(msg.serialize(), "*");
	}
/*
	findNextFocusable: function() {
		console.log('findNextFocusable');

		var current = { element: this, seen: false, res: undefined };
		this.findFocusable(current);

		console.log('findNextFocusable res: '+current.res);
		return current.res;
	},

	findFirstFocusable: function() {
		console.log('findFirstFocusable');

		var current = { element: this, seen: true, res: undefined };
		this.findFocusable(current);

		console.log('findFirstFocusable res: '+current.res);
		return current.res;
	},

	findPreviousFocusable: function() {
		var current = { element: this, seen: false, res: undefined, previous: undefined };
		this.findFocusable(current);
		if(current.seen)
			return current.previous;
		else
			return undefined;
	},

	findFocusable: function(current) {
		console.log('findFocusable current: '+current.element);
		var element = current.element;
		if(Ui.Container.hasInstance(element)) {
			for(var i = 0; i < element.getChildren().length; i++) {
				var child = element.getChildren()[i];
				if(child.getFocusable()) {
					console.log('findFocusable FOUND: '+child);
					if(current.seen) {
						current.res = child;
						return;
					}
					if(child == this.focusElement)
						current.seen = true;
					else
						current.previous = child;
				}
				current.element = child;
				this.findFocusable(current);
				if(current.res != undefined)
					return;
			}
		}
	},

	askFocus: function(element) {
		if(this.focusElement != element) {
			this.removeFocus(this.focusElement);
			this.focusElement = element;
			this.focusElement.fireEvent('focus');
//			console.log('askFocus for '+element+', keyboard ? '+this.focusElement.getKeyboardRequired()+', force: '+this.forceKeyboard);

//			if(this.focusElement.getKeyboardRequired())
//				this.forceKeyboard.focus();
		}
	},

	removeFocus: function(element) {
		if((this.focusElement != undefined) && (this.focusElement == element)) {
			this.focusElement.fireEvent('blur');
			this.focusElement = undefined;
		}
	},

	onWindowMouseDown: function(mouse) {
//		console.log('onWindowMouseDown');
		if(this.focusElement != undefined)
			this.removeFocus(this.focusElement);
	},
*/
//	onWindowFocus: function(event) {
//		console.log('onWindowFocus');
//		if(!this.hasFocus) {
//			this.hasFocus = true;
//			var focusable = this.findFirstFocusable();
//			if(focusable != undefined)
//				focusable.focus();
//		}
//	},

//	onWindowBlur: function(event) {
//		console.log('onWindowBlur');
//		if(this.hasFocus) {
//			this.hasFocus = false;
//			if(this.focusElement != undefined)
//				this.focusElement.blur();
//		}
//	},

//	enqueueLayout: function(element) {
//		element.layoutNext = this.layoutList;
//		this.layoutList = element;
//		if((this.updateTask == undefined) && this.ready)
//			this.updateTask = new Core.DelayedTask({ delay: 0, scope: this, callback: this.update });
//	}
}, {
	invalidateMeasure: function() {
//		if(this.measureValid) {
			this.invalidateArrange();
			this.measureValid = false;
			if((this.updateTask == undefined) && this.ready)
				this.updateTask = new Core.DelayedTask({ delay: 0, scope: this, callback: this.update });
//		}
	},

	invalidateArrange: function() {
//		if(this.arrangeValid) {
//			console.log('invalidate Arrange');
			this.arrangeValid = false;

//			this.enqueueArrange(this);

			if((this.updateTask == undefined) && this.ready)
				this.updateTask = new Core.DelayedTask({ delay: 0, scope: this, callback: this.update });
//		}
	}
}, {
	getWindowIFrame: function(currentWindow) {
		if(currentWindow == undefined)
			currentWindow = window;
		var iframe = undefined;
		if(currentWindow.parent != currentWindow) {
			try {
				var frames = currentWindow.parent.document.getElementsByTagName("IFRAME");
				for(var i = 0; i < frames.length; i++) {
					if(frames[i].contentWindow === currentWindow) {
						iframe = frames[i];
						break;
					}
				}
			} catch(e) {}
		}
		return iframe;
	},

	getRootWindow: function() {
		var rootWindow = window;
		while(rootWindow.parent != rootWindow)
			rootWindow = rootWindow.parent;
		return rootWindow;
	}
});

Ui.App.current = undefined;
