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

		this.border = new Ui.Frame({ frameWidth: 1, fill: '#888888', radius: 8 });
		this.append(this.border);

		this.hbox = new Ui.HBox({ uniform: true, margin: 1 });
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
			if(this.hbox.getChildren()[i] == this.current) {
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
			if(this.hbox.getChildren()[i] == this.current) {
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
		this.updateColors();
	}
}, {
	style: {
		color: '#548be3',
		focusColor: '#ba8f68'
	}
});

Ui.Selectable.extend('Ui.SegmentButton', {
	label: undefined,
	bg: undefined,
	shadow: undefined,
	mode: undefined,
	sep1: undefined,
	sep2: undefined,
	data: undefined,
	fill: undefined,
	downGradient: undefined,

	constructor: function(config) {
		this.setFocusable(false);

		var gradient = new Ui.LinearGradient({ stops: [
			{ offset: 0, color: '#fbfbfb' },
			{ offset: 1, color: '#c8c8c8' }
		] });
		this.bg = new Ui.Rectangle({ fill: gradient, radiusTopLeft: 7, radiusBottomLeft: 7 });
		this.append(this.bg);
		this.labelShadow = new Ui.Label({ fontWeight: 'bold', marginTop: 6, marginBottom: 4, marginLeft: 11, marginRight: 9, color: '#ffffff' });
		this.append(this.labelShadow);
		this.label = new Ui.Label({ fontWeight: 'bold', margin: 5, marginLeft: 10, marginRight: 10, color: '#656565' });
		this.append(this.label);

		this.sep1 = new Ui.Rectangle({ width: 1, fill: '#ebebeb', horizontalAlign: 'left' });
		this.append(this.sep1);

		this.sep2 = new Ui.Rectangle({ width: 1, fill: '#aaaaaa', horizontalAlign: 'right' });
		this.append(this.sep2);

		this.shadow = new Ui.Shadow({ shadowWidth: 3, inner: true, opacity: 0, color: '#041a3d' });
		this.append(this.shadow);

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
		this.labelShadow.setText(text);
	},

	setMode: function(mode) {
		this.mode = mode;
		if(mode == 'left') {
			this.shadow.setRadiusTopLeft(6);
			this.shadow.setRadiusBottomLeft(6);
			this.shadow.setRadiusTopRight(0);
			this.shadow.setRadiusBottomRight(0);
			this.bg.setRadiusTopLeft(6);
			this.bg.setRadiusBottomLeft(6);
			this.bg.setRadiusTopRight(0);
			this.bg.setRadiusBottomRight(0);
			this.sep1.hide();
			this.sep2.show();
		}
		else if(mode == 'right') {
			this.shadow.setRadiusTopLeft(0);
			this.shadow.setRadiusBottomLeft(0);
			this.shadow.setRadiusTopRight(6);
			this.shadow.setRadiusBottomRight(6);
			this.bg.setRadiusTopLeft(0);
			this.bg.setRadiusBottomLeft(0);
			this.bg.setRadiusTopRight(6);
			this.bg.setRadiusBottomRight(6);
			this.sep1.show();
			this.sep2.hide();
		}
		else {
			this.shadow.setRadiusTopLeft(0);
			this.shadow.setRadiusBottomLeft(0);
			this.shadow.setRadiusTopRight(0);
			this.shadow.setRadiusBottomRight(0);
			this.bg.setRadiusTopLeft(0);
			this.bg.setRadiusBottomLeft(0);
			this.bg.setRadiusTopRight(0);
			this.bg.setRadiusBottomRight(0);
			this.sep1.show();
			this.sep2.show();
		}
	},

	setFill: function(fill) {
		if(this.fill != fill) {
			this.fill = Ui.Color.create(fill);
			var yuv = this.fill.getYuva();
			this.downGradient = new Ui.LinearGradient({ stops: [
				{ offset: 0, color: new Ui.Color({ y: yuv.y - 0.1, u: yuv.u, v: yuv.v }) },
				{ offset: 1, color: new Ui.Color({ y: yuv.y + 0.1, u: yuv.u, v: yuv.v }) }
			] });
			if(this.getIsSelected())
				this.bg.setFill(this.downGradient);
			this.shadow.setColor(new Ui.Color({ y: yuv.y - 0.4, u: yuv.u, v: yuv.v }));
		}
	},

	/**#@+ 
	 * @private 
	 */
	onButtonSelect: function() {
		this.bg.setFill(this.downGradient);
		this.shadow.setOpacity(0.5);
		this.sep1.hide();
		this.sep2.hide();
		this.label.hide();
	},

	onButtonUnselect: function() {
		var gradient = new Ui.LinearGradient({ stops: [
			{ offset: 0, color: '#fbfbfb' },
			{ offset: 1, color: '#c8c8c8' }
		] });
		this.bg.setFill(gradient);
		this.shadow.setOpacity(0);
		if(this.mode == 'left')
			this.sep2.show();
		else if(this.mode == 'right')
			this.sep1.show();
		else {
			this.sep1.show();
			this.sep2.show();
		}
		this.label.show();
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

