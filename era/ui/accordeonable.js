Ui.Container.extend('Ui.Accordeonable', 
/**@lends Ui.Accordeonable#*/
{
	current: -1,
	currentPage: undefined,
	clock: undefined,
	headersSize: 0,
	contentSize: 0,
	orientation: 'horizontal',

	/**
	*	@constructs
	*	@class The accordeon is a layout element to present only one element (page)
	* visible at a time. The header of a page is used to control which
	* page is visible.
	*	@extends Ui.Container
	*/
	constructor: function(config) {
		this.addEvents('change');
		this.setClipToBounds(true);
	},

	/**
	* @return the orientation of the accordeon
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
			for(var i = 0; i < this.getChildren().length; i++)
				this.getChildren()[i].setOrientation(orientation);
			this.invalidateMeasure();
		}
	},

	/**
	* Return the array of page in the accordeonable.
	* WARNING: use it only in readonly
	*/
	getPages: function() {
		return this.getChildren();
	},

	/**
	* @return the current opened page
	*/
	getCurrentPage: function() {
		return this.currentPage;
	},

	/**
	* Set the given page as the current opened page
	*/
	setCurrentPage: function(page) {
		for(var i = 0; i < this.getChildren().length; i++) {
			if(this.getChildren()[i] == page) {
				this.setCurrentPosition(i);
				return;
			}
		}
	},

	/**
	* @return the current page position (start at 0 or -1 if empty)
	*/
	getCurrentPosition: function() {
		return this.current;
	},

	/**
	* Set the page at the given position as the
	* current opened page 
	*/
	setCurrentPosition: function(pos) {
		if(this.getChildren().length === 0) {
			if(this.currentPage !== undefined)
				this.currentPage.unselect();
			this.currentPage = undefined;
			this.current = -1;
		}
		else {
			this.current = pos;
			var newPage = this.getChildren()[this.current];
			if(newPage !== this.currentPage) {
				if(this.currentPage !== undefined)
					this.currentPage.unselect();
				this.currentPage = newPage;
				this.fireEvent('change', this, this.currentPage, this.current);
				this.disconnect(this.currentPage, 'select', this.onPageSelect);
				this.currentPage.select();
				this.connect(this.currentPage, 'select', this.onPageSelect);
			}
			if(this.clock !== undefined)
				this.clock.stop();
			this.clock = new Anim.Clock({ scope: this, duration: 2, target: this, onTimeupdate: this.onClockTick });
			this.clock.begin();
		}
	},

	/**
	* Append a new AccordeonPage in the current
	* accordeon
	*/
	appendPage: function(page) {
		page = Ui.AccordeonPage.create(page);
		this.appendChild(page);
		page.setOffset(1);
		page.setOrientation(this.orientation);
		this.connect(page, 'select', this.onPageSelect);
		this.connect(page, 'close', this.onPageClose);
		page.select();
	},

	/**
	* Remove the given AccordeonPage from the current
	* accordeon
	*/
	removePage: function(page) {
		var pos = -1;
		for(var i = 0; i < this.getChildren().length; i++) {
			if(this.getChildren()[i] == page) {
				pos = i;
				break;
			}
		}
		if(pos !== -1) {
			this.disconnect(page, 'select', this.onPageSelect);
			this.disconnect(page, 'close', this.onPageClose);
			this.removeChild(page);
			if((this.current === pos) && (this.current === 0))
				this.setCurrentPosition(0);
			else if(this.current >= pos)
				this.setCurrentPosition(this.current - 1);
			else
				this.setCurrentPosition(this.current);
		}
	},

	/**#@+
	* @private
	*/

	onClockTick: function(clock, progress) {
		for(var i = 0; i < this.getChildren().length; i++) {
			var child = this.getChildren()[i];

			if(i == this.current)
				child.showContent();

			var offset = child.getOffset();
			if(offset > 1)
				child.setOffset(1);
			else {
				var destOffset;
				if(i <= this.current)
					destOffset = 0;
				else
					destOffset = 1;
				child.setOffset(destOffset - ((destOffset - offset) * (1 - progress)));
			}
			if((progress == 1) && (i != this.current))
				child.hideContent();
		}
	},

	onPageSelect: function(page) {
		this.setCurrentPage(page);
	},

	onPageClose: function(page) {
		this.removePage(page);
	},

	measureHorizontal: function(width, height) {
		var i; var size; var child; var content;
		var minHeaders = 0;
		var minContent = 0;
		var minHeight = 0;

		for(i = 0; i < this.getChildren().length; i++) {
			child = this.getChildren()[i];
			size = child.measure(width, height);
			minHeaders += child.getHeader().getMeasureWidth();
			if(child.getHeader().getMeasureHeight() > minHeight)
				minHeight = child.getHeader().getMeasureHeight();
		}

		for(i = 0; i < this.getChildren().length; i++) {
			child = this.getChildren()[i];
			size = child.measure((width - minHeaders) + child.getHeader().getMeasureWidth(), height);

			content = child.getContent();
			if((content !== undefined) && (content.getMeasureWidth() > minContent)) {
				minContent = content.getMeasureWidth();
				if(content.getMeasureHeight() > minHeight)
					minHeight = content.getMeasureHeight();
			}
		}
		this.headersSize = minHeaders;
		return { width: minHeaders + minContent, height: minHeight };
	},

	measureVertical: function(width, height) {
		var i; var child; var size; var content;
		var minHeaders = 0;
		var minContent = 0;
		var minWidth = 0;

		for(i = 0; i < this.getChildren().length; i++) {
			child = this.getChildren()[i];
			size = child.measure(width, height);
			minHeaders += child.getHeader().getMeasureHeight();
			if(child.getHeader().getMeasureWidth() > minWidth)
				minWidth = child.getHeader().getMeasureWidth();
		}

		for(i = 0; i < this.getChildren().length; i++) {
			child = this.getChildren()[i];
			size = child.measure(width, (height - minHeaders) + child.getHeader().getMeasureHeight());

			content = child.getContent();
			if((content !== undefined) && (content.getMeasureHeight() > minContent)) {
				minContent = content.getMeasureHeight();
				if(content.getMeasureWidth() > minWidth)
					minWidth = content.getMeasureWidth();
			}
		}
		this.headersSize = minHeaders;
		return { width: minWidth, height: minHeaders + minContent };
	}
	/**#@-*/
}, 
/**@lends Ui.Accordeonable#*/
{
	measureCore: function(width, height) {
		if(this.orientation == 'horizontal')
			return this.measureHorizontal(width, height);
		else
			return this.measureVertical(width, height);
	},

	arrangeCore: function(width, height) {
		var i; var child; var x; var y;
		if(this.orientation == 'horizontal') {
			x = 0;
			this.contentSize = width - this.headersSize;
			for(i = 0; i < this.getChildren().length; i++) {
				child = this.getChildren()[i];
				child.arrange(x, 0, this.contentSize + child.getHeader().getMeasureWidth(), height);
				x += child.getHeader().getMeasureWidth();
			}
		}
		else {
			y = 0;
			this.contentSize = height - this.headersSize;
			for(i = 0; i < this.getChildren().length; i++) {
				child = this.getChildren()[i];
				child.arrange(0, y, width, this.contentSize + child.getHeader().getMeasureHeight());
				y += child.getHeader().getMeasureHeight();
			}
		}
	}
});

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
			if(this.header !== undefined)
				this.headerBox.removeChild(this.header);
			this.header = header;
			if(this.header !== undefined)
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
			if(this.content !== undefined)
				this.removeChild(this.content);
			this.content = content;
			if(this.content !== undefined)
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
	* @param orientation Possibles values: [horizontal|vertical]
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
		if(this.content !== undefined) {
			this.content.show();
		}
	},

	hideContent: function() {
		if(this.content !== undefined) {
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
		if(this.content !== undefined) {
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
			if(this.content !== undefined)
				this.content.arrange(this.headerBox.getMeasureWidth(), 0, width - this.headerBox.getMeasureWidth(), height);
		}
		else {
			this.headerBox.arrange(0, 0, width, this.headerBox.getMeasureHeight());
			if(this.content !== undefined)
				this.content.arrange(0, this.headerBox.getMeasureHeight(), width, height - this.headerBox.getMeasureHeight());
		}
		this.setOffset(this.offset);
	}
});

