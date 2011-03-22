//
// Define the Accordeon class.
// The accordeon is a layout element to present only one element (page)
// visible at a time. The header of a page is used to control which
// page is visible.
//
Ui.Container.extend('Ui.Accordeon', {
	current: 0,
	clock: undefined,
	headersSize: 0,
	contentSize: 0,
	orientation: 'horizontal',

	constructor: function(config) {
		if(config.orientation != undefined)
			this.setOrientation(config.orientation);
		this.setClipToBounds(true);
	},

	//
	// Return the orientation of the accordeon
	// possibles values: [horizontal|vertical]
	// default value: horizontal
	//
	getOrientation: function() {
		return this.orientation;
	},

	//
	// Set the orientation of the accordeon
	// possibles values: [horizontal|vertical]
	// default value: horizontal
	//
	setOrientation: function(orientation) {
		if(this.orientation != orientation) {
			this.orientation = orientation;
			for(var i = 0; i < this.getChildren().length; i++)
				this.getChildren()[i].setOrientation(orientation);
			this.invalidateMeasure();
		}
	},

	//
	// Set the given page as the current opened page
	//
	setCurrentPage: function(page) {
		for(var i = 0; i < this.getChildren().length; i++) {
			if(this.getChildren()[i] == page) {
				this.setCurrentPosition(i);
				return;
			}
		}
	},

	//
	// Set the page at the given position as the
	// current opened page 
	//
	setCurrentPosition: function(pos) {
		this.current = pos;
		if(this.clock != undefined)
			this.clock.stop();

		this.clock = new Anim.Clock({ duration: 2, target: this, callback: this.onClockTick });
		this.clock.begin();
	},

	//
	// Append a new AccordeonPage in the current
	// accordeon
	//
	appendPage: function(page) {
		this.appendChild(page);
		page.setOffset(this.contentSize);
		page.setOrientation(this.orientation);
		this.connect(page, 'select', this.onPageSelect);
		this.connect(page, 'close', this.onPageClose);
		this.setCurrentPage(page);
	},

	//
	// Remove the given AccordeonPage from the current
	// accordeon
	//
	removePage: function(page) {
		var pos = -1;
		for(var i = 0; i < this.getChildren().length; i++) {
			if(this.getChildren()[i] == page) {
				pos = i;
				break;
			}
		}
		if(pos != -1) {
			this.disconnect(page, 'select', this.onPageSelect);
			this.disconnect(page, 'close', this.onPageClose);
			this.removeChild(page);
			if((this.current == pos) && (this.current == 0))
				this.setCurrentPosition(0);
			else if(this.current >= pos)
				this.setCurrentPosition(this.current - 1);
			else
				this.setCurrentPosition(this.current);
		}
	},

	//
	// Private
	//

	onClockTick: function(clock, progress) {
		for(var i = 0; i < this.getChildren().length; i++) {
			var child = this.getChildren()[i];
			var offset = child.getOffset();
			if(offset > this.contentSize)
				child.setOffset(this.contentSize);
			else {
				var destOffset;
				if(i <= this.current)
					destOffset = 0;
				else
					destOffset = this.contentSize;
				child.setOffset(destOffset - ((destOffset - offset) * (1 - progress)));
			}
		}
	},

	onPageSelect: function(page) {
		this.setCurrentPage(page);
	},

	onPageClose: function(page) {
		this.removePage(page);
	},

	measureHorizontal: function(width, height, force) {
		var minHeaders = 0;
		var minContent = 0;
		var minHeight = 0;

		for(var i = 0; i < this.getChildren().length; i++) {
			var child = this.getChildren()[i];
			var size = child.measure(width, height, force);
			minHeaders += child.getHeader().getMeasureWidth();
			if(child.getHeader().getMeasureHeight() > minHeight)
				minHeight = child.getHeader().getMeasureHeight();
		}

		for(var i = 0; i < this.getChildren().length; i++) {
			var child = this.getChildren()[i];
			var size = child.measure((width - minHeaders) + child.getHeader().getMeasureWidth(), height, force);

			var content = child.getContent();
			if((content != undefined) && (content.getMeasureWidth() > minContent)) {
				minContent = content.getMeasureWidth();
				if(content.getMeasureHeight() > minHeight)
					minHeight = content.getMeasureHeight();
			}
		}
		this.headersSize = minHeaders;
		return { width: minHeaders + minContent, height: minHeight };
	},

	measureVertical: function(width, height, force) {
		var minHeaders = 0;
		var minContent = 0;
		var minWidth = 0;

		for(var i = 0; i < this.getChildren().length; i++) {
			var child = this.getChildren()[i];
			var size = child.measure(width, height, force);
			minHeaders += child.getHeader().getMeasureHeight();
			if(child.getHeader().getMeasureWidth() > minWidth)
				minWidth = child.getHeader().getMeasureWidth();
		}

		for(var i = 0; i < this.getChildren().length; i++) {
			var child = this.getChildren()[i];
			var size = child.measure(width, (height - minHeaders) + child.getHeader().getMeasureHeight(), force);

			var content = child.getContent();
			if((content != undefined) && (content.getMeasureHeight() > minContent)) {
				minContent = content.getMeasureHeight();
				if(content.getMeasureWidth() > minWidth)
					minWidth = content.getMeasureWidth();
			}
		}
		this.headersSize = minHeaders;
		return { width: minWidth, height: minHeaders + minContent };
	},

}, {
	measureCore: function(width, height, force) {
		if(this.orientation == 'horizontal')
			return this.measureHorizontal(width, height, force);
		else
			return this.measureVertical(width, height, force);
	},

	arrangeCore: function(width, height, force) {
		if(this.orientation == 'horizontal') {
			var x = 0;
			this.contentSize = width - this.headersSize;
			for(var i = 0; i < this.getChildren().length; i++) {
				var child = this.getChildren()[i];
				child.arrange(x, 0, this.contentSize + child.getHeader().getMeasureWidth(), height, force);
				x += child.getHeader().getMeasureWidth();
			}
		}
		else {
			var y = 0;
			this.contentSize = height - this.headersSize;
			for(var i = 0; i < this.getChildren().length; i++) {
				var child = this.getChildren()[i];
				child.arrange(0, y, width, this.contentSize + child.getHeader().getMeasureHeight(), force);
				y += child.getHeader().getMeasureHeight();
			}
		}
		this.setCurrentPosition(this.current);
	},
});

