
Ui.Element.extend('Ui.ContentEditable', {
	html: undefined,
	screenX: 0,
	screenY: 0,
	startTime: undefined,
	allowSelect: false,
	timer: undefined,
//	hasHtmlFocus: false,
	anchorNode: null,
	anchorOffset: 0,
	
	constructor: function(config) {
		this.addEvents('anchorchange');

		this.setSelectable(true);
		this.setFocusable(true);
//		this.getDrawing().style.outline = 'red none 0px';
//		this.getDrawing().style.borderBottom = 'solid red 1px';
//		this.getDrawing().style.borderRight = 'solid red 1px';
		this.getDrawing().setAttribute('contenteditable', 'true');
//		this.connect(this.getDrawing(), 'selectstart', this.onHtmlSelectStart);
		this.connect(this.getDrawing(), 'mousedown', this.onMouseDown);
//		this.connect(this.getDrawing(), 'focus', this.onHtmlFocus);
//		this.connect(this.getDrawing(), 'blur', this.onHtmlBlur);
//		this.connect(this.getDrawing(), 'keypress', this.onHtmlKeyPress);
		this.connect(this.getDrawing(), 'keyup', this.onKeyUp);

		this.connect(this.getDrawing(), 'touchstart', this.onTouchStart);
		this.connect(this.getDrawing(), 'touchend', this.onTouchEndCapture, true);
	},

	getHtml: function() {
		return this.getDrawing().innerHTML;
	},

	setHtml: function(html) {
		this.getDrawing().innerHTML = html;
		this.html = this.getDrawing().innerHTML;
		this.invalidateMeasure();
	},

	getTextContent: function(el) {
		var text = '';		
		if(el.nodeType === 3)
			text += el.textContent;
		else if((el.nodeType === 1) && (el.nodeName == "BR"))
			text += '\n';
		if('childNodes' in el) {
			for(var i = 0; i < el.childNodes.length; i++)
				text += this.getTextContent(el.childNodes[i]);
		}
		return text;
	},

	getText: function() {
		return ('innerText' in this.getDrawing())?this.getDrawing().innerText:this.getTextContent(this.getDrawing());
	},

	onKeyUp: function(event) {
		this.testAnchorChange();
	},

	onSubtreeModified: function(event) {
		this.testAnchorChange();
		this.html = this.getDrawing().innerHTML;
		this.invalidateMeasure();
	},

	onKeyPress: function(event) {
		if(this.getDrawing().innerHTML != this.html) {
			this.html = this.getDrawing().innerHTML;
			this.invalidateMeasure();
		}
	},

	onTouchEndCapture: function() {
		new Core.DelayedTask({ scope: this, delay: 0, callback: function() {
			this.testAnchorChange();
		}});
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
			this.timer = new Core.DelayedTask({	delay: 0.5, scope: this, callback: this.onTimer });
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
//		else {
//			if(this.hasHtmlFocus)
//				event.stopPropagation();
//		}
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
//		console.log('onHtmlKeyPress');

/*		console.log('keypress: '+event.which);
		if(event.which == 13) {
			event.stopPropagation();
			event.preventDefault();
		}*/
	},

/*	onHtmlFocus: function(event) {
		console.log('onHtmlFocus');
		this.hasHtmlFocus = true;
		this.setSelectable(true);
		if(this.timer != undefined) {
			this.timer.abort();
			this.timer = undefined;
		}
		this.timer = new Core.DelayedTask({	delay: 0.25, scope: this, callback: this.onTimer });
	},

	onHtmlBlur: function(event) {
		console.log('onHtmlBlur');
		this.hasHtmlFocus = false;
		if(this.timer != undefined) {
			this.timer.abort();
			this.timer = undefined;
		}
		this.allowSelect = false;
	},*/

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
		this.timer = new Core.DelayedTask({	delay: 0.50, scope: this, callback: this.onTimer });

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
		this.testAnchorChange();

		if(this.timer != undefined) {
			this.timer.abort();
			this.timer = undefined;
		}
		this.disconnect(window, 'mousemove', this.onMouseMove, true);
		this.disconnect(window, 'mouseup', this.onMouseUp, true);
	},

	testAnchorChange: function() {
		if((window.getSelection().anchorNode != this.anchorNode) ||
			(window.getSelection().anchorOffset != this.anchorOffset)) {
			this.anchorNode = window.getSelection().anchorNode;
			this.anchorOffset = window.getSelection().anchorOffset;
//			console.log('anchor changed (offset: '+this.anchorOffset+')');
			this.fireEvent('anchorchange', this);
		}
	}

//	onHtmlSelectStart: function(event) {
//		event.stopPropagation();
//	}

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
		div.style.fontSize = this.getStyleProperty('fontSize')+'px';
		div.style.fontFamily = this.getStyleProperty('fontFamily');
		div.style.fontWeight = this.getStyleProperty('fontWeight');
		
		if(this.getWidth() != undefined)
			div.style.width = this.getWidth()+'px';
		div.innerHTML = this.getDrawing().innerHTML;
		document.body.appendChild(div);
		var needWidth = div.clientWidth;
		var needHeight = div.clientHeight;
		document.body.removeChild(div);

		return { width: needWidth, height: needHeight };
	},
	
	onStyleChange: function() {
		var color = Ui.Color.create(this.getStyleProperty('color'));
		this.getDrawing().style.fontSize = this.getStyleProperty('fontSize')+'px';
		this.getDrawing().style.fontFamily = this.getStyleProperty('fontFamily');
		this.getDrawing().style.fontWeight = this.getStyleProperty('fontWeight');
		if(navigator.supportRgba)
			this.getDrawing().style.color = color.getCssRgba();
		else
			this.getDrawing().style.color = color.getCssHtml();
		this.invalidateMeasure();
	}
}, {
	style: {
		color: new Ui.Color({ r: 0, g: 0, b: 0 }),
		fontSize: 18,
		fontFamily: 'Sans-serif',
		fontWeight: 'normal'
	}
});

