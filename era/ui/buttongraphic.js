Ui.LBox.extend('Ui.ButtonGraphic', 
/** @lends Ui.ButtonGraphic# */
{
	allcontent: undefined,
	contentBox: undefined,
	content: undefined,
	text: undefined,
	textBox: undefined,
	text1: undefined,
	text2: undefined,
	icon: undefined,
	iconBox: undefined,
	icon1: undefined,
	icon2: undefined,
	orientation: 'vertical',
	
	rect1: undefined,
	rect2: undefined,
    
	lightShadow: undefined,
	darkShadow: undefined,

	isDown: false,
	isEnable: true,
	color: undefined,
	radius: 4,
	spacing: 3,

    /**
     * @constructs
	 * @class A ButtonGraphic the graphical representation of a button without any style and logic.
     * @extends Ui.LBox
     * @param {String} [config.text] Button's text
     * @param {String} [config.icon] Icon name
     * @param {String} [config.orientation] 'vertical' or 'horizontal'
     * @param {String} [config.color] Color
     * @param {String} [config.spacing] Inner content spacing
     * @param {String} [config.radius] Border radius
	 * @param {mixed} [config] see {@link Ui.LBox} constructor for more options.
     */
	constructor: function(config) {
		this.setPadding(3);

		this.color = new Ui.Color({ r: 0.31, g: 0.66, b: 1 });

		this.lightShadow = new Ui.Rectangle({ fill: new Ui.Color({ r: 1, g: 1, b: 1, a: 0.25 }), radius: 4, marginTop: 1  });
		this.append(this.lightShadow);

		this.darkShadow = new Ui.Rectangle({ fill: new Ui.Color({ r: 0, g: 0, b: 0, a: 0.4}), radius: 4, marginBottom: 1  });
		this.append(this.darkShadow);

		this.allcontent = new Ui.LBox();
		this.append(this.allcontent);

		this.rect2 = new Ui.Rectangle({ radius: 4, marginTop: 1, marginBottom: 2, marginLeft: 1, marginRight: 1  });
		this.allcontent.append(this.rect2);

		this.rect1 = new Ui.Rectangle({ radius: 3, marginTop: 2, marginBottom: 2, marginLeft: 1, marginRight: 1 });
		this.allcontent.append(this.rect1);

		this.contentBox = new Ui.Box({ verticalAlign: 'center', horizontalAlign: 'center' });
		this.allcontent.append(this.contentBox);

		this.iconBox = new Ui.LBox({ verticalAlign: 'center', horizontalAlign: 'center' });
		this.contentBox.append(this.iconBox);

		this.autoConfig(config, 'text', 'icon', 'orientation', 'color', 'spacing', 'radius');

		this.updateColors();
	},

	getContent: function() {
		return this.content;
	},

	setContent: function(content) {
		if(this.content != content) {
			while(this.contentBox.getFirstChild() != undefined)
				this.contentBox.remove(this.contentBox.getFirstChild());
			this.content = content;
			this.contentBox.append(this.content);
		}
	},

	getText: function() {
		return this.text;
	},

	setText: function(text) {
		if(this.text != text) {
			this.text = text;
			if(this.text == undefined) {
				if(this.textBox != undefined) {
					this.contentBox.remove(this.textBox);
					this.textBox = undefined;
					this.text1 = undefined;
					this.text2 = undefined;
				}
			}
			else {
				if(this.textBox == undefined) {
					this.textBox = new Ui.LBox({ verticalAlign: 'center', horizontalAlign: 'center', height: 24 });
					this.contentBox.append(this.textBox);
					this.text1 = new Ui.Label({ text: this.text, color: this.getContentLightColor(), verticalAlign: 'center' });
					this.text2 = new Ui.Label({ text: this.text, color: this.getContentColor(), verticalAlign: 'center' });
					this.textBox.append(this.text1);
					this.textBox.append(this.text2);
				}
				else {
					this.text1.setText(this.text);
					this.text2.setText(this.text);
				}
			}
			this.updateSizes();
		}
	},

	getIcon: function() {
		return this.icon;
	},

	setIcon: function(icon) {
		if(icon == undefined) {
			if(this.icon != undefined) {
				this.iconBox.remove(this.icon1);
				this.iconBox.remove(this.icon2);
				this.icon1 = undefined;
				this.icon2 = undefined;
				this.icon = undefined;
			}
			if(this.content != undefined) {
				this.iconBox.remove(this.content);
				this.content = undefined;
			}
		}
		else {
			if(typeof(icon) == 'string') {
				if(this.content != undefined) {
					this.iconBox.remove(this.content);
					this.content = undefined;
				}
				if(this.icon != icon) {
					this.icon = icon;
					if(this.icon1 != undefined)
						this.iconBox.remove(this.icon1);
					if(this.icon2 != undefined)
						this.iconBox.remove(this.icon2);
					this.icon1 = Ui.Icon.create(icon, 24, 24, this.getContentLightColor());
					this.icon2 = Ui.Icon.create(icon, 24, 24, this.getContentColor());
					this.iconBox.append(this.icon1);
					this.iconBox.append(this.icon2);
				}
			}
			else {
				if(this.icon1 != undefined)
					this.iconBox.remove(this.icon1);
				if(this.icon2 != undefined)
					this.iconBox.remove(this.icon2);
				this.icon1 = undefined;
				this.icon2 = undefined;
				this.icon = undefined;
				if(this.content != icon) {
					if(this.content != undefined)
						this.iconBox.remove(this.content);
					this.content = icon;
					this.iconBox.append(this.content);
				}
			}
		}
		this.updateSizes();
	},

    /** @return {String} Orientation */
	getOrientation: function() {
		return this.orientation;
	},
    
    /** @param {String} orientation can be 'vertical' or 'horizontal' */
	setOrientation: function(orientation) {
		if(this.orientation != orientation) {
			this.orientation = orientation;
			this.contentBox.setOrientation(this.orientation);
			this.updateSizes();
		}
	},

	getIsDown: function() {
		return this.isDown;
	},

	setIsDown: function(isDown) {
		if(this.isDown != isDown) {
			this.isDown = isDown;
			this.updateColors();
		}
	},

	getIsEnable: function() {
		return this.isEnable;
	},

	setIsEnable: function(isEnable) {
		if(this.isEnable != isEnable) {
			this.isEnable = isEnable;
			if(this.isEnable)
				this.contentBox.setOpacity(1);
			else
				this.contentBox.setOpacity(0.2);
		}
	},

	setRadius: function(radius) {
		if(this.radius != radius) {
			this.radius = radius;
			this.lightShadow.setRadius(this.radius);
			this.darkShadow.setRadius(this.radius);
			this.rect2.setRadius(this.radius);
			this.rect1.setRadius(this.radius - 1);
		}
	},

	setSpacing: function(spacing) {
		if(this.spacing != spacing) {
			this.spacing = spacing;
			this.updateSizes();
		}
	},

	setColor: function(color) {
		if(this.color != color) {
			this.color = color;
			this.updateColors();
		}
	},

	/**#@+
	 * @private
	 */

	updateSizes: function() {
		var spacing = this.spacing;
		// vertical
		if(this.orientation == 'vertical') {
			if(this.text != undefined) {
				// icon + text
				if(this.icon != undefined) {
					this.textBox.setMarginLeft(spacing + 2);
					this.textBox.setMarginRight(spacing + 2);
					this.textBox.setMarginTop(spacing);
					this.textBox.setMarginBottom(spacing + 1);
					this.text1.setMargin(0);
					this.text1.setMarginTop(2);
					this.text2.setMargin(1);
					this.text1.setFontWeight('normal');
					this.text2.setFontWeight('normal');

					this.iconBox.setMarginLeft(spacing + 2);
					this.iconBox.setMarginRight(spacing + 2);
					this.iconBox.setMarginTop(spacing +1);
					this.iconBox.setMarginBottom(0);
					this.icon1.setMarginTop(2);
					this.icon1.setMarginBottom(0);
					this.icon2.setMarginTop(1);
					this.icon2.setMarginBottom(1);
				}
				// content + text
				else if(this.content != undefined) {
					this.textBox.setMarginLeft(spacing + 2);
					this.textBox.setMarginRight(spacing + 2);
					this.textBox.setMarginTop(spacing + 1);
					this.textBox.setMarginBottom(spacing + 1);
					this.text1.setMargin(0);
					this.text1.setMarginTop(2);
					this.text2.setMargin(1);
					this.text1.setFontWeight('normal');
					this.text2.setFontWeight('normal');

					this.iconBox.setMarginLeft(spacing + 2);
					this.iconBox.setMarginRight(spacing + 2);
					this.iconBox.setMarginTop(spacing + 2);
					this.iconBox.setMarginBottom(0);
				}
				// text only
				else {
					this.textBox.setMarginLeft(spacing + 4);
					this.textBox.setMarginRight(spacing + 4);
					this.textBox.setMarginTop(spacing + 1);
					this.textBox.setMarginBottom(spacing + 1);
					this.text1.setMargin(0);
					this.text1.setMarginTop(2);
					this.text2.setMargin(1);

					this.text1.setFontWeight('bold');
					this.text2.setFontWeight('bold');

					this.iconBox.setMargin(0);
				}
			}
			// icon only
			else {
				if(this.icon != undefined) {
					this.iconBox.setMarginLeft(spacing + 2);
					this.iconBox.setMarginRight(spacing + 2);
					this.iconBox.setMarginTop(spacing + 1);
					this.iconBox.setMarginBottom(spacing + 1);
					this.icon1.setMarginTop(2);
					this.icon1.setMarginBottom(0);
					this.icon2.setMarginTop(1);
					this.icon2.setMarginBottom(1);
				}
				else if(this.content != undefined) {
					this.iconBox.setMargin(spacing + 2);
				}
			}
		}
		// horizontal
		else {
			if(this.text != undefined) {
				// icon + text
				if(this.icon != undefined) {
					this.textBox.setMarginLeft(spacing + 2);
					this.textBox.setMarginRight(spacing + 2);
					this.textBox.setMarginTop(spacing + 1);
					this.textBox.setMarginBottom(spacing + 1);
					this.text1.setMargin(0);
					this.text1.setMarginTop(2);
					this.text2.setMargin(1);
					this.text1.setFontWeight('bold');
					this.text2.setFontWeight('bold');

					this.iconBox.setMarginLeft(spacing + 2);
					this.iconBox.setMarginRight(0);
					this.iconBox.setMarginTop(spacing + 1);
					this.iconBox.setMarginBottom(spacing + 1);
					this.icon1.setMarginTop(2);
					this.icon1.setMarginBottom(0);
					this.icon2.setMarginTop(1);
					this.icon2.setMarginBottom(1);
				}
				// content + text
				else if(this.content != undefined) {
					this.textBox.setMarginLeft(spacing + 2);
					this.textBox.setMarginRight(spacing + 2);
					this.textBox.setMarginTop(spacing + 1);
					this.textBox.setMarginBottom(spacing + 1);
					this.text1.setMargin(0);
					this.text1.setMarginTop(2);
					this.text2.setMargin(1);
					this.text1.setFontWeight('bold');
					this.text2.setFontWeight('bold');

					this.iconBox.setMarginLeft(spacing + 2);
					this.iconBox.setMarginRight(0);
					this.iconBox.setMarginTop(spacing + 2);
					this.iconBox.setMarginBottom(0);
				}
				// text only
				else {
					this.textBox.setMarginLeft(spacing + 4);
					this.textBox.setMarginRight(spacing + 4);
					this.textBox.setMarginTop(spacing + 1);
					this.textBox.setMarginBottom(spacing + 1);
					this.text1.setMargin(0);
					this.text1.setMarginTop(2);
					this.text2.setMargin(1);

					this.text1.setFontWeight('bold');
					this.text2.setFontWeight('bold');

					this.iconBox.setMargin(0);
				}
			}
			// icon only
			else {
				if(this.icon != undefined) {
					this.iconBox.setMarginLeft(spacing + 2);
					this.iconBox.setMarginRight(spacing + 2);
					this.iconBox.setMarginTop(spacing + 1);
					this.iconBox.setMarginBottom(spacing + 1);
					this.icon1.setMarginTop(2);
					this.icon1.setMarginBottom(0);
					this.icon2.setMarginTop(1);
					this.icon2.setMarginBottom(1);
				}
				else if(this.content != undefined) {
					this.iconBox.setMargin(spacing + 2);
				}
			}
		}
	},

	getGradient: function() {
		var yuv = this.color.getYuv();
		var deltaY = 0;
		if(this.getIsDown())
			deltaY = -0.20;
		return new Ui.LinearGradient({ stops: [
			{ offset: 0, color: new Ui.Color({ y: yuv.y + 0.10 + deltaY, u: yuv.u, v: yuv.v }) },
			{ offset: 1, color: new Ui.Color({ y: yuv.y - 0.10 + deltaY, u: yuv.u, v: yuv.v }) }
		] });
	},

	getContentColor: function() {
		var yuv = this.color.getYuv();
		var deltaY = 0;
		if(this.getIsDown())
			deltaY = 0.20;
		if(yuv.y < 0.4)
			return new Ui.Color({ y: yuv.y + (0.60 + deltaY), u: yuv.u, v: yuv.v });
		else
			return new Ui.Color({ y: yuv.y - (0.60 + deltaY), u: yuv.u, v: yuv.v });
	},

	getContentLightColor: function() {
		var yuv = this.color.getYuv();
		var deltaY = 0;
		if(this.getIsDown())
			deltaY = -0.20;
		if(yuv.y < 0.4)
			return new Ui.Color({ y: yuv.y + 0.10 + deltaY, u: yuv.u, v: yuv.v });
		else
			return new Ui.Color({ y: yuv.y + 0.10 + deltaY, u: yuv.u, v: yuv.v });
	},

	getLightColor: function() {
		var yuv = this.color.getYuv();
		var deltaY = 0;
		if(this.getIsDown())
			deltaY = -0.30;
		if(yuv.y < 0.4)
			return new Ui.Color({ y: yuv.y - 0.20 + deltaY, u: yuv.u, v: yuv.v });
		else
			return new Ui.Color({ y: yuv.y + 0.30 + deltaY, u: yuv.u, v: yuv.v });
	},

	updateColors: function() {
		this.rect1.setFill(this.getGradient());
		if(this.icon1 != undefined)
			this.icon1.setFill(this.getContentLightColor());
		if(this.text1 != undefined)
			this.text1.setColor(this.getContentLightColor());
		if(this.icon2 != undefined)
			this.icon2.setFill(this.getContentColor());
		if(this.text2 != undefined)
			this.text2.setColor(this.getContentColor());
		this.rect2.setFill(this.getLightColor());
	}
	/**#@-*/
});
