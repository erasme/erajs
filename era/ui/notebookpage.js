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

Ui.Fixed.extend('Ui.NotebookBackground', {
	darkShadow: undefined,
	lightShadow: undefined,
	background: undefined,

	radius: 8,
	fill: 'black',
	tabOffset: 30,
	tabWidth: 10,
	tabHeight: 10,

	constructor: function(config) {

		this.darkShadow = new Ui.Shape({ fill: '#010002' });
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

		this.connect(this, 'resize', this.onResize);
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
			var yuv = this.fill.getYuva();
			var gradient = new Ui.LinearGradient({ stops: [
				{ offset: 0, color: new Ui.Color({ y: yuv.y + 0.1, u: yuv.u, v: yuv.v }) },
				{ offset: 1, color: new Ui.Color({ y: yuv.y - 0.1, u: yuv.u, v: yuv.v }) }
			] });
			this.background.setFill(gradient);
			this.darkShadow.setFill(new Ui.Color({ y: yuv.y - 0.4, u: yuv.u, v: yuv.v }));
			this.lightShadow.setFill(new Ui.Color({ y: yuv.y + 0.1, u: yuv.u, v: yuv.v }));
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
	},

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
	}

	/**#@-*/
});