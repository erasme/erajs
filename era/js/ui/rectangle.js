

Ui.Element.extend('Ui.Rectangle', {
	fill: undefined,
	stroke: undefined,
	strokeWidth: 0,
	radiusTopLeft: 0,
	radiusTopRight: 0,
	radiusBottomLeft: 0,
	radiusBottomRight: 0,
	shadow: undefined,

	constructor: function(config) {
		this.getDrawing().style.boxSizing = 'border-box';
		this.getDrawing().style.borderStyle = 'solid';
		this.getDrawing().style.borderWidth = '0px';

		if(config.radius != undefined)
			this.setRadius(config.radius);
		if(config.radiusTopLeft != undefined)
			this.setRadiusTopLeft(config.radiusTopLeft);
		if(config.radiusTopRight != undefined)
			this.setRadiusTopRight(config.radiusTopRight);
		if(config.radiusBottomLeft != undefined)
			this.setRadiusBottomLeft(config.radiusBottomLeft);
		if(config.radiusBottomRight != undefined)
			this.setRadiusBottomRight(config.radiusBottomRight);
		if(config.stroke != undefined)
			this.setStroke(config.stroke);
		if(config.strokeWidth != undefined)
			this.setStrokeWidth(config.strokeWidth);
		if(config.fill != undefined)
			this.setFill(config.fill);
		if(config.shadow != undefined)
			this.setShadow(config.shadow);
	},

	setShadow: function(shadow) {
		if(this.shadow != shadow) {
			this.shadow = shadow;
			if(shadow == undefined)
				shadow = 'none';
			if(Ui.Rectangle.supportBoxShadow)
				this.getDrawing().style.boxShadow = shadow;
			else if(Ui.Rectangle.supportMozBoxShadow)
				this.getDrawing().style.MozBoxShadow = shadow;
			else if(Ui.Rectangle.supportWebkitBoxShadow)
				this.getDrawing().style.webkitBoxShadow = shadow;
		}
	},

	getBoxShadow: function() {
		return this.shadow;
	},

	setRadius: function(radius) {
		this.setRadiusTopLeft(radius);
		this.setRadiusTopRight(radius);
		this.setRadiusBottomLeft(radius);
		this.setRadiusBottomRight(radius);
	},

	getRadiusTopLeft: function() {
		return this.radiusTopLeft;
	},

	setRadiusTopLeft: function(radiusTopLeft) {
		if(this.radiusTopLeft != radiusTopLeft) {
			this.radiusTopLeft = radiusTopLeft;
			if(Ui.Rectangle.supportBorderRadius)
				this.getDrawing().style.borderTopLeftRadius = this.radiusTopLeft+'px';
			else if(Ui.Rectangle.supportMozBorderRadius)
				this.getDrawing().style.MozBorderRadiusTopleft = this.radiusTopLeft+'px';
			else if(Ui.Rectangle.supportWebkitBorderRadius)
				this.getDrawing().style.webkitBorderTopLeftRadius = this.radiusTopLeft+'px';
		}
	},

	getRadiusTopRight: function() {
		return this.radiusTopRight;
	},

	setRadiusTopRight: function(radiusTopRight) {
		if(this.radiusTopRight != radiusTopRight) {
			this.radiusTopRight = radiusTopRight;
			if(Ui.Rectangle.supportBorderRadius)
				this.getDrawing().style.borderTopRightRadius = this.radiusTopRight+'px';
			else if(Ui.Rectangle.supportMozBorderRadius)
				this.getDrawing().style.MozBorderRadiusTopright = this.radiusTopRight+'px';
			else if(Ui.Rectangle.supportWebkitBorderRadius)
				this.getDrawing().style.webkitBorderTopRightRadius = this.radiusTopRight+'px';
		}
	},

	getRadiusBottomLeft: function() {
		return this.radiusBottomLeft;
	},

	setRadiusBottomLeft: function(radiusBottomLeft) {
		if(this.radiusBottomLeft != radiusBottomLeft) {
			this.radiusBottomLeft = radiusBottomLeft;
			if(Ui.Rectangle.supportBorderRadius)
				this.getDrawing().style.borderBottomLeftRadius = this.radiusBottomLeft+'px';
			else if(Ui.Rectangle.supportMozBorderRadius)
				this.getDrawing().style.MozBorderRadiusBottomleft = this.radiusBottomLeft+'px';
			else if(Ui.Rectangle.supportWebkitBorderRadius)
				this.getDrawing().style.webkitBorderBottomLeftRadius = this.radiusBottomLeft+'px';
		}
	},

	getRadiusBottomRight: function() {
		return this.radiusBottomRight;
	},

	setRadiusBottomRight: function(radiusBottomRight) {
		if(this.radiusBottomRight != radiusBottomRight) {
			this.radiusBottomRight = radiusBottomRight;
			if(Ui.Rectangle.supportBorderRadius)
				this.getDrawing().style.borderBottomRightRadius = this.radiusBottomRight+'px';
			else if(Ui.Rectangle.supportMozBorderRadius)
				this.getDrawing().style.MozBorderRadiusBottomright = this.radiusBottomRight+'px';
			else if(Ui.Rectangle.supportWebkitBorderRadius)
				this.getDrawing().style.webkitBorderBottomRightRadius = this.radiusBottomRight+'px';
		}
	},

	setFill: function(fill) {
		if(this.fill != fill) {
			this.fill = fill;
			if(this.fill == undefined)
				this.getDrawing().style.barkground = 'none';
			else if(typeof(this.fill) == 'string')
				this.getDrawing().style.background = this.fill;
			else {
				if(this.fill.isSubclass('Ui.Color'))
					this.getDrawing().style.background = this.fill.getCssRgba();
				else if(this.fill.isSubclass('Ui.LinearGradient')) {
					this.getDrawing().style.backgroundImage = this.fill.getBackgroundImage();
					this.getDrawing().style.backgroundSize = '100% 100%';
				}
			}
		}
	},

	getFill: function() {
		return this.fill;
	},

	setStroke: function(stroke) {
		if(this.stroke != stroke) {
			this.stroke = stroke;
			if(typeof(this.stroke) == 'string')
				this.getDrawing().style.borderColor = this.stroke;
			else if(this.stroke.isSubclass('Ui.Color'))
				this.getDrawing().style.borderColor = this.stroke.getCssRgba();
		}
	},

	getStroke: function() {
		return this.stroke;
	},

	setStrokeWidth: function(strokeWidth) {
		if(this.strokeWidth != strokeWidth) {
			this.strokeWidth = strokeWidth;
			this.getDrawing().style.borderWidth = this.strokeWidth+'px';
		}
	},
	
}, {
});

