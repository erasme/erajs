
Ui.Container.extend('Ui.Locator', 
/**@lends Ui.Locator#*/
{
	path: undefined,
	foregrounds: undefined,
	backgrounds: undefined,
	border: undefined,
	focusedPart: undefined,

	/**
	 * @constructs
	 * @class
	 * @extends Ui.Container
	 */
	constructor: function(config) {
		this.addEvents('change');
		this.connect(this, 'focus', this.updateColors);
		this.connect(this, 'blur', this.updateColors);
	},

	setPath: function(path) {
		var spacing = this.getStyleProperty('spacing');
		var radius = this.getStyleProperty('radius');
		var padding = this.getStyleProperty('padding');

		this.path = path;
		// remove all children
		while(this.getChildren().length > 0)
			this.removeChild(this.getChildren()[0]);

		this.border = new Ui.Rectangle({ fill: '#888888', radius: radius });
		this.appendChild(this.border);

		this.backgrounds = [];
		this.foregrounds = [];

		var button; var bg; var fg; var home; var i;

		if(path == '/') {
			bg = new Ui.Rectangle({ radius: radius-1 });
			this.backgrounds.push(bg);
			this.appendChild(bg);

			fg = new Ui.Pressable({ padding: padding });
			fg.locatorPath = '/';
			fg.locatorPos = 0;
			this.connect(fg, 'press', this.onPathPress);
			this.connect(fg, 'down', this.onPathDown);
			this.connect(fg, 'up', this.onPathUp);
			this.connect(fg, 'focus', this.onPathFocus);
			this.connect(fg, 'blur', this.onPathBlur);

			home = new Ui.Icon({ icon: 'home', width: 24, height: 24 });
			home.setVerticalAlign('center');
			home.setHorizontalAlign('center');
			fg.appendChild(home);

			this.foregrounds.push(fg);
			this.appendChild(fg);
		}
		else {
			var paths = path.split('/');
			var cleanPaths = [];
			for(i = 0; i < paths.length; i++) {
				if(paths[i] !== '')
					cleanPaths.push(paths[i]);
			}
			paths = cleanPaths;
			
			// create all bgs
			bg = new Ui.LocatorRightArrow({ arrowLength: spacing, radius: radius-1 });
			this.backgrounds.push(bg);
			this.appendChild(bg);

			for(i = 0; i < paths.length; i++) {
				if(i == paths.length -1)
					bg = new Ui.LocatorLeftArrow({ arrowLength: spacing, radius: radius-1 });
				else
					bg = new Ui.LocatorLeftRightArrow({ arrowLength: spacing });
				this.backgrounds.push(bg);
				this.appendChild(bg);
			}

			// handle pressable parts
			fg = new Ui.Pressable({ padding: padding });
			fg.locatorPath = currentPath;
			fg.locatorPos = 0;
			this.connect(fg, 'press', this.onPathPress);
			this.connect(fg, 'down', this.onPathDown);
			this.connect(fg, 'up', this.onPathUp);
			this.connect(fg, 'focus', this.onPathFocus);
			this.connect(fg, 'blur', this.onPathBlur);

			home = new Ui.Icon({ icon: 'home', width: 24, height: 24 });
			home.setVerticalAlign('center');
			home.setHorizontalAlign('center');
			fg.locatorPos = 0;
			fg.locatorPath = '/';
			fg.appendChild(home);

			this.foregrounds.push(fg);
			this.appendChild(fg);
			var currentPath = '/';
			for(i = 0; i < paths.length; i++) {
				currentPath += paths[i];	
				fg = new Ui.Pressable({ padding: padding });
				fg.locatorPos = i+1;
				this.connect(fg, 'press', this.onPathPress);
				this.connect(fg, 'down', this.onPathDown);
				this.connect(fg, 'up', this.onPathUp);
				this.connect(fg, 'focus', this.onPathFocus);
				this.connect(fg, 'blur', this.onPathBlur);
				fg.locatorPath = currentPath;
				fg.appendChild(new Ui.Label({ text: paths[i], verticalAlign: 'center' }));
				this.foregrounds.push(fg);
				this.appendChild(fg);
				currentPath += '/';
			}
		}
		this.updateColors();
	},

	getPath: function() {
		return this.path;
	},

	getBackground: function() {
		return Ui.Color.create(this.getStyleProperty('background'));
	},

	getLightColor: function() {
		var yuv = this.getBackground().getYuv();
		var deltaY = 0;
		if(yuv.y < 0.4)
			return new Ui.Color({ y: yuv.y - 0.15 + deltaY, u: yuv.u, v: yuv.v });
		else
			return new Ui.Color({ y: yuv.y + 0.15 + deltaY, u: yuv.u, v: yuv.v });
	},

	getBackgroundBorder: function() {
		var color;
		if((this.focusedPart !== undefined) && !this.focusedPart.getIsMouseFocus())
			color = Ui.Color.create(this.getStyleProperty('focusBackgroundBorder'));
		else
			color = Ui.Color.create(this.getStyleProperty('backgroundBorder'));
		var yuv = color.getYuva();
		var deltaY = 0;
//		if(this.getIsDown())
//			deltaY = -0.20;
//		else if(this.getIsOver())
//			deltaY = 0.20;
		return new Ui.Color({ y: yuv.y + deltaY, u: yuv.u, v: yuv.v, a: yuv.a });
	},
	
	getDownColor: function() {
		var yuv = this.getBackground().getYuv();
		var deltaY = -0.20;
		if(yuv.y < 0.4)
			return new Ui.Color({ y: yuv.y - 0.15 + deltaY, u: yuv.u, v: yuv.v });
		else
			return new Ui.Color({ y: yuv.y + 0.15 + deltaY, u: yuv.u, v: yuv.v });
	},

	onPathPress: function(pathItem) {
		this.fireEvent('change', this, pathItem.locatorPath, pathItem.locatorPos);
	},

	onPathDown: function(pathItem) {
		this.backgrounds[pathItem.locatorPos].setFill(this.getDownColor());
	},

	onPathUp: function(pathItem) {
		this.backgrounds[pathItem.locatorPos].setFill(this.getLightColor());
	},

	onPathFocus: function(pressable) {
		this.focusedPart = pressable;
		this.updateColors();
	},

	onPathBlur: function(pressable) {
		this.focusedPart = undefined;
		this.updateColors();
	},
	
	updateColors: function() {
		var backgroundColor = this.getBackground();
		var focusBackgroundColor = Ui.Color.create(this.getStyleProperty('focusBackground'));
		this.border.setFill(this.getBackgroundBorder());

		var focusPos = -1;
		if(this.focusedPart !== undefined) {
			for(var i = 0; (focusPos === -1) && (i < this.foregrounds.length); i++)
				if(this.foregrounds[i] === this.focusedPart)
					focusPos = i;
		}

		for(var i = 0; i < this.backgrounds.length; i++) {
			if(i === focusPos)
				this.backgrounds[i].setFill(focusBackgroundColor);
			else
				this.backgrounds[i].setFill(backgroundColor);
		}
	}
}, 
/**@lends Ui.Locator#*/
{
	measureCore: function(width, height) {
		if(this.foregrounds.length === 0)
			return { width: 0, height: 0 };
		var i;
		for(i = 0; i < this.foregrounds.length; i++)
			this.foregrounds[i].measure(0, 0);
		for(i = 0; i < this.backgrounds.length; i++)
			this.backgrounds[i].measure(0, 0);
		
		this.border.measure(0, 0);

		if(this.foregrounds.length == 1)
			return { width: this.foregrounds[0].getMeasureWidth()+2, height: this.foregrounds[0].getMeasureHeight()+2 };
		else {
			var minWidth = 0;
			var minHeight = 0;
			for(i = 0; i < this.foregrounds.length; i++) {
				var child = this.foregrounds[i];
				if(child.getMeasureHeight() > minHeight)
					minHeight = child.getMeasureHeight();
				minWidth += child.getMeasureWidth();
			}
			var spacing = this.getStyleProperty('spacing');
			var borderWidth = this.getStyleProperty('borderWidth');
			minWidth += (this.foregrounds.length-1) * (spacing + borderWidth);
			return { width: minWidth+(2*borderWidth), height: minHeight+(2*borderWidth) };
		}
	},

	arrangeCore: function(width, height) {
		var borderWidth = this.getStyleProperty('borderWidth');
		if(this.foregrounds.length == 1) {
			this.foregrounds[0].arrange(borderWidth, borderWidth, width-2*borderWidth, height-2*borderWidth);
			this.backgrounds[0].arrange(borderWidth, borderWidth, width-2*borderWidth, height-2*borderWidth);
			this.border.arrange(0, 0, width, height);
			return;
		}
		var spacing = this.getStyleProperty('spacing');

		x = borderWidth;
		for(var i = 0; i < this.foregrounds.length; i++) {
			var bg = this.backgrounds[i];
			var fg = this.foregrounds[i];
			var fgWidth = fg.getMeasureWidth();
			fg.arrange(x+1, 0+borderWidth, fgWidth, height-2*borderWidth);
			if(i === 0)
				bg.arrange(x, 0+borderWidth, fgWidth + spacing, height-2*borderWidth);
			else if(i == this.foregrounds.length -1)
				bg.arrange(x - spacing, 0+borderWidth, fgWidth + spacing, height-2*borderWidth);
			else
				bg.arrange(x - spacing, 0+borderWidth, fgWidth + spacing*2, height-2*borderWidth);
			x += fgWidth + spacing + borderWidth;
		}
		this.border.arrange(0, 0, width, height);
	},
	
	onStyleChange: function() {	
		var spacing = this.getStyleProperty('spacing');
		var padding = this.getStyleProperty('padding');
		var radius = this.getStyleProperty('radius');

		var borderWidth = this.getStyleProperty('borderWidth');
		for(var i = 0; i < this.backgrounds.length; i++) {
			var bg = this.backgrounds[i];
			if('setArrowLength' in bg)
				bg.setArrowLength(spacing);
			bg.setRadius(radius-borderWidth);
		}
		for(var i = 0; i < this.foregrounds.length; i++)
			this.foregrounds[i].setPadding(padding);
		this.border.setRadius(radius);
		this.updateColors();
	},

	onDisable: function() {
		Ui.Locator.base.onDisable.apply(this, arguments);
		for(var i = 0; i < this.foregrounds.length; i++)
			this.foregrounds[i].setOpacity(0.4);
	},

	onEnable: function() {
		Ui.Locator.base.onEnable.apply(this, arguments);
		for(var i = 0; i < this.foregrounds.length; i++)
			this.foregrounds[i].setOpacity(1);
	}
}, {
	style: {
		background: 'rgba(250,250,250,1)',
		backgroundBorder: 'rgba(140,140,140,1)',
		focusBackground: '#07a0e5',//'rgb(33,211,255)',
		focusBackgroundBorder: new Ui.Color({ r: 0.04, g: 0.43, b: 0.5 }),
		focusActiveBackgroundBorder: new Ui.Color({ r: 0.04, g: 0.43, b: 0.5 }),
		radius: 3,
		spacing: 10,
		padding: 8,
		borderWidth: 1
	}
});

