
Ui.Event.extend('Ui.WheelEvent', {
	deltaX: 0,
	deltaY: 0,
	clientX: 0,
	clientY: 0,
	ctrlKey: false,
	altKey: false,
	shiftKey: false,
	metaKey: false,

	constructor: function(config) {
		this.setType('wheel')
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
	}
});

Core.Object.extend('Ui.WheelManager', {
	captureElement: undefined,
	app: undefined,

	/**
	 * @constructs
	 * @class
	 * @extends Core.Object
	 */
	constructor: function(config) {
		this.app = config.app;
		delete(config.app);

		this.connect(this.app.getDrawing(), 'mousewheel', this.onMouseWheel);
		this.connect(this.app.getDrawing(), 'DOMMouseScroll', this.onMouseWheel);
	},

	onMouseWheel: function(event) {
		var deltaX = 0;
		var deltaY = 0;

		if((event.wheelDeltaX != undefined) && (event.wheelDeltaY != undefined)) {
			deltaX = -event.wheelDeltaX / 5;
			deltaY = -event.wheelDeltaY / 5;
		}
		// Opera, Chrome, IE
		else if(event.wheelDelta != undefined)
			deltaY = -event.wheelDelta / 2;
		// Firefox
		else if(event.detail != undefined)
			deltaY = event.detail * 20;

		var target = Ui.App.current.elementFromPoint(event.clientX, event.clientY);

		if(target !== undefined) {
			var wheelEvent = new Ui.WheelEvent({
				clientX: event.clientX, clientY: event.clientY,
				deltaX: deltaX, deltaY: deltaY,
				ctrlKey: event.ctrlKey, altKey: event.altKey, shiftKey: event.shiftKey, metaKey: event.metaKey
			});
			wheelEvent.dispatchEvent(target);
			event.preventDefault();
		}
	}
});

