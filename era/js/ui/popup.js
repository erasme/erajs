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
	autoHide: true,

	constructor: function(config) {
		if(config.autoHide != undefined)
			this.setAutoHide(config.autoHide);

		this.setHorizontalAlign('stretch');
		this.setVerticalAlign('stretch');

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

	setAutoHide: function(autoHide) {
		this.autoHide = autoHide;
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

	onWindowResize: function() {
		if(this.visible && this.autoHide) {
			this.hide();
		}
	},

	onMouseDown: function(event) {
		event.preventDefault();
		event.stopPropagation();
		if(this.autoHide)
			this.hide();
	},

	onContentMouseDown: function(event) {
		event.preventDefault();
		event.stopPropagation();
	},

	onTouchStart: function(event) {
		event.preventDefault();
		event.stopPropagation();
		if(this.autoHide)
			this.hide();
	},

	onContentTouchStart: function(event) {
		event.preventDefault();
		event.stopPropagation();
	},

}, {
	onStyleChange: function() {
		this.background.setFill(this.getStyleProperty('color'));
	},

	show: function(posX, posY) {
		if(!this.visible) {
			this.visible = true;
			if((typeof(posX) == 'object') && (Ui.Element.hasInstance(posX))) {
				var element = posX;
				var point = element.pointToWindow({ x: element.getLayoutWidth(), y: element.getLayoutHeight()/2 });
				this.posX = point.x;
				this.posY = point.y;
				this.background.setArrowBorder('left');
			}
			else if((posX != undefined) && (posY != undefined)) {
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
//		console.log(this+'.measureCore('+width+','+height+')');

		this.background.measure(width, height);
		var size = this.contentBox.measure(Math.max(width - 80, 0), Math.max(height - 80, 0));

//		console.log('contentBox = '+size.width+' x '+size.height);

		return { width: Math.max(width, size.width + 80), height: Math.max(height, size.height + 80) };
	},

	arrangeCore: function(width, height) {
		var x = 0;
		var y = 0;

//		console.log(this+'.arrangeCore('+width+','+height+')');

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

			if(y + this.contentBox.getMeasureHeight() > height) {
				y = height - this.contentBox.getMeasureHeight();

				var offset = this.posY - y;
				if(offset > this.contentBox.getMeasureHeight() - 18)
					offset = this.contentBox.getMeasureHeight() - 18;
				this.background.setArrowOffset(offset);
			}
			else {
				this.background.setArrowOffset(30);
			}

			this.shadow.arrange(0, 0, 0, 0);
			this.background.arrange(x - 10, y, this.contentBox.getMeasureWidth() + 10, this.contentBox.getMeasureHeight());
		}
		this.contentBox.arrange(x, y, this.contentBox.getMeasureWidth(), this.contentBox.getMeasureHeight());
	},
}, {
	style: {
		color: new Ui.Color({ r: 0.1, g: 0.15, b: 0.2 }),
	},
});


Ui.SVGElement.extend('Ui.PopupBackground', {
	popupDrawing: undefined,

	svgGradient: undefined,
	darkShadow: undefined,
	lightShadow: undefined,
	background: undefined,

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

	setArrowOffset: function(offset) {
		if(this.arrowOffset != offset) {
			this.arrowOffset = offset;
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
		if(this.fill != fill) {
			this.fill = Ui.Color.create(fill);
			this.popupDrawing.removeChild(this.svgGradient);

			var yuv = this.fill.getYuv();
			var gradient = new Ui.LinearGradient({ stops: [
				{ offset: 0, color: new Ui.Color({ y: yuv.y + 0.2, u: yuv.u, v: yuv.v }) },
				{ offset: 1, color: new Ui.Color({ y: yuv.y - 0.1, u: yuv.u, v: yuv.v }) },
			] });
			this.svgGradient = gradient.getSVGGradient();
			var gradId = 'grad'+Core.Util.generateId();
			this.svgGradient.setAttributeNS(null, 'id', gradId);
			this.popupDrawing.insertBefore(this.svgGradient, this.popupDrawing.firstChild);
			this.background.style.fill = 'url(#'+gradId+')';
			this.darkShadow.style.fill = (new Ui.Color({ y: yuv.y - 0.9, u: yuv.u, v: yuv.v })).getCssHtml();
			this.lightShadow.style.fill = (new Ui.Color({ y: yuv.y + 0.3, u: yuv.u, v: yuv.v })).getCssHtml();
		}
	},

	//
	// Private
	//

	genPath: function(width, height, radius, arrowBorder, arrowSize, arrowOffset) {
		if(arrowBorder == 'none') {
			var v1 = width - radius;
			var v2 = height - radius;
			return 'M'+radius+',0 L'+v1+',0 A'+radius+','+radius+' 0 0,1 '+width+','+radius+' L'+width+','+v2+' A'+radius+','+radius+' 0 0,1 '+v1+','+height+' L'+radius+','+height+' A'+radius+','+radius+' 0 0,1 0,'+v2+' L0,'+radius+' A'+radius+','+radius+' 0 0,1 '+radius+',0 z';
		}
		else if(arrowBorder == 'left') {
			var v1 = width - this.radius;
			var v2 = height - this.radius;
			return 'M'+(radius+arrowSize)+',0 L'+v1+',0 A'+radius+','+radius+' 0 0,1 '+width+','+radius+' L'+width+','+v2+' A'+radius+','+radius+' 0 0,1 '+v1+','+height+' L'+(radius+arrowSize)+','+height+' A'+radius+','+radius+' 0 0,1 '+arrowSize+','+v2+' L'+arrowSize+','+(arrowOffset+arrowSize)+' L0,'+arrowOffset+' L'+arrowSize+','+(arrowOffset-arrowSize)+' L'+arrowSize+','+radius+' A'+radius+','+radius+' 0 0,1 '+(radius+arrowSize)+',0 z';
		}
	},

}, {
	render: function() {
		this.popupDrawing = document.createElementNS(svgNS, 'g');

		this.darkShadow = document.createElementNS(svgNS, 'path');
		this.popupDrawing.appendChild(this.darkShadow);
		this.darkShadow.style.fill = '#010002';
		this.darkShadow.style.fillOpacity = '0.8';
		this.darkShadow.style.stroke = 'none';

		this.lightShadow = document.createElementNS(svgNS, 'path');
		this.popupDrawing.appendChild(this.lightShadow);
		this.lightShadow.style.fill = '#5f625b';
		this.lightShadow.style.fillOpacity = '1';
		this.lightShadow.style.stroke = 'none';

		var yuv = (new Ui.Color({ r: 0.50, g: 0.50, b: 0.50 })).getYuv();

		var gradient = new Ui.LinearGradient({ stops: [
			{ offset: 0, color: new Ui.Color({ y: 0.25, u: yuv.u, v: yuv.v }) },
			{ offset: 1, color: new Ui.Color({ y: 0.16, u: yuv.u, v: yuv.v }) },
		] });

		this.svgGradient = gradient.getSVGGradient();
		this.svgGradient.setAttributeNS(null, 'id', 'bgGrad');
		this.popupDrawing.appendChild(this.svgGradient);

		this.background = document.createElementNS(svgNS, 'path');
		this.popupDrawing.appendChild(this.background);
		this.background.style.fill = 'url(#bgGrad)';
		this.background.style.fillOpacity = '1';
		this.background.style.stroke = 'none';

		return this.popupDrawing;
	},

	arrangeCore: function(width, height) {
		this.darkShadow.setAttributeNS(null, 'd', this.genPath(width, height, this.radius, this.arrowBorder, this.arrowSize, this.arrowOffset));

		if(this.arrowBorder == 'none') {
			this.lightShadow.setAttributeNS(null, 'transform', 'translate(1,1)');
			this.background.setAttributeNS(null, 'transform', 'translate(2,2)');
			this.lightShadow.setAttributeNS(null, 'd', this.genPath(width-2, height-2, this.radius-1, this.arrowBorder));
			this.background.setAttributeNS(null, 'd', this.genPath(width-4, height-4, this.radius-1.4, this.arrowBorder));
		}
		else {
			this.lightShadow.setAttributeNS(null, 'transform', 'translate(1.6,1)');
			this.background.setAttributeNS(null, 'transform', 'translate(3.2,2)');
			this.lightShadow.setAttributeNS(null, 'd', this.genPath(width-3, height-2, this.radius-1, this.arrowBorder, this.arrowSize-1, this.arrowOffset-1));
			this.background.setAttributeNS(null, 'd', this.genPath(width-5.7, height-3.7, this.radius-1.4, this.arrowBorder, this.arrowSize-1.3, this.arrowOffset-2));
		}
	},
});


