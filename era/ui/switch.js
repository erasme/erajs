Ui.LBox.extend('Ui.Switch',
/** @lends Ui.Switch#*/
{
	value: false,
	background: undefined,
	pos: 1,
	movable: undefined,
	switchbox: undefined,
	fixed: undefined,

	alignClock: undefined,
	speed: 0,
	animNext: 0,
	animStart: 0,
	ease: undefined,

	/**
	 * @constructs
	 * @class
	 * @extends Ui.LBox
	 */
	constructor: function(config) {
		this.setFocusable(true);
		this.connect(this, 'focus', this.updateColors);
		this.connect(this, 'blur', this.updateColors);

		this.connect(this.getDrawing(), 'keydown', this.onKeyDown);

		this.fixed = new Ui.Fixed();
		this.append(this.fixed);

		this.bg1 = new Ui.Rectangle({ fill: new Ui.Color({ r: 0.2, g: 0.9, b: 0.6 }), radius: 4 });
		this.fixed.append(this.bg1);

		this.bg2 = new Ui.Rectangle({ fill: new Ui.Color({ r: 0.9, g: 0.2, b: 0.2 }), radius: 4 });
		this.fixed.append(this.bg2);

		this.append(new Ui.Frame({ fill: '#aaaaaa', frameWidth: 1, radius: 4 }));

		this.setClipToBounds(true);

		this.movable = new Ui.Movable({ moveVertical: false, margin: 1 });
		this.movable.setFocusable(false);
		this.append(this.movable);

		this.switchbox = new Ui.SwitchBox();
		this.movable.setContent(this.switchbox);

		this.connect(this.movable, 'move', this.onMove);
		this.connect(this.movable, 'down', this.onDown);
		this.connect(this.movable, 'up', this.onUp);

		this.addEvents('change');

		if('trueContent' in config)
			this.setTrueContent(config.trueContent);
		else
			this.setTrueContent(new Ui.Label({ text: 'ON', marginLeft: 5, marginRight: 5 }));
		if('falseContent' in config)
			this.setFalseContent(config.falseContent);
		else
			this.setFalseContent(new Ui.Label({ text: 'OFF', marginLeft: 5, marginRight: 5 }));
		if('ease' in config)
			this.setEase(config.ease);
		else
			this.ease = Anim.EasingFunction.create({ type: Anim.PowerEase, mode: 'out' });
		if('value' in config) {
			this.value = config.value;
			if(this.value)
				this.pos = 0;
			else
				this.pos = 1;
		}
	},

	setEase: function(ease) {
		this.ease = Anim.EasingFunction.create(ease);
	},

	setTrueContent: function(trueContent) {
		this.switchbox.setContent1(trueContent);
	},

	setFalseContent: function(falseContent) {
		this.switchbox.setContent2(falseContent);
	},

	getValue: function() {
		return this.value;
	},

	setValue: function(value) {
		if(this.value != value) {
			this.value = value;
			if(this.value)
				this.startAnimation(2);
			else
				this.startAnimation(-2);
		}
	},

	/**#@+
	* @private
	*/

	onKeyDown: function(event) {
		if(this.getIsDisabled())
			return;
		var key = event.which;

		if((key == 32) || (key == 13) || (key == 37) || (key == 39)) {
			event.stopPropagation();
			event.preventDefault();
		}
		if((key == 32) || (key == 13))
			this.setValue(!this.value);
		else if(key == 37)
			this.setValue(false);
		else if(key == 39)
			this.setValue(true);		
	},

	onMove: function(button) {
		var posX = this.movable.getPositionX();

		var contentWidth = this.switchbox.getContentWidth();
		posX = Math.min(0, Math.max(posX, -contentWidth));
		this.pos = -posX / contentWidth;
		this.updatePos();
	},

	onDown: function(movable) {
		this.stopAnimation();
	},

	onUp: function(movable, speedX, speedY, deltaX, deltaY, cumulMove, abort) {
		// if move is very low consider a click and invert the value
		if(!abort && (cumulMove < 10))
			this.setValue(!this.value);
		// else consider a move
		else {
			if(Math.abs(speedX) < 100) {
				if(this.pos > 0.5)
					speedX = -1;
				else
					speedX = 1;
			}
			else
				speedX /= this.switchbox.getContentWidth();
			if(speedX !== 0)
				this.startAnimation(speedX);
		}
	},

	updatePos: function() {
		var contentWidth = this.switchbox.getContentWidth();

		var posX = -this.pos * contentWidth;
		this.movable.setPosition(posX, undefined);

		var buttonWidth = this.getLayoutWidth() - contentWidth;

		this.bg1.setHeight(this.getLayoutHeight() - 1);
		this.bg1.setWidth(contentWidth + posX + buttonWidth/2);

		this.bg2.setHeight(this.getLayoutHeight() - 1);
		this.bg2.setWidth(-posX + buttonWidth/2);
		this.fixed.setPosition(this.bg2, this.getLayoutWidth() + posX - buttonWidth/2, 0);
	},

	startAnimation: function(speed) {
		this.stopAnimation();
		this.speed = speed;
		this.animStart = this.pos;

		if(this.speed < 0)
			this.animNext = 1;
		else
			this.animNext = 0;
		if(this.animStart != this.animNext) {
			this.alignClock = new Anim.Clock({ duration: 'forever', scope: this, target: this, onTimeupdate: this.onAlignTick });
			this.alignClock.begin();
		}
		else {
			if(this.value !== (this.animNext === 0)) {
				this.value = (this.animNext === 0);
				this.fireEvent('change', this, this.value);
			}
		}
	},

	stopAnimation: function() {
		if(this.alignClock !== undefined) {
			this.alignClock.stop();
			this.alignClock = undefined;
		}
	},

	onAlignTick: function(clock, progress, delta) {
		if(delta === 0)
			return;

		var relprogress = -(clock.getTime() * this.speed) / (this.animNext - this.animStart);
		if(relprogress >= 1) {
			this.alignClock.stop();
			this.alignClock = undefined;
			relprogress = 1;
			this.value = (this.animNext === 0);
			this.fireEvent('change', this, this.value);
		}
		relprogress = this.ease.ease(relprogress);
		this.pos = (this.animStart + relprogress * (this.animNext - this.animStart));
		this.updatePos();
	},

	getGradient: function() {
		var yuv = this.getStyleProperty('color').getYuv();
		return new Ui.LinearGradient({ stops: [
			{ offset: 0, color: new Ui.Color({ y: yuv.y + 0.10, u: yuv.u, v: yuv.v }) },
			{ offset: 1, color: new Ui.Color({ y: yuv.y - 0.10, u: yuv.u, v: yuv.v }) }
		] });
	},

	updateColors: function() {
		var color = this.getStyleProperty('color');

		if(this.getHasFocus())
			color = this.getStyleProperty('focusColor');

		this.switchbox.getSwitchButton().setFill(color);
		this.bg1.setFill(this.getStyleProperty('trueColor'));
		this.bg2.setFill(this.getStyleProperty('falseColor'));
	}

	/**#@-*/
},
/** @lends Ui.Switch#*/
{
	arrangeCore: function(width, height) {
		Ui.Switch.base.arrangeCore.call(this, width, height);
		this.updatePos();
	},

	onStyleChange: function() {
		this.updateColors();
	},

	onDisable: function() {
		Ui.Switch.base.onDisable.call(this);
		this.switchbox.getContent1Box().setOpacity(0.2);
		this.switchbox.getContent2Box().setOpacity(0.2);
	},

	onEnable: function() {
		Ui.Switch.base.onEnable.call(this);
		this.switchbox.getContent1Box().setOpacity(1);
		this.switchbox.getContent2Box().setOpacity(1);
	}
}, {
	style: {
		color: new Ui.Color({ r: 0.96, g: 0.96, b: 0.96 }),
		focusColor: new Ui.Color({ r: 0.13, g: 0.83, b: 1, a: 1 }),
		trueColor: '#b1f5c1',
		falseColor: '#f5b1b1'
	}
});

