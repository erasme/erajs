Ui.LBox.extend('Ui.SegmentBar',
/** @lends Ui.SegmentBar#*/
{
	border: undefined,
	box: undefined,
	current: undefined,
	field: 'text',
	data: undefined,
	orientation: 'horizontal',

	/**
	 * @constructs
	 * @class
	 * @extends Ui.LBox
	 */
	constructor: function(config) {
		this.setFocusable(true);

		this.addEvents('change');

		this.border = new Ui.Rectangle({ fill: '#888888' });
		this.append(this.border);

		this.box = new Ui.Box({ uniform: true, margin: 1, spacing: 1, orientation: this.orientation });
		this.append(this.box);

		this.connect(this, 'focus', this.updateColors);
		this.connect(this, 'blur', this.updateColors);
		this.connect(this.getDrawing(), 'keydown', this.onKeyDown);
	},

	setOrientation: function(orientation) {
		this.orientation = orientation;
		this.box.setOrientation(orientation);
	},

	setField: function(field) {
		this.field = field;
	},

	setData: function(data) {
		while(this.box.getFirstChild() != undefined) {
			this.disconnect(this.box.getFirstChild(), 'toggle', this.onSegmentSelect);
			this.box.remove(this.box.getFirstChild());
		}
		this.data = data;
		for(var i = 0; i < data.length; i++) {
			var mode;
			if(this.orientation === 'horizontal')
	 			mode = (i == 0)?'left':(i == data.length - 1)?'right':'middle';
	 		else
				mode = (i == 0)?'top':(i == data.length - 1)?'bottom':'middle';
			var segment = new Ui.SegmentButton({ data: data[i], text: data[i][this.field], mode: mode });
			this.box.append(segment, true);
			this.connect(segment, 'toggle', this.onSegmentSelect);
		}
	},

	setCurrentPosition: function(position) {
		if((position >= 0) && (position < this.box.getChildren().length))
			this.box.getChildren()[position].toggle();
	},

	getCurrentPosition: function() {
		for(var i = 0; i < this.box.getChildren().length; i++) {
			if(this.box.getChildren()[i].getIsToggled())
				return i;
		}
	},

	/**
	* Move the current choice to the next choice
	*/
	next: function() {
		for(var i = 0; i < this.box.getChildren().length; i++) {
			if(this.box.getChildren()[i] === this.current) {
				this.setCurrentPosition(i+1);
				break;
			}
		}
	},

	/**
	* Move the current choice to the previous choice
	*/
	previous: function() {
		for(var i = 0; i < this.box.getChildren().length; i++) {
			if(this.box.getChildren()[i] === this.current) {
				this.setCurrentPosition(i-1);
				break;
			}
		}
	},

	/**#@+ 
	 * @private 
	 */
	onSegmentSelect: function(segment) {
		if(this.current != undefined)
			this.current.untoggle();
		this.current = segment;
		this.fireEvent('change', this, segment.getData());
	},

	onKeyDown: function(event) {
		if(this.getIsDisabled())
			return;
		var key = event.which;
		if((key == 37) || (key == 39)) {
			event.stopPropagation();
			event.preventDefault();
		}
		if(key == 37)
			this.previous();
		else if(key == 39)
			this.next();
	},

	getCurrentColor: function() {
		var color = this.getStyleProperty('color');
		if(this.getHasFocus())
			color = this.getStyleProperty('focusColor');
		return color;
	},

	updateColors: function() {
		var color = this.getCurrentColor();
		for(var i = 0; i < this.box.getChildren().length; i++)
			this.box.getChildren()[i].setFill(color);
	}
	/**#@-*/
}, {
	onStyleChange: function() {
		var spacing = this.getStyleProperty('spacing');
		var radius = this.getStyleProperty('radius');
		this.border.setRadius(radius);
		for(var i = 0; i < this.box.getChildren().length; i++) {
			this.box.getChildren()[i].setRadius(radius-1);
			this.box.getChildren()[i].setSpacing(spacing);
		}
		this.updateColors();
	}
}, {
	style: {
		color: new Ui.Color({ r: 0.99, g: 0.99, b: 0.99 }),
		focusColor: '#fff0c8',
		radius: 3,
		spacing: 5
	}
});

Ui.Togglable.extend('Ui.SegmentButton', {
	label: undefined,
	bg: undefined,
	shadow: undefined,
	mode: undefined,
	data: undefined,
	fill: undefined,
	downFill: undefined,
	radius: 3,

	constructor: function(config) {
		this.setFocusable(false);
		
		this.bg = new Ui.Rectangle();
		this.append(this.bg);
		this.label = new Ui.Label({ margin: 7 });
		this.append(this.label);

		this.connect(this, 'toggle', this.onButtonSelect);
		this.connect(this, 'untoggle', this.onButtonUnselect);
	},

	getData: function() {
		return this.data;
	},

	setData: function(data) {
		this.data = data;
	},

	setText: function(text) {
		this.label.setText(text);
	},

	setMode: function(mode) {
		this.mode = mode;
		if(mode == 'left') {
			this.bg.setRadiusTopLeft(this.radius);
			this.bg.setRadiusBottomLeft(this.radius);
			this.bg.setRadiusTopRight(0);
			this.bg.setRadiusBottomRight(0);
		}
		else if(mode == 'right') {
			this.bg.setRadiusTopLeft(0);
			this.bg.setRadiusBottomLeft(0);
			this.bg.setRadiusTopRight(this.radius);
			this.bg.setRadiusBottomRight(this.radius);
		}
		else if(mode == 'top') {
			this.bg.setRadiusTopLeft(this.radius);
			this.bg.setRadiusBottomLeft(0);
			this.bg.setRadiusTopRight(this.radius);
			this.bg.setRadiusBottomRight(0);
		}
		else if(mode == 'bottom') {
			this.bg.setRadiusTopLeft(0);
			this.bg.setRadiusBottomLeft(this.radius);
			this.bg.setRadiusTopRight(0);
			this.bg.setRadiusBottomRight(this.radius);
		}
		else {
			this.bg.setRadiusTopLeft(0);
			this.bg.setRadiusBottomLeft(0);
			this.bg.setRadiusTopRight(0);
			this.bg.setRadiusBottomRight(0);
		}
	},

	setFill: function(fill) {
		if(this.fill !== fill) {
			this.fill = Ui.Color.create(fill);
			var yuv = this.fill.getYuva();
			this.downFill = new Ui.Color({ y: yuv.y - 0.2, u: yuv.u, v: yuv.v });
			if(this.getIsToggled())
				this.bg.setFill(this.downFill);
			else
				this.bg.setFill(this.fill);
		}
	},
	
	setRadius: function(radius) {
		this.radius = radius;
		this.setMode(this.mode);
	},
	
	setSpacing: function(spacing) {
		this.label.setMargin(spacing);
	},

	/**#@+ 
	 * @private 
	 */
	onButtonSelect: function() {
		this.bg.setFill(this.downFill);
	},

	onButtonUnselect: function() {
		this.bg.setFill(this.fill);
	}
	/**#@-*/
},
{
	onDisable: function() {
		Ui.Selectable.base.onDisable.call(this);
		this.bg.setOpacity(0.2);
	},

	onEnable: function() {
		Ui.Selectable.base.onEnable.call(this);
		this.bg.setOpacity(1);
	}
});

