
Ui.DualIcon.extend('Ui.DragEffectIcon', {}, {}, {
	style: {
		fill: '#357186',
		stroke: '#ffffff',
		strokeWidth: 5
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
	effectAllowed: undefined,

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
	},

	getEffectAllowed: function() {
		return this.effectAllowed;
	},

	setEffectAllowed: function(effectAllowed) {
		this.effectAllowed = effectAllowed;
	}
});

Core.Object.extend('Ui.DragNativeData', {
	dataTransfer: undefined,

	constructor: function(config) {
		this.dataTransfer = config.dataTransfer;
		delete(config.dataTransfer);
	},

	getTypes: function() {
		return this.dataTransfer.dataTransfer.types;
	},

	hasTypes: function() {
		var types = this.getTypes();
		for(var i = 0; i < types.length; i++) {
			for(var i2 = 0; i2 < arguments.length; i2++)
				if(types[i].toLowerCase() === arguments[i2].toLowerCase())
					return true;
		}
		return false;
	},

	hasType: function(type) {
		return this.hasTypes(type);
	},

	hasFiles: function() {
		return this.hasType('files');
	},

	getFiles: function() {
		var files = [];
		for(var i = 0; i < this.dataTransfer.dataTransfer.files.length; i++)
			files.push(new Core.File({ fileApi: this.dataTransfer.dataTransfer.files[i] }));
		return files;
	},

	getData: function(type) {
		return this.dataTransfer.dataTransfer.getData(type);
	}
});

Core.Object.extend('Ui.DragWatcher', {
	effectAllowed: undefined,
	dataTransfer: undefined,
	element: undefined,
	x: 0,
	y: 0,

	constructor: function(config) {
		this.addEvents('drop', 'leave', 'move');

		this.dataTransfer = config.dataTransfer;
		delete(config.dataTransfer);

		this.element = config.element;
		delete(config.element);
	},

	getPosition: function() {
		return new Ui.Point({ x: this.x, y: this.y });
	},

	getElement: function() {
		return this.element;
	},

	getDataTransfer: function() {
		return this.dataTransfer;
	},

	getEffectAllowed: function() {
		return this.effectAllowed;
	},

	setEffectAllowed: function(effect) {
		this.effectAllowed = effect;
	},

	move: function(x, y) {
		this.x = x;
		this.y = y;
		this.fireEvent('move', this, x, y);
	},

	leave: function() {
		this.fireEvent('leave', this);
	},

	drop: function(dropEffect) {
		this.fireEvent('drop', this, dropEffect, this.x, this.y);
	},

	release: function() {
		this.dataTransfer.releaseDragWatcher(this);
	}
});

