Core.Object.extend('Core.DragManager', 
/**@lends Core.DragManager#*/
{

	/**
    *   @constructs
	*	@class
    *   @extends Core.Object
	*/	
	constructor: function(config) {
		this.connect(window, 'mousedown', this.onMouseDown);
		this.connect(window, 'fingerdown', this.onFingerDown);

		Core.Event.registerEvent('DragEvent', Core.DragEvent);
		Core.Event.register('dragstart', Core.DragEvent);
		Core.Event.register('dragend', Core.DragEvent);
		Core.Event.register('dragenter', Core.DragEvent);
		Core.Event.register('dragover', Core.DragEvent);
		Core.Event.register('drop', Core.DragEvent);
	},

	onDragDown: function(target, x, y, event, mouse, finger) {
		var current = target;
		while((current != undefined) && ('getAttribute' in current) && !((current.getAttribute('draggable') === true) || (current.getAttribute('draggable') === 'true')))
			current = current.parentNode;
		if((current != undefined) && ('getAttribute' in current) && ((current.getAttribute('draggable') === true) || (current.getAttribute('draggable') === 'true')))
			new Core.DragDataTransfer({ draggable: current, x: x, y: y, event: event, mouse: mouse, finger: finger });
	},

	onMouseDown: function(event) {
		if(event.button != 0)
			return;
		this.onDragDown(event.target, event.clientX, event.clientY, event, true, undefined);
	},

	onFingerDown: function(event) {
		this.onDragDown(event.target, event.finger.getX(), event.finger.getY(), event, false, event.finger);
	}
});

Core.Event.extend('Core.DragEvent', 
/**@lends Core.DragEvent#*/
{
	dataTransfer: undefined,
	/**
    *   @constructs
	*	@class
    *   @extends Core.Event
	*/
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
	}
});