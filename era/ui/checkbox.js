
Ui.Togglable.extend('Ui.CheckBox', 
/**Ui.CheckBox#*/
{
	graphic: undefined,
	contentBox: undefined,
	hbox: undefined,
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
		
		this.graphic = new Ui.CheckBoxGraphic();
		this.hbox.append(this.graphic);

		this.connect(this, 'down', this.onCheckBoxDown);
		this.connect(this, 'up', this.onCheckBoxUp);
		this.connect(this, 'toggle', this.onCheckBoxToggle);
		this.connect(this, 'untoggle', this.onCheckBoxUntoggle);

		this.connect(this, 'focus', this.onCheckFocus);
		this.connect(this, 'blur', this.onCheckBlur);

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
		if(text === undefined) {
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
				this.contentBox = new Ui.Text({ margin: 8,  text: this.text });
				this.hbox.append(this.contentBox, true);
			}
		}
	},

	getText: function() {
		return this.text;
	},

	/**
	 *#@+ @private
	 */
	onCheckFocus: function() {
		this.graphic.setColor(this.getStyleProperty('focusColor'));
	},
	
	onCheckBlur: function() {
		this.graphic.setColor(this.getStyleProperty('color'));
	},

	onCheckBoxDown: function() {
		this.graphic.setIsDown(true);
	},

	onCheckBoxUp: function() {
		this.graphic.setIsDown(false);
	},

	onCheckBoxToggle: function() {
		this.graphic.setIsChecked(true);
		this.fireEvent('change', this, true);
	},

	onCheckBoxUntoggle: function() {
		this.graphic.setIsChecked(false);
		this.fireEvent('change', this, false);
	}
	/**#@-*/
}, 
/**Ui.CheckBox#*/
{
	onStyleChange: function() {
		if(this.getHasFocus())
			this.graphic.setColor(this.getStyleProperty('focusColor'));
		else
			this.graphic.setColor(this.getStyleProperty('color'));
		this.graphic.setCheckColor(this.getStyleProperty('checkColor'));
	},

	setContent: function(content) {
		content = Ui.Element.create(content);
		if(content === undefined) {
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
		color: '#444444',
		focusColor: '#f6caa2',
		checkColor: new Ui.Color({ r: 0, g: 0.6, b: 0 })
	}
});


