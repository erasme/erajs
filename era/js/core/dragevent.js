

Core.Event.extend('Core.DragEvent', {
	dataTransfer: undefined,

	constructor: function(config) {
	},

	initDragEvent: function(type, canBubble, cancelable, view, dataTransfer, screenX, screenY, clientX, clientY, ctrlKey, altKey, shiftKey, metaKey) {
		this.type = type;
		this.bubbles = canBubble;
		this.cancelable = cancelable;
		this.view = view;
		this.dataTransfer = dataTransfer;
		this.screenX = screenX;
		this.screenY = screenY;
		this.clientX = clientX;
		this.clientY = clientY;
		this.ctrlKey = ctrlKey;
		this.altKey = altKey;
		this.shiftKey = shiftKey;
		this.metaKey = metaKey
	},
});

Core.Object.extend('Core.DragDataTransfer', {
	dropEffect: 'none',
	type: undefined,
	data: undefined,

	constructor: function(config) {
		this.data = {};
	},

	setData: function(type, data) {
		this.data[type] = data;
	},

	getData: function(type) {
		return this.data[type];
	},

	hasData: function() {
		var check = false;
		for(var i in this.data)
			check = true;
		return check;
	}
});


Core.Object.extend('Core.DragManager', {
	draggable: undefined,
	image: undefined,
	startX: 0,
	startY: 0,
	startImageX: 0,
	startImageY: 0,
	startImagePoint: undefined,
	overElement: undefined,
	dataTransfer: undefined,

	constructor: function(config) {
		this.connect(window, 'mousedown', this.onMouseDown);

		Core.Event.registerEvent('DragEvent', Core.DragEvent);
		Core.Event.register('dragstart', Core.DragEvent);
		Core.Event.register('dragend', Core.DragEvent);
		Core.Event.register('dragenter', Core.DragEvent);
		Core.Event.register('dragover', Core.DragEvent);
		Core.Event.register('drop', Core.DragEvent);
	},

	onMouseDown: function(event) {
//		console.log('DragManager.onMouseDown target: '+event.target.className);

		if(event.button != 0)
			return;

		var current = event.target;
		while((current != undefined) && ('getAttribute' in current) && !current.getAttribute('draggable')) {
			current = current.parentNode;
		}
//		console.log('found: '+current.className);

		if((current != undefined) && ('getAttribute' in current)) {

			this.draggable = current;
			this.dataTransfer = new Core.DragDataTransfer();

			var dragEvent = document.createEvent('DragEvent');
			dragEvent.initDragEvent('dragstart', false, true, event.window, this.dataTransfer, event.screenX, event.screenY, event.clientX, event.clientY, event.ctrlKey, event.altKey, event.shiftKey, event.metaKey);
			current.dispatchEvent(dragEvent);

			if(this.dataTransfer.hasData()) {
				console.log('dataTransfer.hasData');

				event.preventDefault();
				event.stopPropagation();

				this.image = this.draggable.cloneNode(true);
				document.body.appendChild(this.image);

				this.connect(window, 'mouseup', this.onMouseUp, true);
				this.connect(window, 'mousemove', this.onMouseMove, true);

				this.startX = event.clientX;
				this.startY = event.clientY;
				this.startImagePoint = Ui.Element.pointToWindow(this.draggable, { x: 0, y: 0});
				this.image.style.left = this.startImagePoint.x+'px';
				this.image.style.top = this.startImagePoint.y+'px';
			}
			else {
				this.draggable = null;
				this.dataTransfer = null;
			}
		}
	},

	onMouseMove: function(event) {
		event.preventDefault();
		event.stopPropagation();

		document.body.removeChild(this.image);
		var overElement = document.elementFromPoint(event.clientX, event.clientY);
		document.body.appendChild(this.image);

//		console.log('move over: '+element.className+', pos: '+event.clientX+' x '+event.clientY);
//		console.log('move over: '+event.target.className);

		var deltaX = event.clientX - this.startX;
		var deltaY = event.clientY - this.startY;

		this.image.style.left = (this.startImagePoint.x + deltaX)+'px';
		this.image.style.top = (this.startImagePoint.y + deltaY)+'px';

		if(overElement == undefined) {
		}
		else {
			var dragEvent = document.createEvent('DragEvent');
			if(this.overElement != overElement)
				dragEvent.initDragEvent('dragenter', true, true, event.window, this.dataTransfer, event.screenX, event.screenY, event.clientX, event.clientY, event.ctrlKey, event.altKey, event.shiftKey, event.metaKey);
			else
				dragEvent.initDragEvent('dragover', true, true, event.window, this.dataTransfer, event.screenX, event.screenY, event.clientX, event.clientY, event.ctrlKey, event.altKey, event.shiftKey, event.metaKey);
			overElement.dispatchEvent(dragEvent);
		}
		this.overElement = overElement;

	},

	onMouseUp: function(event) {
		event.preventDefault();
		event.stopPropagation();

		if(event.button != 0)
			return;

		this.disconnect(window, 'mouseup', this.onMouseUp, true);
		this.disconnect(window, 'mousemove', this.onMouseMove, true);

		document.body.removeChild(this.image);

		if(this.overElement != undefined) {
			var dragEvent = document.createEvent('DragEvent');
			dragEvent.initDragEvent('drop', false, true, event.window, this.dataTransfer, event.screenX, event.screenY, event.clientX, event.clientY, event.ctrlKey, event.altKey, event.shiftKey, event.metaKey);
			this.overElement.dispatchEvent(dragEvent);
		}

		var dragEvent = document.createEvent('DragEvent');
		dragEvent.initDragEvent('dragend', false, true, event.window, this.dataTransfer, event.screenX, event.screenY, event.clientX, event.clientY, event.ctrlKey, event.altKey, event.shiftKey, event.metaKey);
		this.draggable.dispatchEvent(dragEvent);
	}
});



navigator.supportDrag = false;

if(!navigator.supportDrag) {
//	new Core.DragManager();
}