Ui.CanvasElement.extend('Ui.LocatorRightArrow', 
/**@lends Ui.LocatorRightArrow#*/
{
	radius: 8,
	length: 10,
	fill: undefined,
	
	/**
	 * @constructs
	 * @class
	 * @extends Ui.Shape
	 */
	constructor: function(config) {
		this.fill = new Ui.Color();
	},

	setRadius: function(radius) {
		this.radius = radius;
		this.invalidateArrange();
	},
	
	setArrowLength: function(length) {
		this.length = length;
		this.invalidateArrange();
	},
	
	setFill: function(color) {
		this.fill = Ui.Color.create(color);
		this.invalidateDraw();
	}
}, 
/**@lends Ui.LocatorRightArrow#*/
{
	updateCanvas: function(ctx) {
		var width = this.getLayoutWidth();
		var height = this.getLayoutHeight();
		var v1 = width - this.length;
		var v2 = height/2;
		var v3 = height-this.radius;
		ctx.svgPath('M'+this.radius+',0 L'+v1+',0 L'+width+','+v2+' L'+v1+','+height+' L'+this.radius+','+height+' Q0,'+height+' 0,'+v3+' L0,'+this.radius+' Q0,0 '+this.radius+',0 z');
		ctx.fillStyle = this.fill.getCssRgba();
		ctx.fill();
	}
});

