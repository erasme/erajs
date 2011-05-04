//
// Define the App class. A web application always start
// with a App class as the main container
//
Ui.LBox.extend('Ui.App', {
	defs: undefined,
	styles: undefined,
	updateTask: undefined,
//	style: '../era/style/default/style.css',
//	styleloaded: false,
	loaded: false,
	focusElement: undefined,
	hasFocus: false,
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

	constructor: function(config) {
		Ui.App.current = this;

		this.contentBox = new Ui.LBox();
		this.append(this.contentBox);

		if(config.autoscale != undefined)
			this.setAutoScale(config.autoscale);

//		this.getDrawing().style.position = 'fixed';

		document.documentElement.style.padding = '0px';
		document.documentElement.style.margin = '0px';
		document.documentElement.style.border = '0px solid black';
		document.documentElement.style.overflow = 'hidden';
		document.documentElement.style.width = '100%';
		document.documentElement.style.height = '100%';

		this.svgRoot = document.createElementNS(svgNS, 'svg');

		this.setTransformOrigin(0, 0);

//		this.connect(window, 'focus', this.onWindowFocus);
//		this.connect(window, 'blur', this.onWindowBlur);

		this.connect(window, 'load', this.onWindowLoad);
		this.connect(window, 'resize', this.onWindowResize);

		this.addEvents('resize', 'ready', 'parentmessage');

/*		if(config.style != undefined)
			this.setStyle(config.style);
		else
			this.setStyle(this.style);*/

//		this.connect(window, 'keypress', this.onWindowKeyPress, true);
//		this.connect(window, 'keydown', this.onWindowKeyDown, true);
//		this.connect(window, 'mousedown', this.onWindowMouseDown);

		// prevent bad event handling
		this.connect(window, 'mousedown', function(event) { if((event.target != undefined) && !((event.target.tagName == 'INPUT') || (event.target.tagName == 'TEXTAREA'))) event.preventDefault(); });
		this.connect(window, 'mouseup', function(event) { if((event.target != undefined) && !((event.target.tagName == 'INPUT') || (event.target.tagName == 'TEXTAREA'))) event.preventDefault(); });
		this.connect(window, 'mousemove', function(event) { if((event.target != undefined) && !((event.target.tagName == 'INPUT') || (event.target.tagName == 'TEXTAREA'))) event.preventDefault(); });
//		this.connect(window, 'dragstart', function(event) { event.preventDefault(); });

		this.connect(window, 'dragenter', function(event) {	event.preventDefault();	return false; });
		this.connect(window, 'dragover', function(event) { event.dataTransfer.dropEffect = 'none';
			event.preventDefault();	return false; });
		this.connect(window, 'drop', function(event) { event.preventDefault(); return false; });
		this.connect(window, 'contextmenu', function(event) { event.preventDefault(); });
//		this.connect(window, 'select', function(event) { event.preventDefault(); event.stopPropagation(); });

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

	//
	// Private
	//

	onWindowLoad: function() {
		if(navigator.iPad || navigator.iPhone || navigator.Android) {
			// support app mode for iPad, iPod and iPhone
			var meta = document.createElementNS(htmlNS, 'meta');
			meta.name = 'apple-mobile-web-app-capable';
			meta.content = 'yes';
			document.getElementsByTagName("head")[0].appendChild(meta);
			// black status bar for iPhone
			meta = document.createElementNS(htmlNS, 'meta');
			meta.name = 'apple-mobile-web-app-status-bar-style';
			meta.content = 'black';
			document.getElementsByTagName("head")[0].appendChild(meta);
			// stop the scaling of the page
			meta = document.createElementNS(htmlNS, 'meta');
			meta.name = 'viewport';
			meta.content = 'width=device-width; initial-scale=1.0; maximum-scale=1.0; user-scalable=no';
			document.getElementsByTagName("head")[0].appendChild(meta);
			// prevent Safari to handle touch event
			this.connect(this.getDrawing(), 'touchstart', function(event) { event.preventDefault(); }, true);
			this.connect(this.getDrawing(), 'touchmove', function(event) { event.preventDefault(); }, true);
			this.connect(this.getDrawing(), 'touchend', function(event) { event.preventDefault(); }, true);
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

	onWindowKeyPress: function(event) {
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
			else
				window.dump();
		}
		else {
			if(event.which == 8)
				event.preventDefault();
			if(this.focusElement != undefined)
				this.focusElement.fireEvent('keydown', Ui.Keyboard.current, event.which);
		}
	},

	update: function() {
//		console.log(this+'.update start ('+(new Date()).getTime()+')');

		// update measure
//		var innerWidth = window.innerWidth;
//		var innerHeight = window.innerHeight;

		var innerWidth = document.body.clientWidth;
		var innerHeight = document.body.clientHeight;

//		console.log('window.update('+innerWidth+' x '+innerHeight+') '+document.body.clientWidth+' x '+document.body.clientHeight);

//		window.dump('height');

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
		while(this.layoutList != undefined) {
			var next = this.layoutList.layoutNext;
			this.layoutList.layoutValid = true;
			this.layoutList.layoutNext = undefined;
			this.layoutList.updateLayout();
			this.layoutList = next;
		}

//		console.log(this+'.update end ('+(new Date()).getTime()+')');

		this.updateTask = undefined;
	},

	getContent: function() {
		return this.content;
	},

	setContent: function(content) {
		if(this.content != content) {
			if(this.content != undefined)
				this.contentBox.remove(this.content);
			if(content != undefined)
				this.contentBox.append(content);
			this.content = content;
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

	//
	// Return the arguments given if any
	//
	getArguments: function() {
		return this.arguments;
	},

	getAutoScale: function() {
		return this.autoscale;
	},

	//
	// Activate or not the autoscale. When
	// autoscale is activated, if the content of the window
	// is too big, downscale it to fill the window.
	//
	setAutoScale: function(autoscale) {
		if(this.autoscale != autoscale) {
			this.autoscale = autoscale;
			if(!this.autoscale)
				this.setTransform(undefined);
			this.invalidateMeasure();
		}
	},
/*
	setStyle: function(style) {
		if(this.stylerequest != undefined)
			this.stylerequest.abort();
		this.style = style;
		this.stylerequest = new Core.HttpRequest({ url: this.style });
		this.connect(this.stylerequest, 'done', this.onStyleLoaded);
		this.stylerequest.send();
	},

	onStyleLoaded: function() {
		var s = this.stylerequest.getResponseText();
		this.stylerequest = undefined;
		if(this.currentStyle == undefined) {
			this.currentStyle = document.createElement('style');
			this.currentStyle.innerHTML = s;
			document.getElementsByTagName("head")[0].appendChild(this.currentStyle);
		}
		else
			this.currentStyle.innerHTML = s;
		this.styleloaded = true;
		this.onReady();
	},
*/
	onReady: function() {
		if(this.loaded) { /* && this.styleloaded) {*/
			this.ready = true;

			if(document.body == undefined) {
				this.htmlRoot = document.createElementNS(htmlNS, 'body');
				document.body = this.htmlRoot;
			}
			document.body.style.padding = '0px';
			document.body.style.margin = '0px';
			document.body.style.border = '0px solid black';
			document.body.style.overflow = 'hidden';
			document.body.style.width = '100%';
			document.body.style.height = '100%';
			document.body.appendChild(this.getDrawing());
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
	},

	findNextFocusable: function() {
		var current = { element: this, seen: false, res: undefined };
		this.findFocusable(current);
		return current.res;
	},

	findFirstFocusable: function() {
		var current = { element: this, seen: true, res: undefined };
		this.findFocusable(current);
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
		var element = current.element;
		if(Ui.Container.hasInstance(element)) {
			for(var i = 0; i < element.children.length; i++) {
				var child = element.children[i];
				if(child.getFocusable()) {
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

	onWindowFocus: function(event) {
//		console.log('onWindowFocus');
		if(!this.hasFocus) {
			this.hasFocus = true;
			var focusable = this.findFirstFocusable();
			if(focusable != undefined)
				focusable.focus();
		}
	},

	onWindowBlur: function(event) {
//		console.log('onWindowBlur');
		if(this.hasFocus) {
			this.hasFocus = false;
			if(this.focusElement != undefined)
				this.focusElement.blur();
		}
	},

	enqueueLayout: function(element) {
		element.layoutNext = this.layoutList;
		this.layoutList = element;
		if((this.updateTask == undefined) && this.ready)
			this.updateTask = new Core.DelayedTask({ delay: 0, scope: this, callback: this.update });
	},

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
	},
});

Ui.App.current = undefined;

