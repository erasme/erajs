Ui.LBox.extend('Ui.SegmentBar',
/** @lends Ui.SegmentBar#*/
{
	border: undefined,
	hbox: undefined,
	current: undefined,
	field: 'text',
	data: undefined,

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

		this.hbox = new Ui.HBox({ uniform: true, margin: 1, spacing: 1 });
		this.append(this.hbox);

		this.connect(this, 'focus', this.updateColors);
		this.connect(this, 'blur', this.updateColors);
		this.connect(this.getDrawing(), 'keydown', this.onKeyDown);
	},

	setField: function(field) {
		this.field = field;
	},

	setData: function(data) {
		while(this.hbox.getFirstChild() != undefined) {
			this.disconnect(this.hbox.getFirstChild(), 'select', this.onSegmentSelect);
			this.hbox.remove(this.hbox.getFirstChild());
		}
		this.data = data;
		for(var i = 0; i < data.length; i++) {
			var segment = new Ui.SegmentButton({ data: data[i], text: data[i][this.field], mode: (i == 0)?'left':(i == data.length - 1)?'right':'middle' });
			this.hbox.append(segment, true);
			this.connect(segment, 'select', this.onSegmentSelect);
		}
	},

	setCurrentPosition: function(position) {
		if((position >= 0) && (position < this.hbox.getChildren().length))
			this.hbox.getChildren()[position].select();
	},

	getCurrentPosition: function() {
		for(var i = 0; i < this.hbox.getChildren().length; i++) {
			if(this.hbox.getChildren()[i].getIsSelected())
				return i;
		}
	},

	/**
	* Move the current choice to the next choice
	*/
	next: function() {
		for(var i = 0; i < this.hbox.getChildren().length; i++) {
			if(this.hbox.getChildren()[i] === this.current) {
				this.setCurrentPosition(i+1);
				break;
			}
		}
	},

	/**
	* Move the current choice to the previous choice
	*/
	previous: function() {
		for(var i = 0; i < this.hbox.getChildren().length; i++) {
			if(this.hbox.getChildren()[i] === this.current) {
				this.setCurrentPosition(i-1);
				break;
			}
		}
	},

	/**#@+ 
	 * @private 
	 */
	onSegmentSelect: function(segment) {
		this.focus();
		if(this.current != undefined)
			this.current.unselect();
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
		for(var i = 0; i < this.hbox.getChildren().length; i++)
			this.hbox.getChildren()[i].setFill(color);
	}
	/**#@-*/
}, {
	onStyleChange: function() {
		var spacing = this.getStyleProperty('spacing');
		var radius = this.getStyleProperty('radius');
		this.border.setRadius(radius);
		for(var i = 0; i < this.hbox.getChildren().length; i++) {
			this.hbox.getChildren()[i].setRadius(radius-1);
			this.hbox.getChildren()[i].setSpacing(spacing);
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

Ui.Selectable.extend('Ui.SegmentButton', {
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

		this.connect(this, 'select', this.onButtonSelect);
		this.connect(this, 'unselect', this.onButtonUnselect);
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
			if(this.getIsSelected())
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

