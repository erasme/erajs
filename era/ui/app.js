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
	orientation: 0,
	webApp: true,

	drawList: undefined,
	layoutList: undefined,
	windowWidth: 0,
	windowHeight: 0,
	windowScale: 1,

	contentBox: undefined,
	content: undefined,

	dialogs: undefined,
	virtualkeyboard: undefined,

	bottomMarker: undefined,
	
	requireFonts: undefined,
	testFontTask: undefined,

	/**
	 * @constructs
	 * @ class Define the App class. A web application always start
	 * with a App class as the main container
	 * @extends Ui.LBox
	 */
	constructor: function(config) {
		this.addEvents('resize', 'ready', 'parentmessage', 'orientationchange');

		Ui.App.current = this;
		this.getDrawing().style.cursor = 'default';
		
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
		// handle remote debugging
		if(this.arguments['remotedebug'] != undefined) {
			var args = this.arguments['remotedebug'].split(':');
			new Core.RemoteDebug({ host: args[0], port: args[1] });
		}

		this.contentBox = new Ui.VBox();
		this.append(this.contentBox);

		if('webApp' in config) {
			this.webApp = config.webApp;
			delete(config.webApp);
		}

		if('autoscale' in config) {
			this.setAutoScale(config.autoscale);
			delete(config.autoscale);
		}

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
			//console.log('focus '+event.target+' '+event.target.innerHTML);
//			if(navigator.iOs)
//				window.scrollTo(0, this.bottomMarker.offsetTop);

			this.checkSize();
//			this.checkWindowSize();

			if(event.target == undefined)
				return;

//			window.scrollTo(0, 0);
//			document.body.scrollLeft = 0;

//			console.log('window focus '+event.target);
			this.focusElement = event.target;

			if((this.focusElement.tagName === 'INPUT') || (this.focusElement.tagName === 'TEXTAREA')) {
				if(this.virtualkeyboard !== undefined)
					this.virtualkeyboard.open();
			}
			else if(this.virtualkeyboard !== undefined)
				this.virtualkeyboard.close();


//			if(((this.focusElement.tagName === 'INPUT') || (this.focusElement.tagName === 'TEXTAREA')) && (this.virtualkeyboard !== undefined))
//				this.virtualkeyboard.open();
		}, true);

		this.connect(window, 'blur', function(event) {
			//console.log('blur '+event.target);
			this.focusElement = undefined;
			this.checkSize();
//			this.checkWindowSize();
//			if(navigator.iOs)
//				window.scrollTo(0, this.bottomMarker.offsetTop);
//			window.scrollTo(0, 0);
		}, true);

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

//		this.connect(window, 'contextmenu', function(event) { event.preventDefault(); });
//		if(('oncontextmenu' in document) && ('attachEvent' in document))
//			document.attachEvent('oncontextmenu', function(event) { return false; });

