//
// Define the Locator class.
//
Ui.Container.extend('Ui.Locator', {
	path: undefined,
	backgrounds: undefined,
	foregrounds: undefined,
	spacing: 2,

	constructor: function(config) {
		this.addEvents('change');
		this.autoConfig(config, 'path');
	},

	setPath: function(path) {
		this.path = path;
		// remove all children
		while(this.getChildren().length > 0)
			this.removeChild(this.getChildren()[0]);

		this.backgrounds = [];
		this.foregrounds = [];

		var button;

		if(path == '/') {
			var bg = new Ui.Pressable();
			bg.locatorPath = '/';
			bg.locatorPos = 0;
			this.connect(bg, 'press', this.onPathPress);
			this.connect(bg, 'down', this.onPathDown);
			this.connect(bg, 'up', this.onPathUp);
			bg.appendChild(new Ui.Rectangle({ fill: 'lightblue', radius: 8 }));
			this.backgrounds.push(bg);
			this.appendChild(bg);

			var fg = new Ui.Pressable();
			fg.locatorPath = '/';
			fg.locatorPos = 0;
			this.connect(fg, 'press', this.onPathPress);
			this.connect(fg, 'down', this.onPathDown);
			this.connect(fg, 'up', this.onPathUp);

			var home = Ui.Icon.create('home', 25, 25, 'black');
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
			bg.appendChild(new Ui.LocatorRightArrow({ fill: 'lightblue', radius: 8 }));
			this.backgrounds.push(bg);
			this.appendChild(bg);

			var fg = new Ui.Pressable();
			fg.locatorPath = currentPath;
			fg.locatorPos = 0;
			this.connect(fg, 'press', this.onPathPress);
			this.connect(fg, 'down', this.onPathDown);
			this.connect(fg, 'up', this.onPathUp);

			var home = Ui.Icon.create('home', 25, 25, 'black');
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
					bg.appendChild(new Ui.LocatorLeftArrow({ fill: 'lightblue', radius: 8 }));
				else
					bg.appendChild(new Ui.LocatorLeftRightArrow({ fill: 'lightblue', radius: 8 }));
				this.backgrounds.push(bg);
				this.appendChild(bg);
	
				var fg = new Ui.Pressable();
				fg.locatorPos = i+1;
				this.connect(fg, 'press', this.onPathPress);
				this.connect(fg, 'down', this.onPathDown);
				this.connect(fg, 'up', this.onPathUp);
				fg.locatorPath = currentPath;
				fg.appendChild(new Ui.Label({ text: paths[i], margin: 8 }));
				this.foregrounds.push(fg);
				this.appendChild(fg);

				currentPath += '/';
			}
		}
	},

	getPath: function() {
		return this.path;
	},

	onPathPress: function(pathItem) {
		this.fireEvent('change', this, pathItem.locatorPath);
	},

	onPathDown: function(pathItem) {
		this.backgrounds[pathItem.locatorPos].getChildren()[0].setFill('#38acec');
	},

	onPathUp: function(pathItem) {
		this.backgrounds[pathItem.locatorPos].getChildren()[0].setFill('lightblue');
	}
}, {
	//
	// Return the required size for the current element
	//
	measureCore: function(width, height) {
		if(this.foregrounds.length == 0)
			return { width: 0, height: 0 };

		for(var i = 0; i < this.getChildren().length; i++)
			this.getChildren()[i].measure(width, height);

		if(this.foregrounds.length == 1) {
			return { width: this.foregrounds[0].getMeasureWidth(), height: this.foregrounds[0].getMeasureHeight() };
		}
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
			return { width: minWidth, height: minHeight };
		}
	},

	//
	// Arrange children
	//
	arrangeCore: function(width, height) {
		if(this.foregrounds.length == 1) {
			this.foregrounds[0].arrange(0, 0, width, height);
			this.backgrounds[0].arrange(0, 0, width, height);
			return;
		}

		x = 0;
		for(var i = 0; i < this.foregrounds.length; i++) {
			var bg = this.backgrounds[i];
			var fg = this.foregrounds[i];
			var fgWidth = fg.getMeasureWidth();
			fg.arrange(x, 0, fgWidth, height);
			if(i == 0)
				bg.arrange(x, 0, fgWidth + height/2, height);
			else if(i == this.foregrounds.length -1)
				bg.arrange(x - height/2, 0, fgWidth + height/2, height);
			else
				bg.arrange(x - height/2, 0, fgWidth + height, height);
			x += fgWidth + height/2 + this.spacing;
		}
	}
});

Ui.Shape.extend('Ui.LocatorRightArrow', {
	radius: 8,

	constructor: function(config) {
		this.autoConfig(config, 'radius');
	},

	setRadius: function(radius) {
		this.radius = radius;
	}
}, {
	arrangeCore: function(width, height) {
		Ui.LocatorRightArrow.base.arrangeCore.call(this, width, height);
		var v1 = width - height/2;
		var v2 = height/2;
		var v3 = height-this.radius;
//		this.setPath('M'+this.radius+',0 L'+v1+',0 L'+width+','+v2+' L'+v1+','+height+' L'+this.radius+','+height+' A'+this.radius+','+this.radius+' 0 0,1 0,'+v3+' L0,'+this.radius+' A'+this.radius+','+this.radius+' 0 0,1 '+this.radius+',0 z');
		this.setPath('M'+this.radius+',0 L'+v1+',0 L'+width+','+v2+' L'+v1+','+height+' L'+this.radius+','+height+' Q0,'+height+' 0,'+v3+' L0,'+this.radius+' Q0,0 '+this.radius+',0 z');
	}
});

Ui.Shape.extend('Ui.LocatorLeftArrow', {
	radius: 8,

	constructor: function(config) {
		this.autoConfig(config, 'radius');
	},

	setRadius: function(radius) {
		this.radius = radius;
	}
}, {
	arrangeCore: function(width, height) {
		Ui.LocatorLeftArrow.base.arrangeCore.call(this, width, height);
		var v2 = width - this.radius;
		var v3 = height - this.radius;
		var v4 = height/2;
		this.setPath('M0,0 L'+v2+',0 Q'+width+',0 '+width+','+this.radius+' L'+width+','+v3+' Q'+width+','+height+' '+v2+','+height+' L0,'+height+' L'+v4+','+v4+' z');
//		this.arrowDrawing.setAttributeNS(null, 'd', 'M0,0 L'+v2+',0 A'+this.radius+','+this.radius+' 0 0,1 '+width+','+this.radius+' L'+width+','+v3+' A'+this.radius+','+this.radius+' 0 0,1 '+v2+','+height+' L0,'+height+' L'+v4+','+v4+' z');
	}
});

Ui.Shape.extend('Ui.LocatorLeftRightArrow', {

	constructor: function(config) {
	},

	setRadius: function(radius) {
	}
}, {
	arrangeCore: function(width, height) {
		Ui.LocatorLeftRightArrow.base.arrangeCore.call(this, width, height);
		var v1 = width - height/2;
		var v2 = height/2;
		this.setPath('M0,0 L'+v1+',0 L'+width+','+v2+' L'+v1+','+height+' L0,'+height+' L'+v2+','+v2+' z');
	}
});

