
Ui.Container.extend('Ui.Scrollable', {	
	contentBox: undefined,
	scrollHorizontal: true,
	scrollVertical: true,
	scrollbarHorizontalBox: undefined,
	scrollbarHorizontal: undefined,
	scrollbarVerticalBox: undefined,
	scrollbarVertical: undefined,
	showShadows: false,

	constructor: function(config) {
		this.addEvents('scroll');
		this.contentBox = new Ui.ScrollableContent();
		this.connect(this.contentBox, 'scroll', this.onScroll);
		this.appendChild(this.contentBox);

		if(Ui.ScrollableContent.emulatedScrollbars) {
			this.scrollbarHorizontalBox = new Ui.LBox();
			this.appendChild(this.scrollbarHorizontalBox);

			this.scrollbarVerticalBox = new Ui.LBox();
			this.appendChild(this.scrollbarVerticalBox);

			this.connect(this.scrollbarHorizontalBox.getDrawing(), 'mousedown', this.onHorizontalMouseDown);
			this.connect(this.scrollbarVerticalBox.getDrawing(), 'mousedown', this.onVerticalMouseDown);
		}
	},

	setContent: function(content) {
		this.contentBox.setContent(content);
	},

	getContent: function() {
		return this.contentBox.getContent();
	},

	getScrollHorizontal: function() {
		return this.scrollHorizontal;
	},

	setScrollHorizontal: function(scroll) {
		if(scroll != this.scrollHorizontal) {
			this.scrollHorizontal = scroll;
			this.invalidateMeasure();
		}
	},

	getScrollVertical: function() {
		return this.scrollVertical;
	},

	setScrollVertical: function(scroll) {
		if(scroll != this.scrollVertical) {
			this.scrollVertical = scroll;
			this.invalidateMeasure();
		}
	},

	setScrollbarVertical: function(scrollbarVertical) {
		if(Ui.ScrollableContent.emulatedScrollbars && (this.scrollbarVertical !== scrollbarVertical)) {
			if(this.scrollbarVertical !== undefined)
				this.scrollbarVerticalBox.remove(this.scrollbarVertical);
			this.scrollbarVertical = scrollbarVertical;
			if(this.scrollbarVertical !== undefined)
				this.scrollbarVerticalBox.append(this.scrollbarVertical);
		}
	},

	setScrollbarHorizontal: function(scrollbarHorizontal) {
		if(Ui.ScrollableContent.emulatedScrollbars && (this.scrollbarHorizontal !== scrollbarHorizontal)) {
			if(this.scrollbarHorizontal !== undefined)
				this.scrollbarHorizontalBox.remove(this.scrollbarHorizontal);
			this.scrollbarHorizontal = scrollbarHorizontal;
			if(this.scrollbarHorizontal !== undefined)
				this.scrollbarHorizontalBox.append(this.scrollbarHorizontal);
		}
	},
	
	setOffset: function(offsetX, offsetY, absolute, force) {

		if(absolute === undefined)
			absolute = false;
		if(offsetX === undefined)
			offsetX = this.offsetX;
		else if(!absolute)
			offsetX *= this.contentWidth - this.viewWidth;
		if(offsetY === undefined)
			offsetY = this.offsetY;
		else if(!absolute)
				offsetY *= this.contentHeight - this.viewHeight;

		if(offsetX < 0)
			offsetX = 0;
		else if(this.viewWidth + offsetX > this.contentWidth)
			offsetX = this.contentWidth - this.viewWidth;
		if(offsetY < 0)
			offsetY = 0;
		else if(this.viewHeight + offsetY > this.contentHeight)
			offsetY = this.contentHeight - this.viewHeight;
			
		this.relativeOffsetX = offsetX / (this.contentWidth - this.viewWidth);
		this.relativeOffsetY = offsetY / (this.contentHeight - this.viewHeight);

		if((this.offsetX !== offsetX) || (this.offsetY !== offsetY)) {
			this.offsetX = offsetX;
			this.offsetY = offsetY;
			this.contentBox.setOffset(offsetX, offsetY);
			return true;
		}
		else
			return false;
	},

	getOffsetX: function() {
		return this.contentBox.getOffsetX();
	},

	getRelativeOffsetX: function() {
		return this.relativeOffsetX;
	},

	getOffsetY: function() {
		return this.contentBox.getOffsetY();
	},
	
	getRelativeOffsetY: function() {
		return this.relativeOffsetY;
	},

	onScroll: function() {
		this.updateOffset();
		this.fireEvent('scroll', this, this.offsetX, this.offsetY);
	},

	updateOffset: function() {
		if(this.contentBox === undefined)
			return;

		this.offsetX = this.contentBox.getOffsetX();
		this.offsetY = this.contentBox.getOffsetY();

		this.viewWidth = this.getLayoutWidth();
		this.viewHeight = this.getLayoutHeight();

		this.contentWidth = this.contentBox.getContent().getLayoutWidth();
		this.contentHeight = this.contentBox.getContent().getLayoutHeight();

		this.relativeOffsetX = this.offsetX / (this.contentWidth - this.viewWidth);
		this.relativeOffsetY = this.offsetY / (this.contentHeight - this.viewHeight);

		if(Ui.ScrollableContent.emulatedScrollbars) {
			if(this.scrollbarHorizontalNeeded) {
				var relOffsetX = this.offsetX / (this.contentWidth - this.viewWidth);
				if(relOffsetX > 1) {
					relOffsetX = 1;
					this.setOffset(relOffsetX, undefined);
				}
				this.scrollbarHorizontalBox.setTransform(Ui.Matrix.createTranslate((this.viewWidth - this.scrollbarHorizontalWidth) * relOffsetX, 0));
			}
			if(this.scrollbarVerticalNeeded) {
				var relOffsetY = this.offsetY / (this.contentHeight - this.viewHeight);
				if(relOffsetY > 1) {
					relOffsetY = 1;
					this.setOffset(undefined, relOffsetY);
				}
				this.scrollbarVerticalBox.setTransform(Ui.Matrix.createTranslate(0, (this.viewHeight - this.scrollbarVerticalHeight) * relOffsetY));
			}
		}
	},

	onVerticalMouseDown: function(event) {
		if(this.lock || this.getIsDisabled())
			return;

		if(event.button != 0)
			return;
		
		event.preventDefault();
		event.stopPropagation();

		this.window = window;
		this.iframe = undefined;
		if(navigator.isWebkit || navigator.isFirefox3) {
			var rootWindow = Ui.App.getRootWindow();
			if(rootWindow != window) {
				this.window = rootWindow;
				this.iframe = Ui.App.getWindowIFrame();
			}
		}

		this.connect(this.window, 'mouseup', this.onVerticalMouseUp, true);
		this.connect(this.window, 'mousemove', this.onVerticalMouseMove, true);

		this.catcher = document.createElement('div');
		this.catcher.style.position = 'absolute';
		this.catcher.style.left = '0px';
		this.catcher.style.right = '0px';
		this.catcher.style.top = '0px';
		this.catcher.style.bottom = '0px';
		this.catcher.style.zIndex = 1000;
		this.window.document.body.appendChild(this.catcher);

		this.mouseStart = this.pointFromWindow({ x: event.clientX, y: event.clientY });
		this.startOffsetX = this.offsetX;
		this.startOffsetY = this.offsetY;
		this.speedX = 0;
		this.speedY = 0;
	},

	onVerticalMouseMove: function(event) {
		event.preventDefault();
		event.stopPropagation();

		var point = { x: event.clientX, y: event.clientY };
		if(this.iframe != undefined)
			point = Ui.Element.pointFromWindow(this.iframe, { x: event.clientX, y: event.clientY }, this.window);
		var mousePos = this.pointFromWindow(point);
		var deltaY = mousePos.y - this.mouseStart.y;

		var totalHeight = this.viewHeight - this.scrollbarVerticalBox.getLayoutHeight();
		var offsetY = this.startOffsetY + ((deltaY / totalHeight) * (this.contentHeight - this.viewHeight));
		this.setOffset(undefined, offsetY, true);
	},

	onVerticalMouseUp: function(event) {
		event.preventDefault();
		event.stopPropagation();

		if(event.button != 0)
			return;

		this.window.document.body.removeChild(this.catcher);

		this.disconnect(this.window, 'mousemove', this.onVerticalMouseMove, true);
		this.disconnect(this.window, 'mouseup', this.onVerticalMouseUp, true);
	},

	onHorizontalMouseDown: function(event) {
		if(this.lock || this.getIsDisabled())
			return;

		if(event.button != 0)
			return;
		
		event.preventDefault();
		event.stopPropagation();

		this.window = window;
		this.iframe = undefined;
		if(navigator.isWebkit || navigator.isFirefox3) {
			var rootWindow = Ui.App.getRootWindow();
			if(rootWindow != window) {
				this.window = rootWindow;
				this.iframe = Ui.App.getWindowIFrame();
			}
		}

		this.connect(this.window, 'mouseup', this.onHorizontalMouseUp, true);
		this.connect(this.window, 'mousemove', this.onHorizontalMouseMove, true);

		this.catcher = document.createElement('div');
		this.catcher.style.position = 'absolute';
		this.catcher.style.left = '0px';
		this.catcher.style.right = '0px';
		this.catcher.style.top = '0px';
		this.catcher.style.bottom = '0px';
		this.catcher.style.zIndex = 1000;
		this.window.document.body.appendChild(this.catcher);

		this.mouseStart = this.pointFromWindow({ x: event.clientX, y: event.clientY });
		this.startOffsetX = this.offsetX;
		this.startOffsetY = this.offsetY;
		this.speedX = 0;
		this.speedY = 0;
	},

	onHorizontalMouseMove: function(event) {
		event.preventDefault();
		event.stopPropagation();

		var point = { x: event.clientX, y: event.clientY };
		if(this.iframe != undefined)
			point = Ui.Element.pointFromWindow(this.iframe, { x: event.clientX, y: event.clientY }, this.window);
		var mousePos = this.pointFromWindow(point);
		var deltaX = mousePos.x - this.mouseStart.x;

		var totalWidth = this.viewWidth - this.scrollbarHorizontalBox.getLayoutWidth();
		var offsetX = this.startOffsetX + ((deltaX / totalWidth) * (this.contentWidth - this.viewWidth));
		this.setOffset(offsetX, undefined, true);
	},

	onHorizontalMouseUp: function(event) {
		event.preventDefault();
		event.stopPropagation();

		if(event.button != 0)
			return;

		this.window.document.body.removeChild(this.catcher);

		this.disconnect(this.window, 'mousemove', this.onHorizontalMouseMove, true);
		this.disconnect(this.window, 'mouseup', this.onHorizontalMouseUp, true);
	}
	
}, {
	renderDrawing: function() {
		var drawing = Ui.Scrollable.base.renderDrawing.apply(this, arguments);
		drawing.style.overflow = 'hidden';
		return drawing;
	},

	measureCore: function(width, height) {
		var size = { width: 0, height: 0 };

		if(Ui.ScrollableContent.emulatedScrollbars) {
			this.scrollbarHorizontalBox.measure(width, height);
			this.scrollbarVerticalBox.measure(width, height);
		}

		var contentSize = this.contentBox.measure(width, height);
		if(contentSize.width < width)
			size.width = contentSize.width;
		else
			size.width = width;
		if(contentSize.height < height)
			size.height = contentSize.height;
		else
			size.height = height;
		if(!this.scrollVertical)
			size.height = contentSize.height;
		if(!this.scrollHorizontal)
			size.width = contentSize.width;
		return size;
	},

	arrangeCore: function(width, height) {

		this.viewWidth = width;
		this.viewHeight = height;
		this.contentWidth = width;
		this.contentHeight = height;

		if(Ui.ScrollableContent.emulatedScrollbars) {

			var contentWidth = width;
			if(this.contentBox.getMeasureHeight() > height)
				this.scrollbarVerticalNeeded = true;
			else
				this.scrollbarVerticalNeeded = false;
			if(this.contentBox.getMeasureWidth() > contentWidth)
				this.scrollbarHorizontalNeeded = true;
			else
				this.scrollbarHorizontalNeeded = false;
	
			if(this.scrollbarVerticalNeeded)
				this.scrollbarVerticalBox.show();
			else {
				this.scrollbarVerticalBox.hide();
				this.offsetY = 0;
			}
			if(this.scrollbarHorizontalNeeded)
				this.scrollbarHorizontalBox.show();
			else {
				this.scrollbarHorizontalBox.hide();
				this.offsetX = 0;
			}
		
			if(this.scrollbarVerticalNeeded) {
				this.contentHeight = this.contentBox.getMeasureHeight();
				this.scrollbarVerticalHeight = Math.max((this.viewHeight / this.contentHeight) * this.viewHeight, this.scrollbarVerticalBox.getMeasureHeight());
				this.scrollbarVerticalBox.arrange(width - this.scrollbarVerticalBox.getMeasureWidth(), 0,
					this.scrollbarVerticalBox.getMeasureWidth(), this.scrollbarVerticalHeight);
			}
			if(this.scrollbarHorizontalNeeded) {
				this.contentWidth = this.contentBox.getMeasureWidth();
				this.scrollbarHorizontalWidth = Math.max((this.viewWidth / this.contentWidth) * this.viewWidth, this.scrollbarHorizontalBox.getMeasureWidth());
				this.scrollbarHorizontalBox.arrange(0, height - this.scrollbarHorizontalBox.getMeasureHeight(),
					this.scrollbarHorizontalWidth, this.scrollbarHorizontalBox.getMeasureHeight());
			}
		}

		this.contentBox.arrange(0, 0, this.viewWidth, this.viewHeight);

		this.updateOffset();
	}
});

