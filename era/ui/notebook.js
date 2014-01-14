Ui.Container.extend('Ui.Notebook', 
/**@lends Ui.Notebook#*/
{
	current: -1,
	currentPage: undefined,
	pages: undefined,
	headerHeight: 0,
	hiddenColor: undefined,
	currentColor: undefined,

	/**
	*	@constructs
	*	@class The accordeon is a layout element to present only one element (page)
	* visible at a time. The header of a page is used to control which
	* page is visible.
	*	@extends Ui.Container
	*/
	constructor: function(config) {
		this.addEvents('change');
		this.setFocusable(true);
		this.connect(this, 'focus', this.updateColors);
		this.connect(this, 'blur', this.updateColors);
		this.connect(this.getDrawing(), 'keydown', this.onKeyDown);
		this.pages = [];
	},

	setContent: function(content) {
		while(this.getPages().length > 0)
			this.removePage(this.getPages()[0]);
		if((content != undefined) && (typeof(content) == 'object')) {
			if(content.constructor == Array) {
				for(var i = 0; i < content.length; i++)
					this.appendPage(content[i]);
			}
			else
				this.appendPage(content);
		}
	},

	/**
	* Set the given page as the current opened page
	*/
	setCurrentPage: function(page) {
		for(var i = 0; i < this.pages.length; i++) {
			if(this.pages[i] == page) {
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
		if(this.pages.length == 0) {
			if(this.currentPage != undefined)
				this.currentPage.unselect();
			this.currentPage = undefined;
			this.current = -1;
		}
		else {
			this.current = pos;
			var newPage = this.pages[this.current];
			if(newPage != this.currentPage) {
				if(this.currentPage != undefined)
					this.currentPage.unselect();
				this.currentPage = newPage;
				this.fireEvent('change', this, this.currentPage, this.current);
				this.disconnect(this.currentPage, 'select', this.onPageSelect);
				this.currentPage.select();
				this.connect(this.currentPage, 'select', this.onPageSelect);
			}
		}
		this.invalidateArrange();
	},

	/**
	* Append a new AccordeonPage in the current
	* accordeon
	*/
	appendPage: function(page) {
		page = Ui.NotebookPage.create(page);
		this.pages.push(page);
		this.prependChild(page.getBackground());
		this.appendChild(page.getHeaderBox());
		this.appendChild(page.getContentBox());

		this.connect(page, 'select', this.onPageSelect);
		this.connect(page, 'close', this.onPageClose);

		if(this.pages.length == 1)
			page.select();
	},

	/**
	* Remove the given AccordeonPage from the current
	* accordeon
	*/
	removePage: function(page) {
		var i = 0;
		while((i < this.pages.length) && (this.pages[i] != page)) { i++ };
		if(i < this.pages.length) {
			this.pages.splice(i, 1);
			
			this.removeChild(page.getBackground());
			this.removeChild(page.getHeaderBox());
			this.removeChild(page.getContentBox());

			this.disconnect(page, 'select', this.onPageSelect);
			this.disconnect(page, 'close', this.onPageClose);

			if((this.current == i) && (this.current == 0))
				this.setCurrentPosition(0);
			else if(this.current >= i)
				this.setCurrentPosition(this.current - 1);
			else
				this.setCurrentPosition(this.current);
		}
	},

	/**
	* Return the array of page in the notebook.
	* WARNING: use it only in readonly
	*/
	getPages: function() {
		return this.pages;
	},

	/**
	* @return the current opened page
	*/
	getCurrentPage: function() {
		return this.currentPage;
	},

	/**
	* Move the current page to the next page
	*/
	next: function() {
		if((this.current >= 0) && (this.current + 1 < this.pages.length))
			this.setCurrentPosition(this.current + 1);
	},

	/**
	* Move the current page to the previous page
	*/
	previous: function() {
		if(this.current >= 1)
			this.setCurrentPosition(this.current - 1);
	},

	/**#@+
	* @private
	*/

	onKeyDown: function(event) {
		if(this.getIsDisabled())
			return;
		var key = event.which;
		if((key == 37) || (key == 39)) {
			event.stopPropagation();
			event.preventDefault();
		}
		if(key == 37)
			this.previous();
		else if(key == 39)
			this.next();
	},

	onPageSelect: function(page) {
		this.setCurrentPage(page);
		this.focus();
	},

	onPageClose: function(page) {
		this.removePage(page);
	},

	getCurrentColor: function() {
		var color = this.getStyleProperty('color');
		if(this.getHasFocus())
			color = this.getStyleProperty('focusColor');
		return color;
	},

	updateColors: function() {
		if(this.currentPage !== undefined)
			this.currentPage.getBackground().setFill(this.getCurrentColor());
	}

	/**#@-*/
}, 
/**@lends Ui.Notebook#*/
{
	measureCore: function(width, height) {
		var spacing = 10;

		var minHeaderWidth = 0;
		var minHeaderHeight = 0;
		for(var i = 0; i < this.pages.length; i++) {
			var page = this.pages[i];
			page.getBackground().measure(width, height);

			var size = page.getHeaderBox().measure(0, 0);
			minHeaderWidth += size.width + spacing * 2;
			if(size.height > minHeaderHeight)
				minHeaderHeight = size.height;
		}
		minHeaderHeight += spacing * 2;

		var constraintWidth = Math.max(minHeaderWidth, width - (spacing * 2));
		var constraintHeight = Math.max(height - (minHeaderHeight + (spacing * 2)), 0);

		var minContentWidth = 0;
		var minContentHeight = 0;

		for(var i = 0; i < this.pages.length; i++) {
			var page = this.pages[i];
			var size = page.getContentBox().measure(constraintWidth, constraintHeight);
			if(size.width > minContentWidth)
				minContentWidth = size.width;
			if(size.height > minContentHeight)
				minContentHeight = size.height;
		}
		minContentWidth += spacing * 2;
		minContentHeight += spacing * 2;

		this.headerHeight = minHeaderHeight;

		return { width: Math.max(minContentWidth, minHeaderWidth), height: minContentHeight + minHeaderHeight };
	},

	arrangeCore: function(width, height) {
		var spacing = 10;

		var x = 0;
		for(var i = 0; i < this.pages.length; i++) {
			var page = this.pages[i];
			var headerWidth = page.getHeaderBox().getMeasureWidth();
			page.getHeaderBox().arrange(x + spacing, spacing, headerWidth, this.headerHeight - (spacing * 2));
			if(this.current == i) {
				page.getContentBox().show();
				page.getContentBox().arrange(spacing, this.headerHeight + spacing, width - (spacing * 2), height - (this.headerHeight + spacing * 2));
				if(this.currentColor != undefined)
					page.getBackground().setFill(this.getCurrentColor());
				page.getBackground().setTab(x, headerWidth + spacing * 2, this.headerHeight);
				page.getBackground().arrange(0, 0, width, height);
			}
			else {
				this.moveChildAt(page.getBackground(), 0);

				page.getContentBox().hide();
				if(this.hiddenColor != undefined)
					page.getBackground().setFill(this.hiddenColor);
				page.getBackground().setTab(x, headerWidth + spacing * 2, this.headerHeight);
				page.getBackground().arrange(0, 0, width, height);
			}
			x += headerWidth + (spacing * 2);
		}
	},

	onStyleChange: function() {
		this.currentColor = Ui.Color.create(this.getStyleProperty('color'));
		var yuv = this.currentColor.getYuva();
		this.hiddenColor = new Ui.Color({ y: yuv.y - 0.08, u: yuv.u, v: yuv.v });
		for(var i = 0; i < this.pages.length; i++) {
			if(i == this.current)
				this.pages[i].getBackground().setFill(this.currentColor);
			else
				this.pages[i].getBackground().setFill(this.hiddenColor);
		}
	}
}, {
	style: {
		color: '#f8f8f8',
		focusColor: '#f8ead2'
	}
});

Core.Object.extend('Ui.NotebookPage', 
/**@lends Ui.NotebookPage#*/
{
	headerBox: undefined,
	header: undefined,
	contentBox: undefined,
	content: undefined,
	background: undefined,
	isSelected: false,

	/**
	*	@constructs
	*	@class A page for a Notebook element
	*	@extends Ui.Container
	*/
	constructor: function(config) {
		this.addEvents('select', 'unselect', 'close');

		this.headerBox = new Ui.Pressable();
		this.headerBox.setFocusable(false);
		this.connect(this.headerBox, 'press', this.onHeaderPress);

		this.contentBox = new Ui.LBox();
		this.contentBox.hide();

		this.background = new Ui.NotebookBackground();
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
			this.contentBox.show();
			this.fireEvent('select', this);
		}
	},

	/**
	* @return true if the current page is the current active
	* page in the Ui.Notebook
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
	* @param header Element
	* corresponding to the bar that can be pressed to
	* set the content visible
	*/
	setHeader: function(header) {
		if(header != this.header) {
			if(this.header != undefined)
				this.headerBox.removeChild(this.header);
			this.header = Ui.Element.create(header);
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
		if(content != this.content) {
			if(this.content != undefined)
				this.contentBox.removeChild(this.content);
			this.content = Ui.Element.create(content);
			if(this.content != undefined)
				this.contentBox.appendChild(this.content);
		}
	},

	/**#@+
	* @private
	*/

	unselect: function() {
		if(this.isSelected) {
			this.isSelected = false;
			this.fireEvent('unselect', this);
			this.contentBox.hide();
		}
	},

	getHeaderBox: function() {
		return this.headerBox;
	},

	getContentBox: function() {
		return this.contentBox;
	},

	getBackground: function() {
		return this.background;
	},

	onHeaderPress: function() {
		this.select();
	}

	/**#@-*/
});


Ui.CanvasElement.extend('Ui.NotebookBackground', {
	darkShadow: undefined,
	lightShadow: undefined,
	background: undefined,

	radius: 0,
	fill: 'black',
	tabOffset: 30,
	tabWidth: 10,
	tabHeight: 10,

	constructor: function(config) {
/*		this.darkShadow = new Ui.Shape({ fill: '#010002' });
		this.append(this.darkShadow);

		this.lightShadow = new Ui.Shape({ fill: '#5f625b' });
		this.append(this.lightShadow);

		var yuv = (new Ui.Color({ r: 0.50, g: 0.50, b: 0.50 })).getYuv();
		var gradient = new Ui.LinearGradient({ stops: [
			{ offset: 0, color: new Ui.Color({ y: 0.25, u: yuv.u, v: yuv.v }) },
			{ offset: 1, color: new Ui.Color({ y: 0.16, u: yuv.u, v: yuv.v }) }
		] });

		this.background = new Ui.Shape({ fill: gradient });
		this.append(this.background);

		this.connect(this, 'resize', this.onResize);*/
	},

	setTab: function(offset, width, height) {
		this.tabOffset = offset;
		this.tabWidth = width;
		this.tabHeight = height;
		this.invalidateArrange();
	},

	setRadius: function(radius) {
		if(this.radius != radius) {
			this.radius = radius;
			this.invalidateArrange();
		}
	},

	setFill: function(fill) {
		if(this.fill != fill) {
			this.fill = Ui.Color.create(fill);
			this.invalidateDraw();
/*			var yuv = this.fill.getYuva();
			var gradient = new Ui.LinearGradient({ stops: [
				{ offset: 0, color: new Ui.Color({ y: yuv.y + 0.1, u: yuv.u, v: yuv.v }) },
				{ offset: 1, color: new Ui.Color({ y: yuv.y - 0.1, u: yuv.u, v: yuv.v }) }
			] });
			this.background.setFill(gradient);
			this.darkShadow.setFill(new Ui.Color({ y: yuv.y - 0.4, u: yuv.u, v: yuv.v }));
			this.lightShadow.setFill(new Ui.Color({ y: yuv.y + 0.1, u: yuv.u, v: yuv.v }));*/
		}
	},

	/**#@+
	* @private
	*/

	genPath: function(width, height, radius, tabOffset, tabWidth, tabHeight) {
		var str = 'M'+tabOffset+','+tabHeight+' L'+tabOffset+','+radius+' Q'+tabOffset+',0 '+(tabOffset+radius)+',0 L'+(tabOffset + tabWidth - radius)+',0 Q'+(tabOffset + tabWidth)+',0 '+(tabOffset + tabWidth)+','+radius+' L'+(tabOffset + tabWidth)+','+tabHeight+' L'+(width - radius)+','+tabHeight+' Q'+width+','+tabHeight+' '+width+','+(tabHeight+radius)+' L'+width+','+(height-radius)+' Q'+width+','+height+' '+(width-radius)+','+height+' L'+radius+','+height+' Q0,'+height+' 0,'+(height-radius);
		if(tabOffset == 0)
			str += ' z';
		else
			str += ' L0,'+(tabHeight+radius)+' Q0,'+tabHeight+' '+radius+','+tabHeight+' z';
		return str;
	}/*,

	onResize: function(notebookBackground, width, height) {
		this.darkShadow.setWidth(width);
		this.darkShadow.setHeight(height);
		this.darkShadow.setPath(this.genPath(width, height, this.radius, this.tabOffset, this.tabWidth, this.tabHeight));

		this.lightShadow.setWidth(width - 2);
		this.lightShadow.setHeight(height - 2);
		this.setPosition(this.lightShadow, 1, 1);
		this.lightShadow.setPath(this.genPath(width-2, height-2, this.radius-1, this.tabOffset, this.tabWidth-2, this.tabHeight));
			
		this.background.setWidth(width - 4);
		this.background.setHeight(height - 4);
		this.setPosition(this.background, 2, 2);
		this.background.setPath(this.genPath(width-4, height-4, this.radius - 1.4, this.tabOffset, this.tabWidth-4, this.tabHeight));
	}*/
	/**#@-*/
}, {
	updateCanvas: function(ctx) {
		var width = this.getLayoutWidth();
		var height = this.getLayoutHeight();
		
		ctx.fillStyle = '#cccccc';
		ctx.svgPath(this.genPath(width, height, this.radius, this.tabOffset, this.tabWidth, this.tabHeight));
		ctx.fill();
		
		ctx.translate(1, 1);
		ctx.fillStyle = this.fill.getCssRgba();
		ctx.svgPath(this.genPath(width-2, height-2, this.radius, this.tabOffset, this.tabWidth-2, this.tabHeight));
		ctx.fill();
	}
});