//		this.connect(window, 'select', function(event) { event.preventDefault(); event.stopPropagation(); });
//		this.connect(window, 'scroll', function(event) { window.scrollTo(0, 0); event.stopPropagation(); event.preventDefault(); });
		this.connect(window, 'scroll', this.onWindowScroll);

		if('onorientationchange' in window)
			this.connect(window, 'orientationchange', this.onOrientationChange);

		// handle messages
		this.connect(window, 'message', this.onMessage);
	},
		
	forceInvalidateMeasure: function(element) {
		if(element === undefined)
			element = this;
		//element.invalidateDraw();
		if('getChildren' in element) {
			for(var i = 0; i < element.getChildren().length; i++)
				this.forceInvalidateMeasure(element.getChildren()[i]);
		}
		element.invalidateMeasure();
	},
	
	requireFont: function(fontFamily, fontWeight) {
		var fontKey = fontFamily+':'+fontWeight;
		//console.log('requireFont: '+fontKey);
		if(this.requireFonts === undefined)
			this.requireFonts = {};
		if(!this.requireFonts[fontKey]) {
			var test = false;
			if(this.getIsReady())
				test = Ui.Label.isFontAvailable(fontFamily, fontWeight);
			this.requireFonts[fontKey] = test;
			if(test)
				this.forceInvalidateMeasure(this);
			else if(this.getIsReady() && !test && (this.testFontTask === undefined))
				this.testFontTask = new Core.DelayedTask({ scope: this, delay: 0.25, callback: this.testRequireFonts });
		}
	},
	
	testRequireFonts: function() {
		var allDone = true;
		for(var fontKey in this.requireFonts) {
			var test = this.requireFonts[fontKey];
			if(!test) {
				var fontTab = fontKey.split(':');
				test = Ui.Label.isFontAvailable(fontTab[0], fontTab[1]);
				if(test) {
					this.requireFonts[fontKey] = true;
					var app = this;
					this.forceInvalidateMeasure(this);
				}
				else
					allDone = false;
			}
//			console.log(fontKey+' = '+test);
		}
		if(!allDone)
			this.testFontTask = new Core.DelayedTask({ scope: this, delay: 0.25, callback: this.testRequireFonts });
		else
			this.testFontTask = undefined;
	},

	checkWindowSize: function() {
		var innerWidth = document.body.clientWidth;
		var innerHeight = document.body.clientHeight;
		if(navigator.iOs)
			innerHeight = this.bottomMarker.offsetTop - document.body.scrollTop;
		if((innerWidth != this.getLayoutWidth()) || (innerHeight != this.getLayoutHeight()))
			this.invalidateMeasure();
	},

	timedCheckSize: function(task) {
//		console.log('timedCheckSize');
		this.checkSize();
		new Core.DelayedTask({ scope: this, callback: this.timedCheckSize, delay: 1 });
	},

	checkSize: function() {
		if(this.bottomMarker != undefined) {
//			document.body.scrollTop = this.bottomMarker.offsetTop;
			window.scrollTo(0, this.bottomMarker.offsetTop);
//			console.log('checkSize '+(this.bottomMarker.offsetTop - document.body.scrollTop));
		}
		this.checkWindowSize();
	},

	setVirtualKeyboard: function(wanted) {
		if(wanted) {
			if(this.virtualkeyboard === undefined) {
				this.virtualkeyboard = new Ui.VirtualKeyboard();
				this.contentBox.append(this.virtualkeyboard);
			}
		}
		else {
			if(this.virtualkeyboard !== undefined) {
				this.contentBox.remove(this.virtualkeyboard);
				this.virtualkeyboard = undefined;
			}
		}
	},

	openVirtualKeyboard: function() {
		if(this.virtualkeyboard !== undefined)
			this.virtualkeyboard.open();
	},

	closeVirtualKeyboard: function() {
		if(this.virtualkeyboard !== undefined)
			this.virtualkeyboard.close();
	},

	getOrientation: function() {
		return this.orientation;
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
			if(this.webApp) {
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
			}
			// stop the scaling of the page
			meta = document.createElement('meta');
			meta.name = 'viewport';
			meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
			document.getElementsByTagName("head")[0].appendChild(meta);
		}
		this.loaded = true;
		this.onReady();

	},

	onWindowScroll: function(event) {
		if(event.target != document)
			return;

//		console.log('onWindowScroll');
		this.checkWindowSize();

		// for Safari on iOS
//		if(navigator.iOs) {
//			if(this.lastScrollTop != this.bottomMarker.offsetTop) {
//				this.lastScrollTop = this.bottomMarker.offsetTop;

//			console.log('scroll m: '+this.bottomMarker.offsetTop+', t:'+document.body.scrollTop);

//		var innerWidth = document.body.clientWidth;
//		var innerHeight = document.body.clientHeight;
//		if(navigator.iOs)
//			innerHeight = this.bottomMarker.offsetTop;

//		if((innerWidth != this.getLayoutWidth()) || (innerHeight != this.getLayoutHeight()))
//			this.invalidateMeasure();


//			this.disconnect(window, 'scroll', this.onWindowScroll);
//			window.scrollTo(0, this.bottomMarker.offsetTop);
//			document.body.style.top = document.body.scrollTop+'px';
//			this.connect(window, 'scroll', this.onWindowScroll);
//			}
//		}
//		else {
//			window.scrollTo(0, 0);
//		}
//		event.stopPropagation();
//		event.preventDefault();
	},

	onWindowResize: function(event) {
//		console.log('onWindowResize');

//		console.log('onWindowResize iframe ? '+(window != Ui.App.getRootWindow())+' ('+document.body.clientWidth+' x '+document.body.clientHeight+')');
//		console.log(this+'.onWindowResize start updateTask: '+this.updateTask+', measureValid: '+this.measureValid);

//		if(this.focusElement != undefined)
//			this.focusElement.blur();

//		this.fireEvent('resize', this);

		this.checkSize();
//		this.checkWindowSize();

//		var innerWidth = document.body.clientWidth;
//		var innerHeight = document.body.clientHeight;
//		if(navigator.iOs)
//			innerHeight = this.bottomMarker.offsetTop - document.body.scrollTop;

//		if((innerWidth != this.getLayoutWidth()) || (innerHeight != this.getLayoutHeight()))
//			this.invalidateMeasure();

//		console.log(this+'.onWindowResize end updateTask: '+this.updateTask+', measureValid: '+this.measureValid);
	},

	onOrientationChange: function(event) {
		this.orientation = window.orientation;
		this.fireEvent('orientationchange', this.orientation);
//		this.fireEvent('resize', this);
		this.checkWindowSize();
//		this.invalidateMeasure();
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
		// clean the updateTask to allow a new one
		// important to do it first because iOS with its
		// bad thread system can trigger code that will ask for an
		// update without having finish this code
		this.updateTask = undefined;
//		console.log('update task: '+this.updateTask);

		// update measure
//		var innerWidth = window.innerWidth;
//		var innerHeight = window.innerHeight;

		var innerWidth = document.body.clientWidth;
		var innerHeight = document.body.clientHeight;
		if(navigator.iOs)
			innerHeight = this.bottomMarker.offsetTop - document.body.scrollTop;

//		console.log('update innerHeight: '+innerHeight);

//		if((document.body != undefined) && (this.bottomMarker != undefined))
//			console.log('i: '+window.innerHeight+', c: '+document.body.clientHeight+', s: '+document.body.scrollTop+', b: '+this.bottomMarker.offsetTop);

		// to avoid offscreen scroll problem on iOS
//		if(innerHeight >= this.windowHeight)
//			window.scrollTo(0, 0);

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
//		console.log(this+'.update size: '+this.windowWidth+' x '+this.windowHeight+', child: '+size.width+' x '+size.height);

//		this.arrange(0, 0, Math.max(this.windowWidth * this.windowScale, size.width), Math.max(this.windowHeight * this.windowScale, size.height));
		this.arrange(0, 0, innerWidth * this.windowScale, innerHeight * this.windowScale);

		// update arrange
//		while(this.layoutList != undefined) {
//			var next = this.layoutList.layoutNext;
//			this.layoutList.layoutValid = true;
//			this.layoutList.layoutNext = undefined;
//			this.layoutList.updateLayout();
//			this.layoutList = next;

		// update draw
		while(this.drawList != undefined) {
			var next = this.drawList.drawNext;
			this.drawList.drawNext = undefined;
			this.drawList.draw();
			this.drawList = next;
		}

		if((this.windowWidth != innerWidth) || (this.windowHeight != innerHeight)) {
			this.windowWidth = innerWidth;
			this.windowHeight = innerHeight;
			this.fireEvent('resize', this);
		}

		if(navigator.iOs)
			this.getDrawing().style.top = document.body.scrollTop+'px';

//		console.log(this+'.update end ('+(new Date()).getTime()+')');

//		if(navigator.iPad || navigator.iPhone) {
//			var top = document.body.scrollTop;
//			document.body.scrollLeft = 0;
//			document.body.scrollTop = 0;
//		}
	},

	getContent: function() {
		return this.content;
	},

	getFocusElement: function() {
		return this.focusElement;
	},

	appendDialog: function(dialog) {
		if(this.dialogs === undefined) {
			this.focusStack = [];
			this.dialogs = new Ui.LBox();
			this.append(this.dialogs);
		}
		this.focusStack.push(this.focusElement);
		this.dialogs.append(dialog);
		this.contentBox.disable();
		for(var i = 0; i < this.dialogs.getChildren().length - 1; i++)
			this.dialogs.getChildren()[i].disable();
		// find the first focusable element in the new dialog
//		var focusElement = this.findFocusableDiv(dialog.getDrawing());
//		if(focusElement != undefined)
//			focusElement.focus();
	},

	removeDialog: function(dialog) {
		if(this.dialogs != undefined) {
			this.dialogs.remove(dialog);
			if(this.dialogs.getChildren().length == 0) {
				this.remove(this.dialogs);
				this.dialogs = undefined;
				this.contentBox.enable();
			}
			else
				this.dialogs.getLastChild().enable();
			var focus = this.focusStack.pop();
			if(focus != undefined)
				try { focus.focus(); } catch(e) {}
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

	getIsReady: function() {
		return this.ready;
	},

	onReady: function() {
		if(this.loaded) {
			this.ready = true;
						
			if(document.body === undefined) {
				this.htmlRoot = document.createElement('body');
				document.body = this.htmlRoot;
			}

			document.documentElement.style.padding = '0px';
			document.documentElement.style.margin = '0px';
			document.documentElement.style.border = '0px solid black';
			document.documentElement.style.overflow = 'hidden';
			document.documentElement.style.width = '100%';
			document.documentElement.style.height = '100%';

//			if(this.content !== undefined) {
				document.body.style.padding = '0px';
				document.body.style.margin = '0px';
				document.body.style.border = '0px solid black';
				document.body.style.overflow = 'hidden';

				document.body.style.position = 'absolute';
				document.body.style.right = '0px';
				document.body.style.left = '0px';
				document.body.style.top = '0px';
				document.body.style.bottom = '0px';

//				document.body.style.width = '100%';
//				document.body.style.height = '100%';
				document.body.appendChild(this.getDrawing());
//			}

			// iOS hack to know the visible part (without the virtual keyboard size)
			if(navigator.iOs) {
				this.bottomMarker = document.createElement('div');
				this.bottomMarker.style.position = 'absolute';
				this.bottomMarker.style.width = '0px';
				this.bottomMarker.style.height = '0px';
				this.bottomMarker.style.background = 'red';
				this.bottomMarker.style.bottom = '0px';
				this.bottomMarker.style.left = '0px';
				document.body.appendChild(this.bottomMarker);
			}

			document.body.appendChild(this.getDrawing());

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

			if((this.requireFonts !== undefined) && (this.testFontTask === undefined))
				this.testRequireFonts();

			this.setIsLoaded(true);
			this.setParentVisible(true);
			this.update();
			this.fireEvent('ready');

			if(navigator.iOs)
				this.timedCheckSize();
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

	findFocusableDiv: function(current) {
		if(('tabIndex' in current) && (current.tabIndex >= 0))
			return current;
		if('childNodes' in current) {
			for(var i = 0; i < current.childNodes.length; i++) {
				var res = this.findFocusableDiv(current.childNodes[i]);
				if(res != undefined)
					return res;
			}
		}
		return undefined;
	},

	enqueueDraw: function(element) {
		element.drawNext = this.drawList;
		this.drawList = element;
//		if((this.updateTask === undefined) && this.ready)
//			this.updateTask = new Core.DelayedTask({ delay: 0, scope: this, callback: this.update });
			
		if((this.updateTask === undefined) && this.ready) {
			var app = this;
			this.updateTask = true;
			requestAnimationFrame(function() { app.update() });
		}
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
//		if((this.updateTask === undefined) && this.ready)
//			this.updateTask = new Core.DelayedTask({ delay: 0, scope: this, callback: this.update });
//	}
}, {
	invalidateMeasure: function() {
//		console.log('App.invalidateMeasure new task ? '+(((this.updateTask === undefined) && this.ready)));
//		if(this.measureValid) {
			this.invalidateArrange();
			this.measureValid = false;
//			if((this.updateTask === undefined) && this.ready)
//				this.updateTask = new Core.DelayedTask({ delay: 0, scope: this, callback: this.update });				
				
			if((this.updateTask === undefined) && this.ready) {
				var app = this;
				this.updateTask = true;
				requestAnimationFrame(function() { app.update() });
			}
//		}
	},

	invalidateArrange: function() {
//		if(this.arrangeValid) {
//			console.log('invalidate Arrange');
			this.arrangeValid = false;

//			this.enqueueArrange(this);

//			if((this.updateTask === undefined) && this.ready)
//				this.updateTask = new Core.DelayedTask({ delay: 0, scope: this, callback: this.update });
			if((this.updateTask === undefined) && this.ready) {
				var app = this;
				this.updateTask = true;
				requestAnimationFrame(function() { app.update() });
			}
				
//		}
	},

	setContent: function(content) {
		content = Ui.Element.create(content);
		if(this.content != content) {
//			document.documentElement.style.padding = '0px';
//			document.documentElement.style.margin = '0px';
//			document.documentElement.style.border = '0px solid black';
//			document.documentElement.style.overflow = 'hidden';
//			document.documentElement.style.width = '100%';
//			document.documentElement.style.height = '100%';

			if(this.content != undefined)
				this.contentBox.remove(this.content);
			if(content != undefined)
				this.contentBox.prepend(content, true);
			this.content = content;

//			if((this.content != undefined) && this.ready) {
//				document.body.style.padding = '0px';
//				document.body.style.margin = '0px';
//				document.body.style.border = '0px solid black';
//				document.body.style.overflow = 'hidden';
//				document.body.style.width = '100%';
//				document.body.style.height = '100%';
//				document.body.appendChild(this.getDrawing());
//			}
		}
	}
}, {
	/**{Ui.App} Reference to the current application instance*/
	current: undefined,

	getWindowIFrame: function(currentWindow) {
		if(currentWindow === undefined)
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
