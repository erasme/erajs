Ui.Container.extend('Ui.Slider', 
/**@lends Ui.Slider#*/
{
	value: 0,
	background: undefined,
	button: undefined,

	/**
	 * @constructs
	 * @class
	 * @extends Ui.Container
	 */
	constructor: function(config) {
		this.addEvents('change');

		this.background = new Ui.Frame({ frameWidth: 2, radius: 4 });
		this.appendChild(this.background);

		this.bar = new Ui.Rectangle({ margin: 1, height: 4 });
		this.appendChild(this.bar);

		this.button = new Ui.Movable({ moveVertical: false });
		this.appendChild(this.button);
		this.connect(this.button, 'move', this.onButtonMove);
		this.connect(this.button, 'focus', this.updateColors);
		this.connect(this.button, 'blur', this.updateColors);
		this.connect(this.button, 'down', this.updateColors);
		this.connect(this.button, 'up', this.updateColors);

		this.buttonContent = new Ui.SliderContentDrawing({ marginTop: 10, marginBottom: 2, marginLeft: 12, marginRight: 12});
		this.button.setContent(this.buttonContent);
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

	/**#@+
	 * @private
	 */

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
		this.bar.arrange(18, y + 18, (width - 36) * this.value, 9);
	},

	getColor: function() {
		var yuv = this.getStyleProperty('color').getYuv();
		return new Ui.Color({ y: yuv.y, u: yuv.u, v: yuv.v });
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
		this.bar.setFill(this.getColor());
		this.background.setFill(this.getColor());
		this.buttonContent.setFill(this.getButtonColor());
	}

	/**#@-*/
}, 
/**@lends Ui.Slider#*/
{
	measureCore: function(width, height) {
		this.background.measure(width - 36, 10);
		this.bar.measure(width - 38, 9);
		this.button.measure(40, 40);
		return { width: 88, height: 44 };
	},

	arrangeCore: function(width, height) {
		var y = (height - 44)/2;
		this.background.arrange(18, y + 18, width - 36, 10);
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
	}
}, 
/**@lends Ui.Slider*/
{
	style: {
		color: Ui.Color.create('#b1b1b1')
	}
});

Ui.LBox.extend('Ui.SliderContentDrawing', 
/**@lends Ui.SliderContentDrawing#*/
{
	contentDrawing: undefined,

	svgGradient: undefined,
	shadow: undefined,
	background: undefined,

	radius: 0,
	fill: 'black',

	/**
	 * @constructs
	 * @class
	 * @extends Ui.LBox
	 */
	constructor: function(config) {
		this.shadow = new Ui.Shape();
		this.append(this.shadow);

		this.background = new Ui.Shape({ margin: 1 });
		this.append(this.background);
	},

	setRadius: function(radius) {
		if(this.radius != radius) {
			this.radius = radius;
		}
	},

	setFill: function(fill) {
		if(this.fill != fill) {
			this.fill = Ui.Color.create(fill);
			var yuv = this.fill.getYuv();
			this.background.setFill(this.fill);
			this.shadow.setFill((new Ui.Color({ y: yuv.y - 0.3, u: yuv.u, v: yuv.v })).getCssHtml());
		}
	},

	/**@private*/
	genPath: function(width, height, radius) {
		return 'M'+radius+',0 L'+(width-radius)+',0 Q'+width+',0 '+width+','+radius+'  L'+width+','+(height*0.66)+' L'+(width/2)+','+height+' L0,'+(height*0.66)+' L0,'+radius+' Q0,0 '+radius+',0 z';
	}
}, 
/**@lends Ui.SliderContentDrawing#*/
{
	arrangeCore: function(width, height) {
		Ui.SliderContentDrawing.base.arrangeCore.call(this, width, height);

		this.shadow.setPath(this.genPath(width, height, this.radius));
		this.background.setPath(this.genPath(width-2, height-2, this.radius-1.4));
	}
});


