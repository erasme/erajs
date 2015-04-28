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

		this.border = new Ui.Frame();
		this.append(this.border);

		this.box = new Ui.Box({ uniform: true, margin: 1, spacing: 1, orientation: this.orientation });
		this.append(this.box);

		this.connect(this, 'focus', this.onStyleChange);
		this.connect(this, 'blur', this.onStyleChange);
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
		while(this.box.getFirstChild() !== undefined) {
			this.disconnect(this.box.getFirstChild(), 'toggle', this.onSegmentSelect);
			this.box.remove(this.box.getFirstChild());
		}
		this.data = data;
		for(var i = 0; i < data.length; i++) {
			var mode;
			if(this.orientation === 'horizontal')
				mode = (i === 0)?'left':(i === data.length - 1)?'right':'middle';
			else
				mode = (i === 0)?'top':(i === data.length - 1)?'bottom':'middle';
			var segment = new Ui.SegmentButton({ data: data[i], text: data[i][this.field], mode: mode });
			this.box.append(segment, true);
			this.connect(segment, 'press', this.onSegmentSelect);
		}
	},

	setCurrentPosition: function(position) {
		if((position >= 0) && (position < this.box.getChildren().length)) {
			this.current = this.box.getChildren()[position];
			this.onSegmentSelect(this.current);
		}
	},

	getCurrentPosition: function() {
		for(var i = 0; i < this.box.getChildren().length; i++) {
			if(this.box.getChildren()[i] === this.current)
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
		this.current = segment;
		this.onStyleChange();
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
	}
	/**#@-*/
}, {
	onStyleChange: function() {
		var spacing = this.getStyleProperty('spacing');
		var padding = this.getStyleProperty('padding');
		var radius = this.getStyleProperty('radius');
		var borderWidth = this.getStyleProperty('borderWidth');
		this.border.setRadius(radius);
		this.border.setFrameWidth(borderWidth);

		var background = this.getStyleProperty('background');
		var backgroundBorder = this.getStyleProperty('backgroundBorder');
		var foreground = this.getStyleProperty('foreground');
		if(this.getHasFocus() && !this.getIsMouseFocus()) {
			background = this.getStyleProperty('focusBackground');
			backgroundBorder = this.getStyleProperty('focusBackgroundBorder');
			foreground = this.getStyleProperty('focusForeground');
		}
		var activeBackground = this.getStyleProperty('activeBackground');
		var activeForeground = this.getStyleProperty('activeForeground');
		var textHeight = this.getStyleProperty('textHeight');
		var textTransform = this.getStyleProperty('textTransform');

		this.box.setMargin(borderWidth);
		this.border.setFill(backgroundBorder);
		for(var i = 0; i < this.box.getChildren().length; i++) {
			var child = this.box.getChildren()[i];
			child.setRadius(Math.max(0, radius-borderWidth));
			child.setSpacing(padding-borderWidth);
			child.setTextHeight(textHeight);
			child.setTextTransform(textTransform);
			if(this.current === child) {
				child.setBackground(activeBackground);
				child.setForeground(activeForeground);
			}
			else {
				child.setBackground(background);
				child.setForeground(foreground);
			}
		}
	}
}, {
	style: {
		borderWidth: 1,
		background: 'rgba(240,240,240,1)',
		backgroundBorder: 'rgba(102,102,102,1)',
		foreground: '#444444',
		focusBackground: 'rgba(240,240,240,1)',
		focusBackgroundBorder: 'rgba(33,211,255,1)',
		focusForeground: 'rgba(33,211,255,1)',
		activeBackground: 'rgba(33,211,255,1)',
		activeForeground: 'rgba(250,250,250,1)',
		radius: 3,
		textHeight: 26,
		spacing: 10,
		padding: 7,
		textTransform: 'uppercase'
	}
});

Ui.Pressable.extend('Ui.SegmentButton', {
	textBox: undefined,
	label: undefined,
	bg: undefined,
	mode: undefined,
	data: undefined,
	radius: 3,

	constructor: function(config) {
		this.setFocusable(false);
		this.bg = new Ui.Rectangle();
		this.append(this.bg);
		this.textBox = new Ui.LBox();
		this.append(this.textBox);
		this.label = new Ui.CompactLabel({ verticalAlign: 'center', whiteSpace: 'nowrap', textAlign: 'center' });
		this.textBox.setContent(this.label);
	},

	setTextTransform: function(textTransform) {
		this.label.setTextTransform(textTransform);
	},

	setForeground: function(color) {
		this.label.setColor(color);
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

	setTextHeight: function(height) {
		this.textBox.setHeight(height);
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
	
	setRadius: function(radius) {
		this.radius = radius;
		this.setMode(this.mode);
	},

	setSpacing: function(spacing) {
		this.textBox.setMargin(spacing);
	},

	setBackground: function(color) {
		this.bg.setFill(color);
	}

}, {
	onDisable: function() {
		Ui.SegmentButton.base.onDisable.apply(this, arguments);
		this.bg.setOpacity(0.2);
	},

	onEnable: function() {
		Ui.SegmentButton.base.onEnable.apply(this, arguments);
		this.bg.setOpacity(1);
	}
});