Ui.Shape.extend('Ui.LocatorLeftArrow', 
/**@lends Ui.LocatorLeftArrow#*/
{
	radius: 8,
	length: 10,

	/**
	 * @constructs
	 * @class
	 * @extends Ui.Shape
	 */
	constructor: function(config) {
	},

	setRadius: function(radius) {
		this.radius = radius;
	},
	
	setArrowLength: function(length) {
		this.length = length;
		this.invalidateDraw();
	}
}, 
/**@lends Ui.LocatorLeftArrow#*/
{
	arrangeCore: function(width, height) {
		Ui.LocatorLeftArrow.base.arrangeCore.call(this, width, height);
		var v2 = width - this.radius;
		var v3 = height - this.radius;
		var v4 = height/2;
		this.setPath('M0,0 L'+v2+',0 Q'+width+',0 '+width+','+this.radius+' L'+width+','+v3+' Q'+width+','+height+' '+v2+','+height+' L0,'+height+' L'+this.length+','+v4+' z');
	}
});

Ui.Shape.extend('Ui.LocatorLeftRightArrow', 
/**@lends Ui.LocatorLeftRightArrow#*/
{
	length: 10,

	/**
	 * @constructs
	 * @class
	 * @extends Ui.Shape
	 */
	constructor: function(config) {
	},

	setRadius: function(radius) {
	},
	
	setArrowLength: function(length) {
		this.length = length;
		this.invalidateDraw();
	}
}, 
/**@lends Ui.LocatorLeftRightArrow#*/
{
	arrangeCore: function(width, height) {
		Ui.LocatorLeftRightArrow.base.arrangeCore.call(this, width, height);
		var v1 = width - this.length;
		var v2 = height/2;
		this.setPath('M0,0 L'+v1+',0 L'+width+','+v2+' L'+v1+','+height+' L0,'+height+' L'+this.length+','+v2+' z');
	}
});

