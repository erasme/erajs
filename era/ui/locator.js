Ui.Container.extend('Ui.Locator', 
/**@lends Ui.Locator#*/
{
	path: undefined,
	foregrounds: undefined,
	backgrounds: undefined,
	spacing: 2,
	border: undefined,

	/**
	 * @constructs
	 * @class
	 * @extends Ui.Container
	 */
	constructor: function(config) {
		this.addEvents('change');
	},

	setPath: function(path) {
		this.path = path;
		// remove all children
		while(this.getChildren().length > 0)
			this.removeChild(this.getChildren()[0]);

		this.border = new Ui.Frame({ frameWidth: 1, fill: '#888888', radius: 8 });
		this.appendChild(this.border);

		this.backgrounds = [];
		this.foregrounds = [];

		var button;

		var gradient = this.getGradient();

		if(path == '/') {
			var bg = new Ui.Pressable();
			bg.locatorPath = '/';
			bg.locatorPos = 0;
			this.connect(bg, 'press', this.onPathPress);
			this.connect(bg, 'down', this.onPathDown);
			this.connect(bg, 'up', this.onPathUp);
			bg.appendChild(new Ui.Rectangle({ fill: gradient, radius: 7 }));
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
			
			var currentPath = '/';

			var bg = new Ui.Pressable();
			bg.locatorPath = currentPath;
			bg.locatorPos = 0;
			this.connect(bg, 'press', this.onPathPress);
			this.connect(bg, 'down', this.onPathDown);
			this.connect(bg, 'up', this.onPathUp);
			bg.appendChild(new Ui.LocatorRightArrow({ fill: gradient, radius: 7 }));
			this.backgrounds.push(bg);
			this.appendChild(bg);

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
			fg.appendChild(home);

			this.foregrounds.push(fg);
			this.appendChild(fg);

			for(var i = 0; i < paths.length; i++) {
				currentPath += paths[i];

				var bg = new Ui.Pressable();
				bg.locatorPath = currentPath;
				bg.locatorPos = i+1;
				this.connect(bg, 'press', this.onPathPress);
				this.connect(bg, 'down', this.onPathDown);
				this.connect(bg, 'up', this.onPathUp);
				if(i == paths.length -1)
					bg.appendChild(new Ui.LocatorLeftArrow({ fill: gradient, radius: 7 }));
				else
					bg.appendChild(new Ui.LocatorLeftRightArrow({ fill: gradient, radius: 7 }));
				this.backgrounds.push(bg);
				this.appendChild(bg);
	
				var fg = new Ui.Pressable();
				fg.locatorPos = i+1;
				this.connect(fg, 'press', this.onPathPress);
				this.connect(fg, 'down', this.onPathDown);
				this.connect(fg, 'up', this.onPathUp);
				fg.locatorPath = currentPath;
				fg.appendChild(new Ui.Label({ text: paths[i], margin: 7 }));
				this.foregrounds.push(fg);
				this.appendChild(fg);

				currentPath += '/';
			}
		}
	},

	getPath: function() {
		return this.path;
	},

	getGradient: function() {
		return new Ui.LinearGradient({ stops: [
			{ offset: 0, color: '#fbfbfb' },
			{ offset: 1, color: '#c8c8c8' }
		] });
	},

	getDownGradient: function() {
		return new Ui.LinearGradient({ stops: [
			{ offset: 0, color: '#bbbbbb' },
			{ offset: 1, color: '#989898' }
		] });
	},

	onPathPress: function(pathItem) {
		this.fireEvent('change', this, pathItem.locatorPath);
	},

	onPathDown: function(pathItem) {
		this.backgrounds[pathItem.locatorPos].getChildren()[0].setFill(this.getDownGradient());
	},

	onPathUp: function(pathItem) {
		this.backgrounds[pathItem.locatorPos].getChildren()[0].setFill(this.getGradient());
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
			minWidth += (this.foregrounds.length-1) * (minHeight/2 + this.spacing);
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

		x = 0;
		for(var i = 0; i < this.foregrounds.length; i++) {
			var bg = this.backgrounds[i];
			var fg = this.foregrounds[i];
			var fgWidth = fg.getMeasureWidth();
			fg.arrange(x+1, 0+1, fgWidth, height-2);
			if(i == 0)
				bg.arrange(x+1, 0+1, fgWidth + (height-2)/2, height-2);
			else if(i == this.foregrounds.length -1)
				bg.arrange(x - height/2+1, 0+1, fgWidth + (height-2)/2, height-2);
			else
				bg.arrange(x - height/2+1, 0+1, fgWidth + (height-2), height-2);
			x += fgWidth + (height-2)/2 + this.spacing;
		}
		this.border.arrange(0, 0, width, height);
	}
});

Ui.Shape.extend('Ui.LocatorRightArrow', 
/**@lends Ui.LocatorRightArrow#*/
{
	radius: 8,

	/**
	 * @constructs
	 * @class
	 * @extends Ui.Shape
	 */
	constructor: function(config) {
	},

	setRadius: function(radius) {
		this.radius = radius;
	}
}, 
/**@lends Ui.LocatorRightArrow#*/
{
	arrangeCore: function(width, height) {
		Ui.LocatorRightArrow.base.arrangeCore.call(this, width, height);
		var v1 = width - height/2;
		var v2 = height/2;
		var v3 = height-this.radius;
		this.setPath('M'+this.radius+',0 L'+v1+',0 L'+width+','+v2+' L'+v1+','+height+' L'+this.radius+','+height+' Q0,'+height+' 0,'+v3+' L0,'+this.radius+' Q0,0 '+this.radius+',0 z');
	}
});

Ui.Shape.extend('Ui.LocatorLeftArrow', 
/**@lends Ui.LocatorLeftArrow#*/
{
	radius: 8,

	/**
	 * @constructs
	 * @class
	 * @extends Ui.Shape
	 */
	constructor: function(config) {
	},

	setRadius: function(radius) {
		this.radius = radius;
	}
}, 
/**@lends Ui.LocatorLeftArrow#*/
{
	arrangeCore: function(width, height) {
		Ui.LocatorLeftArrow.base.arrangeCore.call(this, width, height);
		var v2 = width - this.radius;
		var v3 = height - this.radius;
		var v4 = height/2;
		this.setPath('M0,0 L'+v2+',0 Q'+width+',0 '+width+','+this.radius+' L'+width+','+v3+' Q'+width+','+height+' '+v2+','+height+' L0,'+height+' L'+v4+','+v4+' z');
	}
});

Ui.Shape.extend('Ui.LocatorLeftRightArrow', 
/**@lends Ui.LocatorLeftRightArrow#*/
{
	/**
	 * @constructs
	 * @class
	 * @extends Ui.Shape
	 */
	constructor: function(config) {
	},

	setRadius: function(radius) {
	}
}, 
/**@lends Ui.LocatorLeftRightArrow#*/
{
	arrangeCore: function(width, height) {
		Ui.LocatorLeftRightArrow.base.arrangeCore.call(this, width, height);
		var v1 = width - height/2;
		var v2 = height/2;
		this.setPath('M0,0 L'+v1+',0 L'+width+','+v2+' L'+v1+','+height+' L0,'+height+' L'+v2+','+v2+' z');
	}
});

