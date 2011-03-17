

Ui.Element.extend('Ui.Rectangle', {
	fill: 'black',
	rectDrawing: undefined,

	constructor: function(config) {
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
		if(config.fill != undefined)
			this.setFill(config.fill);
		else
			this.setFill(this.fill);
	},

	setRadius: function(radius) {
		this.setRadiusTopLeft(radius);
		this.setRadiusTopRight(radius);
		this.setRadiusBottomLeft(radius);
		this.setRadiusBottomRight(radius);
	},

	setRadiusTopLeft: function(radius) {
		if(Ui.Rectangle.supportBorderRadius)
			this.rectDrawing.style.setProperty('border-top-left-radius', radius+'px', null);
		else if(Ui.Rectangle.supportMozBorderRadius)
			this.rectDrawing.style.setProperty('-moz-border-radius-topleft', radius+'px', null);
		else if(Ui.Rectangle.supportWebkitBorderRadius)
			this.rectDrawing.style.setProperty('-webkit-border-top-left-radius', radius+'px', null);
	},

	setRadiusTopRight: function(radius) {
		if(Ui.Rectangle.supportBorderRadius)
			this.rectDrawing.style.setProperty('border-top-right-radius', radius+'px', null);
		else if(Ui.Rectangle.supportMozBorderRadius)
			this.rectDrawing.style.setProperty('-moz-border-radius-topright', radius+'px', null);
		else if(Ui.Rectangle.supportWebkitBorderRadius)
			this.rectDrawing.style.setProperty('-webkit-border-top-right-radius', radius+'px', null);
	},

	setRadiusBottomLeft: function(radius) {
		if(Ui.Rectangle.supportBorderRadius)
			this.rectDrawing.style.setProperty('border-bottom-left-radius', radius+'px', null);
		else if(Ui.Rectangle.supportMozBorderRadius)
			this.rectDrawing.style.setProperty('-moz-border-radius-bottomleft', radius+'px', null);
		else if(Ui.Rectangle.supportWebkitBorderRadius)
			this.rectDrawing.style.setProperty('-webkit-border-bottom-left-radius', radius+'px', null);
	},

	setRadiusBottomRight: function(radius) {
		if(Ui.Rectangle.supportBorderRadius)
			this.rectDrawing.style.setProperty('border-bottom-right-radius', radius+'px', null);
		else if(Ui.Rectangle.supportMozBorderRadius)
			this.rectDrawing.style.setProperty('-moz-border-radius-bottomright', radius+'px', null);
		else if(Ui.Rectangle.supportWebkitBorderRadius)
			this.rectDrawing.style.setProperty('-webkit-border-bottom-right-radius', radius+'px', null);
	},

	setFill: function(fill) {
		this.fill = fill;
		this.rectDrawing.style.background = this.fill;
	},

	getFill: function() {
		return this.fill;
	},
}, {
	render: function() {
		this.rectDrawing = document.createElementNS(htmlNS, 'div');
		return this.rectDrawing;
	},

	arrangeCore: function(width, height) {
		this.rectDrawing.style.setProperty('width', width+'px', null);
		this.rectDrawing.style.setProperty('height', height+'px', null);
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
test = undefined;


