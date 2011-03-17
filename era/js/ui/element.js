
//
// Define the base class for all GUI elements
//
Object.extend('Ui.Element', {
	marginTop: 0,
	marginBottom: 0,
	marginLeft: 0,
	marginRight: 0,

	// parent
	parent: undefined,

	// preferred element size
	width: undefined,
	height: undefined,

	// rendering
	renderValid: false,
	drawing: undefined,

	// measurement
	measureValid: false,
	measureWidth: 0,
	measureHeight: 0,

	// arrangement
	arrangeValid: false,
	arrangeX: 0,
	arrangeY: 0,
	arrangeWidth: 0,
	arrangeHeight: 0,

	layoutX: 0,
	layoutY: 0,
	layoutWidth: 0,
	layoutHeight: 0,

	// is loaded in the displayed tree
	isLoaded: false,

	// alignment when arrange is bigger than measure
	// vertical: [top|center|bottom|stretch]
	// horizontal: [left|center|right|stretch]
	verticalAlign: 'stretch',
	horizontalAlign: 'stretch',

	// whether or not the current element graphic
	// is clipped to the layout size
	clipToBounds: false,

	// whether or not the current element can get focus
	focusable: false,

	transform: undefined,
	transformOriginX: 0.5,
	transformOriginY: 0.5,
	transformOriginAbsolute: false,

	// if the current element is the target of
	// an active timeline, the running clock
	animClock: undefined,

	constructor: function(config) {
		// create the drawing container
		this.drawing = document.createElementNS(htmlNS, 'div');
		this.drawing.style.position = 'absolute';
		this.drawing.style.left = '0px';
		this.drawing.style.top = '0px';
		this.addClass(this.classType.toLowerCase().replace(/\./gi, '-'));
		var content = this.render();
		if(content != undefined)
			this.drawing.appendChild(content);

		if(config.width != undefined)
			this.setWidth(config.width);
		if(config.height != undefined)
			this.setHeight(config.height);
		if(config.verticalAlign != undefined)
			this.setVerticalAlign(config.verticalAlign);
		if(config.horizontalAlign != undefined)
			this.setHorizontalAlign(config.horizontalAlign);

		if(config.margin != undefined)
			this.setMargin(config.margin);
		if(config.marginTop != undefined)
			this.setMarginTop(config.marginTop);
		if(config.marginBottom != undefined)
			this.setMarginBottom(config.marginBottom);
		if(config.marginLeft != undefined)
			this.setMarginLeft(config.marginLeft);
		if(config.marginRight != undefined)
			this.setMarginRight(config.marginRight);
		if(config.opacity != undefined)
			this.setOpacity(config.opacity);
		if(config.focusable != undefined)
			this.setFocusable(config.focusable);
		if(config.clipToBounds != undefined)
			this.setClipToBounds(config.clipToBounds);
		if(config.id != undefined)
			this.setId(config.id);
		else
			this.setId(Core.Util.generateId());

//		this.connect(this.drawing, 'focus', this.focus);
//		this.connect(this.drawing, 'blur', this.blur);

		this.addEvents('keypress', 'keydown', 'focus', 'blur', 'load', 'unload');
	},

	//
	// Return the HTML element that correspond to
	// the current element rendering
	//
	getDrawing: function() {
		return this.drawing;
	},

	getLayoutX: function() {
		return this.layoutX;
	},

	getLayoutY: function() {
		return this.layoutY;
	},

	getLayoutWidth: function() {
		return this.layoutWidth;
	},

	getLayoutHeight: function() {
		return this.layoutHeight;
	},

	//
	// Set a unique id for the current element
	//
	setId: function(id) {
		this.drawing.setAttributeNS(null, 'id', id);
	},

	//
	// Return the id of the current element
	//
	getId: function() {
		return this.drawing.getAttributeNS(null, 'id');
	},

	//
	// Defined if the current element can have the focus
	//
	setFocusable: function(focusable) {
		this.focusable = focusable;
		if(focusable)
			this.drawing.setAttributeNS(null, 'tabindex', 0);
		else
			this.drawing.setAttributeNS(null, 'tabindex', -1);
	},

	//
	// Return whether or not the current element can get the focus
	//
	getFocusable: function() {
		return this.focusable;
	},

	//
	// Set the current element role as defined by
	// the WAI-ARIA. To remove a role, use undefined
	//
	setRole: function(role) {
		if(role == undefined) {
			if(this.drawing.hasAttributeNS('http://www.w3.org/2005/07/aaa', 'role'))
				this.drawing.removeAttributeNS('http://www.w3.org/2005/07/aaa', 'role');
		}
		else
			this.drawing.setAttributeNS('http://www.w3.org/2005/07/aaa', 'role', role);
	},

	//
	// Provide the available size and return
	// the minimum required size
	//
	measure: function(width, height, force) {
		var marginLeft = this.getMarginLeft();
		var marginRight = this.getMarginRight();
		var marginTop = this.getMarginTop();
		var marginBottom = this.getMarginBottom();
		var size = this.measureCore(width - (marginLeft+marginRight), height - (marginTop+marginBottom), force);

		// if width and height are set they are taken as a minimum
		if((this.width != undefined) && (size.width < this.width))
			this.measureWidth = this.width + marginLeft + marginRight;
		else
			this.measureWidth = size.width + marginLeft + marginRight;
		if((this.height != undefined) && (size.height < this.height))
			this.measureHeight = this.height + marginTop + marginBottom;
		else
			this.measureHeight = size.height + marginTop + marginBottom;

		this.measureValid = true;

//		console.log(this+'.measure ('+width+','+height+') => '+this.measureWidth+'x'+this.measureHeight);

		return { width: this.measureWidth, height: this.measureHeight };
	},

	//
	// Override this method to provide your own
	// measure policy
	//
	measureCore: function(width, height, force) {
		return { width: 0, height: 0 };
	},

	//
	// Signal that the current element measure need to be
	// updated
	//
	invalidateMeasure: function() {
		this.invalidateArrange();
		if(this.measureValid) {
			this.measureValid = false;
			if((this.parent != undefined) && (this.parent.measureValid))
				this.parent.invalidateMeasure();
		}
	},

	//
	// Update the current element arrangement
	//
	arrange: function(x, y, width, height, force) {
		if(((force != undefined) &&  force) || (!this.arrangeValid) || (this.arrangeX != x) || (this.arrangeY != y) || (this.arrangeWidth != width) || (this.arrangeHeight != height)) {
			this.arrangeX = x;
			this.arrangeY = y;
			this.arrangeWidth = width;
			this.arrangeHeight = height;

			// handle alignment
			if(this.verticalAlign == 'top') {
				height = this.measureHeight;
			}
			else if(this.verticalAlign == 'bottom') {
				y += height - this.measureHeight;
				height = this.measureHeight;
			}
			else if(this.verticalAlign == 'center') {
				y += (height - this.measureHeight) / 2;
				height = this.measureHeight;
			}
			if(this.horizontalAlign == 'left') {
				width = this.measureWidth;
			}
			else if(this.horizontalAlign == 'right') {
				x += width - this.measureWidth;
				width = this.measureWidth;
			}
			else if(this.horizontalAlign == 'center') {
				x += (width - this.measureWidth) / 2;
				width = this.measureWidth;
			}

			// handle margin
			var marginLeft = this.getMarginLeft();
			var marginRight = this.getMarginRight();
			var marginTop = this.getMarginTop();
			var marginBottom = this.getMarginBottom();
			x += marginLeft;
			y += marginTop;
			width -= marginLeft + marginRight;
			height -= marginTop + marginBottom;

			this.layoutX = x;
			this.layoutY = y;
			this.layoutWidth = width;
			this.layoutHeight = height;

//			console.log(this+'.arrange '+x+','+y+' ('+width+'x'+height+')');

			this.drawing.style.setProperty('left', this.layoutX+'px', null);
			this.drawing.style.setProperty('top', this.layoutY+'px', null);
			this.updateTransform();
			this.drawing.style.setProperty('width', width+'px', null);
			this.drawing.style.setProperty('height', height+'px', null);

			if(this.clipToBounds)
				this.setClipRectangle(0, 0, this.layoutWidth, this.layoutHeight);

			this.arrangeCore(width, height, force);
		}
		this.arrangeValid = true;
	},

	//
	// Override this to provide your own
	// arrangement policy
	//
	arrangeCore: function(width, height, force) {
	},

	//
	// Signal that the current element arrangement need
	// to be updated
	//
	invalidateArrange: function() {
		if(this.arrangeValid) {
			this.arrangeValid = false;
			if(this.parent != undefined)
				this.parent.invalidateArrange();
		}
	},

	//
	// Override this method to provide a custom
	// rendering of the current element.
	// Return the SVGElement of the rendering
	//
	render: function() {
		return undefined;
	},

	//
	// Called to synchronize the current element
	// with its visual aspect (INTERNAL)
	//
	updateRender: function(force) {
		if(((force != undefined) && force) ||  !this.renderValid)
			this.updateRenderCore(force);
		this.renderValid = true;
	},

	//
	// Called when the rendering need to be updated (color, aspect...)
	// Override this method to synchronize the current element
	// with its visual aspect
	//
	updateRenderCore: function(force) {
	},

	//
	// Signal that the current element graphical
	// display need to be updated
	//
	invalidateRender: function() {
		if(this.renderValid) {
			this.renderValid = false;
			if(this.parent != undefined)
				this.parent.invalidateRender();
		}
	},

	//
	// Return the prefered width of the element
	// or undefined
	//
	getWidth: function() {
		return this.width;
	},

	//
	// Set the prefered width of the element
	//
	setWidth: function(width) {
		this.width = width;
		this.invalidateMeasure();
	},

	//
	// Return the prefered height of the element
	// or undefined
	//
	getHeight: function() {
		return this.height;
	},

	//
	// Set the prefered height of the element
	//
	setHeight: function(height) {
		this.height = height;
		this.invalidateMeasure();
	},

	//
	// Return the vertical alignment from the parent.
	//
	getVerticalAlign: function() {
		return this.verticalAlign;
	},

	//
	// Set the vertical alignment from the parent.
	// Possible values: [top|center|bottom|stretch]
	//
	setVerticalAlign: function(align) {
		this.verticalAlign = align;
		this.invalidateArrange();
	},

	//
	// Return the horizontal alignment from the parent.
	//
	getHorizontalAlign: function() {
		return this.horizontalAlign;
	},

	//
	// Set the horizontal alignment from the parent.
	// Possible values: [left|center|right|stretch]
	//
	setHorizontalAlign: function(align) {
		this.horizontalAlign = align;
		this.invalidateArrange();
	},

	getClipToBounds: function() {
		return this.clipToBounds;
	},

	setClipToBounds: function(clip) {
		if(this.clipToBounds != clip) {
			this.clipToBounds = clip;
			if(clip)
				this.setClipRectangle(0, 0, this.layoutWidth, this.layoutHeight);
			else
				this.drawing.style.setProperty('clip', 'none', null);
		}
	},

	setClipRectangle: function(x, y, width, height) {
		x = Math.round(x);
		y = Math.round(y);
		width = Math.round(width);
		height = Math.round(height);
		this.drawing.style.setProperty('clip', 'rect('+y+'px '+(x+width)+'px '+(y+height)+'px '+x+'px)', null);
	},

	//
	// Return true if the given class is applied to the current element
	// CSS class
	//
	checkClass: function(className) {
		var cssClass = this.drawing.getAttributeNS(null, 'class');
		if((cssClass == undefined) || (cssClass == ''))
			return false;
		var classes = cssClass.split(' ');
		for(var i = 0; i < classes.length; i++) {
			if(classes[i] == className)
				return true;
		}
		return false;
	},

	//
	// Add CSS class to the current element
	//
	addClass: function(className) {
		var cssClass = this.drawing.getAttributeNS(null, 'class');
		if(!cssClass)
			this.drawing.setAttributeNS(null, 'class', className);
		else
			if(!this.checkClass(className))
				this.drawing.setAttributeNS(null, 'class', cssClass+' '+className);
	},

	//
	// Remove CSS class to the current element
	//
	removeClass: function(className) {
		if(className == undefined)
			return;
		var cssClass = this.drawing.getAttributeNS(null, 'class');
		if(cssClass) {
			var classes = cssClass.split(' ');
			var tmp = '';
			for(var i = 0; i < classes.length; i++) {
				if((classes[i] == className) || (classes[i] == ''))
					continue;
				if(tmp != '')
					tmp += ' ';
				tmp += classes[i];
			}
			this.drawing.setAttributeNS(null, 'class', tmp);
		}
	},

	//
	// Replace CSS class to the current element
	//
	replaceClass: function(oldClassName, newClassName) {
		var cssClass = this.drawing.getAttributeNS(null, 'class');
		if(!cssClass)
			this.drawing.setAttributeNS(null, 'class', newClassName);
		else {
			var classes = cssClass.split(' ');
			var tmp = '';
			for(var i = 0; i < classes.length; i++) {
				if(classes[i] == '')
					continue;
				if(tmp != '')
					tmp += ' ';
				if(classes[i] == oldClassName)
					tmp += newClassName;
				else
					tmp += classes[i];
			}
			this.drawing.setAttributeNS(null, 'class', tmp);
		}
	},

	//
	// Get the CSS computed value of a given property
	//
	getComputedStyleProperty: function(property) {
		return window.getComputedStyle(this.drawing, null).getPropertyValue(property);
	},

	//
	// Set the local style value of a given property
	//
	setStyleProperty: function(property, value) {
		this.drawing.style.setProperty(property, value, 'important');
	},

	//
	// Set the current element margin for all borders
	//
	setMargin: function(margin) {
		this.setMarginTop(margin);
		this.setMarginBottom(margin);
		this.setMarginLeft(margin);
		this.setMarginRight(margin);
	},

	//
	// Return the current element top margin
	//
	getMarginTop: function() {
		return this.marginTop;
	},

	//
	// Set the current element top margin
	//
	setMarginTop: function(marginTop) {
		if(marginTop != this.marginTop) {
			this.marginTop = marginTop;
			this.invalidateMeasure();
		}
	},

	//
	// Return the current element bottom margin
	//
	getMarginBottom: function() {
		return this.marginBottom;
	},

	//
	// Set the current element bottom margin
	//
	setMarginBottom: function(marginBottom) {
		if(marginBottom != this.marginBottom) {
			this.marginBottom = marginBottom;
			this.invalidateMeasure();
		}
	},

	//
	// Return the current element left margin
	//
	getMarginLeft: function() {
		return this.marginLeft;
	},

	//
	// Set the current element left margin
	//
	setMarginLeft: function(marginLeft) {
		if(marginLeft != this.marginLeft) {
			this.marginLeft = marginLeft;
			this.invalidateMeasure();
		}
	},

	//
	// Return the current element right margin
	//
	getMarginRight: function() {
		return this.marginRight;
	},

	//
	// Set the current element right margin
	//
	setMarginRight: function(marginRight) {
		if(marginRight != this.marginRight) {
			this.marginRight = marginRight;
			this.invalidateMeasure();
		}
	},

	//
	// Return the current element opacity
	//
	getOpacity: function() {
		return new Number(this.getComputedStyleProperty('opacity'));
	},

	//
	// Set the current element opacity
	//
	setOpacity: function(opacity) {
		this.drawing.style.opacity = opacity;
	},

	//
	// Ask for focus on the current element
	//
	focus: function() {
		var current = this;
		while(current.parent != undefined) {
			current = current.parent;
		}
		if(current.isSubclass('Ui.App'))
			current.askFocus(this);
	},

	//
	// Remove the focus current element
	//
	blur: function() {
		var current = this;
		while(current.parent != undefined) {
			current = current.parent;
		}
		if(current.isSubclass('Ui.App'))
			current.removeFocus(this);
	},

	//
	// Provide an Matrix to transform the element rendering.
	// This transformation is not taken in account for the arrangement
	//
	setTransform: function(transform) {
		this.transform = transform;
		this.updateTransform();
	},

	//
	// If setTransform is used, define the origin of the transform.
	// x and y give the position of the center.
	// If absolute is not set, the position is relative to the
	// width and height of the current element.
	//
	setTransformOrigin: function(x, y, absolute) {
		this.transformOriginX = x;
		this.transformOriginY = y;
		if(absolute == undefined)
			this.transformOriginAbsolute = false;
		else
			this.transformOriginAbsolute = absolute;
		this.updateTransform();
	},

	//
	// Return the transform matrix to convert coordinates
	// from the current element coordinate system to the page
	// coordinate system
	//
	transformToPage: function() {
		if(navigator.isWebkit) {
			var matrix = new Ui.Matrix();
			var current = this.drawing;
			while(current != undefined) {
				var trans = window.getComputedStyle(current, null).getPropertyValue('-webkit-transform');
				if(trans != 'none') {
					var origin = window.getComputedStyle(current, null).getPropertyValue('-webkit-transform-origin');
					var originX = 0;
					var originY = 0;
					if(origin != '0px 0px') {
						var origins = origin.split(' ');
						originX = new Number(origins[0].replace(/px$/, ''));
						originY = new Number(origins[1].replace(/px$/, ''));
					}
					var cssMatrix = new WebKitCSSMatrix(trans);
					var localMatrix = Ui.Matrix.createMatrix(cssMatrix.a, cssMatrix.b, cssMatrix.c, cssMatrix.d, cssMatrix.e, cssMatrix.f);
					matrix.translate(current.offsetLeft - originX, current.offsetTop - originY);
					matrix.multiply(localMatrix);
					matrix.translate(originX, originY);
				}
				current = current.offsetParent;
			}
			return matrix;
		}
		else if(navigator.isGecko) {
			var matrix = new Ui.Matrix();
			var current = this.drawing;
			while(current != undefined) {
				var trans = window.getComputedStyle(current, null).getPropertyValue('-moz-transform');
				if(trans != 'none') {
					var splits = trans.split(' ');
					var a = new Number(splits[0].slice(7, splits[0].length-1));
					var b = new Number(splits[1].slice(0, splits[1].length-1));
					var c = new Number(splits[2].slice(0, splits[2].length-1));
					var d = new Number(splits[3].slice(0, splits[3].length-1));
					var e = new Number(splits[4].slice(0, splits[4].length-3));
					var f = new Number(splits[5].slice(0, splits[5].length-3));
					var origin = window.getComputedStyle(current, null).getPropertyValue('-moz-transform-origin');
					var originX = 0;
					var originY = 0;
					if(origin != '0px 0px') {
						var origins = origin.split(' ');
						originX = new Number(origins[0].replace(/px$/, ''));
						originY = new Number(origins[1].replace(/px$/, ''));
					}
					var localMatrix = Ui.Matrix.createMatrix(a, b, c, d, e, f);
					matrix.translate(current.offsetLeft - originX, current.offsetTop - originY);
					matrix.multiply(localMatrix);
					matrix.translate(originX, originY);
				}
				current = current.offsetParent;
			}
			return matrix;
		}
		else if(navigator.isOpera) {
			var matrix = new Ui.Matrix();
			var current = this.drawing;
			while(current != undefined) {
				var trans = window.getComputedStyle(current, null).getPropertyValue('-o-transform');
				if((trans != 'none') && (trans != 'matrix(1, 0, 0, 1, 0, 0)')) {
					var splits = trans.split(' ');
					var a = new Number(splits[0].slice(7, splits[0].length-1));
					var b = new Number(splits[1].slice(0, splits[1].length-1));
					var c = new Number(splits[2].slice(0, splits[2].length-1));
					var d = new Number(splits[3].slice(0, splits[3].length-1));
					var e = new Number(splits[4].slice(0, splits[4].length-1));
					var f = new Number(splits[5].slice(0, splits[5].length-1));
					var origin = window.getComputedStyle(current, null).getPropertyValue('-o-transform-origin');
					var originX = 0;
					var originY = 0;
					if(origin != '0px 0px') {
						var origins = origin.split(' ');
						originX = new Number(origins[0].replace(/px$/, ''));
						originY = new Number(origins[1].replace(/px$/, ''));
					}
					var localMatrix = Ui.Matrix.createMatrix(a, b, c, d, e, f);
					matrix.translate(current.offsetLeft - originX, current.offsetTop - originY);
					matrix.multiply(localMatrix);
					matrix.translate(originX, originY);
				}
				current = current.offsetParent;
			}
			return matrix;
		}
		else if(navigator.isIE) {
			var matrix = new Ui.Matrix();
			var current = this.drawing;
			while(current != undefined) {
				var trans = window.getComputedStyle(current, null).getPropertyValue('-ms-transform');
				if((trans != 'none') && (trans != 'matrix(1, 0, 0, 1, 0, 0)')) {
					var splits = trans.split(' ');
					var a = new Number(splits[0].slice(7, splits[0].length-1));
					var b = new Number(splits[1].slice(0, splits[1].length-1));
					var c = new Number(splits[2].slice(0, splits[2].length-1));
					var d = new Number(splits[3].slice(0, splits[3].length-1));
					var e = new Number(splits[4].slice(0, splits[4].length-1));
					var f = new Number(splits[5].slice(0, splits[5].length-1));
					var origin = window.getComputedStyle(current, null).getPropertyValue('-ms-transform-origin');
					var originX = 0;
					var originY = 0;
					if(origin != '0px 0px') {
						var origins = origin.split(' ');
						originX = new Number(origins[0].replace(/px$/, ''));
						originY = new Number(origins[1].replace(/px$/, ''));
					}
					var localMatrix = Ui.Matrix.createMatrix(a, b, c, d, e, f);
					matrix.translate(current.offsetLeft - originX, current.offsetTop - originY);
					matrix.multiply(localMatrix);
					matrix.translate(originX, originY);
				}
				current = current.offsetParent;
			}
			return matrix;
		}
		else {
			var svg = document.createElementNS(svgNS, 'svg');
			if(this.drawing.firstChild == undefined)
				this.drawing.appendChild(svg);
			else
				this.drawing.insertBefore(svg, this.drawing.firstChild);
			var svgMatrix = svg.getScreenCTM();
			this.drawing.removeChild(svg);
			return Ui.Matrix.createMatrix(svgMatrix.a, svgMatrix.b, svgMatrix.c, svgMatrix.d, svgMatrix.e, svgMatrix.f);
		}
	},

	//
	// Return the transform matrix to convert coordinates
	// from the page coordinate system to the current element
	// coordinate system
	//
	transformFromPage: function() {
		var matrix = this.transformToPage();
		matrix.inverse();
		return matrix;
	},

	//
	// Return the transform matrix to convert coordinates
	// from the current element coordinate system to a given
	// element coordinate system
	//
	transformToElement: function(element) {
		var matrix = this.transformToPage();
		matrix.multiply(element.transformFromPage());
		return matrix;
	},

	//
	// Return the given point converted from the current element
	// coordinate system to the page coordinate system
	//
	pointToPage: function(point) {
		if(navigator.isWebkit)
			return window.webkitConvertPointFromNodeToPage(this.drawing, new WebKitPoint(point.x, point.y));
		else {
			point = new Ui.Point({point: point });
			point.matrixTransform(this.transformToPage());
			return point;
		}
	},

	//
	// Return the given point converted from the page coordinate
	// system to the current element coordinate system
	//
	pointFromPage: function(point) {
		if(navigator.isWebkit)
			return window.webkitConvertPointFromPageToNode(this.drawing, new WebKitPoint(point.x, point.y));
		else {
			point = new Ui.Point({ point: point });
			point.matrixTransform(this.transformFromPage());
			return point;
		}
	},

	//
	// Return the given point converted from the given element coordinate
	// system to the current element coordinate system
	//
	pointFromElement: function(element, point) {
		return this.pointFromPage(element.pointToPage(point));
	},

	//
	// Return true if the current element is inserted in a displayed
	// rendering tree
	//
	getIsLoaded: function() {
		return this.isLoaded;
	},

	//
	// Return the width taken by the current element
	//
	getMeasureWidth: function() {
		return this.measureWidth;
	},

	//
	// Return the height taken by the current element
	//
	getMeasureHeight: function() {
		return this.measureHeight;
	},

	show: function() {
		this.drawing.style.display = 'block';
	},

	hide: function() {
		this.drawing.style.display = 'none';
	},

	//
	// Private
	//

	setIsLoaded: function(isLoaded) {
		if(this.isLoaded != isLoaded) {
			this.isLoaded = isLoaded;
			if(isLoaded)
				this.onLoad();
			else
				this.onUnload();
		}
	},

	updateTransform: function() {
		var matrix = new Ui.Matrix();
		if(this.transform != undefined) {
			var x = this.transformOriginX;
			var y = this.transformOriginY;
			if(!this.transformOriginAbsolute) {
				x *= this.layoutWidth;
				y *= this.layoutHeight;
			}
			matrix.translate(x, y);
			matrix.multiply(this.transform);
			matrix.translate(-x, -y);
		}
		if(navigator.isIE) {
			this.drawing.style.msTransform = matrix.toString();
			this.drawing.style.msTransformOrigin = '0% 0%';
		}
		else if(navigator.isGecko) {
			this.drawing.style.setProperty('-moz-transform', 'matrix('+matrix.svgMatrix.a.toFixed(4)+', '+matrix.svgMatrix.b.toFixed(4)+', '+matrix.svgMatrix.c.toFixed(4)+', '+matrix.svgMatrix.d.toFixed(4)+', '+matrix.svgMatrix.e.toFixed(0)+'px, '+matrix.svgMatrix.f.toFixed(0)+'px)', null);
			this.drawing.style.setProperty('-moz-transform-origin', '0% 0%', null);
		}
		else if(navigator.isWebkit) {
			this.drawing.style.webkitTransform = matrix.toString();
			this.drawing.style.webkitTransformOrigin = '0% 0%';
		}
		else if(navigator.isOpera) {
			this.drawing.style.setProperty('-o-transform', matrix.toString(), null);
			this.drawing.style.setProperty('-o-transform-origin', '0% 0%', null);
		}
	},

	setAnimClock: function(clock) {
		// if an anim clock is already set stop it
		if(this.animClock != undefined)
			this.animClock.stop();
		this.animClock = clock;
		if(clock != undefined)
			this.connect(clock, 'complete', function() { this.animClock = undefined; });
	},

	onLoad: function() {
		this.fireEvent('load');
	},

	onUnload: function() {
		if(this.animClock != undefined) {
			this.animClock.stop();
			this.animClock = undefined;
		}
		this.fireEvent('unload');
	},
});

