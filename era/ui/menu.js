
Ui.ToolBar.extend('Ui.MenuBar', {});

Ui.Pressable.extend('Ui.Menu', 
{
	headerLabel: undefined,
	header: undefined,
	dialog: undefined,

	constructor: function(config) {
		this.addEvents('item');

		this.headerLabel = new Ui.Label({ margin: 5, horizontalAlign: 'left' });
		this.append(this.headerLabel);

		this.dialog = new Ui.MenuDialog({ element: this });
		this.connect(this.dialog, 'item', function(dialog, item) {
			this.fireEvent('item', this, item);
		});

		this.connect(this, 'press', this.onTitlePress);
		this.connect(window, 'resize', this.onWindowResize);

		this.autoConfig(config, 'header');
	},

	setHeader: function(header) {
		if(this.header != header) {
			this.header = header;
			this.headerLabel.setText(header);
			this.dialog.setHeader(header);
		}
	},

	appendItem: function(item) {
		this.dialog.appendItem(item);
	},

	appendSeparator: function() {
		this.dialog.appendSeparator();
	},

	getIsOpen: function() {
		return this.dialog.getIsVisible();
	},

	open: function() {
		this.dialog.show();
	},

	close: function() {
		this.dialog.hide();
	},

	onTitlePress: function() {
		this.open();
	},

	onWindowResize: function() {
		this.close();
	}
});

Ui.Container.extend('Ui.MenuDialog', {
	element: undefined,
	background: undefined,
	header: undefined,
	scroll: undefined,
	content: undefined,

	constructor: function(config) {
		this.addEvents('item');

		this.element = config.element;

		this.background = new Ui.MenuBackground({ fill: new Ui.Color({ r: 0.96, g: 0.96, b: 0.96 }), radius: 4 });
		this.appendChild(this.background);

		this.header = new Ui.Label({ margin: 5, horizontalAlign: 'left' });
		this.appendChild(this.header);

		this.scroll = new Ui.ScrollingArea({ margin: 5, scrollHorizontal: true });
		this.content = new Ui.VBox();
		this.scroll.setContent(this.content);
		this.appendChild(this.scroll);

		this.connect(this.getDrawing(), 'mousedown', this.onMouseDown);
		this.connect(this.getDrawing(), 'fingerdown', this.onFingerDown);
	},

	setHeader: function(header) {
		this.header.setText(header);
	},

	appendItem: function(item) {
		var pressable = new Ui.Pressable({ margin: 5, marginLeft: 10, marginRight: 10 });
		pressable.append(item);
		this.connect(pressable, 'press', this.onItemPress);
		this.content.append(pressable);
	},
	
	appendSeparator: function() {
		this.content.append(new Ui.Separator());
	},

	onItemPress: function(pressable) {
		var item = pressable.getChildren()[0];
		this.fireEvent('item', this, item);
		this.hide();
	},

	onMouseDown: function(event) {
		var contentDrawing = this.scroll.getDrawing();
		var current = event.target;
		while((current != undefined) && (current != contentDrawing))
			current = current.offsetParent;
		if(current == undefined) {
			this.hide();
			event.preventDefault();
			event.stopPropagation();
		}
	},

	onFingerDown: function(event) {
		var contentDrawing = this.scroll.getDrawing();
		var current = event.target;
		while((current != undefined) && (current != contentDrawing))
			current = current.offsetParent;
		if(current == undefined) {
			this.hide();
			event.preventDefault();
			event.stopPropagation();
		}
	}
}, {
	visible: false,

	show: function() {
		if(!this.getIsVisible()) {
			this.header.setFontWeight(this.element.headerLabel.getFontWeight());
			this.header.setFontSize(this.element.headerLabel.getFontSize());
			Ui.App.current.appendDialog(this);
		}
		Ui.MenuDialog.base.show.call(this);
	},

	hide: function() {
		if(this.getIsVisible())
			Ui.App.current.removeDialog(this);
		Ui.MenuDialog.base.hide.call(this);
	},

	measureCore: function(width, height) {
		var point1 = this.element.pointToWindow({ x: 0, y: 0 });
		var point2 = this.element.pointToWindow({ x: this.element.getLayoutWidth(), y: this.element.getLayoutHeight() });
		
		var headerSize = this.header.measure(point2.x, point2.y);
		var scrollSize = this.scroll.measure(width, height - point2.y);

		return { width: Math.max(headerSize.width, scrollSize.width), height: (headerSize.height + scrollSize.height) };
	},

	arrangeCore: function(width, height) {
		var point1 = this.element.pointToWindow({ x: 0, y: 0 });
		var point2 = this.element.pointToWindow({ x: this.element.getLayoutWidth(), y: this.element.getLayoutHeight() });

		this.header.arrange(point1.x, point1.y, this.header.getMeasureWidth(), this.header.getMeasureHeight());

		var offset = 0;
		if(this.scroll.getMeasureWidth() > width - point1.x)
			offset = point1.x - (width - this.scroll.getMeasureWidth());
		this.scroll.arrange(point1.x - offset, point2.y, this.scroll.getMeasureWidth(), this.scroll.getMeasureHeight());

		this.background.setTab(offset, this.header.getMeasureWidth(), this.header.getMeasureHeight());

		this.background.arrange(point1.x - offset, point1.y, Math.max(this.header.getMeasureWidth(), this.scroll.getMeasureWidth()), this.header.getMeasureHeight() + this.scroll.getMeasureHeight());
	}
});


