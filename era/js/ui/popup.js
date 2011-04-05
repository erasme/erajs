//
// Define the PopupMenu class.
//
Ui.Container.extend('Ui.Popup', {
	background: undefined,
	contentBox: undefined,
	visible: false,
	posX: undefined,
	posY: undefined,
	lbox: undefined,

	constructor: function(config) {
//		this.background = new Ui.Rectangle({ radius: 8, fill: 'pink' });

		this.shadow = new Ui.Rectangle({ fill: 'white', opacity: 0.5 });
		this.appendChild(this.shadow);

		this.background = new Ui.PopupBackground({ radius: 8, fill: 'black' });
		this.appendChild(this.background);

		this.contentBox = new Ui.LBox({ paddingLeft: 15, paddingRight: 15, paddingTop: 11, paddingBottom: 11 });
		this.appendChild(this.contentBox);

		this.connect(this.getDrawing(), 'mousedown', this.onMouseDown);
		this.connect(this.contentBox.getDrawing(), 'mousedown', this.onContentMouseDown);

		this.connect(this.getDrawing(), 'touchstart', this.onTouchStart);
		this.connect(this.contentBox.getDrawing(), 'touchstart', this.onContentTouchStart);

		this.connect(window, 'resize', this.onWindowResize);
	},

	setContent: function(content) {
		if(this.content != content) {
			if(this.content != undefined)
				this.contentBox.remove(this.content);
			this.content = content;
			if(this.content != undefined)
				this.contentBox.append(this.content);
		}
	},

	getBackgroundColor: function() {
		var color = this.getStyleProperty('backgroundColor');
		if(color == undefined)
			color = 'lightblue';
		return color;
	},

	onWindowResize: function() {
		console.log('window resize');
		if(this.visible) {
			this.hide();
		}
	},

	onMouseDown: function(event) {
		event.preventDefault();
		event.stopPropagation();
		this.hide();
	},

	onContentMouseDown: function(event) {
		event.preventDefault();
		event.stopPropagation();
	},

	onTouchStart: function(event) {
		event.preventDefault();
		event.stopPropagation();
		this.hide();
	},

	onContentTouchStart: function(event) {
		event.preventDefault();
		event.stopPropagation();
	},

}, {
	onStyleChange: function() {
		console.log(this+'.onStyleChange '+this.getStyleProperty('backgroundColor'));
		this.background.setFill(this.getStyleProperty('backgroundColor'));
	},

	show: function(posX, posY) {
		if(!this.visible) {
			this.visible = true;
			if((posX != undefined) && (posY != undefined)) {
				this.posX = posX;
				this.posY = posY;
				this.background.setArrowBorder('left');
			}
			else {
				this.posX = undefined;
				this.posY = undefined;
				this.background.setArrowBorder('none');
			}
			this.invalidateArrange();
			Ui.App.current.appendDialog(this);
		}
	},

	hide: function() {
		if(this.visible) {
			this.visible = false;
			Ui.App.current.removeDialog(this);
		}
	},

	measureCore: function(width, height) {
		this.background.measure(width, height);

		var size = this.contentBox.measure(width, height);
		console.log('popup.measure '+width+'x'+height+' => '+size.width+'x'+size.height);

		return { width: width, height: height };
	},

	arrangeCore: function(width, height, force) {
		var x = 0;
		var y = 0;

		console.log('popup arrangeCore');

		if(this.posX == undefined) {
			x = (width - this.contentBox.getMeasureWidth())/2;
			y = (height - this.contentBox.getMeasureHeight())/2;
			this.shadow.arrange(0, 0, width, height);
			this.background.arrange(x, y, this.contentBox.getMeasureWidth(), this.contentBox.getMeasureHeight());
		}
		else {
			x = this.posX;
			y = this.posY;
			x += 10;
			y -= 30;
			this.shadow.arrange(0, 0, 0, 0);
			this.background.arrange(x - 10, y, this.contentBox.getMeasureWidth() + 10, this.contentBox.getMeasureHeight());
		}
		this.contentBox.arrange(x, y, this.contentBox.getMeasureWidth(), this.contentBox.getMeasureHeight());

	},
});


