
Ui.Pressable.extend('Ui.CheckBox', 
/**Ui.CheckBox#*/
{
	graphic: undefined,
	contentBox: undefined,
	hbox: undefined,
	content: undefined,
	text: undefined,
	isToggled: false,

	/**
	 * @constructs
	 * @class
	 * @extends Ui.Pressable
	 */
	constructor: function(config) {
		this.addEvents('change','toggle', 'untoggle');

		this.setRole('checkbox');
		this.getDrawing().setAttribute('aria-checked', 'false');

		this.setPadding(3);

		this.hbox = new Ui.HBox();
		this.append(this.hbox);
		
		this.graphic = new Ui.CheckBoxGraphic();
		this.hbox.append(this.graphic);

		this.connect(this, 'down', this.onCheckBoxDown);
		this.connect(this, 'up', this.onCheckBoxUp);
		this.connect(this, 'focus', this.onCheckFocus);
		this.connect(this, 'blur', this.onCheckBlur);
		this.connect(this, 'press', this.onCheckPress);
	},

	getIsToggled: function() {
		return this.isToggled;
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
			if(this.contentBox !== undefined) {
				this.hbox.remove(this.contentBox);
				this.contentBox = undefined;
			}
			this.text = undefined;
			this.content = undefined;
		}
		else {
			if(this.text !== undefined) {
				this.text = text;
				this.contentBox.setText(this.text);
			}
			else {
				if(this.content !== undefined) {
					this.hbox.remove(this.contentBox);
					this.content = undefined;
				}
				this.text = text;
				this.contentBox = new Ui.Text({ margin: 8,  text: this.text, verticalAlign: 'center' });
				this.hbox.append(this.contentBox, true);
			}
		}
	},

	getText: function() {
		return this.text;
	},

	toggle: function() {
		this.onToggle();
	},

	untoggle: function() {
		this.onUntoggle();
	},
	
	/**
	 *#@+ @private
	 */
	onCheckPress: function() {
		if(!this.isToggled)
			this.onToggle();
		else
			this.onUntoggle();
	},
	
	onToggle: function() {
		if(!this.isToggled) {
			this.isToggled = true;
			this.getDrawing().setAttribute('aria-checked', 'true');
			this.fireEvent('toggle', this);
			this.graphic.setIsChecked(true);
			this.graphic.setColor(this.getStyleProperty('activeColor'));
			this.fireEvent('change', this, true);
		}
	},

	onUntoggle: function() {
		if(this.isToggled) {
			this.isToggled = false;
			this.getDrawing().setAttribute('aria-checked', 'false');
			this.fireEvent('untoggle', this);
			this.graphic.setIsChecked(false);
			this.graphic.setColor(this.getStyleProperty('color'));
			this.fireEvent('change', this, false);
		}
	},
	
	onCheckFocus: function() {
		if(!this.getIsMouseFocus())
			this.graphic.setColor(this.getStyleProperty('focusColor'));
	},
	
	onCheckBlur: function() {
		if(this.isToggled)
			this.graphic.setColor(this.getStyleProperty('activeColor'));
		else
			this.graphic.setColor(this.getStyleProperty('color'));
	},

	onCheckBoxDown: function() {
		this.graphic.setIsDown(true);
	},

	onCheckBoxUp: function() {
		this.graphic.setIsDown(false);
	}
	/**#@-*/
}, 
/**Ui.CheckBox#*/
{
	onStyleChange: function() {
		if(this.getHasFocus())
			this.graphic.setColor(this.getStyleProperty('focusColor'));
		else {
			if(this.isToggled)
				this.graphic.setColor(this.getStyleProperty('activeColor'));
			else
				this.graphic.setColor(this.getStyleProperty('color'));
		}
		this.graphic.setCheckColor(this.getStyleProperty('checkColor'));
		this.graphic.setBorderWidth(this.getStyleProperty('borderWidth'));
		this.graphic.setRadius(this.getStyleProperty('radius'));
	},

	setContent: function(content) {
		if(content === undefined) {
			if(this.contentBox !== undefined) {
				this.hbox.remove(this.contentBox);
				this.contentBox = undefined;
			}
			this.text = undefined;
			this.content = undefined;
		}
		else {
			if(this.text !== undefined) {
				this.hbox.remove(this.contentBox);
				this.text = undefined;
			}
			if(this.content !== undefined)
				this.contentBox.remove(this.content);
			else {
				this.contentBox = new Ui.LBox({ padding: 8, verticalAlign: 'center' });
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
		borderWidth: 2,
		color: '#444444',
		activeColor: '#07a0e5',
		focusColor: '#21d3ff',
		checkColor: '#ffffff',
		radius: 3
	}
});


