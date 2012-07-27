Ui.Container.extend('Ui.AccordeonPage', 
/**@lends Ui.AccordeonPage#*/
{
	headerBox: undefined,
	header: undefined,
	content: undefined,
	offset: 0,
	orientation: 'horizontal',
	isSelected: false,

	/**
	*	@constructs
	*	@class A page for an Accordeon element
	*	@extends Ui.Container
	*/
	constructor: function(config) {
		this.addEvents('select', 'unselect', 'close', 'orientationchange');

		this.headerBox = new Ui.Pressable();
		this.appendChild(this.headerBox);
		this.connect(this.headerBox, 'press', this.onHeaderPress);
	},

	/**
	* Signal that the current page need to be closed
	*/
	close: function() {
		this.fireEvent('close', this);
	},

	/**
	* Select the current page
	*/
	select: function() {
		if(!this.isSelected) {
			this.isSelected = true;
			this.fireEvent('select', this);
		}
	},

	/**
	* @return true if the current page is the current active
	* page in the Ui.Accordeonable
	*/
	getIsSelected: function() {
		return this.isSelected;
	},

	/**
	* @return the header element
	*/
	getHeader: function() {
		return this.header;
	},

	/**
	* Set the header element. 
	*	@param header Element
	* corresponding to the bar that can be pressed to
	* set the content visible
	*/
	setHeader: function(header) {
		header = Ui.Element.create(header);
		if(header != this.header) {
			if(this.header != undefined)
				this.headerBox.removeChild(this.header);
			this.header = header;
			if(this.header != undefined)
				this.headerBox.appendChild(this.header);
		}
	},

	/**
	* @return the content element of the page
	*/
	getContent: function() {
		return this.content;
	},

	/**
	* Set the content element of the page
	*/
	setContent: function(content) {
		content = Ui.Element.create(content) ;
		if(this.content != content) {
			if(this.content != undefined)
				this.removeChild(this.content);
			this.content = content;
			if(this.content != undefined)
				this.appendChild(this.content, true);
		}
	},

	/**
	* @return The orientation of the accordeon
	* possibles values: [horizontal|vertical]
	* default value: horizontal
	*/
	getOrientation: function() {
		return this.orientation;
	},

	/**
	* Set the orientation of the accordeon
	* 	@param orientation Possibles values: [horizontal|vertical]
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

	unselect: function() {
		if(this.isSelected) {
			this.isSelected = false;
			this.fireEvent('unselect', this);
		}
	},

	showContent: function() {
		if(this.content != undefined) {
			this.content.show();
		}
	},

	hideContent: function() {
		if(this.content != undefined) {
			this.content.hide();
		}
	},

	getOffset: function() {
		return this.offset;
	},

	setOffset: function(offset) {
		this.offset = offset;
		if(this.orientation == 'horizontal')
			this.setTransform(Ui.Matrix.createTranslate(this.offset * (this.getLayoutWidth() - this.headerBox.getMeasureWidth()), 0));
		else
			this.setTransform(Ui.Matrix.createTranslate(0, this.offset * (this.getLayoutHeight() - this.headerBox.getMeasureHeight())));
	},

	onHeaderPress: function() {
		this.select();
	}
	/**#@-*/
}, 
/**@lends Ui.AccordeonPage#*/
{
	/**
	* @return The required size for the current element
	*/
	measureCore: function(width, height) {
		var size = this.headerBox.measure(width, height);
		var contentSize = { width: 0, height: 0 };
		if(this.content != undefined) {
			if(this.orientation == 'horizontal') {
				contentSize = this.content.measure(width - size.width, height);
				if(contentSize.height > size.height)
					size.height = contentSize.height;
				size.width += contentSize.width;
			}
			else {
				contentSize = this.content.measure(width, height - size.height);
				if(contentSize.width > size.width)
					size.width = contentSize.width;
				size.height += contentSize.height;
			}
		}
		return size;
	},

	/**
	* Arrange children
	*/
	arrangeCore: function(width, height) {
		if(this.orientation == 'horizontal') {
			this.headerBox.arrange(0, 0, this.headerBox.getMeasureWidth(), height);
			if(this.content != undefined)
				this.content.arrange(this.headerBox.getMeasureWidth(), 0, width - this.headerBox.getMeasureWidth(), height);
		}
		else {
			this.headerBox.arrange(0, 0, width, this.headerBox.getMeasureHeight());
			if(this.content != undefined)
				this.content.arrange(0, this.headerBox.getMeasureHeight(), width, height - this.headerBox.getMeasureHeight());
		}
		this.setOffset(this.offset);
	}
});
