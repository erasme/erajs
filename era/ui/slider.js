Ui.Container.extend('Ui.Slider', 
/**@lends Ui.Slider#*/
{
	value: 0,
	background: undefined,
	button: undefined,
	orientation: 'horizontal',
	updateLock: undefined,

	/**
	 * @constructs
	 * @class
	 * @extends Ui.Container
	 */
	constructor: function(config) {
		this.addEvents('change');

		this.background = new Ui.Rectangle({ width: 4, height: 4 });
		this.appendChild(this.background);

		this.bar = new Ui.Rectangle({ width: 4, height: 4 });
		this.appendChild(this.bar);

		this.button = new Ui.Movable({ moveVertical: false });
		this.appendChild(this.button);
		this.connect(this.button, 'move', this.onButtonMove);
		this.connect(this.button, 'focus', this.updateColors);
		this.connect(this.button, 'blur', this.updateColors);
		this.connect(this.button, 'down', this.updateColors);
		this.connect(this.button, 'up', this.updateColors);

		this.buttonContent = new Ui.Rectangle({ radius: 10, width: 20, height: 20, margin: 10 });
		this.button.setContent(this.buttonContent);
	},

	getValue: function() {
		return this.value;
	},

	setValue: function(value, dontSignal) {
		value = Math.min(1, Math.max(0, value));
		if(this.value !== value) {
			this.value = value;
			this.disconnect(this.button, 'move', this.onButtonMove);
			this.updateValue();
			this.connect(this.button, 'move', this.onButtonMove);
			if(dontSignal !== true)
				this.fireEvent('change', this, this.value);
		}
	},
	
	getOrientation: function() {
		return this.orientation;
	},
	
	setOrientation: function(orientation) {
		if(this.orientation !== orientation) {
			this.orientation = orientation;
			this.button.setMoveHorizontal(true);
			this.button.setMoveVertical(true);
			this.updateValue();
			if(this.orientation === 'horizontal') {
				this.button.setMoveHorizontal(true);
				this.button.setMoveVertical(false);
			}
			else {
				this.button.setMoveHorizontal(false);
				this.button.setMoveVertical(true);
			}
			this.invalidateMeasure();
			this.onStyleChange();
		}
	},

	/**#@+
	 * @private
	 */

	onButtonMove: function(button) {
		var oldValue = this.value;

		// get the new value only if its a user move
		if(this.updateLock !== true) {
			var pos;
			var size;
			var max;
		
			if(this.orientation === 'horizontal') {
				pos = this.button.getPositionX();
				size = this.getLayoutWidth();
				max = size - this.button.getLayoutWidth();
			}
			else {
				size = this.getLayoutHeight();
				max = size - this.button.getLayoutHeight();
				pos = max - this.button.getPositionY();
			}
			if(pos < 0)
				pos = 0;
			else if(pos > max)
				pos = max;

			this.value = pos / max;
		}

		this.disconnect(this.button, 'move', this.onButtonMove);
		this.updateValue();
		this.connect(this.button, 'move', this.onButtonMove);
		if(oldValue != this.value)
			this.fireEvent('change', this, this.value);
	},

	updateValue: function() {
		this.updateLock = true;

		var max;
		var width = this.getLayoutWidth();
		var height = this.getLayoutHeight();
		if(this.orientation === 'horizontal') {
			max = width - this.button.getLayoutWidth();
			this.button.setPosition(max * this.value, 0);
			this.bar.arrange(
				this.button.getLayoutWidth()/2,
				(height-this.bar.getMeasureHeight())/2,
				max * this.value, this.bar.getMeasureHeight());
		}
		else {		
			max = height - this.button.getLayoutHeight();
			var x = (width - 44)/2;
			var size = (height - 36) * this.value;
			this.button.setPosition(0, max * (1 - this.value));
			this.bar.arrange(
				(width-this.bar.getMeasureWidth())/2,
				this.button.getLayoutHeight()/2 + max * (1 - this.value),
				this.bar.getMeasureWidth(), max * this.value);
		}

		delete(this.updateLock);
	},

	getColor: function() {
		var yuv = Ui.Color.create(this.getStyleProperty('background')).getYuv();
		return new Ui.Color({ y: yuv.y, u: yuv.u, v: yuv.v });
	},
	
	getForeground: function() {
		return Ui.Color.create(this.getStyleProperty('foreground'));
	},

	getBackground: function() {
		var yuv = Ui.Color.create(this.getStyleProperty('background')).getYuv();
		var deltaY = 0;
		if(this.button.getIsDown())
			deltaY = -0.30;
		return new Ui.Color({ y: yuv.y + deltaY, u: yuv.u, v: yuv.v });
	},

	getButtonColor: function() {
		var yuv = Ui.Color.create(this.getStyleProperty('background')).getYuv();

		var deltaY = 0;
		if(this.button.getIsDown())
			deltaY = -0.30;
		else if(this.button.getHasFocus())
			deltaY = 0.10;

		return new Ui.Color({ y: yuv.y + deltaY, u: yuv.u, v: yuv.v });
	},

	updateColors: function() {
		this.bar.setFill(this.getForeground());
		this.background.setFill(this.getBackground());
		this.buttonContent.setFill(this.getForeground());
	}

	/**#@-*/
}, 
/**@lends Ui.Slider#*/
{
	measureCore: function(width, height) {
		var buttonSize = this.button.measure(0, 0);
		var size = buttonSize;
		var res;

		if(this.orientation === 'horizontal') {
			res = this.background.measure(width-buttonSize.width, 0);
			if(res.width > size.width)
				size.width = res.width;
			if(res.height > size.height)
				size.height = res.height;
			res = this.bar.measure(width-buttonSize.width, 0);
			if(res.width > size.width)
				size.width = res.width;
			if(res.height > size.height)
				size.height = res.height;
		}
		else {
			res = this.background.measure(0, height-buttonSize.height);
			if(res.width > size.width)
				size.width = res.width;
			if(res.height > size.height)
				size.height = res.height;
			res = this.bar.measure(0, height-buttonSize.height);
			if(res.width > size.width)
				size.width = res.width;
			if(res.height > size.height)
				size.height = res.height;
		}
		return size;
	},

	arrangeCore: function(width, height) {	
		if(this.orientation === 'horizontal') {
			this.button.arrange(0, (height-this.button.getMeasureHeight())/2, this.button.getMeasureWidth(), this.button.getMeasureHeight());
			this.background.arrange(
				this.button.getLayoutWidth()/2,
				(height-this.background.getMeasureHeight())/2,
				width-this.button.getLayoutWidth(), this.background.getMeasureHeight());
		}
		else {
			this.button.arrange((width-this.button.getMeasureWidth())/2, 0, this.button.getMeasureWidth(), this.button.getMeasureHeight());
			this.background.arrange(
				(width-this.background.getMeasureWidth())/2,
				this.button.getLayoutHeight()/2,
				this.background.getMeasureWidth(), height-this.button.getLayoutHeight());
		}
		this.updateValue();
	},

	onStyleChange: function() {
		this.background.setRadius(this.getStyleProperty('radius'));
		this.bar.setRadius(this.getStyleProperty('radius'));
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
		radius: 0,
		background: '#e1e1e1',
		backgroundBorder: '#919191',
		foreground: '#07a0e5'
	}
});

