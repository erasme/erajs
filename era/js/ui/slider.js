//
// Define the Slider class.
//
Ui.Container.extend('Ui.Slider', {
	value: 0,
	background: undefined,
	button: undefined,

	constructor: function(config) {
		if(config.value != undefined)
			this.value = config.value;

		this.lightShadow = new Ui.Rectangle({ fill: new Ui.Color({ r: 1, g: 1, b: 1, a: 0.25 }), radius: 7 });
		this.appendChild(this.lightShadow);

		this.darkShadow = new Ui.Rectangle({ fill: new Ui.Color({ r: 0, g: 0, b: 0, a: 0.4}), radius: 7 });
		this.appendChild(this.darkShadow);

		this.background = new Ui.Rectangle({ fill: new Ui.Color({ r: 0.85, g: 0.85, b: 0.85 }), radius: 7, shadow: 'inset 0px 0px 1px 1px rgba(0, 0, 0, 0.20)' });
		this.appendChild(this.background);

		this.barBox = new Ui.LBox();
		this.appendChild(this.barBox);

		this.barBackground = new Ui.Rectangle({ radius: 6 });
		this.barBox.append(this.barBackground);

		this.bar = new Ui.Rectangle({ margin: 1, radius: 6 });
		this.barBox.append(this.bar);

		this.button = new Ui.Movable({ moveVertical: false });
		this.appendChild(this.button);
		this.connect(this.button, 'move', this.onButtonMove);
		this.connect(this.button, 'focus', this.updateColors);
		this.connect(this.button, 'blur', this.updateColors);
		this.connect(this.button, 'down', this.updateColors);
		this.connect(this.button, 'up', this.updateColors);

//		var buttonBox = new Ui.LBox();
//		this.button.setContent(buttonBox);

//		this.buttonContentBorder = new Ui.Rectangle({ radius: 20, fill: 'black' });
//		buttonBox.append(this.buttonContentBorder);

//		this.buttonContent = new Ui.Rectangle({ radius: 20, fill: 'lightblue', margin: 3 });
//		buttonBox.append(this.buttonContent);

		this.buttonContent = new Ui.SliderContentDrawing({ marginTop: 5, marginLeft: 10, marginRight: 10});
		this.button.setContent(this.buttonContent);

		this.addEvents('change');
	},

	getValue: function() {
		return this.value;
	},

	setValue: function(value) {
		if(this.value != value) {
			this.value = value;
			this.updateValue();
			this.fireEvent('change', this);
		}
	},

	//
	// Private
	//

	onButtonMove: function(button) {
		var posX = this.button.getPositionX();
		var width = this.getLayoutWidth();
		var maxX = width - 44;
		if(posX < 0)
			posX = 0;
		else if(posX > maxX)
			posX = maxX;

		var oldValue = this.value;
		this.value = posX / maxX;
		this.disconnect(this.button, 'move', this.onButtonMove);
		this.updateValue();
		this.connect(this.button, 'move', this.onButtonMove);
		if(oldValue != this.value)
			this.fireEvent('change', this);
	},

	updateValue: function() {
		var width = this.getLayoutWidth();
		var height = this.getLayoutHeight();
		var maxX = width - 44;
		this.button.setPosition(maxX * this.value, undefined);
		var y = (height - 44)/2;
		this.barBox.arrange(18, y + 15, (width - 36) * this.value, 15);
	},

	getGradient: function() {
		var yuv = this.getStyleProperty('color').getYuv();
		return new Ui.LinearGradient({ stops: [
			{ offset: 0, color: new Ui.Color({ y: yuv.y + 0.10, u: yuv.u, v: yuv.v }) },
			{ offset: 1, color: new Ui.Color({ y: yuv.y - 0.10, u: yuv.u, v: yuv.v }) },
		] });
	},

	getBarBorderColor: function() {
		var yuv = this.getStyleProperty('color').getYuv();
		return new Ui.Color({ y: yuv.y - 0.20, u: yuv.u, v: yuv.v });
	},

	getContentBorderColor: function() {
		var yuv = this.getStyleProperty('color').getYuv();
		return new Ui.Color({ y: yuv.y - 0.40, u: yuv.u, v: yuv.v });
	},

	getButtonColor: function() {
		var yuv = this.getStyleProperty('color').getYuv();

		var deltaY = 0;
		if(this.button.getIsDown())
			deltaY = -0.30;
		else if(this.button.getHasFocus())
			deltaY = 0.10;

		return new Ui.Color({ y: yuv.y + deltaY, u: yuv.u, v: yuv.v });
	},

	updateColors: function() {
/*		this.rect1.setFill(this.getGradient());
		if(this.icon1 != undefined)
			this.icon1.setFill(this.getContentLightColor());
		if(this.text1 != undefined)
			this.text1.setColor(this.getContentLightColor());
		if(this.icon2 != undefined)
			this.icon2.setFill(this.getContentColor());
		if(this.text2 != undefined)
			this.text2.setColor(this.getContentColor());
		this.rect2.setFill(this.getLightColor());*/

		this.bar.setFill(this.getGradient());
		this.barBackground.setFill(this.getBarBorderColor());
		this.buttonContent.setFill(this.getButtonColor());
	},

}, {
	measureCore: function(width, height) {
		this.lightShadow.measure(width - 34, 16);
		this.darkShadow.measure(width - 34, 16);
		this.background.measure(width - 36, 16);
		this.barBox.measure(width - 38, 12);
		this.button.measure(40, 40);
		return { width: 88, height: 44 };
	},

	arrangeCore: function(width, height) {
		var y = (height - 44)/2;
		this.lightShadow.arrange(17, y + 15, width - 34, 16);
		this.darkShadow.arrange(17, y + 14, width - 34, 16);
		this.background.arrange(18, y + 15, width - 36, 16);
		this.button.arrange(2, y + 2, 40, 40);
		this.updateValue();
	},

	onStyleChange: function() {
		this.updateColors();
	},

	onDisable: function() {
		Ui.Slider.base.onDisable.call(this);
		this.button.setOpacity(0.2);
	},

	onEnable: function() {
		Ui.Slider.base.onEnable.call(this);
		this.button.setOpacity(1);
	},
}, {
	style: {
		color: new Ui.Color({ r: 0.31, g: 0.66, b: 1 }),
	},
});