Ui.LBox.extend('Ui.SwitchButton', 
/**@lends Ui.SwitchButton#*/
{
	shadow: undefined,
	background: undefined,
	radius: 3,
	fill: undefined,

	/**
	 * @constructs
	 * @class
	 * @extends Ui.LBox
	 */
	constructor: function(config) {
		this.shadow = new Ui.Rectangle({ radius: 3 });
		this.append(this.shadow);

		this.background = new Ui.Rectangle({ radius: 2, margin: 1 });
		this.append(this.background);

		if('radius' in config)
			this.setRadius(config.radius);
		if('fill' in config)
			this.setFill(config.fill);
		else
			this.setFill(new Ui.Color({ r: 0.96, g: 0.96, b: 0.96 }));
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
			this.shadow.setFill((new Ui.Color({ y: yuv.y - 0.6, u: yuv.u, v: yuv.v })).getCssHtml());
		}
	}
});

Ui.Container.extend('Ui.SwitchBox', 
/**@lends Ui.SwitchBox#*/
{
	content1Box: undefined,
	content2Box: undefined,
	button: undefined,

	/**
	 * @constructs
	 * @class
	 * @extends Ui.Container
	 */
	constructor: function() {
		this.content1Box = new Ui.LBox({ margin: 5 });
		this.appendChild(this.content1Box);

		this.button = new Ui.SwitchButton({ width: 28, height: 28 });
		this.appendChild(this.button);

		this.content2Box = new Ui.LBox({ margin: 5 });
		this.appendChild(this.content2Box);
	},

	getSwitchButton: function() {
		return this.button;
	},

	getContent1Box: function() {
		return this.content1Box;
	},

	getContent2Box: function() {
		return this.content2Box;
	},

	setContent1: function(content1) {
		if(this.content1 !== content1) {
			if(this.content1 !== undefined)
				this.content1Box.remove(this.content1);
			this.content1 = content1;
			if(this.content1 !== undefined)
				this.content1Box.append(this.content1);
		}
	},

	setContent2: function(content2) {
		if(this.content2 !== content2) {
			if(this.content2 !== undefined)
				this.content2Box.remove(this.content2);
			this.content2 = content2;
			if(this.content2 !== undefined)
				this.content2Box.append(this.content2);
		}
	},

	getContentWidth: function() {
		return this.getLayoutWidth() - this.button.getLayoutWidth();
	}
}, 
/**@lends Ui.SwitchBox#*/
{
	measureCore: function(width, height) {
		var c1size = this.content1Box.measure(0, 0);
		var c2size = this.content2Box.measure(0, 0);
		var bsize = this.button.measure(0, 0);
		return { width: Math.max(c1size.width, c2size.width) + bsize.width, height: Math.max(c1size.height, Math.max(c2size.height, bsize.height)) };
	},

	arrangeCore: function(width, height) {
		var contentWidth = (width - this.button.getMeasureWidth());
		this.content1Box.arrange(0, 0, contentWidth, height);
		this.content2Box.arrange(contentWidth + this.button.getMeasureWidth(), 0, contentWidth, height);
		this.button.arrange(contentWidth, 0, this.button.getMeasureWidth(), height);
	}
});

