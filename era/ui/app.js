Ui.LBox.extend('Ui.App', 
/**@lends Ui.App#*/
{
	styles: undefined,
	updateTask: false,
	loaded: false,
	focusElement: undefined,
	arguments: undefined,
	ready: false,
	orientation: 0,
	webApp: true,
	lastArrangeHeight: 0,

	drawList: undefined,
	layoutList: undefined,
	windowWidth: 0,
	windowHeight: 0,

	contentBox: undefined,
	content: undefined,

	dialogs: undefined,

	requireFonts: undefined,
	testFontTask: undefined,

	/**
	 * @constructs
	 * @ class Define the App class. A web application always start
	 * with a App class as the main container
	 * @extends Ui.LBox
	 */
	constructor: function(config) {
		var args;
		this.addEvents('resize', 'ready', 'parentmessage', 'orientationchange');
		this.setClipToBounds(true);

		Ui.App.current = this;
		this.getDrawing().style.cursor = 'default';
		
		// check if arguments are available
		if((window.location.search !== undefined) && (window.location.search !== '')) {
			var base64;
			args = {};
			var tab = window.location.search.substring(1).split('&');
			for(var i = 0; i < tab.length; i++) {
				var tab2 = tab[i].split('=');
				if(tab2.length == 2) {
					var key = decodeURIComponent(tab2[0]);
					var val = decodeURIComponent(tab2[1]);
					if(key === 'base64')
						base64 = JSON.parse(val.fromBase64());
					else
						args[key] = val;
				}
			}
			if(base64 !== undefined) {
				this.arguments = base64;
				for(var prop in args)
					this.arguments[prop] = args[prop];
			}
			else
				this.arguments = args;
		}
		else
			this.arguments = {};
		// handle remote debugging
		if(this.arguments.remotedebug !== undefined) {
			args = this.arguments.remotedebug.split(':');
			new Core.RemoteDebug({ host: args[0], port: args[1] });
		}

		this.contentBox = new Ui.VBox();
		this.append(this.contentBox);

		if('webApp' in config) {
			this.webApp = config.webApp;
			delete(config.webApp);
		}

		this.setTransformOrigin(0, 0);

		this.connect(window, 'load', this.onWindowLoad);
		this.connect(window, 'resize', this.onWindowResize);

		if('style' in config)
			this.setStyle(config.style);
		else
			this.setStyle(Ui.Styles['default']);
		
		this.connect(window, 'focus', function(event) {
			if((event.target === undefined) || (event.target === null))
				return;
			this.focusElement = event.target;
		}, true);

		this.connect(window, 'blur', function(event) {
			this.focusElement = undefined;
		}, true);


		this.connect(window, 'dragstart', function(event) { event.preventDefault(); });
		this.connect(window, 'dragenter', function(event) {	event.preventDefault();	return false; });
		this.connect(window, 'dragover', function(event) {
			event.dataTransfer.dropEffect = 'none';
			event.preventDefault();	return false;
		});
		this.connect(window, 'drop', function(event) { event.preventDefault(); return false; });

		if('onorientationchange' in window)
			this.connect(window, 'orientationchange', this.onOrientationChange);

		// handle messages
		this.connect(window, 'message', this.onMessage);		
	},
		
	forceInvalidateMeasure: function(element) {
		if(element === undefined)
			element = this;
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
		}
		if(!allDone)
			this.testFontTask = new Core.DelayedTask({ scope: this, delay: 0.25, callback: this.testRequireFonts });
		else
			this.testFontTask = undefined;
	},

	checkWindowSize: function() {
		var innerWidth = (window.innerWidth !== undefined) ? window.innerWidth : document.body.clientWidth;
		var innerHeight = (window.innerHeight !== undefined) ? window.innerHeight : document.body.clientHeight;
		if((innerWidth !== this.getLayoutWidth()) || (innerHeight !== this.getLayoutHeight()))
			this.invalidateMeasure();
	},

	getOrientation: function() {
		return this.orientation;
	},

	/**#@+
	 * @private
	 */

	onWindowLoad: function() {
		var meta; var style;
//		console.log('onWindowLoad updateTask: '+this.updateTask);
		if(navigator.iPad || navigator.iPhone || navigator.Android) {
			if(this.webApp) {
				// support app mode for iPad, iPod and iPhone
				meta = document.createElement('meta');
				meta.name = 'apple-mobile-web-app-capable';
				meta.content = 'yes';
				document.getElementsByTagName("head")[0].appendChild(meta);
				// black status bar for iPhone
				meta = document.createElement('meta');
				meta.name = 'apple-mobile-web-app-status-bar-style';
				meta.content = 'black';
				document.getElementsByTagName("head")[0].appendChild(meta);
				// support for Chrome
				meta = document.createElement('meta');
				meta.name = 'mobile-web-app-capable';
				meta.content = 'yes';
				document.getElementsByTagName("head")[0].appendChild(meta);
			}
			// stop the scaling of the page for iOS and Android
			meta = document.createElement('meta');
			meta.name = 'viewport';
			meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
			document.getElementsByTagName("head")[0].appendChild(meta);
		}
		// hide scroll tap focus (webkit)
		if(navigator.isWebkit) {
			style = document.createElement('style');
			style.type = 'text/css';
			style.innerHTML = '* { -webkit-tap-highlight-color: rgba(0, 0, 0, 0); }';
			document.getElementsByTagName('head')[0].appendChild(style);
		}
		// disable page zoom and auto scale for IE
		else if(navigator.isIE && !(navigator.isIE8 || navigator.isIE7)) {
			style = document.createElement('style');
			style.type = 'text/css';
			style.innerHTML = '@-ms-viewport { width: device-width; } body { -ms-content-zooming: none; }';
			document.getElementsByTagName('head')[0].appendChild(style);
		}
		this.loaded = true;
		this.onReady();
	},
	
	onWindowResize: function(event) {
		this.checkWindowSize();
	},

	onOrientationChange: function(event) {
		this.orientation = window.orientation;
		this.fireEvent('orientationchange', this.orientation);
		this.checkWindowSize();
	},

	/**#@-*/
	
	update: function() {
		if(this.updateCounter === undefined)
			this.updateCounter = 0;	
		else
			this.updateCounter++;
		var localCounter = this.updateCounter;
//		console.log('update START '+localCounter+' task: '+this.updateTask);
		// clean the updateTask to allow a new one
		// important to do it first because iOS with its
		// bad thread system can trigger code that will ask for an
		// update without having finish this code
//		this.updateTask = false;
//		console.log('update task: '+this.updateTask);

		// update measure
		var innerWidth = (window.innerWidth !== undefined) ? window.innerWidth : document.body.clientWidth;
		var innerHeight = (window.innerHeight !== undefined) ? window.innerHeight : document.body.clientHeight;

		// disable page scroll horizontal that might happened because of focused elements
		// out of the screen
		if(navigator.isIE7 || navigator.isIE8)
			document.body.scrollLeft = '0px';

//		var innerWidth = document.body.clientWidth;
//		var innerHeight = document.body.clientHeight;
		
		var size = this.measure(innerWidth, innerHeight);
//			console.log('update M1 '+localCounter+', task: '+this.updateTask);

//		console.log(this+'.update size: '+this.windowWidth+' x '+this.windowHeight+', child: '+size.width+' x '+size.height);

//		this.arrange(0, 0, Math.max(this.windowWidth * this.windowScale, size.width), Math.max(this.windowHeight * this.windowScale, size.height));
		this.arrange(0, 0, innerWidth, innerHeight);

//		console.log('update A1 '+localCounter+', task: '+this.updateTask);

		// update arrange
//		while(this.layoutList !== undefined) {
//			var next = this.layoutList.layoutNext;
//			this.layoutList.layoutValid = true;
//			this.layoutList.layoutNext = undefined;
//			this.layoutList.updateLayout();
//			this.layoutList = next;

		// update draw
		while(this.drawList !== undefined) {
			var next = this.drawList.drawNext;
			this.drawList.drawNext = undefined;
			this.drawList.draw();
			this.drawList = next;
		}

//		console.log('update D1 '+localCounter+', task: '+this.updateTask);

		if((this.windowWidth !== innerWidth) || (this.windowHeight !== innerHeight)) {
			this.windowWidth = innerWidth;
			this.windowHeight = innerHeight;
			this.fireEvent('resize', this, this.windowWidth, this.windowHeight);
		}

//		console.log(this+'.update end ('+(new Date()).getTime()+')');

//		console.log('update STOP '+localCounter+', task: '+this.updateTask);
		this.updateTask = false;
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
//		if(focusElement !== undefined)
//			focusElement.focus();
	},

	removeDialog: function(dialog) {
		if(this.dialogs !== undefined) {
			this.dialogs.remove(dialog);
			if(this.dialogs.getChildren().length === 0) {
				this.remove(this.dialogs);
				this.dialogs = undefined;
				this.contentBox.enable();
			}
			else
				this.dialogs.getLastChild().enable();
			var focus = this.focusStack.pop();
			if(focus !== undefined)
				try { focus.focus(); } catch(e) {}
		}
	},

	/**
	 * Return the arguments given if any
	 */
	getArguments: function() {
		return this.arguments;
	},
	
	getIsReady: function() {
		return this.ready;
	},

	onReady: function() {
		if(this.loaded) {
//			document.documentElement.style.position = 'absolute';
			document.documentElement.style.padding = '0px';
			document.documentElement.style.margin = '0px';
			document.documentElement.style.border = '0px solid black';
			document.documentElement.style.overflow = 'hidden';
//			document.documentElement.style.right = '0px';
//			document.documentElement.style.left = '0px';
//			document.documentElement.style.top = '0px';
//			document.documentElement.style.bottom = '0px';
//			document.documentElement.style.width = '100%';
//			document.documentElement.style.height = '100%';

//			if(this.content !== undefined) {
				document.body.style.padding = '0px';
				document.body.style.margin = '0px';
				document.body.style.border = '0px solid black';
				document.body.style.outline = 'none';
				document.body.style.overflow = 'hidden';

				document.body.style.position = 'absolute';
				document.body.style.right = '0px';
				document.body.style.left = '0px';
				document.body.style.top = '0px';
				document.body.style.bottom = '0px';
				document.body.appendChild(this.getDrawing());
//			}
			
			// iOS dont handle correctly touch events if they
			// are rised on scrolling area if no handler are
			// set on a always visible part (some kind of event
			// bugged optimisation)
			if(navigator.iOs)
				this.connect(document.body, 'touchstart', function(e) {});
						
//			document.body.appendChild(this.getDrawing());

			if((this.requireFonts !== undefined) && (this.testFontTask === undefined))
				this.testRequireFonts();

			this.setIsLoaded(true);
			this.setParentVisible(true);
			this.fireEvent('ready');
			
			this.ready = true;
			if((this.updateTask === false) && this.ready) {
				var app = this;
				this.updateTask = true;
//				console.log('onReady set updateTask == true');
				requestAnimationFrame(function() { app.update(); });
				// really a bullshit iOS
				if(navigator.iOs)
					new Core.DelayedTask({ delay: 0.5, scope: this, callback: this.update });
			}
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
				if(res !== undefined)
					return res;
			}
		}
		return undefined;
	},

	enqueueDraw: function(element) {
		element.drawNext = this.drawList;
		this.drawList = element;
		if((this.updateTask === false) && this.ready) {
			var app = this;
			this.updateTask = true;
			requestAnimationFrame(function() { app.update(); });
		}
	}

}, {
	invalidateMeasure: function() {
		this.invalidateArrange();
		this.measureValid = false;
		if((this.updateTask === false) && this.ready) {
			var app = this;
			this.updateTask = true;
			requestAnimationFrame(function() { app.update(); });
		}
	},

	invalidateArrange: function() {
		this.arrangeValid = false;
		if((this.updateTask === false) && this.ready) {
			var app = this;
			this.updateTask = true;
			requestAnimationFrame(function() { app.update(); });
		}
	},
	
	setContent: function(content) {
		content = Ui.Element.create(content);
		if(this.content !== content) {
			if(this.content !== undefined)
				this.contentBox.remove(this.content);
			if(content !== undefined)
				this.contentBox.prepend(content, true);
			this.content = content;
		}
	}
}, {
	/**{Ui.App} Reference to the current application instance*/
	current: undefined,

	getWindowIFrame: function(currentWindow) {
		if(currentWindow === undefined)
			currentWindow = window;
		var iframe;
		if(currentWindow.parent !== currentWindow) {
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
