
Ui.DualIcon.extend('Ui.DragEffectIcon', {}, {}, {
	style: {
		fill: 'green',
		stroke: 'white',
		strokeWidth: 4
	}
});

Ui.Event.extend('Ui.DragEvent', 
/**@lends Ui.DragEvent#*/
{
	clientX: 0,
	clientY: 0,
	ctrlKey: false,
	altKey: false,
	shiftKey: false,
	metaKey: false,
	dataTransfer: undefined,

	/**
    *   @constructs
	*	@class
    *   @extends Core.Event
	*/
	constructor: function(config) {
	},

	setClientX: function(clientX) {
		this.clientX = clientX;
	},

	setClientY: function(clientY) {
		this.clientY = clientY;
	},

	setDeltaX: function(deltaX) {
		this.deltaX = deltaX;
	},

	setDeltaY: function(deltaY) {
		this.deltaY = deltaY;
	},

	setCtrlKey: function(ctrlKey) {
		this.ctrlKey = ctrlKey;
	},

	setAltKey: function(altKey) {
		this.altKey = altKey;
	},

	setShiftKey: function(shiftKey) {
		this.shiftKey = shiftKey;
	},

	setMetaKey: function(metaKey) {
		this.metaKey = metaKey;
	},

	setDataTransfer: function(dataTransfer) {
		this.dataTransfer = dataTransfer;
	},

	preventDefault: function() {
	}
});

