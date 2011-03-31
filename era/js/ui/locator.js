//
// Define the Locator class.
//
Ui.Container.extend('Ui.Locator', {
	path: undefined,
	backgrounds: undefined,
	foregrounds: undefined,
	spacing: 2,

	constructor: function(config) {
		if(config.path != undefined)
			this.setPath(config.path);

		this.addEvents('change');
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
			fg.appendChild(new Ui.LocatorHome({ verticalAlign: 'center', horizontalAlign: 'center', width: 25, height: 25, margin: 5 }));
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
			fg.appendChild(new Ui.LocatorHome({ verticalAlign: 'center', horizontalAlign: 'center', width: 25, height: 25, margin: 5 }));
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
	},


}, {
	//
	// Return the required size for the current element
	//
	measureCore: function(width, height, force) {
		if(this.foregrounds.length == 0)
			return { width: 0, height: 0 };

		for(var i = 0; i < this.getChildren().length; i++)
			this.getChildren()[i].measure(width, height, force);

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
	arrangeCore: function(width, height, force) {
		if(this.foregrounds.length == 1) {
			this.foregrounds[0].arrange(0, 0, width, height, force);
			this.backgrounds[0].arrange(0, 0, width, height, force);
			return;
		}

		x = 0;
		for(var i = 0; i < this.foregrounds.length; i++) {
			var bg = this.backgrounds[i];
			var fg = this.foregrounds[i];
			var fgWidth = fg.getMeasureWidth();
			fg.arrange(x, 0, fgWidth, height, force);
			if(i == 0)
				bg.arrange(x, 0, fgWidth + height/2, height, force);
			else if(i == this.foregrounds.length -1)
				bg.arrange(x - height/2, 0, fgWidth + height/2, height, force);
			else
				bg.arrange(x - height/2, 0, fgWidth + height, height, force);
			x += fgWidth + height/2 + this.spacing;
		}
	},
});

Ui.SVGElement.extend('Ui.LocatorRightArrow', {
	arrowDrawing: undefined,
	radius: 8,
	fill: 'black',

	constructor: function(config) {
		if(config.radius != undefined)
			this.setRadius(config.radius);
		if(config.fill != undefined)
			this.setFill(config.fill);
	},

	setRadius: function(radius) {
		this.radius = radius;
	},

	setFill: function(fill) {
		this.fill = fill;
		this.arrowDrawing.style.setProperty('fill', this.fill, null);
	},

}, {
	renderSVG: function() {
		this.arrowDrawing = document.createElementNS(svgNS, 'path');
		this.arrowDrawing.style.setProperty('fill', this.fill, null);
		this.arrowDrawing.style.setProperty('fill-opacity', '1', null);
		this.arrowDrawing.style.setProperty('stroke', 'none', null);
		return this.arrowDrawing;
	},

	arrangeCore: function(width, height) {
		var v1 = width - height/2;
		var v2 = height/2;
		var v3 = height-this.radius;
		this.arrowDrawing.setAttributeNS(null, 'd', 'M'+this.radius+',0 L'+v1+',0 L'+width+','+v2+' L'+v1+','+height+' L'+this.radius+','+height+' A'+this.radius+','+this.radius+' 0 0,1 0,'+v3+' L0,'+this.radius+' A'+this.radius+','+this.radius+' 0 0,1 '+this.radius+',0 z');
	},
});

Ui.SVGElement.extend('Ui.LocatorLeftArrow', {
	arrowDrawing: undefined,
	radius: 8,
	fill: 'black',

	constructor: function(config) {
		if(config.radius != undefined)
			this.setRadius(config.radius);
		if(config.fill != undefined)
			this.setFill(config.fill);
	},

	setRadius: function(radius) {
		this.radius = radius;
	},

	setFill: function(fill) {
		this.fill = fill;
		this.arrowDrawing.style.setProperty('fill', this.fill, null);
	},

}, {
	renderSVG: function() {
		this.arrowDrawing = document.createElementNS(svgNS, 'path');
		this.arrowDrawing.style.setProperty('fill', this.fill, null);
		this.arrowDrawing.style.setProperty('fill-opacity', '1', null);
		this.arrowDrawing.style.setProperty('stroke', 'none', null);
		return this.arrowDrawing;
	},

	arrangeCore: function(width, height) {
		var v2 = width - this.radius;
		var v3 = height - this.radius;
		var v4 = height/2;
		this.arrowDrawing.setAttributeNS(null, 'd', 'M0,0 L'+v2+',0 A'+this.radius+','+this.radius+' 0 0,1 '+width+','+this.radius+' L'+width+','+v3+' A'+this.radius+','+this.radius+' 0 0,1 '+v2+','+height+' L0,'+height+' L'+v4+','+v4+' z');
	},
});

Ui.SVGElement.extend('Ui.LocatorLeftRightArrow', {
	arrowDrawing: undefined,
	radius: 8,
	fill: 'black',

	constructor: function(config) {
		if(config.radius != undefined)
			this.setRadius(config.radius);
		if(config.fill != undefined)
			this.setFill(config.fill);
	},

	setRadius: function(radius) {
		this.radius = radius;
	},

	setFill: function(fill) {
		this.fill = fill;
		this.arrowDrawing.style.setProperty('fill', this.fill, null);
	},

}, {
	renderSVG: function() {
		this.arrowDrawing = document.createElementNS(svgNS, 'path');
		this.arrowDrawing.style.setProperty('fill', this.fill, null);
		this.arrowDrawing.style.setProperty('fill-opacity', '1', null);
		this.arrowDrawing.style.setProperty('stroke', 'none', null);
		return this.arrowDrawing;
	},

	arrangeCore: function(width, height) {
		var v1 = width - height/2;
		var v2 = height/2;
		this.arrowDrawing.setAttributeNS(null, 'd', 'M0,0 L'+v1+',0 L'+width+','+v2+' L'+v1+','+height+' L0,'+height+' L'+v2+','+v2+' z');
	},
});


Ui.SVGElement.extend('Ui.LocatorHome', {
	homeDrawing: undefined,
	fill: 'black',

	constructor: function(config) {
		if(config.radius != undefined)
			this.setRadius(config.radius);
		if(config.fill != undefined)
			this.setFill(config.fill);
	},

	setFill: function(fill) {
		this.fill = fill;
		this.homeDrawing.style.setProperty('fill', this.fill, null);
	},

}, {
	renderSVG: function() {
		this.homeDrawing = document.createElementNS(svgNS, 'path');
		this.homeDrawing.style.setProperty('fill', this.fill, null);
		this.homeDrawing.style.setProperty('fill-opacity', '1', null);
		this.homeDrawing.style.setProperty('stroke', 'none', null);
		this.homeDrawing.setAttributeNS(null, 'd', 'M 25.78125 8.4375 C 25.324787 8.4375 24.892151 8.63045 24.53125 8.96875 C 24.53125 8.96875 6.032579 23.87715 5.6875 24.21875 C 4.081261 25.55365 4.524131 25.86215 4.96875 26.46875 C 7.1319435 26.472745 6.9387918 26.465628 8.875 26.46875 L 8.875 38.40625 C 8.875 40.46895 10.593558 42.1875 12.65625 42.1875 L 37.3125 42.1875 C 39.375192 42.1875 41.09375 40.46895 41.09375 38.40625 L 41.09375 26.5 C 42.834133 26.49218 44.96875 26.46875 44.96875 26.46875 C 45.304525 25.79985 45.215875 24.96585 44.65625 24.40625 L 39.96875 20.3125 C 40.040347 20.078087 40.09375 19.817094 40.09375 19.5625 L 40.09375 11.875 C 40.09375 10.4883 38.949133 9.34375 37.5625 9.34375 L 33.25 9.34375 C 31.863368 9.34375 30.71875 10.4883 30.71875 11.875 L 30.71875 12.1875 L 27.03125 8.96875 C 26.681485 8.61895 26.237713 8.4375 25.78125 8.4375 z M 33.71875 12.34375 L 37.09375 12.34375 L 37.09375 17.78125 L 33.71875 14.8125 L 33.71875 12.34375 z M 12.875 26.46875 C 23.518938 26.483067 32.947599 26.505366 37.09375 26.5 L 37.09375 38.1875 L 12.875 38.1875 L 12.875 26.46875 z');
		return this.homeDrawing;
	},

	arrangeCore: function(width, height) {
		var scale = Math.min(width, height) / 48;
		this.homeDrawing.setAttributeNS(null, 'transform', 'scale( '+scale.toFixed(4)+', '+scale.toFixed(4)+' )');
	},
});

