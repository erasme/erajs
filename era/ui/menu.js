
Ui.ToolBar.extend('Ui.MenuBar', {});

Ui.Pressable.extend('Ui.Menu', 
{
	headerLabel: undefined,
	header: undefined,
	dialog: undefined,
	scope: undefined,

	constructor: function(config) {
		this.addEvents('item');

		this.headerLabel = new Ui.Label({ margin: 5, horizontalAlign: 'left' });
		this.append(this.headerLabel);

		this.dialog = new Ui.MenuDialog({ element: this.headerLabel });
		this.connect(this.dialog, 'item', function(dialog, item) {
			this.fireEvent('item', this, item);
		});

		this.connect(this, 'press', this.onTitlePress);
		this.connect(window, 'resize', this.onWindowResize);

		this.autoConfig(config, 'header', 'scope', 'items');
	},

	setHeader: function(header) {
		if(this.header != header) {
			this.header = header;
			this.headerLabel.setText(header);
			this.dialog.setHeader(header);
		}
	},

	appendItem: function(item, callback, scope) {
		if(typeof(item) == 'string')
			item = new Ui.Label({ horizontalAlign: 'left', text: item });
		var menu = this;
		var pressable = this.dialog.appendItem(item);
		if(callback != undefined) {
			if(scope == undefined) {
				if(this.scope == undefined)
					scope = this;
				else
					scope = this.scope;
			}
			scope.connect(pressable, 'press', function(pressable) {
				callback.call(this, menu, pressable.getChildren()[0]);
			});
		}
	},

	setScope: function(scope) {
		this.scope = scope;
	},

	setItems: function(items) {
		this.dialog.clearItems();
		for(var i = 0; i < items.length; i++) {
			this.appendItem(items[i].item, items[i].callback, items[i].scope);
		}
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
	shadow: undefined,

	constructor: function(config) {
		this.addEvents('item');

		this.element = config.element;

		this.shadow = new Ui.Rectangle({ opacity: 0, fill: new Ui.Color({ a: 0 }) });
		this.appendChild(this.shadow);

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

	clearItems: function() {
		while(this.content.getFirstChild() != undefined) {
			this.content.remove(this.content.getFirstChild());
		}
	},

	appendItem: function(item) {
		var menuItem = new Ui.MenuItem();
		menuItem.setContent(item);
		this.connect(menuItem, 'press', this.onItemPress);
		this.content.append(menuItem);
		return menuItem;
	},
	
	appendSeparator: function() {
		this.content.append(new Ui.Separator());
	},

	onItemPress: function(menuitem) {
		var item = menuitem.getContent();
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
		var oldVisible = this.getIsVisible();
		Ui.MenuDialog.base.show.call(this);

		if(!oldVisible) {
			this.header.setFontWeight(this.element.getFontWeight());
			this.header.setFontSize(this.element.getFontSize());
			Ui.App.current.appendDialog(this);
		}
	},

	onHidden: function() {
		Ui.App.current.removeDialog(this);
	},

	measureCore: function(width, height) {
		this.shadow.measure(width, height);

		var point1 = this.element.pointToWindow({ x: 0, y: 0 });
		var point2 = this.element.pointToWindow({ x: this.element.getLayoutWidth(), y: this.element.getLayoutHeight() });
		
		var headerSize = this.header.measure(point2.x, point2.y);
		var scrollSize = this.scroll.measure(width, height - point2.y);

		return { width: Math.max(headerSize.width, scrollSize.width), height: (headerSize.height + scrollSize.height) };
	},

	arrangeCore: function(width, height) {
		this.shadow.arrange(0, 0, width, height);

		var point1 = this.element.pointToWindow({ x: 0, y: 0 });
		var point2 = this.element.pointToWindow({ x: this.element.getLayoutWidth(), y: this.element.getLayoutHeight() });

		this.header.arrange(point1.x - 5, point1.y - 5, this.header.getMeasureWidth(), this.header.getMeasureHeight());

		var offset = 0;
		if(this.scroll.getMeasureWidth() > width - point1.x - 5)
			offset = point1.x - (width - this.scroll.getMeasureWidth()) - 5;
		this.scroll.arrange(point1.x - offset - 5, point2.y, Math.max(this.header.getMeasureWidth(), this.scroll.getMeasureWidth()), this.scroll.getMeasureHeight());

		this.background.setTab(offset, this.header.getMeasureWidth(), this.header.getMeasureHeight() - 5);

		this.background.arrange(point1.x - offset - 5, point1.y - 5, Math.max(this.header.getMeasureWidth(), this.scroll.getMeasureWidth()), this.header.getMeasureHeight() + this.scroll.getMeasureHeight() - 5);
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
			if(this.getLayoutHeight() > 0) {
				var gradient = new Ui.LinearGradient({ stops: [
					{ offset: 0, color: new Ui.Color({ y: yuv.y - 0.1, u: yuv.u, v: yuv.v }) },
					{ offset: this.tabHeight/(this.getLayoutHeight()*2), color: new Ui.Color({ y: yuv.y, u: yuv.u, v: yuv.v }) },
					{ offset: 1, color: new Ui.Color({ y: yuv.y, u: yuv.u, v: yuv.v }) }
				] });
				this.background.setFill(gradient);
			}
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

Ui.MouseOverable.extend('Ui.MenuItem', {
	background: undefined,
	pressable: undefined,

	constructor: function() {
		this.addEvents('press');

		this.background = new Ui.Rectangle({ fill: new Ui.Color.create('#1c8ef2'), opacity: 0, radius: 4 });
		this.append(this.background);

		this.pressable = new Ui.Pressable({ padding: 5, paddingLeft: 10, paddingRight: 10 });
		this.append(this.pressable);
		this.connect(this.pressable, 'press', function() {
			this.fireEvent('press', this);
		});

		this.connect(this, 'enter', this.onEnter);
		this.connect(this, 'leave', this.onLeave);
		this.connect(this.pressable, 'down', this.onDown);
		this.connect(this.pressable, 'up', this.onUp);
	},

	setContent: function(content) {
		this.pressable.append(content);
	},

	getContent: function() {
		return this.pressable.getChildren()[0];
	},

	onEnter: function() {
		this.background.setOpacity(0.6);
	},

	onLeave: function() {
		this.background.setOpacity(0);
	},

	onDown: function() {
		this.background.setOpacity(1);
	},

	onUp: function() {
		this.background.setOpacity(0);
	}
});

