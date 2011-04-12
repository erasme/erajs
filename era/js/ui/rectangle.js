

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
		this.getDrawing().style.setProperty('box-sizing', 'border-box', null);

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
			this.invalidateRender();
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
			this.invalidateRender();
		}
	},

	getRadiusTopRight: function() {
		return this.radiusTopRight;
	},

	setRadiusTopRight: function(radiusTopRight) {
		if(this.radiusTopRight != radiusTopRight) {
			this.radiusTopRight = radiusTopRight;
			this.invalidateRender();
		}
	},

	getRadiusBottomLeft: function() {
		return this.radiusBottomLeft;
	},

	setRadiusBottomLeft: function(radiusBottomLeft) {
		if(this.radiusBottomLeft != radiusBottomLeft) {
			this.radiusBottomLeft = radiusBottomLeft;
			this.invalidateRender();
		}
	},

	getRadiusBottomRight: function() {
		return this.radiusBottomRight;
	},

	setRadiusBottomRight: function(radiusBottomRight) {
		if(this.radiusBottomRight != radiusBottomRight) {
			this.radiusBottomRight = radiusBottomRight;
			this.invalidateRender();
		}
	},

	setFill: function(fill) {
		if(this.fill != fill) {
			this.fill = fill;
			this.invalidateRender();
		}
	},

	getFill: function() {
		return this.fill;
	},

	setStroke: function(stroke) {
		if(this.stroke != stroke) {
			this.stroke = stroke;
			this.invalidateRender();
		}
	},

	getStroke: function() {
		return this.stroke;
	},

	setStrokeWidth: function(strokeWidth) {
		if(this.strokeWidth != strokeWidth) {
			this.strokeWidth = strokeWidth;
			this.invalidateRender();
		}
	},
	
}, {
/*	render: function() {
		this.rectDrawing = document.createElementNS(htmlNS, 'div');
		this.rectDrawing.style.setProperty('box-sizing', 'border-box', null);
		return this.rectDrawing;
	},*/

/*	arrangeCore: function(width, height) {
		this.rectDrawing.style.setProperty('width', width+'px', null);
		this.rectDrawing.style.setProperty('height', height+'px', null);
	},*/

	updateRenderCore: function() {
		var drawing = this.getDrawing();

		if(Ui.Rectangle.supportBorderRadius) {
			drawing.style.setProperty('border-top-left-radius', this.getRadiusTopLeft()+'px', null);
			drawing.style.setProperty('border-top-right-radius', this.getRadiusTopRight()+'px', null);
			drawing.style.setProperty('border-bottom-left-radius', this.getRadiusBottomLeft()+'px', null);
			drawing.style.setProperty('border-bottom-right-radius', this.getRadiusBottomRight()+'px', null);
		}
		else if(Ui.Rectangle.supportMozBorderRadius) {
			drawing.style.setProperty('-moz-border-radius-topleft', this.getRadiusTopLeft()+'px', null);
			drawing.style.setProperty('-moz-border-radius-topright', this.getRadiusTopRight()+'px', null);
			drawing.style.setProperty('-moz-border-radius-bottomleft', this.getRadiusBottomLeft()+'px', null);
			drawing.style.setProperty('-moz-border-radius-bottomright', this.getRadiusBottomRight()+'px', null);
		}		
		else if(Ui.Rectangle.supportWebkitBorderRadius) {
			drawing.style.setProperty('-webkit-border-top-left-radius', this.getRadiusTopLeft()+'px', null);
			drawing.style.setProperty('-webkit-border-top-right-radius', this.getRadiusTopRight()+'px', null);
			drawing.style.setProperty('-webkit-border-bottom-left-radius', this.getRadiusBottomLeft()+'px', null);
			drawing.style.setProperty('-webkit-border-bottom-right-radius', this.getRadiusBottomRight()+'px', null);
		}

		var shadow = 'none';
		if(this.shadow != undefined)
			shadow = this.shadow;

		if(Ui.Rectangle.supportBoxShadow)
			drawing.style.setProperty('box-shadow', shadow, null);
		else if(Ui.Rectangle.supportMozBoxShadow)
			drawing.style.setProperty('-moz-box-shadow', shadow, null);
		else if(Ui.Rectangle.supportWebkitBoxShadow)
			drawing.style.setProperty('-webkit-box-shadow', shadow, null);

		if(this.fill == undefined)
			drawing.style.setProperty('barkground', 'none', null);
		else if(typeof(this.fill) == 'string')
			drawing.style.setProperty('background', this.fill, null);
		else {
			if(this.fill.isSubclass('Ui.Color'))
				drawing.style.setProperty('background', this.fill.getCssRgba(), null);
			else if(this.fill.isSubclass('Ui.LinearGradient')) {
				drawing.style.setProperty('background-image', this.fill.getBackgroundImage(), null);
				drawing.style.setProperty('background-size', '100% 100%', null);
			}
		}
		if((this.stroke != undefined) && (this.strokeWidth > 0)) {
			drawing.style.setProperty('border-width', this.strokeWidth+'px', null);
			drawing.style.setProperty('border-style', 'solid', null);
			if(typeof(this.stroke) == 'string')
				drawing.style.setProperty('border-color', this.stroke);
			else if(this.fill.isSubclass('Ui.Color'))
				drawing.style.setProperty('background', this.fill.getCssRgba(), null);
		}
		else
			drawing.style.setProperty('border-width', '0px', null);
	},
});

Ui.Rectangle.supportBorderRadius = false;
Ui.Rectangle.supportMozBorderRadius = false;
Ui.Rectangle.supportWebkitBorderRadius = false;

var test = document.createElementNS(htmlNS, 'div');
test.style.setProperty('border-top-left-radius', '8px', null);
var res = test.style.getPropertyValue('border-top-left-radius');
if((res != null) && (res != undefined) && (res != ''))
	Ui.Rectangle.supportBorderRadius = true;
else {
	test.style.setProperty('-moz-border-radius-topleft', '8px', null);
	res = test.style.getPropertyValue('-moz-border-radius-topleft');
	if((res != null) && (res != undefined) && (res != '')) {
		Ui.Rectangle.supportMozBorderRadius = true;
	}
	else {
		test.style.setProperty('-webkit-border-top-left-radius', '8px', null);
		res = test.style.getPropertyValue('-webkit-border-top-left-radius');
		if((res != null) && (res != undefined) && (res != '')) {
			Ui.Rectangle.supportWebkitBorderRadius = true;
		}
	}
}


Ui.Rectangle.supportBoxShadow = false;
Ui.Rectangle.supportMozBoxShadow = false;
Ui.Rectangle.supportWebkitBoxShadow = false;

test.style.setProperty('box-shadow', '0px 0px 4px black', null);
var res = test.style.getPropertyValue('box-shadow');
if((res != null) && (res != undefined) && (res != ''))
	Ui.Rectangle.supportBoxShadow = true;
else {
	test.style.setProperty('-moz-box-shadow', '0px 0px 4px black', null);
	res = test.style.getPropertyValue('-moz-box-shadow');
	if((res != null) && (res != undefined) && (res != '')) {
		Ui.Rectangle.supportMozBoxShadow = true;
	}
	else {
		test.style.setProperty('-webkit-box-shadow', '0px 0px 4px black', null);
		res = test.style.getPropertyValue('-webkit-box-shadow');
		if((res != null) && (res != undefined) && (res != '')) {
			Ui.Rectangle.supportWebkitBoxShadow = true;
		}
	}
}

test = undefined;