Ui.Container.extend('Ui.ScrollableContent', {
	content: undefined,

	constructor: function(config) {
		this.addEvents('scroll');
		this.connect(this.getDrawing(), 'scroll', function(event) {
			this.fireEvent('scroll', this, this.getDrawing().scrollLeft, this.getDrawing().scrollTop);
		});
	},

	setContent: function(content) {
		this.content = content;
		this.appendChild(this.content);
	},

	getContent: function() {
		return this.content;
	},

	setOffset: function(offsetX, offsetY) {
		this.getDrawing().scrollLeft = offsetX;
		this.getDrawing().scrollTop = offsetY;
	},

	getOffsetX: function() {
		return this.getDrawing().scrollLeft;
	},

	getOffsetY: function() {
		return this.getDrawing().scrollTop;
	}

}, {
	renderDrawing: function(config) {
		var drawing = Ui.Scrollable.base.renderDrawing.apply(this, arguments);
		if(Ui.ScrollableContent.emulatedScrollbars)
			drawing.style.overflow = 'scroll';
		else
			drawing.style.overflow = 'auto';
		// for iOS elastic scroll but plenty of thread bugs
		drawing.style.webkitOverflowScrolling = 'touch';
		return drawing;
	},

	measureCore: function(width, height) {
		var size = { width: 0, height: 0 };

		if(this.content !== undefined) {
			var contentSize = this.content.measure(width, height);
			if(contentSize.width < width)
				size.width = contentSize.width;
			else
				size.width = width;
			if(contentSize.height < height)
				size.height = contentSize.height;
			else
				size.height = height;
			if(!this.scrollVertical)
				size.height = contentSize.height;
			if(!this.scrollHorizontal)
				size.width = contentSize.width;
		}
		return size;
	},

	arrangeCore: function(width, height) {	
		if(this.content !== undefined) {
			var viewWidth = this.content.getMeasureWidth();
			if(width > viewWidth)
				viewWidth = width;
			var viewHeight = this.content.getMeasureHeight();
			if(height > viewHeight)
				viewHeight = height;
			this.content.arrange(0, 0, viewWidth, viewHeight);
			this.getDrawing().style.width = (width+Ui.ScrollableContent.emulatedExtraWidth)+'px';
			this.getDrawing().style.height = (height+Ui.ScrollableContent.emulatedExtraHeight)+'px';
		}
	}
}, {
	emulatedScrollbars: true,
	emulatedExtraWidth: 20,
	emulatedExtraHeight: 20,

	constructor: function() {
		if((document.body === undefined) || (document.body === null)) {
			var body = document.createElement('body');
			document.body = body;
		}
		var div = document.createElement('div');
		div.style.overflow = 'scroll';
		div.style.visibility = 'hidden';
		document.body.appendChild(div);

		Ui.ScrollableContent.emulatedExtraWidth = div.offsetWidth - div.clientWidth;
		Ui.ScrollableContent.emulatedExtraHeight = div.offsetHeight - div.clientHeight;
		Ui.ScrollableContent.emulatedScrollbars = (this.emulatedExtraWidth > 0) || (this.emulatedExtraHeight > 0);

		document.body.removeChild(div);
	}
});