Ui.Rectangle.supportBorderRadius = false;
Ui.Rectangle.supportMozBorderRadius = false;
Ui.Rectangle.supportWebkitBorderRadius = false;

var test = document.createElementNS(htmlNS, 'div');
test.style.borderTopLeftRadius = '8px';
var res = test.style.getPropertyValue('border-top-left-radius');
if((res != null) && (res != undefined) && (res != ''))
	Ui.Rectangle.supportBorderRadius = true;
else {
	test.style.MozBorderRadiusTopleft = '8px';
	res = test.style.getPropertyValue('-moz-border-radius-topleft');
	if((res != null) && (res != undefined) && (res != '')) {
		Ui.Rectangle.supportMozBorderRadius = true;
	}
	else {
		test.style.webkitBorderTopLeftRadius = '8px';
		res = test.style.getPropertyValue('-webkit-border-top-left-radius');
		if((res != null) && (res != undefined) && (res != '')) {
			Ui.Rectangle.supportWebkitBorderRadius = true;
		}
	}
}


Ui.Rectangle.supportBoxShadow = false;
Ui.Rectangle.supportMozBoxShadow = false;
Ui.Rectangle.supportWebkitBoxShadow = false;

test.style.boxShadow = '0px 0px 4px black';
var res = test.style.getPropertyValue('box-shadow');
if((res != null) && (res != undefined) && (res != ''))
	Ui.Rectangle.supportBoxShadow = true;
else {
	test.style.MozBoxShadow = '0px 0px 4px black';
	res = test.style.getPropertyValue('-moz-box-shadow');
	if((res != null) && (res != undefined) && (res != '')) {
		Ui.Rectangle.supportMozBoxShadow = true;
	}
	else {
		test.style.webkitBoxShadow = '0px 0px 4px black';
		res = test.style.getPropertyValue('-webkit-box-shadow');
		if((res != null) && (res != undefined) && (res != '')) {
			Ui.Rectangle.supportWebkitBoxShadow = true;
		}
	}
}

test = undefined;

