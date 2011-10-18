Ui.Togglable.extend('Ui.CheckBox', 
/**Ui.CheckBox#*/
{
	check: undefined,
	checkBox: undefined,
	contentBox: undefined,
	hbox: undefined,

	lightShadow: undefined,
	darkShadow: undefined,
	lightBorder: undefined,
	background: undefined,

	content: undefined,
	text: undefined,

	/**
	 * @constructs
	 * @class
	 * @extends Ui.Togglable
	 */
	constructor: function(config) {
		this.addEvents('change');

		this.setPadding(3);

		this.hbox = new Ui.HBox();
		this.append(this.hbox);

		this.checkBox = new Ui.LBox();
		this.hbox.append(this.checkBox);

		this.lightShadow = new Ui.Rectangle({ fill: new Ui.Color({ r: 1, g: 1, b: 1, a: 0.25 }), radius: 4, margin: 10, marginTop: 11  });
		this.checkBox.append(this.lightShadow);

		this.darkShadow = new Ui.Rectangle({ fill: new Ui.Color({ r: 0, g: 0, b: 0, a: 0.4}), radius: 4, margin: 10, marginBottom: 11  });
		this.checkBox.append(this.darkShadow);

		this.lightBorder = new Ui.Rectangle({ fill: 'lightgray', radius: 4, marginTop: 11, marginBottom: 12, marginLeft: 11, marginRight: 11  });
		this.checkBox.append(this.lightBorder);

		this.background = new Ui.Rectangle({ fill: 'darkgray', radius: 3, marginTop: 12, marginBottom: 12, marginLeft: 11, marginRight: 11 });
		this.checkBox.append(this.background);

		this.check = Ui.Icon.create('check', 24, 24, 'green');
		this.check.setMargin(12);
		this.check.hide();
		this.checkBox.append(this.check);

		this.connect(this, 'down', this.onCheckBoxDown);
		this.connect(this, 'up', this.onCheckBoxUp);
		this.connect(this, 'toggle', this.onCheckBoxToggle);
		this.connect(this, 'untoggle', this.onCheckBoxUntoggle);
	},

	getValue: function() {
		return this.getIsToggled();
	},

	setValue: function(value) {
		if(value)
			this.toggle();
		else
			this.untoggle();
	},

	setText: function(text) {
		if(text == undefined) {
			if(this.contentBox != undefined) {
				this.hbox.remove(this.contentBox);
				this.contentBox = undefined;
			}
			this.text = undefined;
			this.content = undefined;
		}
		else {
			if(this.text != undefined) {
				this.text = text;
				this.contentBox.setText(this.text);
			}
			else {
				if(this.content != undefined) {
					this.hbox.remove(this.contentBox);
					this.content = undefined;
				}
				this.text = text;
				this.contentBox = new Ui.Label({ margin: 8,  text: this.text });
				this.hbox.append(this.contentBox);
			}
		}
	},

	getText: function() {
		return this.text;
	},

	/**
	 *#@+ @private
	 */

	onCheckBoxDown: function() {
		this.background.setFill(this.getGradientDown());
		this.lightBorder.setFill(this.getLightBorderColorDown());
	},

	onCheckBoxUp: function() {
		this.background.setFill(this.getGradient());
		this.lightBorder.setFill(this.getLightBorderColor());
	},

	onCheckBoxToggle: function() {
		this.check.show();
	},

	onCheckBoxUntoggle: function() {
		this.check.hide();
	},

	getGradient: function() {
		var yuv = this.getStyleProperty('color').getYuv();
		return new Ui.LinearGradient({ stops: [
			{ offset: 0, color: new Ui.Color({ y: yuv.y + 0.10, u: yuv.u, v: yuv.v }) },
			{ offset: 0.05, color: new Ui.Color({ y: yuv.y, u: yuv.u, v: yuv.v }) },
			{ offset: 0.9, color: new Ui.Color({ y: yuv.y, u: yuv.u, v: yuv.v }) },
			{ offset: 1, color: new Ui.Color({ y: yuv.y - 0.10, u: yuv.u, v: yuv.v }) }
		] });
	},

	getGradientDown: function() {
		var yuv = this.getStyleProperty('color').getYuv();
		return new Ui.LinearGradient({ stops: [
			{ offset: 0, color: new Ui.Color({ y: yuv.y + 0.10 - 0.20, u: yuv.u, v: yuv.v }) },
			{ offset: 0.1, color: new Ui.Color({ y: yuv.y - 0.20, u: yuv.u, v: yuv.v }) },
			{ offset: 0.9, color: new Ui.Color({ y: yuv.y - 0.20, u: yuv.u, v: yuv.v }) },
			{ offset: 1, color: new Ui.Color({ y: yuv.y - 0.10 - 0.20, u: yuv.u, v: yuv.v }) }
		] });
	},

	getLightBorderColor: function() {
		var yuv = this.getStyleProperty('color').getYuv();
		return new Ui.Color({ y: yuv.y + 0.20, u: yuv.u, v: yuv.v });
	},

	getLightBorderColorDown: function() {
		var yuv = this.getStyleProperty('color').getYuv();
		if(yuv.y < 0.4)
			return new Ui.Color({ y: yuv.y, u: yuv.u, v: yuv.v });
		else
			return new Ui.Color({ y: yuv.y - 0.10, u: yuv.u, v: yuv.v });
	}
	/**#@-*/
}, 
/**Ui.CheckBox#*/
{
	onStyleChange: function() {
		this.check.setFill(this.getStyleProperty('checkColor'));
		if(this.getIsDown()) {
			this.background.setFill(this.getGradientDown());
			this.lightBorder.setFill(this.getLightBorderColorDown());
		}
		else {
			this.background.setFill(this.getGradient());
			this.lightBorder.setFill(this.getLightBorderColor());
		}
		var radius = this.getStyleProperty('radius');
		this.lightShadow.setRadius(radius);
		this.darkShadow.setRadius(radius);
		this.lightBorder.setRadius(radius);
		this.background.setRadius(radius);		
	},

	onDisable: function() {
		Ui.CheckBox.base.onDisable.call(this);
		this.check.setOpacity(0.4);
	},

	onEnable: function() {
		Ui.CheckBox.base.onEnable.call(this);
		this.check.setOpacity(1);
	},

	onToggle: function() {
		Ui.CheckBox.base.onToggle.call(this);
		this.fireEvent('change', this, true);
	},

	onUntoggle: function() {
		Ui.CheckBox.base.onUntoggle.call(this);
		this.fireEvent('change', this, false);
	},

	setContent: function(content) {
		content = Core.Object.create(content, this);

		if(content == undefined) {
			if(this.contentBox != undefined) {
				this.hbox.remove(this.contentBox);
				this.contentBox = undefined;
			}
			this.text = undefined;
			this.content = undefined;
		}
		else {
			if(this.text != undefined) {
				this.hbox.remove(this.contentBox);
				this.text = undefined;
			}
			if(this.content != undefined)
				this.contentBox.remove(this.content);
			else {
				this.contentBox = new Ui.LBox({ padding: 8 });
				this.hbox.append(this.contentBox);
			}
			this.content = content;
			this.contentBox.append(this.content);
		}
	}
}, 
/**Ui.CheckBox*/
{
	style: {
		color: new Ui.Color({ r: 0.89, g: 0.89, b: 0.89 }),
		checkColor: new Ui.Color({ r: 0, g: 0.6, b: 0 }),
		radius: 4
	}
});