Ui.Container.extend('Ui.MenuBackground', {
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
		this.appendChild(this.darkShadow);

		this.lightShadow = new Ui.Shape({ fill: '#5f625b' });
		this.appendChild(this.lightShadow);

		var yuv = (new Ui.Color({ r: 0.50, g: 0.50, b: 0.50 })).getYuv();
		var gradient = new Ui.LinearGradient({ stops: [
			{ offset: 0, color: new Ui.Color({ y: 0.25, u: yuv.u, v: yuv.v }) },
			{ offset: 1, color: new Ui.Color({ y: 0.16, u: yuv.u, v: yuv.v }) }
		] });

		this.background = new Ui.Shape({ fill: gradient });
		this.appendChild(this.background);

		this.autoConfig(config, 'radius', 'fill');
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
				{ offset: 0, color: new Ui.Color({ y: yuv.y - 0.1, u: yuv.u, v: yuv.v }) },
				{ offset: this.tabHeight/(this.getLayoutHeight()*2), color: new Ui.Color({ y: yuv.y, u: yuv.u, v: yuv.v }) },
				{ offset: 1, color: new Ui.Color({ y: yuv.y, u: yuv.u, v: yuv.v }) }
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
		if(tabWidth == width)
			return 'M'+radius+',0 L'+(width-radius)+',0 Q'+width+',0 '+width+','+radius+' L'+width+','+(height-radius)+' Q'+width+','+height+' '+(width-radius)+','+height+' L'+radius+','+height+' Q'+0+','+height+' 0,'+(height-radius)+' L0,'+radius+' Q0,0 '+radius+',0 z';

		var str = 'M'+tabOffset+','+tabHeight+' L'+tabOffset+','+radius+' Q'+tabOffset+',0 '+(tabOffset+radius)+',0 L'+(tabOffset + tabWidth - radius)+',0 Q'+(tabOffset + tabWidth)+',0 '+(tabOffset + tabWidth)+','+radius+' L'+(tabOffset + tabWidth)+','+tabHeight+' L'+(width - radius)+','+tabHeight+' Q'+width+','+tabHeight+' '+width+','+(tabHeight+radius)+' L'+width+','+(height-radius)+' Q'+width+','+height+' '+(width-radius)+','+height+' L'+radius+','+height+' Q0,'+height+' 0,'+(height-radius);
		if(tabOffset == 0)
			str += ' z';
		else
			str += ' L0,'+(tabHeight+radius)+' Q0,'+tabHeight+' '+radius+','+tabHeight+' z';
		return str;
	}
	/**#@-*/
}, {
	arrangeCore: function(width, height) {
		this.darkShadow.setPath(this.genPath(width, height, this.radius, this.tabOffset, this.tabWidth, this.tabHeight));
		this.darkShadow.arrange(0, 0, width, height);

		this.lightShadow.setPath(this.genPath(width-2, height-2, this.radius-1, this.tabOffset, this.tabWidth-2, this.tabHeight));
		this.lightShadow.arrange(1, 1, width - 2, height - 2);	
		
		this.background.setPath(this.genPath(width-4, height-4, this.radius - 1.4, this.tabOffset, this.tabWidth-4, this.tabHeight));
		this.background.arrange(2, 2, width - 4, height - 4);

		var yuv = this.fill.getYuva();
		var gradient = new Ui.LinearGradient({ stops: [
			{ offset: 0, color: new Ui.Color({ y: yuv.y - 0.1, u: yuv.u, v: yuv.v }) },
			{ offset: this.tabHeight/(height*2), color: new Ui.Color({ y: yuv.y, u: yuv.u, v: yuv.v }) },
			{ offset: 1, color: new Ui.Color({ y: yuv.y, u: yuv.u, v: yuv.v }) }
		] });
		this.background.setFill(gradient);
	}
});


