
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
	drawing: undefined,

	// measurement
	measureValid: false,
	measureConstraintWidth: 0,
	measureConstraintHeight: 0,
	measureWidth: 0,
	measureHeight: 0,

	// arrangement
	arrangeValid: false,
	arrangeX: 0,
	arrangeY: 0,
	arrangeWidth: 0,
	arrangeHeight: 0,

	layoutValid: true,
	layoutNext: undefined,
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

	clipX: undefined,
	clipY: undefined,
	clipWidth: undefined,
	clipHeight: undefined,

	// whether or not the current element can get focus
	focusable: false,

	transform: undefined,
	transformOriginX: 0.5,
	transformOriginY: 0.5,
	transformOriginAbsolute: false,

	// if the current element is the target of
	// an active clock
	animClock: undefined,

	opacity: 1,

	// handle disable
	disabled: undefined,
	parentDisabled: undefined,

	// handle styles
	style: undefined,
	parentStyle: undefined,
	mergeStyle: undefined,

	constructor: function(config) {
		// create the drawing container
		this.drawing = this.renderDrawing();
		this.drawing.style.position = 'absolute';
		this.drawing.style.left = '-10000px';
		this.drawing.style.top = '-10000px';
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

//		this.connect(this.drawing, 'focus', this.focus);
//		this.connect(this.drawing, 'blur', this.blur);

		this.addEvents('keypress', 'keydown', 'focus', 'blur', 'load', 'unload', 'enable', 'disable');
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
	measure: function(width, height) {

//		console.log(this+'.measure ('+width+','+height+')');

		if((this.measureValid) && (this.measureConstraintWidth == width) && (this.measureConstraintHeight == height))
			return { width: this.measureWidth, height: this.measureHeight };

		this.measureConstraintWidth = width;
		this.measureConstraintHeight = height;

		var marginLeft = this.getMarginLeft();
		var marginRight = this.getMarginRight();
		var marginTop = this.getMarginTop();
		var marginBottom = this.getMarginBottom();

		var constraintWidth = Math.max(width - (marginLeft+marginRight), 0);
		var constraintHeight = Math.max(height - (marginTop+marginBottom), 0);

		if(this.horizontalAlign != 'stretch')
			constraintWidth = 0;
		if(this.verticalAlign != 'stretch')
			constraintHeight = 0;

		if(this.width != undefined)
			constraintWidth = Math.max(this.width, constraintWidth);
		if(this.height != undefined)
			constraintHeight = Math.max(this.height, constraintHeight);

		var size = this.measureCore(constraintWidth, constraintHeight);

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
	measureCore: function(width, height) {
		return { width: 0, height: 0 };
	},

	//
	// Signal that the current element measure need to be
	// updated
	//
	invalidateMeasure: function() {
//		console.log(this+'.invalidateMeasure start');

		this.invalidateArrange();
		if(this.measureValid) {
//			console.log(this+'.invalidateMeasure');

			this.measureValid = false;
			if((this.parent != undefined) && (this.parent.measureValid))
				this.parent.onChildInvalidateMeasure(this);
		}
	},

	invalidateLayout: function() {
		if(this.layoutValid) {
			console.log('invalidateLayout enqueue ('+(new Date()).getTime()+')');

			this.layoutValid = false;
			Ui.App.current.enqueueLayout(this);
		}
	},

	onChildInvalidateMeasure: function(child) {
		this.invalidateMeasure();
	},

	updateLayout: function() {
	},

	//
	// Update the current element arrangement
	//
	arrange: function(x, y, width, height) {
		if((!this.arrangeValid) || (this.arrangeX != x) || (this.arrangeY != y) || (this.arrangeWidth != width) || (this.arrangeHeight != height)) {
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

			this.drawing.style.left = this.layoutX+'px';
			this.drawing.style.top = this.layoutY+'px';
			if(this.transform != undefined)
				this.updateTransform();
			this.drawing.style.width = width+'px';
			this.drawing.style.height = height+'px';

			if(this.clipToBounds) {
				this.clipX = 0;
				this.clipY = 0;
				this.clipWidth = this.layoutWidth;
				this.clipHeight = this.layoutHeight;
				this.updateClipRectangle();
			}

			this.arrangeCore(width, height);
		}
		this.arrangeValid = true;
	},

	//
	// Override this to provide your own
	// arrangement policy
	//
	arrangeCore: function(width, height) {
	},

	//
	// Signal that the current element arrangement need
	// to be updated
	//
	invalidateArrange: function() {
		if(this.arrangeValid) {
			this.arrangeValid = false;
			if(this.parent != undefined)
				this.parent.onChildInvalidateArrange(this);
		}
	},

	onChildInvalidateArrange: function(child) {
		this.invalidateArrange();
	},

	//
	// Override this method to provide a custom
	// rendering of the current element.
	// Return the HTML element of the rendering
	//
	renderDrawing: function() {
		return document.createElementNS(htmlNS, 'div');
	},

	//
	// Override this method to provide a custom
	// rendering of the current element.
	// Return the HTML element of the rendering
	//
	render: function() {
		return undefined;
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
		if(this.width != width) {
			this.width = width;
			this.invalidateMeasure();
		}
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
		if(this.height != height) {
			this.height = height;
			this.invalidateMeasure();
		}
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
			if(clip) {
				this.clipX = 0;
				this.clipY = 0;
				this.clipWidth = this.layoutWidth;
				this.clipHeight = this.layoutHeight;
			}
			else {
				this.clipX = undefined;
				this.clipY = undefined;
				this.clipWidth = undefined;
				this.clipHeight = undefined;
			}
			this.updateClipRectangle();
		}
	},

	setClipRectangle: function(x, y, width, height) {
		this.clipX = x;
		this.clipY = y;
		this.clipWidth = width;
		this.clipHeight = height;
		this.updateClipRectangle();
	},

	updateClipRectangle: function() {
		if(this.clipX != undefined) {
			x = Math.round(this.clipX);
			y = Math.round(this.clipY);
			width = Math.round(this.clipWidth);
			height = Math.round(this.clipHeight);
			this.drawing.style.clip = 'rect('+y+'px '+(x+width)+'px '+(y+height)+'px '+x+'px)';
		}
		else
			this.drawing.style.removeProperty('clip');
	},

	//
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
		return this.opacity;
	},

	//
	// Set the current element opacity
	//
	setOpacity: function(opacity) {
		if(this.opacity != opacity) {
			this.opacity = opacity;
			this.drawing.style.opacity = this.opacity;
		}
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
		if(this.transform != transform) {
			this.transform = transform;
			this.updateTransform();
		}
	},

	//
	// If setTransform is used, define the origin of the transform.
	// x and y give the position of the center.
	// If absolute is not set, the position is relative to the
	// width and height of the current element.
	//
	setTransformOrigin: function(x, y, absolute) {
		if((this.transformOriginX != x) || (this.transformOriginY != y) || (this.transformOriginAbsolute != absolute)) {
			this.transformOriginX = x;
			this.transformOriginY = y;
			if(absolute == undefined)
				this.transformOriginAbsolute = false;
			else
				this.transformOriginAbsolute = absolute;
			this.updateTransform();
		}
	},

	//
	// Return the transform matrix to convert coordinates
	// from the current element coordinate system to the page
	// coordinate system
	//
	transformToWindow: function() {
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
				matrix.translate(current.offsetLeft, current.offsetTop);
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
				matrix.translate(current.offsetLeft, current.offsetTop);
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
				matrix.translate(current.offsetLeft, current.offsetTop);
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
				matrix.translate(current.offsetLeft, current.offsetTop);
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
	transformFromWindow: function() {
		var matrix = this.transformToWindow();
		matrix.inverse();
		return matrix;
	},

	//
	// Return the transform matrix to convert coordinates
	// from the current element coordinate system to a given
	// element coordinate system
	//
	transformToElement: function(element) {
		var matrix = this.transformToWindow();
		matrix.multiply(element.transformFromWindow());
		return matrix;
	},

	//
	// Return the given point converted from the current element
	// coordinate system to the page coordinate system
	//
	pointToWindow: function(point) {
		if(navigator.isWebkit)
			return window.webkitConvertPointFromNodeToPage(this.drawing, new WebKitPoint(point.x, point.y));
		else {
			point = new Ui.Point({point: point });
			point.matrixTransform(this.transformToWindow());
			return point;
		}
	},

	//
	// Return the given point converted from the page coordinate
	// system to the current element coordinate system
	//
	pointFromWindow: function(point) {
		if(navigator.isWebkit)
			return window.webkitConvertPointFromPageToNode(this.drawing, new WebKitPoint(point.x, point.y));
		else {
			point = new Ui.Point({ point: point });
			point.matrixTransform(this.transformFromWindow());
			return point;
		}
	},

	//
	// Return the given point converted from the given element coordinate
	// system to the current element coordinate system
	//
	pointFromElement: function(element, point) {
		return this.pointFromWindow(element.pointToWindow(point));
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
		this.drawing.style.visibility = 'visible';
	},

	hide: function() {
		this.drawing.style.visibility = 'hidden';
	},

	disable: function() {
		if((this.disabled == undefined) || !this.disabled) {
			var old = this.getIsDisabled();
			this.disabled = true;
			if(!old)
				this.onInternalDisable();
		}
	},
	
	enable: function() {
		if((this.disabled == undefined) || this.disabled) {
			var old = this.getIsDisabled();
			this.disabled = false;
			if(old)
				this.onInternalEnable();
		}
	},

	getIsDisabled: function() {
		if(this.disabled != undefined)
			return this.disabled;
		else {
			if(this.parentDisabled != undefined)
				return this.parentDisabled;
			else
				return false;
		}
	},

	setParentDisabled: function(disabled) {
		var old = this.getIsDisabled();
		this.parentDisabled = disabled;
		if(old != this.getIsDisabled()) {
			if(this.getIsDisabled())
				this.onInternalDisable();
			else
				this.onInternalEnable();
		}
	},

	onInternalDisable: function() {
		this.onDisable();
		this.fireEvent('disable', this);
	},

	onDisable: function() {
	},

	onInternalEnable: function() {
		this.onEnable();
		this.fireEvent('enable', this);
	},

	onEnable: function() {
	},

	containSubStyle: function(style) {
		for(var prop in style) {
			if((prop.indexOf('.') != -1) && (typeof(style[prop]) == 'object'))
				return true; 
		}
		return false;
	},

	fusionStyle: function(dst, src) {
		for(var prop in src) {
			if((prop.indexOf('.') == -1) || (typeof(src[prop]) != 'object'))
				continue;

			if(dst[prop] != undefined) {
				var old = dst[prop];
				dst[prop] = {};
				for(var prop2 in old)
					dst[prop][prop2] = old[prop2];
				for(var prop2 in src[prop])
					dst[prop][prop2] = src[prop][prop2];
			}
			else
				dst[prop] = src[prop];
		}
	},

	mergeStyles: function() {
		this.mergeStyle = undefined;
		if(this.constructor.style != undefined) {
			if(this.constructor.classStyle != undefined)
				this.mergeStyle = this.constructor.classStyle;
			else {
				this.mergeStyle = {};
//				console.log('CREATE NEW STYLE');
				this.mergeStyle[this.classType] = this.constructor.style;
				this.fusionStyle(this.mergeStyle, this.constructor.style);
				this.constructor.classStyle = this.mergeStyle;
			}
		}
		if(this.parentStyle != undefined) {
			if(this.mergeStyle != undefined) {
				var old = this.mergeStyle;
				this.mergeStyle = {};
//				console.log('CREATE NEW STYLE');
				this.fusionStyle(this.mergeStyle, old);
				this.fusionStyle(this.mergeStyle, this.parentStyle);

				if((this.parentStyle[this.classType] != undefined) && (this.containSubStyle(this.parentStyle[this.classType])))
					this.fusionStyle(this.mergeStyle, this.parentStyle[this.classType]);
			}
			else {
				if((this.parentStyle[this.classType] != undefined) && (this.containSubStyle(this.parentStyle[this.classType]))) {
					this.mergeStyle = {};
					this.fusionStyle(this.mergeStyle, this.parentStyle[this.classType]);
				}
				else
					this.mergeStyle = this.parentStyle;
			}
		}
		if(this.style != undefined) {
			if(this.mergeStyle != undefined) {
				var old = this.mergeStyle;
				this.mergeStyle = {};
//				console.log('CREATE NEW STYLE');
				this.fusionStyle(this.mergeStyle, old);
				this.fusionStyle(this.mergeStyle, this.style);

				if((this.style[this.classType] != undefined) && (this.containSubStyle(this.style[this.classType])))
					this.fusionStyle(this.mergeStyle, this.style[this.classType]);
			}
			else {
				if((this.style[this.classType] != undefined) && (this.containSubStyle(this.style[this.classType]))) {
					this.mergeStyle = {};
//					console.log('CREATE NEW STYLE');
					this.fusionStyle(this.mergeStyle, this.style[this.classType]);
				}
				else
					this.mergeStyle = this.style;
			}
		}
/*
		if(this.parentStyle == undefined) {
			if(this.style == undefined) {
				if(this.constructor.style != undefined) {
					if(this.constructor.style[this.classType] != undefined) {
						if(this.containSubStyle(this.constructor.style)) {
							this.mergeStyle = {};
							this.fusionStyle(this.mergeStyle, this.constructor.style);
							this.fusionStyle(this.mergeStyle, this.constructor.style[this.classType]);
						}
					}
					else
						this.mergeStyle = this.constructor.style;
				}
				else
					this.mergeStyle = undefined;
			}

			if((this.style != undefined) && (this.style[this.classType] != undefined)) {
				// TODO
			}
			else
				this.mergeStyle = this.style;
		}
		else {
		}*/

//////

/*		this.mergeStyle = {};
		if(this.parentStyle != undefined) {
			for(var prop in this.parentStyle) {
				if(prop != 'resources')
					this.mergeStyle[prop] = this.parentStyle[prop];
			}
			if(this.parentStyle[this.classType] != undefined) {
				for(var prop in this.parentStyle[this.classType]) {
					if(prop != 'resources')
						this.mergeStyle[prop] = this.parentStyle[this.classType][prop];
				}
			}
		}
		if(this.style != undefined) {
			for(var prop in this.style) {
				if(prop != 'resources')
					this.mergeStyle[prop] = this.style[prop];
			}
			if(this.style[this.classType] != undefined) {
				for(var prop in this.style[this.classType]) {
					if(prop != 'resources')
						this.mergeStyle[prop] = this.style[this.classType][prop];
				}
			}
		}*/
	},

/*	mergeStyles: function() {
		if(this.parentStyle == undefined)
			this.mergeStyle = this.style;
		else {
			if(this.style == undefined)
				this.mergeStyle = this.parentStyle;
			else {
				this.mergeStyle = {};
				for(var prop in this.parentStyle) {
					if(prop != 'resources')
						this.mergeStyle[prop] = this.parentStyle[prop];
				}
				for(var prop in this.style) {
					if(prop != 'resources')
						this.mergeStyle[prop] = this.style[prop];
				}
			}
		}
	},*/

	setParentStyle: function(parentStyle) {
		if(this.parentStyle != parentStyle) {
			this.parentStyle = parentStyle;
		}
		this.mergeStyles();
		this.onInternalStyleChange();
	},

	setStyle: function(style) {
		this.style = style;
		this.mergeStyles();
		this.onInternalStyleChange();
	},

	getStyleProperty: function(property) {
		if((this.mergeStyle != undefined) && (this.mergeStyle[this.classType] != undefined) && (this.mergeStyle[this.classType][property] != undefined))
			return this.mergeStyle[this.classType][property];
		else
			return this.constructor.style[property];
	},

	onInternalStyleChange: function() {
		this.onStyleChange();
	},

	//
	// Override this in classes that handle style
	//
	onStyleChange: function() {
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
		if(this.transform != undefined) {
			var matrix = new Ui.Matrix();
			var x = this.transformOriginX;
			var y = this.transformOriginY;
			if(!this.transformOriginAbsolute) {
				x *= this.layoutWidth;
				y *= this.layoutHeight;
			}
			matrix.translate(x, y);
			matrix.multiply(this.transform);
			matrix.translate(-x, -y);

			if(navigator.isIE) {
				this.drawing.style.msTransform = matrix.toString();
				this.drawing.style.msTransformOrigin = '0% 0%';
			}
			else if(navigator.isGecko) {
				this.drawing.style.MozTransform = 'matrix('+matrix.svgMatrix.a.toFixed(4)+', '+matrix.svgMatrix.b.toFixed(4)+', '+matrix.svgMatrix.c.toFixed(4)+', '+matrix.svgMatrix.d.toFixed(4)+', '+matrix.svgMatrix.e.toFixed(0)+'px, '+matrix.svgMatrix.f.toFixed(0)+'px)';
				this.drawing.style.MozTransformOrigin = '0% 0%';
			}
			else if(navigator.isWebkit) {
				this.drawing.style.webkitTransform = matrix.toString();
				this.drawing.style.webkitTransformOrigin = '0% 0%';
			}
			else if(navigator.isOpera) {
				this.drawing.style.OTransform = matrix.toString();
				this.drawing.style.OTransformOrigin = '0% 0%';
			}
		}
		else {
			if(navigator.isIE) {
				this.drawing.style.removeProperty('-ms-transform');
				this.drawing.style.removeProperty('-ms-transform-origin');
			}
			else if(navigator.isGecko) {
				this.drawing.style.removeProperty('-moz-transform');
				this.drawing.style.removeProperty('-moz-transform-origin');
			}
			else if(navigator.isWebkit) {
				this.drawing.style.removeProperty('-webkit-transform');
				this.drawing.style.removeProperty('-webkit-transform-origin');
			}
			else if(navigator.isOpera) {
				this.drawing.style.removeProperty('-o-transform');
				this.drawing.style.removeProperty('-o-transform-origin');
			}
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
		if(this.parent != undefined) {
			this.setParentStyle(this.parent.mergeStyle);
			this.setParentDisabled(this.getIsDisabled());
		}
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

