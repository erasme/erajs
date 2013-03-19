Ui.Element.extend('Ui.Html', 
/**@lends Ui.Html#*/
{
	htmlDrawing: undefined,
	html: undefined,
	mouseTarget: undefined,

	/**
	 * @constructs
	 * @class
	 * @extends Ui.Element
	 */
	constructor: function(config) {
		this.addEvents('link');
	},

	getHtml: function() {
		return this.htmlDrawing.innerHTML;
	},
	
	getElements: function(tagName) {
		var res = [];
		this.searchElements(tagName.toUpperCase(), this.htmlDrawing, res);
		return res;
	},
	
	searchElements: function(tagName, element, res) {
		for(var i = 0; i < element.childNodes.length; i++) {
			var child = element.childNodes[i];
			if(('tagName' in child) && (child.tagName.toUpperCase() == tagName))
				res.push(child);
			this.searchElements(tagName, child, res);
		}
	},
	
	getParentElement: function(tagName, element) {
		do {
			if(('tagName' in element) && (element.tagName.toUpperCase() == tagName))
				return element;
			if(element.parentNode == undefined)
				return undefined;
			element = element.parentNode;
		} while(true);
	},

	setHtml: function(html) {
		// remove old callbacks
		var tab = this.getElements('A');
		for(var i = 0; i < tab.length; i++) {
			// handle mouse
			this.disconnect(tab[i], 'mousedown', this.onLinkMouseDown);
			this.disconnect(tab[i], 'click', this.onLinkClick);
			// handle touches
			this.disconnect(tab[i], 'fingerdown', this.onLinkFingerDown);
		}
		tab = this.getElements('IMG');
		for(var i = 0; i < tab.length; i++)
			this.disconnect(tab[i], 'load', this.onImageLoad);
		// update HTML content
		this.htmlDrawing.innerHTML = html;
		this.html = this.htmlDrawing.innerHTML;
		// connect link callbacks
		tab = this.getElements('A');
		for(var i = 0; i < tab.length; i++) {
			tab[i].htmlHref = tab[i].href;
			// handle mouse
			this.connect(tab[i], 'mousedown', this.onLinkMouseDown);
			this.connect(tab[i], 'click', this.onLinkClick);
			// handle touches
			this.connect(tab[i], 'fingerdown', this.onLinkFingerDown);
		}
		tab = this.getElements('IMG');
		for(var i = 0; i < tab.length; i++)
			this.connect(tab[i], 'load', this.onImageLoad);
		this.invalidateMeasure();
	},
	
	setText: function(text) {
		if('textContent' in this.htmlDrawing)
			this.htmlDrawing.textContent = text;
		else
			this.htmlDrawing.innerText = text;
		this.html = this.htmlDrawing.innerHTML;	
		this.invalidateMeasure();
	},
	
	getText: function() {
		if('textContent' in this.htmlDrawing)
			return this.htmlDrawing.textContent;
		else
			return this.htmlDrawing.innerText;
	},

	onSubtreeModified: function(event) {
		this.html = this.htmlDrawing.innerHTML;
		this.invalidateMeasure();
	},

	onKeyPress: function(event) {
		if(this.htmlDrawing.innerHTML != this.html) {
			this.html = this.htmlDrawing.innerHTML;
			this.invalidateMeasure();
		}
	},
	
	onLinkClick: function(event) {
		event.preventDefault();
		event.stopPropagation();
	},
	
	onLinkMouseDown: function(event) {
		if((event.button != 0) || this.getIsDisabled())
			return;

		var target = this.getParentElement('A', event.target);
		if(target == undefined)
			return;
		event.preventDefault();
		event.stopPropagation();
		
		this.mouseTarget = target;
		
		target.mouseStartX = event.screenX;
		target.mouseStartY = event.screenY;
		target.isDown = true;

		this.connect(window, 'mousemove', this.onLinkMouseMove, true);
		this.connect(window, 'mouseup', this.onLinkMouseUp, true);
	},

	onLinkMouseMove: function(event) {
		var target = this.mouseTarget;
		
		var deltaX = event.screenX - target.mouseStartX;
		var deltaY = event.screenY - target.mouseStartY;
		var delta = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

		event.preventDefault();
		event.stopPropagation();
		
		// if the user move to much, release the touch event
		if(delta > 10) {
			this.disconnect(window, 'mousemove', this.onLinkMouseMove, true);
			this.disconnect(window, 'mouseup', this.onLinkMouseUp, true);
			
			target.isDown = false;

			if('createEvent' in document) {
				this.disconnect(target, 'mousedown', this.onLinkMouseDown);

				var mouseDownEvent = document.createEvent('MouseEvents');
				mouseDownEvent.initMouseEvent('mousedown', true, true, window, 1, event.screenX, event.screenY,
					event.clientX, event.clientY,
					event.ctrlKey, event.altKey, event.shiftKey,
					event.metaKey, 0, event.target);
				event.target.dispatchEvent(mouseDownEvent);

				this.connect(target, 'mousedown', this.onLinkMouseDown);
			}
		}
	},

	onLinkMouseUp: function(event) {
		var target = this.mouseTarget;
		
		if(!target.isDown)
			return;
		
		event.preventDefault();
		event.stopPropagation();

		if(event.button == 0) {
			this.disconnect(window, 'mousemove', this.onLinkMouseMove, true);
			this.disconnect(window, 'mouseup', this.onLinkMouseUp, true);
			this.fireEvent('link', this, target.htmlHref);
		}
	},
	
	onLinkFingerDown: function(event) {
		var target = this.getParentElement('A', event.target);
		if(target == undefined)
			return;
		if(this.getIsDisabled() || target.isDown)
			return;

		this.connect(event.finger, 'fingermove', this.onLinkFingerMove);
		this.connect(event.finger, 'fingerup', this.onLinkFingerUp);

		event.finger.capture(target);

		event.preventDefault();
		event.stopPropagation();

		target.touchStartX = event.finger.getX();
		target.touchStartY = event.finger.getY();
		target.isDown = true;
	},

	onLinkFingerMove: function(event) {
		var target = event.finger.getCaptureElement();
	
		event.preventDefault();
		event.stopPropagation();

		var deltaX = event.finger.getX() - target.touchStartX;
		var deltaY = event.finger.getY() - target.touchStartY;
		var delta = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

		// if the user move to much, release the touch event
		if(delta > 10) {
			this.disconnect(event.finger, 'fingermove', this.onLinkFingerMove);
			this.disconnect(event.finger, 'fingerup', this.onLinkFingerUp);
			target.isDown = false;

			this.disconnect(target, 'fingerdown', this.onLinkFingerDown);
			event.finger.release();
			this.connect(target, 'fingerdown', this.onLinkFingerDown);
		}
	},
	
	onLinkFingerUp: function(event) {
		var target = event.finger.getCaptureElement();
	
		this.disconnect(event.finger, 'fingermove', this.onLinkFingerMove);
		this.disconnect(event.finger, 'fingerup', this.onLinkFingerUp);

		event.preventDefault();
		event.stopPropagation();

		target.isDown = false;
		this.fireEvent('link', this, target.htmlHref);
	},
	
	onImageLoad: function(event) {
		this.invalidateMeasure();
	}

}, {
	render: function() {
		this.htmlDrawing = document.createElement('div');
		this.htmlDrawing.style.display = 'block';
		this.htmlDrawing.style.position = 'absolute';
		this.htmlDrawing.style.left = '0px';
		this.htmlDrawing.style.top = '0px';
		this.connect(this.htmlDrawing, 'DOMSubtreeModified', this.onSubtreeModified);
		this.connect(this.htmlDrawing, 'keypress', this.onKeyPress);
		return this.htmlDrawing;
	},

	measureCore: function(width, height) {
		var div = document.createElement('div');
		div.style.display = 'block';
		div.style.visibility = 'hidden';
		div.style.position = 'absolute';
		div.style.left = '0px';
		div.style.top = '0px';
		div.style.width = ((this.getWidth() != undefined)?Math.max(width,this.getWidth()):width)+'px';
		div.innerHTML = this.htmlDrawing.innerHTML;
		document.body.appendChild(div);
		var needWidth = div.clientWidth;
		var needHeight = div.clientHeight;
		document.body.removeChild(div);
		return { width: needWidth, height: needHeight };
	},

	arrangeCore: function(width, height) {
		this.htmlDrawing.style.width = width+'px';
		this.htmlDrawing.style.height = height+'px';
	}
});