Core.Object.extend('Ui.DragDataTransfer', {
	draggable: undefined,
	image: undefined,
	imageEffect: undefined,
	catcher: undefined,
	startX: 0,
	startY: 0,
	dropX: 0,
	dropY: 0,
	x: 0,
	y: 0,
	startImagePoint: undefined,
	overElement: undefined,
	hasStarted: false,
	dragDelta: undefined,

	effectAllowed: undefined,
	watcher: undefined,
	pointer: undefined,
	pointerId: 0,
	dropEffect: undefined,
	dropEffectIcon: undefined,
	data: undefined,
	type: undefined,
	timer: undefined,
	dropFailsTimer: undefined,
	delayed: false,

	dragWatcher: undefined,

	constructor: function(config) {
		this.addEvents('start', 'end');

		this.dropEffect = [];
		this.effectAllowed = [];
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

		this.dragDelta = this.draggable.pointFromWindow({ x: this.startX, y: this.startY });
		this.data = {};

		this.connect(this.watcher, 'move', this.onPointerMove);
		this.connect(this.watcher, 'up', this.onPointerUp);
		this.connect(this.watcher, 'cancel', this.onPointerCancel);

		if(this.delayed)
			this.timer = new Core.DelayedTask({ scope: this, delay: 0.5, callback: this.onTimer });
	},

	setData: function(data) {
		this.data = data;
	},

	getData: function() {
		return this.data;
	},

	hasData: function() {
		return this.data !== undefined;
	},

	getPosition: function() {
		return new Ui.Point({ x: this.x, y: this.y });
	},

	getDragDelta: function() {
		return this.dragDelta;
	},

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

	capture: function(element, effect) {

		if((this.dragWatcher !== undefined) && (this.dragWatcher.getElement() === element))
			throw('Drag already captured by the given element');

		if(this.dragWatcher !== undefined)
			this.dragWatcher.leave();

		this.dragWatcher = new Ui.DragWatcher({ dataTransfer: this, element: element, effectAllowed: effect });
		return this.dragWatcher;
	},

	releaseDragWatcher: function(dragWatcher) {
		if(this.dragWatcher === dragWatcher) {
			this.dragWatcher.leave();
			this.dragWatcher = undefined;
		}
	},
	
	onPointerMove: function(watcher) {
		var deltaX; var deltaY; var delta; var dragEvent; var ofs;

		if(watcher.getIsCaptured()) {
			var clientX = watcher.pointer.getX();
			var clientY = watcher.pointer.getY();

			this.x = clientX;
			this.y = clientY;

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

			this.image.style.left = (this.startImagePoint.x + deltaX + ofs)+'px';
			this.image.style.top = (this.startImagePoint.y + deltaY + ofs)+'px';

			if((overElement !== undefined) && (overElement !== null)) {
				var dragEvent;
				var oldDropEffectIcon = this.dropEffectIcon;
				//this.dropEffect = 'none';
				dragEvent = new Ui.DragEvent({
					type: 'dragover',  clientX: clientX, clientY: clientY,
					dataTransfer: this
				});
				var effectAllowed = [];
				dragEvent.dispatchEvent(overElement);
				if(this.dragWatcher !== undefined)
					effectAllowed = this.dragWatcher.getEffectAllowed();

				if((this.dragWatcher !== undefined) && !overElement.getIsChildOf(this.dragWatcher.getElement())) {
					this.dragWatcher.leave();
					this.dragWatcher = undefined;
				}					

				if(this.dragWatcher !== undefined)
					this.dragWatcher.move(clientX, clientY);
				
				this.dropEffect = Ui.DragDataTransfer.getMatchingDropEffect(this.effectAllowed, effectAllowed,
					watcher.pointer.getType(), watcher.pointer.getCtrlKey(), watcher.pointer.getAltKey(),
					watcher.pointer.getShiftKey());

				if(this.dropEffect.length > 1)
					this.dropEffectIcon = 'dragchoose';
				else if(this.dropEffect.length > 0)
					this.dropEffectIcon = this.dropEffect[0].dragicon;
				else
					this.dropEffectIcon = undefined;

				// handle the drop effect icon feedback
				if(this.dropEffectIcon !== oldDropEffectIcon) {
					if(this.imageEffect !== undefined) {
						this.imageEffect.setIsLoaded(false);
						this.image.removeChild(this.imageEffect.getDrawing());
						this.imageEffect = undefined;
					}
					if(this.dropEffectIcon !== undefined) {
						this.imageEffect = new Ui.DragEffectIcon({
							icon: this.dropEffectIcon
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
		if(!watcher.getIsCaptured())
			watcher.cancel();
		else {
			// a dragWatcher is present, drop is possible
			if(this.dragWatcher !== undefined) {
				this.removeImage();
				this.dragWatcher.leave();
				// TODO handle the choice if needed
				if(this.dropEffect.length === 1)
					this.dragWatcher.drop(this.dropEffect[0].action);
				else if(this.dropEffect.length > 1) {
					// TODO
					var popup = new Ui.Popup();
					var vbox = new Ui.VBox();
					popup.setContent(vbox);
					for(var i = 0; i < this.dropEffect.length; i++) {
						var button = new Ui.Button({ text: this.dropEffect[i].text });
						button['Ui.DragEvent.dropEffect'] = this.dropEffect[i];
						this.connect(button, 'press', function(b) {
							this.dragWatcher.drop(b['Ui.DragEvent.dropEffect'].action);
							popup.close();
						});
						vbox.append(button);
					}

					//popup.setContent(new Ui.Rectangle({ width: 100, height: 100, fill: 'pink' }));
					popup.open(this.x, this.y);


					//this.dragWatcher.drop(this.dropEffect);
				}
				//this.dragWatcher = undefined;
			}
			else {
				// start an animation to return the dragged element to its origin
				this.dropX = watcher.pointer.getX();
				this.dropY = watcher.pointer.getY();
				this.dropFailsTimer = new Anim.Clock({ duration: 0.25, ease: new Anim.PowerEase({ mode: 'out' }) });
				this.connect(this.dropFailsTimer, 'timeupdate', this.onDropFailsTimerUpdate);
				this.dropFailsTimer.begin();
			}
			this.fireEvent('end', this);
		}
	},

	onPointerCancel: function(watcher) {
		if(this.timer !== undefined) {
			this.timer.abort();
			this.timer = undefined;
		}
	},

	removeImage: function() {
		document.body.removeChild(this.image);
		if(this.catcher !== undefined) {
           	document.body.removeChild(this.catcher);
           	this.catcher = undefined;
		}
	},

	onDropFailsTimerUpdate: function(clock, progress) {
		if(progress >= 1)
			this.removeImage();
		else {
			var deltaX = (this.dropX - this.startX) * (1 - progress);
			var deltaY = (this.dropY - this.startY) * (1 - progress);

			this.image.style.left = (this.startImagePoint.x + deltaX)+'px';
			this.image.style.top = (this.startImagePoint.y + deltaY)+'px';
		}
	}
}, {}, {
	getMergedEffectAllowed: function(effectAllowed1, effectAllowed2) {
		if(effectAllowed1 === 'all')
			return effectAllowed2;
		else {
			var effectAllowed = [];

			for(var i = 0; i < effectAllowed1.length; i++) {
				for(var i2 = 0; i2 < effectAllowed2.length; i2++) {
					if(effectAllowed1[i] === effectAllowed2[i2].action)
						effectAllowed.push(effectAllowed2[i2]);
				}
			}
			return effectAllowed;
		}
	},

	getMatchingDropEffect: function(srcEffectAllowed, dstEffectAllowed, pointerType, ctrlKey, altKey, shiftKey) {
		// filter with what the source support
		effectAllowed = Ui.DragDataTransfer.getMergedEffectAllowed(srcEffectAllowed, dstEffectAllowed);
		var dropEffect = effectAllowed;

		if(effectAllowed.length > 1) {
			// if the mouse is used let the choice using de keyboard controls
			if(pointerType === 'mouse') {
				if(!altKey) {
					// find the secondary choice if any
					if(ctrlKey) {
						for(var i = 0; i < effectAllowed.length; i++) {
							if(effectAllowed[i].secondary === true)
								dropEffect = [ effectAllowed[i] ];
						}
						// else if possible take the second 
						if((dropEffect === effectAllowed) && (effectAllowed.length > 1))
							dropEffect = [ effectAllowed[1] ];
					}
					// else find the primary
					else {
						for(var i = 0; i < effectAllowed.length; i++) {
							if(effectAllowed[i].primary === true)
								dropEffect = [ effectAllowed[i] ];
						}
						// else find take the first one
						if(dropEffect === effectAllowed)
							dropEffect = [ effectAllowed[0] ];
					}
				}
			}
		}
		return dropEffect;
/*
		if(effectAllowed === 'copy')
			dropEffect = 'copy';
		else if(effectAllowed === 'link')
			dropEffect = 'link';
		else if(effectAllowed === 'move')
			dropEffect = 'move';
		else if(effectAllowed === 'copyLink') {
			if(ctrlKey)
				dropEffect = 'copy';
			else
				dropEffect = 'link';
		}
		else if(effectAllowed === 'copyMove') {
			if(ctrlKey)
				dropEffect = 'copy';
			else
				dropEffect = 'move';
		}
		else if(effectAllowed === 'linkMove') {
			if(altKey)
				dropEffect = 'link';
			else
				dropEffect = 'move';
		}
		else if(effectAllowed === 'all') {
			if(ctrlKey)
				dropEffect = 'copy';
			else if(altKey)
				dropEffect = 'link';
			else
				dropEffect = 'move';
		}
		return dropEffect;*/
	}
});

Core.Object.extend('Ui.DragNativeDataTransfer', {
	dataTransfer: undefined,
	dragWatcher: undefined,
	nativeData: undefined,
	dropEffect: 'none',
	position: undefined,

	constructor: function(config) {
		this.nativeData = new Ui.DragNativeData({ dataTransfer: this });
	},

	getPosition: function() {
		return this.position;
	},

	setPosition: function(position) {
		this.position = position;
	},

	getData: function() {
		return this.nativeData;
	},

	setDataTransfer: function(dataTransfer) {
		this.dataTransfer = dataTransfer;
	},

	capture: function(element, effect) {
		if((this.dragWatcher !== undefined) && (this.dragWatcher.getElement() === element))
			throw('Drag already captured by the given element');

		if(this.dragWatcher !== undefined)
			this.dragWatcher.leave();

		this.dragWatcher = new Ui.DragWatcher({ dataTransfer: this, element: element, effectAllowed: effect });
		return this.dragWatcher;
	},

	releaseDragWatcher: function(dragWatcher) {
		if(this.dragWatcher === dragWatcher) {
			this.dragWatcher.leave();
			this.dragWatcher = undefined;
		}
	}
});

Core.Object.extend('Ui.DragNativeManager', {
	app: undefined,
	dataTransfer: undefined,
	dragWatcher: undefined,
	nativeTarget: undefined,

	constructor: function(config) {
		this.app = config.app;
		delete(config.app);

		this.dataTransfer = new Ui.DragNativeDataTransfer();

		this.connect(this.app.getDrawing(), 'dragover', this.onDragOver);
		this.connect(this.app.getDrawing(), 'dragenter', this.onDragEnter);
		this.connect(this.app.getDrawing(), 'dragleave', this.onDragLeave);
		this.connect(this.app.getDrawing(), 'drop', this.onDrop);
	},

	onDragOver: function(event) {
		this.dataTransfer.setDataTransfer(event.dataTransfer);
		this.dataTransfer.setPosition(new Ui.Point({ x: event.clientX, y: event.clientY }));

		var overElement = this.app.elementFromPoint(event.clientX, event.clientY);

		if(overElement !== undefined) {
			var dragEvent = new Ui.DragEvent({
				type: 'dragover',  clientX: event.clientX, clientY: event.clientY,
				dataTransfer: this.dataTransfer
			});
			dragEvent.dispatchEvent(overElement);

			if((this.dataTransfer.dragWatcher !== undefined) &&
			   !overElement.getIsChildOf(this.dataTransfer.dragWatcher.getElement())) {
				this.dataTransfer.dragWatcher.leave();
				this.dataTransfer.dragWatcher = undefined;
			}
		}

		if(this.dataTransfer.dragWatcher !== undefined) {
			var dropEffect = Ui.DragDataTransfer.getMergedEffectAllowed(
				this.nativeToCustom(event.dataTransfer.effectAllowed), this.dataTransfer.dragWatcher.effectAllowed);
			this.dataTransfer.dragWatcher.move(event.clientX, event.clientY);
			event.dataTransfer.dropEffect = this.customToNative(dropEffect);
		}
		else
			event.dataTransfer.dropEffect = 'none';
		event.stopImmediatePropagation();
		event.preventDefault();
		return false;
	},


	onDragEnter: function(e) {
		this.nativeTarget = e.target;
	},

	onDragLeave: function(e) {
		if(this.nativeTarget !== e.target)
			return;
		this.nativeTarget = undefined;
			
		if(this.dataTransfer.dragWatcher !== undefined) {
			this.dataTransfer.dragWatcher.leave();
			this.dataTransfer.dragWatcher = undefined;
		}
	},

	onDrop: function(event) {
		this.dataTransfer.setDataTransfer(event.dataTransfer);
		if(this.dataTransfer.dragWatcher !== undefined) {
			this.dataTransfer.dragWatcher.leave();
			var dropEffect = Ui.DragDataTransfer.getMergedEffectAllowed(
				this.nativeToCustom(event.dataTransfer.effectAllowed), this.dataTransfer.dragWatcher.effectAllowed);
			event.dataTransfer.dropEffect = this.customToNative(dropEffect);
			if(dropEffect.length > 0)
				this.dataTransfer.dragWatcher.drop(dropEffect[0].action);
			this.dataTransfer.dragWatcher = undefined;
		}
		event.stopImmediatePropagation();
		event.preventDefault();
	},

	nativeToCustom: function(effectAllowed) {
		if(effectAllowed === 'copy')
			return [ 'copy' ];
		else if(effectAllowed === 'link')
			return [ 'link' ];
		else if(effectAllowed === 'move')
			return [ 'move' ];
		else if(effectAllowed === 'copyLink')
			return [ 'copy', 'link' ];
		else if(effectAllowed === 'copyMove')
			return [ 'move', 'copy' ];
		else if(effectAllowed === 'linkMove')
			return [ 'move', 'link' ];
		else if(effectAllowed === 'all')
			return [ 'move', 'copy', 'link' ];
	},

	customToNative: function(effectAllowed) {
		var containsLink = false;
		var containsCopy = false;
		var containsMove = false;
		for(var i = 0; i < effectAllowed.length; i++) {
			if(effectAllowed[i].action === 'link')
				containsLink = true;
			else if(effectAllowed[i].action === 'move')
				containsMove = true;
			else if(effectAllowed[i].action === 'copy')
				containsCopy = true;
		}
		if(containsLink && containsCopy && containsMove)
			return 'all';
		else if(containsLink && containsCopy)
			return 'copyLink';
		else if(containsLink && containsMove)
			return 'linkMove';
		else if(containsMove && containsCopy)
			return 'copyMove';
		else if(containsLink)
			return 'link';
		else if(containsMove)
			return 'move';
		else if(containsCopy)
			return 'copy';
		else
			return 'none';
	}
});