Ui.SVGElement.extend('Ui.PopupBackground', {
	popupDrawing: undefined,
	radius: 8,
	fill: 'black',
	// [left|right|top|bottom]
	arrowBorder: 'left',
	arrowOffset: 30,
	arrowSize: 10,

	constructor: function(config) {
		if(config.radius != undefined)
			this.setRadius(config.radius);
		if(config.fill != undefined)
			this.setFill(config.fill);
		if(config.arrowBorder != undefined)
			this.setArrowBorder(config.arrowBorder);
	},

	setArrowBorder: function(arrowBorder) {
		if(this.arrowBorder != arrowBorder) {
			this.arrowBorder = arrowBorder;
			this.invalidateArrange();
		}
	},

	setRadius: function(radius) {
		if(this.radius != radius) {
			this.radius = radius;
			this.invalidateArrange();
		}
	},

	setFill: function(fill) {
		this.fill = fill;
		this.popupDrawing.style.setProperty('fill', this.fill, null);
	},
}, {
	renderSVG: function() {
		this.popupDrawing = document.createElementNS(svgNS, 'path');
		this.popupDrawing.style.setProperty('fill', this.fill, null);
		this.popupDrawing.style.setProperty('fill-opacity', '1', null);
		this.popupDrawing.style.setProperty('stroke', 'none', null);
		return this.popupDrawing;
	},

	arrangeCore: function(width, height) {
		if(this.arrowBorder == 'none') {
			var v1 = width - this.radius;
			var v2 = height - this.radius;
			this.popupDrawing.setAttributeNS(null, 'd', 'M'+this.radius+',0 L'+v1+',0 A'+this.radius+','+this.radius+' 0 0,1 '+width+','+this.radius+' L'+width+','+v2+' A'+this.radius+','+this.radius+' 0 0,1 '+v1+','+height+' L'+this.radius+','+height+' A'+this.radius+','+this.radius+' 0 0,1 0,'+v2+' L0,'+this.radius+' A'+this.radius+','+this.radius+' 0 0,1 '+this.radius+',0 z');
		}
		else if(this.arrowBorder == 'left') {
			var v1 = width - this.radius;
			var v2 = height - this.radius;
			this.popupDrawing.setAttributeNS(null, 'd', 'M'+(this.radius+this.arrowSize)+',0 L'+v1+',0 A'+this.radius+','+this.radius+' 0 0,1 '+width+','+this.radius+' L'+width+','+v2+' A'+this.radius+','+this.radius+' 0 0,1 '+v1+','+height+' L'+(this.radius+this.arrowSize)+','+height+' A'+this.radius+','+this.radius+' 0 0,1 '+this.arrowSize+','+v2+' L'+this.arrowSize+','+(this.arrowOffset+this.arrowSize)+' L0,'+this.arrowOffset+' L'+this.arrowSize+','+(this.arrowOffset-this.arrowSize)+' L'+this.arrowSize+','+this.radius+' A'+this.radius+','+this.radius+' 0 0,1 '+(this.radius+this.arrowSize)+',0 z');
		}

//		this.popupDrawing.setAttributeNS(null, 'd', 'M'+this.radius+',0 L'+v1+',0 A'+this.radius+','+this.radius+' 0 0 0,1 L'+width+','+v2+'  A'+this.radius+','+this.radius+' 0 0 0,1 L'+this.radius+','+height+' A'+this.radius+','+this.radius+' 0 0 0,1 L0,'+this.radius+' A'+this.radius+','+this.radius+' 0 0 0,1 z');

//		this.popupDrawing.setAttributeNS(null, 'd', 'M'+this.radius+',0 L'+v1+',0 L'+width+','+v2+' L'+v1+','+height+' L'+this.radius+','+height+' A'+this.radius+','+this.radius+' 0 0,1 0,'+v3+' L0,'+this.radius+' A'+this.radius+','+this.radius+' 0 0,1 '+this.radius+',0 z');
	},
});


