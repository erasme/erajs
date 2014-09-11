Ui.Container.extend('Ui.Fold', 
/**@lends Ui.Fold#*/
{
	headerBox: undefined,
	header: undefined,
	contentBox: undefined,
	content: undefined,
	background: undefined,
	offset: 0,
	position: 'bottom',
	isFolded: true,
	over: true,
	mode: 'extend',
	clock: undefined,
	contentSize: 0,
	animDuration: 2,

	/**
	 * @constructs
	 * @class
	 * @extends Ui.Container
	 */	
	constructor: function(config) {
		this.addEvents('fold', 'unfold', 'positionchange');

		this.headerBox = new Ui.LBox();
		this.appendChild(this.headerBox);

		this.contentBox = new Ui.LBox();
		this.appendChild(this.contentBox);
		this.contentBox.hide();
	},

	getIsFolded: function() {
		return this.isFolded;
	},

	setIsFolded: function(isFolded) {
		if(this.isFolded != isFolded) {
			this.isFolded = isFolded;
			if(this.isFolded) {
				this.setOffset(0);
				this.contentBox.hide();
				this.fireEvent('fold', this);
			}
			else {
				this.setOffset(1);
				this.contentBox.show();
				this.fireEvent('unfold', this);
			}
		}
	},

	/**
	 * Fold the content part
	 */
	fold: function() {
		if(!this.isFolded) {
			this.isFolded = true;
			this.startAnimation();
			this.fireEvent('fold', this);
		}
	},

	/**
	 * Unfold the content part
	 */
	unfold: function() {
		if(this.isFolded) {
			this.isFolded = false;
			this.startAnimation();
			this.fireEvent('unfold', this);
		}
	},

	getOver: function() {
		return this.over;
	},

	/**
	 * Set true to unfold the content part
	 * without reserving space in the layout (default)
	 * if false, unfolding will "push" existing element
	 */
	setOver: function(over) {
		if(this.over != over) {
			this.over = over;
			this.stopAnimation();
			this.setTransform(Ui.Matrix.createTranslate(0, 0));
			this.invalidateMeasure();
		}
	},

	getMode: function() {
		return this.mode;
	},

	/**
	 * If the current fold is in over mode.
	 * Setup what happends when unfolding.
	 * Possibles values: [extend|slide]
	 * extend: the header dont move and the content appear below or right
	 * slide: the header move over or left to let the content appear
	 */
	setMode: function(mode) {
		if(this.mode != mode) {
			this.mode = mode;
			this.stopAnimation();
			this.invalidateMeasure();
		}
	},

	/**
	 * Return the header element
	 */
	getHeader: function() {
		return this.header;
	},

	/**
	 * Set the header element. The header element
	 * correspond to the bar that can be pressed to
	 * set the content visible
	 */
	setHeader: function(header) {
		if(header !== this.header) {
			this.header = header;
			this.headerBox.setContent(this.header);
		}
	},

	/**
	 * Return the content element of the page
	 */
	getContent: function() {
		return this.content;
	},

	/**
	 * Set the content element of the page
	 */
	setContent: function(content) {
		if(this.content !== content) {
			this.content = content;
			this.contentBox.setContent(this.content);
		}
	},

	/**
	 * Return the background element of the page
	 */
	getBackground: function() {
		return this.background;
	},

	/**
	 * Set the background element of the page
	 */
	setBackground: function(background) {
		if(this.background !== background) {
			if(this.background !== undefined)
				this.removeChild(this.background);
			this.background = background;
			if(this.background !== undefined)
				this.prependChild(this.background);
		}
	},
	
	/**
	 * Return the position of the content
	 * possibles values: [top|bottom|left|right]
	 * default value: bottom
	 */
	getPosition: function() {
		return this.position;
	},

	/**
	 * Set the position of the content relative to the header
	 * possibles values: [top|bottom|left|right]
	 * default value: right
	 */
	setPosition: function(position) {
		if(this.position != position) {
			this.position = position;
			this.fireEvent('positionchange', this, position);
			this.invalidateMeasure();
		}
	},

	/**#@+
	 * @private
	 */

	getOffset: function() {
		return this.offset;
	},

	setOffset: function(offset) {
		if(this.offset === offset)
			return;
		this.offset = offset;

		if(!this.over)
			this.invalidateMeasure();
		else {
			if(this.position === 'right') {
				if(this.mode === 'slide')
					this.setTransform(Ui.Matrix.createTranslate(-this.offset * this.contentSize, 0));
				else
					this.setTransform(Ui.Matrix.createTranslate(0, 0));
				this.contentBox.setClipRectangle(0, 0, Math.round(this.contentSize*this.offset), this.getLayoutHeight());
				if(this.background !== undefined)
					this.background.arrange(0, 0, Math.round(this.headerBox.getMeasureWidth() + this.contentSize*this.offset), Math.round(this.getLayoutHeight()));
			}
			else if(this.position === 'left') {
				if(this.mode === 'slide')
					this.setTransform(Ui.Matrix.createTranslate(-this.contentSize + (this.offset * this.contentSize), 0));
				else
					this.setTransform(Ui.Matrix.createTranslate(-this.contentSize, 0));
				this.contentBox.setClipRectangle(Math.round(this.contentSize*(1-this.offset)), 0, this.contentSize, this.getLayoutHeight());
				if(this.background !== undefined)
					this.background.arrange(Math.round(this.contentSize*(1-this.offset)), 0, Math.round(this.headerBox.getMeasureWidth() + this.contentSize*this.offset), Math.round(this.getLayoutHeight()));
			}
			else if(this.position === 'top') {
				if(this.mode === 'slide')
					this.setTransform(Ui.Matrix.createTranslate(0, -this.contentSize + (this.offset * this.contentSize)));
				else
					this.setTransform(Ui.Matrix.createTranslate(0, -this.contentSize));
				this.contentBox.setClipRectangle(0, Math.round(this.contentSize*(1-this.offset)), this.getLayoutWidth(), Math.round(this.contentSize*this.offset));
				if(this.background !== undefined)
					this.background.arrange(0, Math.round(this.contentSize*(1-this.offset)), this.getLayoutWidth(), Math.round(this.headerBox.getMeasureHeight() + this.contentSize*this.offset));
			}
			else {
				if(this.mode === 'slide')
					this.setTransform(Ui.Matrix.createTranslate(0, -this.offset * this.contentSize));
				else
					this.setTransform(Ui.Matrix.createTranslate(0, 0));
				this.contentBox.setClipRectangle(0, 0, this.getLayoutWidth(), Math.round(this.contentSize*this.offset));
				if(this.background !== undefined)
					this.background.arrange(0, 0, this.getLayoutWidth(), Math.round(this.headerBox.getMeasureHeight() + this.contentSize*this.offset));
			}
		}
	},

	invert: function() {
		if(this.isFolded)
			this.unfold();
		else
			this.fold();
	},

	setAnimDuration: function(duration) {
		this.animDuration = duration;
	},

	startAnimation: function() {
		if(this.clock !== undefined)
			this.clock.stop();

		if(!this.isFolded)
			this.contentBox.show();

		this.clock = new Anim.Clock({ duration: this.animDuration, target: this });
		this.connect(this.clock, 'timeupdate', this.onClockTick);
		this.clock.begin();
	},

	stopAnimation: function() {
		if(this.clock !== undefined) {
			this.clock.stop();
			this.clock = undefined;
		}
	},

	onClockTick: function(clock, progress) {
		if(this.content === undefined) {
			if(this.clock !== undefined) {
				this.clock.stop();
				this.clock = undefined;
			}
			return;
		}
		var offset = this.getOffset();
		if(offset > 1)
			this.setOffset(1);
		else {
			var destOffset;
			if(this.isFolded)
				destOffset = 0;
			else
				destOffset = 1;
			this.setOffset(destOffset - ((destOffset - offset) * (1 - progress)));
		}
		if((progress == 1) && this.isFolded) {
			this.contentBox.hide();
		}
	}
	/**#@-*/
}, {
	/**
	 * Return the required size for the current element
	 */
	measureCore: function(width, height) {
		if(this.background !== undefined)
			this.background.measure(width, height);
		var size = this.headerBox.measure(width, height);
		var contentSize = { width: 0, height: 0 };
		if((this.position == 'left') || (this.position == 'right')) {
			contentSize = this.contentBox.measure(width - size.width, height);
			if(contentSize.height > size.height)
				size.height = contentSize.height;
			if(!this.over)
				size.width += contentSize.width * this.offset;
			this.contentSize = contentSize.width;
		}
		else {
			contentSize = this.contentBox.measure(width, height - size.height);
			if(contentSize.width > size.width)
				size.width = contentSize.width;
			if(!this.over)
				size.height += contentSize.height * this.offset;
			this.contentSize = contentSize.height;
		}
		return size;
	},

	/**
	 * Arrange children
	 */
	arrangeCore: function(width, height) {
		if(this.position == 'left') {
			if(!this.over)
				this.setTransform(Ui.Matrix.createTranslate(-this.contentSize + (this.offset * this.contentSize), 0));
			this.contentBox.arrange(0, 0, this.contentBox.getMeasureWidth(), height);
			this.headerBox.arrange(this.contentBox.getMeasureWidth(), 0, this.headerBox.getMeasureWidth(), height);
			if(this.background !== undefined)
				this.background.arrange(Math.round(this.contentSize*(1-this.offset)), 0, Math.round(this.headerBox.getMeasureWidth() + this.contentSize*this.offset), Math.round(height));
			this.contentBox.setClipRectangle(Math.round(this.contentSize*(1-this.offset)), 0, Math.round(this.contentSize*this.offset), Math.round(height));
		}
		else if(this.position == 'right') {
			this.headerBox.arrange(0, 0, this.headerBox.getMeasureWidth(), height);
			this.contentBox.arrange(this.headerBox.getMeasureWidth(), 0, this.contentBox.getMeasureWidth(), height);
			if(this.background !== undefined)
				this.background.arrange(0, 0, Math.round(this.headerBox.getMeasureWidth() + this.contentSize*this.offset), Math.round(height));
			this.contentBox.setClipRectangle(0, 0, Math.round(this.contentSize*this.offset), Math.round(height));
		}
		else if(this.position == 'top') {
			if(!this.over)
				this.setTransform(Ui.Matrix.createTranslate(0, -this.contentSize + (this.offset * this.contentSize)));
			this.contentBox.arrange(0, 0, width, this.contentBox.getMeasureHeight());
			this.headerBox.arrange(0, this.contentBox.getMeasureHeight(), width, this.headerBox.getMeasureHeight());
			if(this.background !== undefined)
				this.background.arrange(0, Math.round(this.contentSize*(1-this.offset)), width, Math.round(this.headerBox.getMeasureHeight() + this.contentSize*this.offset));
			this.contentBox.setClipRectangle(0, Math.round(this.contentSize*(1-this.offset)), Math.round(width), Math.round(this.contentSize*this.offset));
		}
		else {
			this.headerBox.arrange(0, 0, width, this.headerBox.getMeasureHeight());
			this.contentBox.arrange(0, this.headerBox.getMeasureHeight(), width, this.contentBox.getMeasureHeight());
			if(this.background !== undefined)
				this.background.arrange(0, 0, width, Math.round(this.headerBox.getMeasureHeight() + this.contentSize*this.offset));
			this.contentBox.setClipRectangle(0, 0, Math.round(width), Math.round(this.contentSize*this.offset));
		}
		this.setOffset(this.offset);
	}
});

