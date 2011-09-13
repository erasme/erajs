Ui.Container.extend('Ui.Fold', 
/**@lends Ui.Fold#*/
{
	headerBox: undefined,
	header: undefined,
	contentBox: undefined,
	content: undefined,
	offset: 0,
	orientation: 'horizontal',
	isFolded: true,
	over: true,
	mode: 'extend',
	clock: undefined,
	contentSize: 0,

	/**
	 * @constructs
	 * @class
	 * @extends Ui.Container
	 */	
	constructor: function(config) {
		this.addEvents('fold', 'unfold', 'orientationchange');

		this.headerBox = new Ui.Pressable();
		this.appendChild(this.headerBox);
		this.connect(this.headerBox, 'press', this.onHeaderPress);

		this.contentBox = new Ui.LBox();
		this.appendChild(this.contentBox);
		this.contentBox.hide();

		this.autoConfig(config, 'header', 'content', 'over', 'mode', 'orientation');
	},

	getIsFolded: function() {
		return this.isFolded;
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
		if(header != this.header) {
			if(this.header != undefined)
				this.headerBox.removeChild(this.header);
			this.header = header;
			if(this.header != undefined)
				this.headerBox.appendChild(this.header);
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
		if(this.content != content) {
			if(this.content != undefined)
				this.contentBox.removeChild(this.content);
			this.content = content;
			if(this.content != undefined)
				this.contentBox.appendChild(this.content);
		}
	},

	/**
	 * Return the orientation of the accordeon
	 * possibles values: [horizontal|vertical]
	 * default value: horizontal
	 */
	getOrientation: function() {
		return this.orientation;
	},

	/**
	 * Set the orientation of the accordeon
	 * possibles values: [horizontal|vertical]
	 * default value: horizontal
	 */
	setOrientation: function(orientation) {
		if(this.orientation != orientation) {
			this.orientation = orientation;
			this.fireEvent('orientationchange', this, orientation);
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
		this.offset = offset;

		if(!this.over)
			this.invalidateMeasure();
		else {
			if(this.orientation == 'horizontal') {
				if(this.mode == 'slide')
					this.setTransform(Ui.Matrix.createTranslate(-this.offset * this.contentSize, 0));
				this.contentBox.setClipRectangle(0, 0, Math.round(this.contentSize*this.offset), this.getLayoutHeight());
			}
			else {
				if(this.mode == 'slide')
					this.setTransform(Ui.Matrix.createTranslate(0, -this.offset * this.contentSize));
				this.contentBox.setClipRectangle(0, 0, this.getLayoutWidth(), Math.round(this.contentSize*this.offset));
			}
		}
	},

	onHeaderPress: function() {
		if(this.isFolded)
			this.unfold();
		else
			this.fold();
	},

	startAnimation: function() {
		if(this.clock != undefined)
			this.clock.stop();

		if(!this.isFolded)
			this.contentBox.show();

		this.clock = new Anim.Clock({ duration: 2, target: this, callback: this.onClockTick });
		this.clock.begin();
	},

	stopAnimation: function() {
		if(this.clock != undefined) {
			this.clock.stop();
			this.clock = undefined
		}
	},

	onClockTick: function(clock, progress) {
		if(this.content == undefined) {
			if(this.clock != undefined) {
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
}, 

{
	/**
	 * Return the required size for the current element
	 */
	measureCore: function(width, height) {
		var size = this.headerBox.measure(width, height);
		var contentSize = { width: 0, height: 0 };
		if(this.orientation == 'horizontal') {
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
		if(this.orientation == 'horizontal') {
			this.headerBox.arrange(0, 0, this.headerBox.getMeasureWidth(), height);
			this.contentBox.arrange(this.headerBox.getMeasureWidth(), 0, this.contentBox.getMeasureWidth(), height);
			this.contentBox.setClipRectangle(0, 0, Math.round(this.contentSize*this.offset), Math.round(height));
		}
		else {
			this.headerBox.arrange(0, 0, width, this.headerBox.getMeasureHeight());
			this.contentBox.arrange(0, this.headerBox.getMeasureHeight(), width, this.contentBox.getMeasureHeight());
			this.contentBox.setClipRectangle(0, 0, Math.round(width), Math.round(this.contentSize*this.offset));
		}
		this.setOffset(this.offset);
	}
});