Ui.SVGElement.extend('Ui.SliderContentDrawing', {
	contentDrawing: undefined,

	svgGradient: undefined,
	shadow: undefined,
	background: undefined,

	radius: 8,
	fill: 'black',

	constructor: function(config) {
		if(config.radius != undefined)
			this.setRadius(config.radius);
		if(config.fill != undefined)
			this.setFill(config.fill);
	},

	setRadius: function(radius) {
		if(this.radius != radius) {
			this.radius = radius;
			this.invalidateArrange();
		}
	},

	setFill: function(fill) {
		if(this.fill != fill) {
			this.fill = Ui.Color.create(fill);
			if(this.svgGradient != undefined)
				this.contentDrawing.removeChild(this.svgGradient);

			var yuv = this.fill.getYuv();
			var gradient = new Ui.LinearGradient({ stops: [
				{ offset: 0, color: new Ui.Color({ y: yuv.y + 0.2, u: yuv.u, v: yuv.v }) },
				{ offset: 1, color: new Ui.Color({ y: yuv.y - 0.1, u: yuv.u, v: yuv.v }) },
			] });
			this.svgGradient = gradient.getSVGGradient();
			var gradId = 'grad'+Core.Util.generateId();
			this.svgGradient.setAttributeNS(null, 'id', gradId);
			this.contentDrawing.insertBefore(this.svgGradient, this.contentDrawing.firstChild);
			this.background.style.fill = 'url(#'+gradId+')';
			this.shadow.style.fill = (new Ui.Color({ y: yuv.y - 0.9, u: yuv.u, v: yuv.v })).getCssHtml();
		}
	},

	//
	// Private
	//

	genPath: function(width, height, radius) {
		return 'M'+radius+',0 L'+(width-radius)+',0 A'+radius+','+radius+' 0 0,1 '+width+','+radius+'  L'+width+','+(height*0.66)+' L'+(width/2)+','+height+' L0,'+(height*0.66)+' L0,'+radius+' A'+radius+','+radius+' 0 0,1 '+radius+',0 z';
	},

}, {
	render: function() {
		this.contentDrawing = document.createElementNS(svgNS, 'g');

		this.shadow = document.createElementNS(svgNS, 'path');
		this.contentDrawing.appendChild(this.shadow);
		this.shadow.style.stroke = 'none';

		this.background = document.createElementNS(svgNS, 'path');
		this.contentDrawing.appendChild(this.background);
		this.background.style.stroke = 'none';

		return this.contentDrawing;
	},

	arrangeCore: function(width, height) {
		this.shadow.setAttributeNS(null, 'd', this.genPath(width, height, this.radius));
		this.background.setAttributeNS(null, 'transform', 'translate(1,1)');
		this.background.setAttributeNS(null, 'd', this.genPath(width-2, height-2, this.radius-1.4));
	},
});