//
// Define a page for an Accordeon element
//
Ui.Container.extend('Ui.AccordeonPage', {
	headerBox: undefined,
	header: undefined,
	content: undefined,
	offset: 0,
	orientation: 'horizontal',

	constructor: function(config) {
		if(config.orientation != undefined)
			this.setOrientation(config.orientation);

		this.headerBox = new Ui.Pressable();
		this.appendChild(this.headerBox);
		this.connect(this.headerBox, 'press', this.onHeaderPress);

		if(config.header != undefined)
			this.setHeader(config.header);
		if(config.content != undefined)
			this.setContent(config.content);

		this.addEvents('select', 'close', 'orientationchange');
	},

	//
	// Signal that the current page need to be closed
	//
	close: function() {
		this.fireEvent('close', this);
	},

	//
	// Return the header element
	//
	getHeader: function() {
		return this.header;
	},

	//
	// Set the header element. The header element
	// correspond to the bar that can be pressed to
	// set the content visible
	//
	setHeader: function(header) {
		if(header != this.header) {
			if(this.header != undefined)
				this.headerBox.removeChild(this.header);
			this.header = header;
			if(this.header != undefined)
				this.headerBox.appendChild(this.header);
		}
	},

	//
	// Return the content element of the page
	//
	getContent: function() {
		return this.content;
	},

	//
	// Set the content element of the page
	//
	setContent: function(content) {
		if(this.content != content) {
			if(this.content != undefined)
				this.removeChild(this.content);
			this.content = content;
			if(this.content != undefined)
				this.appendChild(this.content, true);
		}
	},

	//
	// Return the orientation of the accordeon
	// possibles values: [horizontal|vertical]
	// default value: horizontal
	//
	getOrientation: function() {
		return this.orientation;
	},

	//
	// Set the orientation of the accordeon
	// possibles values: [horizontal|vertical]
	// default value: horizontal
	//
	setOrientation: function(orientation) {
		if(this.orientation != orientation) {
			this.orientation = orientation;
			this.fireEvent('orientationchange', this, orientation);
			this.invalidateMeasure();
		}
	},

	//
	// Private
	//

	getOffset: function() {
		return this.offset;
	},

	setOffset: function(offset) {
		this.offset = offset;
		if(this.orientation == 'horizontal')
			this.setTransform(Ui.Matrix.createTranslate(this.offset, 0));
		else
			this.setTransform(Ui.Matrix.createTranslate(0, this.offset));
	},

	onHeaderPress: function() {
		this.fireEvent('select', this);
	},
}, {
	//
	// Return the required size for the current element
	//
	measureCore: function(width, height, force) {
		var size = this.headerBox.measure(width, height, force);
		var contentSize = { width: 0, height: 0 };
		if(this.content != undefined) {
			if(this.orientation == 'horizontal') {
				contentSize = this.content.measure(width - size.width, height, force);
				if(contentSize.height > size.height)
					size.height = contentSize.height;
				size.width += contentSize.width;
			}
			else {
				contentSize = this.content.measure(width, height - size.height, force);
				if(contentSize.width > size.width)
					size.width = contentSize.width;
				size.height += contentSize.height;
			}
		}
		return size;
	},

	//
	// Arrange children
	//
	arrangeCore: function(width, height, force) {
		if(this.orientation == 'horizontal') {
			this.headerBox.arrange(0, 0, this.headerBox.getMeasureWidth(), height, force);
			if(this.content != undefined)
				this.content.arrange(this.headerBox.getMeasureWidth(), 0, width - this.headerBox.getMeasureWidth(), height, force);
		}
		else {
			this.headerBox.arrange(0, 0, width, this.headerBox.getMeasureHeight(), force);
			if(this.content != undefined)
				this.content.arrange(0, this.headerBox.getMeasureHeight(), width, height - this.headerBox.getMeasureHeight(), force);
		}
	},
});

