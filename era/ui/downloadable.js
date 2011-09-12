Ui.LBox.extend('Ui.Downloadable', 
/**@lends Ui.Downloadable#*/
{
	content: undefined,
	link: undefined,
	isDown: false,
	mouseStartX: undefined,
	mouseStartY: undefined,
	forceTarget: true,

	/**
	 * @constructs
	 * @class
	 * @extends Ui.LBox
	 */
	constructor: function(config) {
		this.addEvents('down', 'up', 'download');

		if(config.src != undefined)
			this.setSrc(config.src);

		this.getDrawing().style.cursor = 'pointer';
		this.setFocusable(true);
		this.setRole('button');

		// handle mouse
		this.connect(this.getDrawing(), 'mousedown', this.onMouseDown);

		if('forceTarget' in config)
			this.setForceTarget(config.forceTarget);
	},

	setSrc: function(src) {
		this.link = src;
		this.getDrawing().setAttribute('href', src);
	},

	setContent: function(content) {
		if(this.content != content) {
			if(this.content != undefined)
				this.remove(this.content);
			if(content != undefined)
				this.append(content);
			this.content = content;
		}
	},

	setForceTarget: function(forceTarget) {
		this.forceTarget = forceTarget;
	},

	getIsDown: function() {
		return this.isDown;
	},

	onMouseDown: function(event) {
		if((event.button != 0) || this.getIsDisabled())
			return;

		this.getDrawing().setAttribute('href', this.link);

		event.preventDefault();
		event.stopPropagation();

		this.mouseStartX = event.screenX;
		this.mouseStartY = event.screenY;

		this.connect(window, 'mousemove', this.onMouseMove, true);
		this.connect(window, 'mouseup', this.onMouseUp, true);

		this.onDown();
	},

	onMouseMove: function(event) {
		var deltaX = event.screenX - this.mouseStartX;
		var deltaY = event.screenY - this.mouseStartY;
		var delta = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

		event.preventDefault();
		event.stopPropagation();

		// if the user move to much, release the touch event
		if(delta > 10) {
			this.disconnect(window, 'mousemove', this.onMouseMove, true);
			this.disconnect(window, 'mouseup', this.onMouseUp, true);

			this.onUp();

			this.getDrawing().removeAttribute('href');

			if('createEvent' in document) {
				this.disconnect(this.getDrawing(), 'mousedown', this.onMouseDown);

				var mouseDownEvent = document.createEvent('MouseEvents');
				mouseDownEvent.initMouseEvent('mousedown', true, true, window, 1, event.screenX, event.screenY,
					event.clientX, event.clientY,
					event.ctrlKey, event.altKey, event.shiftKey,
					event.metaKey, 0, event.target);
				event.target.dispatchEvent(mouseDownEvent);

				this.connect(this.getDrawing(), 'mousedown', this.onMouseDown);
			}
		}
	},

	onMouseUp: function(event) {
		if(!this.isDown)
			return;

		event.preventDefault();
		event.stopPropagation();

		if(event.button == 0) {
			this.disconnect(window, 'mousemove', this.onMouseMove, true);
			this.disconnect(window, 'mouseup', this.onMouseUp, true);

			this.getDrawing().setAttribute('href', this.link);
			this.onUp();
			this.fireEvent('download', this);
			this.focus();
		}
	},

	onClick: function(event) {
		console.log('onClick');
		this.fireEvent('download', this);
	},

	onDown: function() {
		this.isDown = true;
		this.focus();
		this.fireEvent('down', this);
	},

	onUp: function() {
		this.disconnect(window, 'mousemove', this.onMouseMove, true);
		this.disconnect(window, 'mouseup', this.onMouseUp, true);
 		this.isDown = false;
		this.fireEvent('up', this);
	}
}, 
/**@lends Ui.Downloadable#*/
{
	renderDrawing: function() {
		var linkDrawing = document.createElement('a');
		linkDrawing.style.display = 'block';
		linkDrawing.style.textDecoration = 'none';
		if('download' in linkDrawing)
			linkDrawing.download = true;
		else if(this.forceTarget)
			linkDrawing.target = 'download-'+Core.Util.generateId();
		return linkDrawing;
	}
});

