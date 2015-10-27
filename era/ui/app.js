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
	topLayers: undefined,

	requireFonts: undefined,
	testFontTask: undefined,
	bindedUpdate: undefined,

	selection: undefined,

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

		this.selection = new Ui.Selection();
		this.connect(this.selection, 'change', this.onSelectionChange);

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
		this.connect(window, 'keyup', this.onWindowKeyUp);

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

		this.bindedUpdate = this.update.bind(this);
	},

	// implement a selection handler for Selectionable elements
	getSelectionHandler: function() {	
		return this.selection;
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

	onSelectionChange: function(selection) {
	},

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
		}
		// stop the scaling of the page for Safari and Chrome*
		meta = document.createElement('meta');
		meta.name = 'viewport';
		meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
		document.getElementsByTagName("head")[0].appendChild(meta);
		// hide scroll tap focus (webkit)
		if(navigator.isWebkit) {
			style = document.createElement('style');
			style.type = 'text/css';
			style.innerHTML = '* { -webkit-tap-highlight-color: rgba(0, 0, 0, 0); }';
			document.getElementsByTagName('head')[0].appendChild(style);
		}
		// disable page zoom and auto scale for IE
		else if(navigator.isIE) {
			style = document.createElement('style');
			style.type = 'text/css';
			style.innerHTML = 
				'@-ms-viewport { width: device-width; } '+
				'body { -ms-content-zooming: none; } '+
				'* { touch-action: none; } ';
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
//		if(this.updateCounter === undefined)
//			this.updateCounter = 0;	
//		else
//			this.updateCounter++;
//		var localCounter = this.updateCounter;
//		console.log('update START '+localCounter+' task: '+this.updateTask);
		// clean the updateTask to allow a new one
		// important to do it first because iOS with its
		// bad thread system can trigger code that will ask for an
		// update without having finish this code
//		this.updateTask = false;
//		console.log('update task: '+this.updateTask);

		// update measure
//		var innerWidth = (window.innerWidth !== undefined) ? window.innerWidth : document.body.clientWidth;
//		var innerHeight = (window.innerHeight !== undefined) ? window.innerHeight : document.body.clientHeight;

		var innerWidth = document.body.clientWidth;
		var innerHeight = document.body.clientHeight;
		// to work like Windows 8 and iOS. Take outer size for not
		// taking care of the virtual keyboard size
//		if(navigator.Android) {
//			innerWidth = window.outerWidth;
//			innerHeight = window.outerHeight;
//		}

		if((this.windowWidth !== innerWidth) || (this.windowHeight !== innerHeight)) {
			this.windowWidth = innerWidth;
			this.windowHeight = innerHeight;
			this.fireEvent('resize', this, this.windowWidth, this.windowHeight);
			this.invalidateLayout();
		}

		this.layoutWidth = this.windowWidth;
		this.layoutHeight = this.windowHeight;

		// disable page scroll horizontal that might happened because of focused elements
		// out of the screen

//		document.body.scrollLeft = 0;
//		document.body.scrollTop = 0;

//		var innerWidth = document.body.clientWidth;
//		var innerHeight = document.body.clientHeight;
		
//		var size = this.measure(innerWidth, innerHeight);
//			console.log('update M1 '+localCounter+', task: '+this.updateTask);

//		console.log(this+'.update size: '+this.windowWidth+' x '+this.windowHeight+', child: '+size.width+' x '+size.height);

//		this.arrange(0, 0, Math.max(this.windowWidth * this.windowScale, size.width), Math.max(this.windowHeight * this.windowScale, size.height));
//		this.arrange(0, 0, innerWidth, innerHeight);

//		console.log('update A1 '+localCounter+', task: '+this.updateTask);

		// update measure/arrange
		while(this.layoutList !== undefined) {
			var next = this.layoutList.layoutNext;
			this.layoutList.layoutValid = true;
			this.layoutList.layoutNext = undefined;
			this.layoutList.updateLayout();
			this.layoutList = next;
		}

		// update draw
		while(this.drawList !== undefined) {
			var next = this.drawList.drawNext;
			this.drawList.drawNext = undefined;
			this.drawList.draw();
			this.drawList = next;
		}

//		console.log('update D1 '+localCounter+', task: '+this.updateTask);

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
//			this.focusStack = [];
			this.dialogs = new Ui.LBox({ eventsHidden: true });
			if(this.topLayers !== undefined)
				this.insertBefore(this.dialogs, this.topLayers);
			else
				this.append(this.dialogs);
		}
