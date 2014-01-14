
Ui.Container.extend('Ui.Locator', 
/**@lends Ui.Locator#*/
{
	path: undefined,
	foregrounds: undefined,
	backgrounds: undefined,
	border: undefined,

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
	
		this.path = path;
		// remove all children
		while(this.getChildren().length > 0)
			this.removeChild(this.getChildren()[0]);

		this.border = new Ui.Rectangle({ fill: '#888888', radius: radius });
		this.appendChild(this.border);

		this.backgrounds = [];
		this.foregrounds = [];

		var button;

		if(path == '/') {
			var bg = new Ui.Rectangle({ radius: radius-1 });
			this.backgrounds.push(bg);
			this.appendChild(bg);

			var fg = new Ui.Pressable();
			fg.locatorPath = '/';
			fg.locatorPos = 0;
			this.connect(fg, 'press', this.onPathPress);
			this.connect(fg, 'down', this.onPathDown);
			this.connect(fg, 'up', this.onPathUp);

			var home = new Ui.Icon({ icon: 'home', width: 25, height: 25 });
			home.setVerticalAlign('center');
			home.setHorizontalAlign('center');
			home.setMargin(5);
			fg.appendChild(home);

			this.foregrounds.push(fg);
			this.appendChild(fg);
		}
		else {
			var paths = path.split('/');
			var cleanPaths = [];
			for(var i = 0; i < paths.length; i++) {
				if(paths[i] != '')
					cleanPaths.push(paths[i]);
			}
			paths = cleanPaths;
			
			// create all bgs
			var bg = new Ui.LocatorRightArrow({ arrowLength: spacing, radius: radius-1 });
			this.backgrounds.push(bg);
			this.appendChild(bg);

			for(var i = 0; i < paths.length; i++) {
				var bg;
				if(i == paths.length -1)
					bg = new Ui.LocatorLeftArrow({ arrowLength: spacing, radius: radius-1 });
				else
					bg = new Ui.LocatorLeftRightArrow({ arrowLength: spacing });
				this.backgrounds.push(bg);
				this.appendChild(bg);
			}

			// handle pressable parts
			var fg = new Ui.Pressable();
			fg.locatorPath = currentPath;
			fg.locatorPos = 0;
			this.connect(fg, 'press', this.onPathPress);
			this.connect(fg, 'down', this.onPathDown);
			this.connect(fg, 'up', this.onPathUp);

			var home = new Ui.Icon({ icon: 'home', width: 25, height: 25 });
			home.setVerticalAlign('center');
			home.setHorizontalAlign('center');
			home.setMargin(5);
			fg.locatorPos = 0;
			fg.locatorPath = '/';
			fg.appendChild(home);

			this.foregrounds.push(fg);
			this.appendChild(fg);
			var currentPath = '/';
			for(var i = 0; i < paths.length; i++) {
				currentPath += paths[i];	
				var fg = new Ui.Pressable();
				fg.locatorPos = i+1;
				this.connect(fg, 'press', this.onPathPress);
				this.connect(fg, 'down', this.onPathDown);
				this.connect(fg, 'up', this.onPathUp);
				fg.locatorPath = currentPath;
				fg.appendChild(new Ui.Label({ text: paths[i], margin: 5, verticalAlign: 'center' }));
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

	getColor: function() {
		return Ui.Color.create(this.getStyleProperty('color'));
	},
	
	getDarkColor: function() {
		var yuv = this.getColor().getYuv();
		var deltaY = 0;
		if(yuv.y < 0.4)
			return new Ui.Color({ y: yuv.y - 0.60 + deltaY, u: yuv.u, v: yuv.v, a: 0.8 });
		else
			return new Ui.Color({ y: yuv.y - 0.40 + deltaY, u: yuv.u, v: yuv.v, a: 0.4 });
	},
	
	getLightColor: function() {
		var yuv = this.getColor().getYuv();
		var deltaY = 0;
		if(yuv.y < 0.4)
			return new Ui.Color({ y: yuv.y - 0.15 + deltaY, u: yuv.u, v: yuv.v });
		else
			return new Ui.Color({ y: yuv.y + 0.15 + deltaY, u: yuv.u, v: yuv.v });
	},
	
	getDownColor: function() {
		var yuv = this.getColor().getYuv();
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
	
	updateColors: function() {
		var lightColor = this.getLightColor();		
		this.border.setFill(this.getDarkColor());
		for(var i = 0; i < this.backgrounds.length; i++) {
			this.backgrounds[i].setFill(lightColor);
		}
	}
}, 
/**@lends Ui.Locator#*/
{
	measureCore: function(width, height) {
		if(this.foregrounds.length == 0)
			return { width: 0, height: 0 };

		for(var i = 0; i < this.foregrounds.length; i++)
			this.foregrounds[i].measure(0, 0);
		for(var i = 0; i < this.backgrounds.length; i++)
			this.backgrounds[i].measure(0, 0);
		
		this.border.measure(0, 0);

		if(this.foregrounds.length == 1)
			return { width: this.foregrounds[0].getMeasureWidth()+2, height: this.foregrounds[0].getMeasureHeight()+2 };
		else {
			var minWidth = 0;
			var minHeight = 0;
			for(var i = 0; i < this.foregrounds.length; i++) {
				var child = this.foregrounds[i];
				if(child.getMeasureHeight() > minHeight)
					minHeight = child.getMeasureHeight();
				minWidth += child.getMeasureWidth();
			}
			var spacing = this.getStyleProperty('spacing');
			minWidth += (this.foregrounds.length-1) * (spacing + 1);
			return { width: minWidth+2, height: minHeight+2 };
		}
	},

	arrangeCore: function(width, height) {
		if(this.foregrounds.length == 1) {
			this.foregrounds[0].arrange(1, 1, width-2, height-2);
			this.backgrounds[0].arrange(1, 1, width-2, height-2);
			this.border.arrange(0, 0, width, height);
			return;
		}
		var spacing = this.getStyleProperty('spacing');
		x = 1;
		for(var i = 0; i < this.foregrounds.length; i++) {
			var bg = this.backgrounds[i];
			var fg = this.foregrounds[i];
			var fgWidth = fg.getMeasureWidth();
			fg.arrange(x+1, 0+1, fgWidth, height-2);
			if(i == 0)
				bg.arrange(x, 0+1, fgWidth + spacing, height-2);
			else if(i == this.foregrounds.length -1)
				bg.arrange(x - spacing, 0+1, fgWidth + spacing, height-2);
			else
				bg.arrange(x - spacing, 0+1, fgWidth + spacing*2, height-2);
			x += fgWidth + spacing + 1;
		}
		this.border.arrange(0, 0, width, height);
	},
	
	onStyleChange: function() {	
		var spacing = this.getStyleProperty('spacing');
		var radius = this.getStyleProperty('radius');
		for(var i = 0; i < this.backgrounds.length; i++) {
			var bg = this.backgrounds[i];
			if('setArrowLength' in bg)
				bg.setArrowLength(spacing);
			bg.setRadius(radius-1);
		}
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
		color: new Ui.Color({ r: 0.31, g: 0.66, b: 1 }),
		focusColor: '#f6caa2',
		radius: 3,
		spacing: 20
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

