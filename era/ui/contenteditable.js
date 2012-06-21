
Ui.Element.extend('Ui.ContentEditable', {
	html: undefined,
	screenX: 0,
	screenY: 0,
	startTime: undefined,
	allowSelect: false,
	timer: undefined,
	hasHtmlFocus: false,
	
	constructor: function(config) {
		this.setSelectable(true);
		this.setFocusable(true);
//		this.getDrawing().style.outline = 'red none 0px';
//		this.getDrawing().style.borderBottom = 'solid red 1px';
//		this.getDrawing().style.borderRight = 'solid red 1px';
		this.getDrawing().setAttribute('contenteditable', 'true');
//		this.connect(this.getDrawing(), 'selectstart', this.onHtmlSelectStart);
		this.connect(this.getDrawing(), 'mousedown', this.onMouseDown);
		this.connect(this.getDrawing(), 'focus', this.onHtmlFocus);
		this.connect(this.getDrawing(), 'blur', this.onHtmlBlur);
		this.connect(this.getDrawing(), 'keypress', this.onHtmlKeyPress);

		this.connect(this.getDrawing(), 'touchstart', this.onTouchStart);
	},

	getHtml: function() {
		return this.getDrawing().innerHTML;
	},

	setHtml: function(html) {
		this.getDrawing().innerHTML = html;
		this.html = this.getDrawing().innerHTML;
		this.invalidateMeasure();
	},

	onSubtreeModified: function(event) {
		this.html = this.getDrawing().innerHTML;
		this.invalidateMeasure();
	},

	onKeyPress: function(event) {
		if(this.getDrawing().innerHTML != this.html) {
			this.html = this.getDrawing().innerHTML;
			this.invalidateMeasure();
		}
	},

	onTouchStart: function(event) {
		if(event.targetTouches.length == 1) {
			event.stopPropagation();

			this.connect(this.getDrawing(), 'touchmove', this.onTouchMove, true);
			this.connect(this.getDrawing(), 'touchend', this.onTouchEnd, true);

			if(this.timer != undefined) {
				this.timer.abort();
				this.timer = undefined;
			}
			this.timer = new Core.DelayedTask({	delay: 0.25, scope: this, callback: this.onTimer });
		}
	},

	onTouchMove: function(event) {
		if(!this.allowSelect) {
			if(this.timer != undefined) {
				this.timer.abort();
				this.timer = undefined;
			}
			this.disconnect(this.getDrawing(), 'touchmove', this.onTouchMove, true);
			this.disconnect(this.getDrawing(), 'touchend', this.onTouchEnd, true);			
		}
		else {
			if(this.hasHtmlFocus)
				event.stopPropagation();
		}
	},

	onTouchEnd: function(event) {
		event.stopPropagation();

		if(this.timer != undefined) {
			this.timer.abort();
			this.timer = undefined;
		}

		this.disconnect(this.getDrawing(), 'touchmove', this.onTouchMove, true);
		this.disconnect(this.getDrawing(), 'touchend', this.onTouchEnd, true);
		this.allowSelect = false;
	},

	onHtmlKeyPress: function(event) {
/*		console.log('keypress: '+event.which);
		if(event.which == 13) {
			event.stopPropagation();
			event.preventDefault();
		}*/
	},

	onHtmlFocus: function(event) {
		this.hasHtmlFocus = true;
		this.setSelectable(true);
		if(this.timer != undefined) {
			this.timer.abort();
			this.timer = undefined;
		}
		this.timer = new Core.DelayedTask({	delay: 0.25, scope: this, callback: this.onTimer });
	},

	onHtmlBlur: function(event) {
		this.hasHtmlFocus = false;
		if(this.timer != undefined) {
			this.timer.abort();
			this.timer = undefined;
		}
		this.allowSelect = false;
	},

	onTimer: function(timer) {
		this.allowSelect = true;
		this.timer = undefined;
	},

	onMouseDown: function(event) {
		this.setSelectable(true);
		event.stopPropagation();

		if(this.timer != undefined) {
			this.timer.abort();
			this.timer = undefined;
		}
		this.allowSelect = false;
		this.timer = new Core.DelayedTask({	delay: 0.25, scope: this, callback: this.onTimer });

		this.screenX = event.screenX;
		this.screenY = event.screenY;

		var currentTime = (new Date().getTime())/1000;
		this.startTime = currentTime;

		this.connect(window, 'mousemove', this.onMouseMove, true);
		this.connect(window, 'mouseup', this.onMouseUp, true);
	},

	onMouseMove: function(event) {
		if(!this.allowSelect) {
			var deltaX = event.screenX - this.screenX;
			var deltaY = event.screenY - this.screenY;
			var delta = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

			event.stopPropagation();
			event.preventDefault();

			// if the user move to much, release the touch event
			if(delta > 10) {
				if(this.timer != undefined) {
					this.timer.abort();
					this.timer = undefined;
				}

				var selection = window.getSelection();
				selection.removeAllRanges();
				this.setSelectable(false);

				this.disconnect(window, 'mousemove', this.onMouseMove, true);
				this.disconnect(window, 'mouseup', this.onMouseUp, true);
	
				var mouseDownEvent = document.createEvent('MouseEvents');
				mouseDownEvent.initMouseEvent('mousedown', true, true, window, 1, event.screenX, event.screenY,
					event.clientX, event.clientY,
					event.ctrlKey, event.altKey, event.shiftKey,
					event.metaKey, 0, event.target);
				this.getDrawing().offsetParent.dispatchEvent(mouseDownEvent);
			}
		}
		else
			event.stopPropagation();
	},

	onMouseUp: function(event) {
		if(this.timer != undefined) {
			this.timer.abort();
			this.timer = undefined;
		}
		this.disconnect(window, 'mousemove', this.onMouseMove, true);
		this.disconnect(window, 'mouseup', this.onMouseUp, true);
	},

	onHtmlSelectStart: function(event) {
		event.stopPropagation();
	}

}, {
	renderDrawing: function() {
		var drawing = document.createElement('div');
		drawing.style.display = 'block';
		drawing.style.position = 'absolute';
		drawing.style.left = '0px';
		drawing.style.top = '0px';
		this.connect(drawing, 'DOMSubtreeModified', this.onSubtreeModified);
		this.connect(drawing, 'keypress', this.onKeyPress);
		return drawing;
	},

	measureCore: function(width, height) {
		var div = document.createElement('div');
		div.style.display = 'block';
		div.style.visibility = 'hidden';
		div.style.position = 'absolute';
		div.style.left = '0px';
		div.style.top = '0px';
		if(this.getWidth() != undefined)
			div.style.width = this.getWidth()+'px';
		div.innerHTML = this.getDrawing().innerHTML;
		document.body.appendChild(div);
		var needWidth = div.clientWidth;
		var needHeight = div.clientHeight;
		document.body.removeChild(div);

		return { width: needWidth, height: needHeight };
	}
});