//		this.focusStack.push(this.focusElement);
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
//			var focus = this.focusStack.pop();
//			if(focus !== undefined)
//				try { focus.focus(); } catch(e) {}
		}
	},

	appendTopLayer: function(layer) {
		if(this.topLayers === undefined) {
			this.topLayers = new Ui.LBox({ eventsHidden: true });
			this.append(this.topLayers);
		}
		this.topLayers.append(layer);
	},

	removeTopLayer: function(layer) {
		if(this.topLayers !== undefined) {
			this.topLayers.remove(layer);
			if(this.topLayers.getChildren().length === 0) {
				this.remove(this.topLayers);
				this.topLayers = undefined;
			}
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
			document.documentElement.style.position = 'absolute';
			document.documentElement.style.padding = '0px';
			document.documentElement.style.margin = '0px';
			document.documentElement.style.border = '0px solid black';
			document.documentElement.style.width = '100%';
			document.documentElement.style.height = '100%';

			document.body.style.position = 'absolute';
			document.body.style.overflow = 'hidden';
			document.body.style.padding = '0px';
			document.body.style.margin = '0px';
			document.body.style.border = '0px solid black';
			document.body.style.outline = 'none';
			document.body.style.width = '100%';
			document.body.style.height = '100%';

			document.body.appendChild(this.getDrawing());

			this.handleScrolling(document.body);

			if((this.requireFonts !== undefined) && (this.testFontTask === undefined))
				this.testRequireFonts();

			this.setIsLoaded(true);
			this.setParentVisible(true);
			this.fireEvent('ready');
			
			this.ready = true;
			if((this.updateTask === false) && this.ready) {
				var app = this;
				this.updateTask = true;
				requestAnimationFrame(function() { app.update(); });
			}

			// create a WheelManager to handle wheel events
			new Ui.WheelManager({ app: this });

			// handle pointer events
			new Ui.PointerManager({ app: this });

			// handle native drag & drop
			new Ui.DragNativeManager({ app: this });
		}
	},

	onWindowKeyUp: function(event) {
		var key = event.which;

		// escape
		if((key == 27) && (this.dialogs !== undefined) && (this.dialogs.getChildren().length > 0)) {
			var dialog = this.dialogs.getChildren()[this.dialogs.getChildren().length-1];
			if('close' in dialog)
				dialog.close();
			else
				dialog.hide();
			event.preventDefault();
			event.stopPropagation();
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
			this.updateTask = true;
			setTimeout(this.bindedUpdate, 0);
		}
	},

	enqueueLayout: function(element) {
		element.layoutNext = this.layoutList;
		this.layoutList = element;
		if((this.updateTask === false) && this.ready) {
			this.updateTask = true;
			requestAnimationFrame(this.bindedUpdate);
		}
	},

	handleScrolling: function(drawing) {
		this.connect(this, 'ptrdown', function(event) {
			var startOffsetX = drawing.scrollLeft;
			var startOffsetY = drawing.scrollTop;
			var watcher = event.pointer.watch(this);
			this.connect(watcher, 'move', function() {
				if(!watcher.getIsCaptured()) {
					if(watcher.pointer.getIsMove()) {
						var direction = watcher.getDirection();
						var allowed = false;
						if(direction === 'left')
							allowed = (drawing.scrollLeft + drawing.clientWidth) < drawing.scrollWidth;
						else if(direction === 'right')
							allowed = drawing.scrollLeft > 0;
						else if(direction === 'bottom')
							allowed = drawing.scrollTop > 0;
						// if scroll down, allways allow it because of virtual keyboards
						else if(direction === 'top')
							allowed = true;// (drawing.scrollTop + drawing.clientHeight) < drawing.scrollHeight;
						if(allowed)
							watcher.capture();
						else
							watcher.cancel();
					}
				}
				else {
					var delta = watcher.getDelta();
					drawing.scrollLeft = startOffsetX - delta.x;
					drawing.scrollTop = startOffsetY - delta.y;
				}
			});
		});
	},

	getElementsByClassName: function(className) {
		var res = [];
		var reqSearch = function(current) {
			if(current.classType === className)
				res.push(current);
			if(current.children !== undefined) {
				for(var i = 0; i < current.children.length; i++)
					reqSearch(current.children[i]);
			}
		};
		reqSearch(this);
		return res;
	},

	getElementByDrawing: function(drawing) {
		var reqSearch = function(current) {
			if(current.drawing === drawing)
				return current;
			if(current.children !== undefined) {
				for(var i = 0; i < current.children.length; i++) {
					var res = reqSearch(current.children[i]);
					if(res !== undefined)
						return res;
				}
			}
		};
		return reqSearch(this);
	}

}, {
	getInverseLayoutTransform: function() {
		return Ui.Matrix.createTranslate(-document.body.scrollLeft, -document.body.scrollTop).multiply(Ui.App.base.getInverseLayoutTransform());
	},

	getLayoutTransform: function() {
		return Ui.App.base.getLayoutTransform().translate(document.body.scrollLeft, document.body.scrollTop);
	},

	invalidateMeasure: function() {
		// Ui.App is layout root, handle the layout here
		this.invalidateLayout();
	},

	invalidateArrange: function() {
		// Ui.App is layout root, handle the layout here
		this.invalidateLayout();
	},

	arrangeCore: function(w, h) {
		// on Android, remove focus of text elements when
		// the virtual keyboard is closed. Else it will re-open at each touch
		if(navigator.Android && navigator.isWebkit) {
			if((this.focusElement !== undefined) && ((this.focusElement.tagName === 'INPUT') || (this.focusElement.tagName === 'TEXTAREA') || (this.focusElement.contenteditable))) {
				if(h - 100 > this.lastArrangeHeight)
					this.focusElement.blur();
			}
		}
		this.lastArrangeHeight = h;
		Ui.App.base.arrangeCore.call(this, w, h);
	},
	
	setContent: function(content) {
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