Core.Object.extend('Ui.DragDataTransfer', 
/**@lends Ui.DragDataTransfer#*/
{
	draggable: undefined,
	image: undefined,
	imageEffect: undefined,
	catcher: undefined,
	startX: 0,
	startY: 0,
	startImagePoint: undefined,
	overElement: undefined,
	hasStarted: false,
	types: undefined,

	watcher: undefined,
	pointer: undefined,
	pointerId: 0,
	dropEffect: 'none',
	data: undefined,
	type: undefined,
	timer: undefined,
	delayed: false,

	/**
    *   @constructs
	*	@class
    *   @extends Core.Object
	*/
	constructor: function(config) {
		this.addEvents('start', 'end');

		this.draggable = config.draggable;
		delete(config.draggable);
		this.startX = config.x;
		delete(config.x);
		this.startY = config.y;
		delete(config.y);
		this.type = config.type;
		delete(config.type);
		this.delayed = config.delayed;
		delete(config.delayed);
		if('pointerId' in config) {
			this.pointerId = config.pointerId;
			delete(config.pointerId);
		}
		this.pointer = config.pointer;
		delete(config.pointer);
		this.watcher = this.pointer.watch(Ui.App.current);

		// prevent native drag and drop if supported
/*		if('ondragstart' in this.draggable) {
			this.draggable.ondragstart = function(e) {
				if(e !== undefined) {
					if('preventDefault' in e)
						e.preventDefault();
					if('stopImmediatePropagation' in e)
						e.stopImmediatePropagation();
				}
				return false;
			};
		}*/

		this.data = {};

		this.connect(this.watcher, 'move', this.onPointerMove);
		this.connect(this.watcher, 'up', this.onPointerUp);
		this.connect(this.watcher, 'cancel', this.onPointerCancel);

		if(this.delayed)
			this.timer = new Core.DelayedTask({ scope: this, delay: 0.5, callback: this.onTimer });
	},

	setData: function(type, data) {
		this.data[type.toLowerCase()] = data;
		this.updateTypes();
	},

	getData: function(type) {
		return this.data[type.toLowerCase()];
	},

	hasData: function() {
		var check = false;
		for(var i in this.data)
			check = true;
		return check;
	},

	/**#@+
	* @private
	*/
	generateImage: function(element) {
		var res; var key; var child; var i;
		if(navigator.isIE7 || navigator.isIE8) {
			var div = document.createElement('div');
			div.style.position = 'absolute';
			div.style.left = '-10000px';
			div.style.top = '-10000px';
			div.style.outline = '0px';
			div.innerHTML = element.outerHTML;
			res = div.childNodes[0];
		}
		else {
			if(('tagName' in element) && (element.tagName.toUpperCase() == 'IMG')) {
				res = element.cloneNode(false);
				res.oncontextmenu = function(e) { e.preventDefault(); };
			}
			else if(('tagName' in element) && (element.tagName.toUpperCase() == 'CANVAS')) {
				res = document.createElement('img');
				res.oncontextmenu = function(e) { e.preventDefault(); };
				// copy styles (position)
				for(key in element.style)
					res.style[key] = element.style[key];
				res.setAttribute('src', element.toDataURL('image/png'));
			}
			else if(!navigator.isFirefox && (element.toDataURL !== undefined)) {
				res = document.createElement('img');
				res.oncontextmenu = function(e) { e.preventDefault(); };
				// copy styles (position)
				for(key in element.style)
					res.style[key] = element.style[key];
				res.setAttribute('src', element.toDataURL('image/png'));
			}
			else {
				res = element.cloneNode(false);
				if('style' in res) {
					res.style.webkitUserSelect = 'none';
					// to disable the magnifier in iOS WebApp mode
					res.style.webkitUserCallout = 'none';
				}
				for(i = 0; i < element.childNodes.length; i++) {
					child = element.childNodes[i];
					res.appendChild(this.generateImage(child));
				}
			}
			if('setAttribute' in res)
				res.setAttribute('draggable', false);
		}
		res.onselectstart = function(e) {
			e.preventDefault();
			return false;
		};
		return res;
	},
		
	updateTypes: function() {
		this.types = [];
		for(var type in this.data)
			this.types.push(type);
	},

	onTimer: function() {
		this.timer = undefined;
	
		this.fireEvent('start', this);

		if(this.hasData()) {
			this.hasStarted = true;

			this.image = this.generateImage(this.draggable.getDrawing());
			this.image.style.touchAction = 'none';
			this.image.style.zIndex = 100000;
			this.image.style.position = 'absolute';
			// remove possible matrix transform
			if('removeProperty' in this.image.style)
				this.image.style.removeProperty('transform');
			if(navigator.isIE && ('removeProperty' in this.image.style))
				this.image.style.removeProperty('-ms-transform');
			else if(navigator.isGecko)
				this.image.style.removeProperty('-moz-transform');
			else if(navigator.isWebkit)
				this.image.style.removeProperty('-webkit-transform');
			else if(navigator.isOpera)
				this.image.style.removeProperty('-o-transform');
			
			if(navigator.supportOpacity) {
				this.image.style.opacity = 1;
				this.image.firstChild.style.opacity = 0.8;
			}

			var ofs = this.delayed ? -10 : 0;

			this.startImagePoint = this.draggable.pointToWindow({ x: 0, y: 0 });

			this.image.style.left = (this.startImagePoint.x+ofs)+'px';
			this.image.style.top = (this.startImagePoint.y+ofs)+'px';

			// avoid IFrame problems for mouse
			if(this.watcher.pointer.getType() === 'mouse') {
				this.catcher = document.createElement('div');
				this.catcher.style.position = 'absolute';
				this.catcher.style.left = '0px';
				this.catcher.style.right = '0px';
				this.catcher.style.top = '0px';
				this.catcher.style.bottom = '0px';
				this.catcher.zIndex = 1000;
				document.body.appendChild(this.catcher);
			}

			document.body.appendChild(this.image);

			this.watcher.capture();
		}
		else {
			this.watcher.cancel();
		}
	},
	
	onPointerMove: function(watcher) {
		var deltaX; var deltaY; var delta; var dragEvent; var ofs;
//		console.log('onPointerMove captured: '+watcher.getIsCaptured()+', move: '+watcher.pointer.getIsMove());

		if(watcher.getIsCaptured()) {
			var clientX = watcher.pointer.getX();
			var clientY = watcher.pointer.getY();

			document.body.removeChild(this.image);
			if(this.catcher !== undefined)
				document.body.removeChild(this.catcher);

			var overElement = Ui.App.current.elementFromPoint(clientX, clientY);

			if(this.catcher !== undefined)
				document.body.appendChild(this.catcher);
			document.body.appendChild(this.image);

			deltaX = clientX - this.startX;
			deltaY = clientY - this.startY;
			ofs = this.delayed ? -10 : 0;

//			console.log('onMove move delta: '+clientX+','+clientY);

			this.image.style.left = (this.startImagePoint.x + deltaX + ofs)+'px';
			this.image.style.top = (this.startImagePoint.y + deltaY + ofs)+'px';
//			this.image.stype.webkitTransform = 'translate3d('+(this.startImagePoint.x + deltaX + ofs)+'px,'+(this.startImagePoint.y + deltaY + ofs)+'px'+',0px)';

			if((overElement !== undefined) && (overElement !== null) && (overElement !== document.documentElement)) {
				var dragEvent;
				var oldDropEffect = this.dropEffect;
				if(this.overElement !== overElement)
					dragEvent = new Ui.DragEvent({
						type: 'localdragenter',  clientX: clientX, clientY: clientY,
						dataTransfer: this
					});
				else {
					this.dropEffect = 'none';
					dragEvent = new Ui.DragEvent({
						type: 'localdragover',  clientX: clientX, clientY: clientY,
						dataTransfer: this
					});
				}
				dragEvent.dispatchEvent(overElement);

				// handle the drop effect icon feedback
				if(this.dropEffect !== oldDropEffect) {
					if(this.imageEffect !== undefined) {
						this.imageEffect.setIsLoaded(false);
						this.image.removeChild(this.imageEffect.getDrawing());
						this.imageEffect = undefined;
					}
					if(this.dropEffect !== 'none') {
						this.imageEffect = new Ui.DragEffectIcon({
							icon: 'drag'+this.dropEffect//, stroke: 'white'
						});
						this.imageEffect.parent = Ui.App.current;
						this.imageEffect.setIsLoaded(true);
						this.imageEffect.setParentVisible(true);
						this.imageEffect.setParentDisabled(false);

						this.imageEffect.measure(32, 32);
						this.imageEffect.arrange(
							-48 + (this.startX-this.startImagePoint.x-ofs),
							-48 + (this.startY-this.startImagePoint.y-ofs), 32, 32);
						this.image.appendChild(this.imageEffect.getDrawing());
					}
				}
				this.overElement = overElement;
			}
			else
				this.overElement = undefined;

		}
		else {
			if(watcher.pointer.getIsMove())
				watcher.cancel();
		}
	},

	onPointerUp: function(watcher) {
//		console.log('onPointerUp');
		var dragEvent;

		if(!watcher.getIsCaptured())
			watcher.cancel();
		else {
			var clientX = watcher.pointer.getX();
			var clientY = watcher.pointer.getY();

			document.body.removeChild(this.image);

			if(this.catcher !== undefined) {
            	document.body.removeChild(this.catcher);
            	this.catcher = undefined;
            }

			if(this.overElement !== undefined) {
				dragEvent = new Ui.DragEvent({
					type: 'localdrop', clientX: clientX, clientY: clientY, 
					dataTransfer: this
				});
				dragEvent.dispatchEvent(this.overElement);
			}
			this.fireEvent('end', this);
		}
	},

	onPointerCancel: function(watcher) {
		if(this.timer !== undefined) {
			this.timer.abort();
			this.timer = undefined;
		}
	}
	/**#@-*/
});

	