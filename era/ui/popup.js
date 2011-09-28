Ui.Container.extend('Ui.Popup', 
/**@lends Ui.Popup#*/
{
	background: undefined,
	shadow: undefined,
	contentBox: undefined,
	posX: undefined,
	posY: undefined,
	attachedElement: undefined,
	lbox: undefined,
	autoHide: true,
	expandable: false,

	/**
     * @constructs
	 * @class
     * @extends Ui.Container
     * @param {Boolean} [config.autoHide]
	 * @param {Boolean} [config.expandable]
	 */
	constructor: function(config) {
		this.setHorizontalAlign('stretch');
		this.setVerticalAlign('stretch');

		this.shadow = new Ui.Rectangle();
		this.appendChild(this.shadow);

		this.background = new Ui.PopupBackground({ radius: 8, fill: 'black' });
		this.appendChild(this.background);

		this.contentBox = new Ui.LBox({ paddingLeft: 15, paddingRight: 15, paddingTop: 11, paddingBottom: 11 });
		this.appendChild(this.contentBox);

		this.connect(this.shadow.getDrawing(), 'mousedown', this.onMouseDown);
//		this.connect(this.contentBox.getDrawing(), 'mousedown', this.onContentMouseDown);

		this.connect(this.shadow.getDrawing(), 'touchstart', this.onTouchStart);
//		this.connect(this.contentBox.getDrawing(), 'touchstart', this.onContentTouchStart);

		this.connect(window, 'resize', this.onWindowResize);

		this.autoConfig(config, 'autoHide', 'expandable');
	},

	setExpandable: function(expandable) {
		if(this.expandable != expandable) {
			this.expandable = expandable;
			this.invalidateMeasure();
		}
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
	}
}, 
/**@lends Ui.Popup#*/
{
	visible: false,

	onStyleChange: function() {
		this.background.setFill(this.getStyleProperty('color'));
		this.shadow.setFill(this.getStyleProperty('shadowColor'));
	},

	show: function(posX, posY) {
		var oldVisible = this.getIsVisible();
		Ui.Popup.base.show.call(this);

		this.attachedElement = undefined;
		this.posX = undefined;
		this.posY = undefined;

		if(!oldVisible) {
			if((typeof(posX) == 'object') && (Ui.Element.hasInstance(posX))) {
				this.attachedElement = posX;
				var point = this.attachedElement.pointToWindow({ x: this.attachedElement.getLayoutWidth(), y: this.attachedElement.getLayoutHeight()/2 });
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

	onHidden: function() {
		Ui.App.current.removeDialog(this);
	},

	measureCore: function(width, height) {
//		console.log(this+'.measureCore('+width+','+height+')');

		var constraintWidth = Math.max(width - 80, 0);
		var constraintHeight = Math.max(height - 80, 0);

//		if((this.posX != undefined) || (this.attachedElement != undefined)) {
//			constraintWidth = 0;
//			constraintHeight = 0;
//		}
		if(!this.expandable) {
			constraintWidth = 0;
			constraintHeight = 0;
		}

		this.background.measure(constraintWidth, constraintHeight);
		var size = this.contentBox.measure(constraintWidth, constraintHeight);

//		console.log('contentBox = '+size.width+' x '+size.height);

		if((this.posX != undefined) || (this.attachedElement != undefined))
			return { width: size.width, height: size.height };
		else
			return { width: Math.max(width, size.width + 80), height: Math.max(height, size.height + 80) };
	},

	arrangeCore: function(width, height) {
		var x = 0;
		var y = 0;

//		console.log(this+'.arrangeCore('+width+','+height+')');

		this.shadow.arrange(0, 0, width, height);

		// handle open center screen
		if((this.posX == undefined) && (this.attachedElement == undefined)) {
			this.setCenter(width, height);
		}
		// handle open at an element
		else if(this.attachedElement != undefined) {
			var point = this.attachedElement.pointToWindow({ x: this.attachedElement.getLayoutWidth(), y: this.attachedElement.getLayoutHeight()/2 });
			if(this.contentBox.getMeasureWidth() + point.x + 10 < width)
				this.setLeft(point.x, point.y, width, height);
			else {
				point = this.attachedElement.pointToWindow({ x: 0, y: this.attachedElement.getLayoutHeight()/2 });
				if(this.contentBox.getMeasureWidth() + 10 < point.x)
					this.setRight(point.x, point.y, width, height);
				else {
					point = this.attachedElement.pointToWindow({ x: this.attachedElement.getLayoutWidth()/2, y: 0 });
					if(this.contentBox.getMeasureHeight() + 10 < point.y)
						this.setTop(point.x, point.y, width, height);
					else {
						point = this.attachedElement.pointToWindow({ x: this.attachedElement.getLayoutWidth()/2, y: this.attachedElement.getLayoutHeight() });
						if(this.contentBox.getMeasureHeight() + 10 + point.y < height)
							this.setBottom(point.x, point.y, width, height);
						else
							this.setCenter(width, height);
					}
				}
			}
		}
		// handle open at a position
		else {
			this.setLeft(this.posX, this.posY, width, height);
		}
	},

	setLeft: function(x, y, width, height) {
		var px = x + 10;
		var py = y - 30;

		this.background.setArrowBorder('left');

		if(py + this.contentBox.getMeasureHeight() > height) {
			py = height - this.contentBox.getMeasureHeight();

			var offset = y - py;
			if(offset > this.contentBox.getMeasureHeight() - 18)
				offset = this.contentBox.getMeasureHeight() - 18;
			this.background.setArrowOffset(offset);
		}
		else
			this.background.setArrowOffset(30);
		this.shadow.setOpacity(0);
		this.background.arrange(px - 10, py, this.contentBox.getMeasureWidth() + 10, this.contentBox.getMeasureHeight());
		this.contentBox.arrange(px, py, this.contentBox.getMeasureWidth(), this.contentBox.getMeasureHeight());
	},

	setRight: function(x, y, width, height) {
		var px = x - (10 + this.contentBox.getMeasureWidth());
		var py = y - 30;

		this.background.setArrowBorder('right');

		if(py + this.contentBox.getMeasureHeight() > height) {
			py = height - this.contentBox.getMeasureHeight();

			var offset = y - py;
			if(offset > this.contentBox.getMeasureHeight() - 18)
				offset = this.contentBox.getMeasureHeight() - 18;
			this.background.setArrowOffset(offset);
		}
		else
			this.background.setArrowOffset(30);
		this.shadow.setOpacity(0);
		this.background.arrange(px, py, this.contentBox.getMeasureWidth() + 10, this.contentBox.getMeasureHeight());
		this.contentBox.arrange(px, py, this.contentBox.getMeasureWidth(), this.contentBox.getMeasureHeight());
	},

	setTop: function(x, y, width, height) {
		var py = y - (this.contentBox.getMeasureHeight());
		var px = x - 30;

		this.background.setArrowBorder('bottom');

		if(px + this.contentBox.getMeasureWidth() > width) {
			px = width - this.contentBox.getMeasureWidth();

			var offset = x - px;
			if(offset > this.contentBox.getMeasureWidth() - 18)
				offset = this.contentBox.getMeasureWidth() - 18;
			this.background.setArrowOffset(offset);
		}
		else
			this.background.setArrowOffset(30);
		this.shadow.setOpacity(0);
		this.background.arrange(px, py - 10, this.contentBox.getMeasureWidth(), this.contentBox.getMeasureHeight() + 10);
		this.contentBox.arrange(px, py - 10, this.contentBox.getMeasureWidth(), this.contentBox.getMeasureHeight());
	},

	setBottom: function(x, y, width, height) {
		var py = y + 10;
		var px = x - 30;

		this.background.setArrowBorder('top');

		if(px + this.contentBox.getMeasureWidth() > width) {
			px = width - this.contentBox.getMeasureWidth();

			var offset = x - px;

			if(offset > this.contentBox.getMeasureWidth() - 18)
				offset = this.contentBox.getMeasureWidth() - 18;
			this.background.setArrowOffset(offset);
		}
		else
			this.background.setArrowOffset(30);
		this.shadow.setOpacity(0);
		this.background.arrange(px, py - 10, this.contentBox.getMeasureWidth(), this.contentBox.getMeasureHeight() + 10);
		this.contentBox.arrange(px, py, this.contentBox.getMeasureWidth(), this.contentBox.getMeasureHeight());
	},

	setCenter: function(width, height) {
		this.background.setArrowBorder('none');

		x = (width - this.contentBox.getMeasureWidth())/2;
		y = (height - this.contentBox.getMeasureHeight())/2;
		this.background.arrange(x, y, this.contentBox.getMeasureWidth(), this.contentBox.getMeasureHeight());
		this.shadow.setOpacity(1);
		this.contentBox.arrange(x, y, this.contentBox.getMeasureWidth(), this.contentBox.getMeasureHeight());
	}
}, 
/**@lends Ui.Popup*/
{
	style: {
		color: new Ui.Color({ r: 0.1, g: 0.15, b: 0.2 }),
		shadowColor: new Ui.Color({ r: 1, g: 1, b: 1, a: 0.5 })
	}
});

Ui.Fixed.extend('Ui.PopupBackground', 
/**@lends Ui.PopupBackground#*/
{
	darkShadow: undefined,
	lightShadow: undefined,
	background: undefined,

	radius: 8,
	fill: 'black',
	// [left|right|top|bottom]
	arrowBorder: 'left',
	arrowOffset: 30,
	arrowSize: 10,

	/**
     * @constructs
	 * @class
     * @extends Ui.Fixed
	 */
	constructor: function(config) {

		this.darkShadow = new Ui.Shape({ fill: '#010002', opacity: 0.8 });
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

		this.autoConfig(config, 'radius', 'fill', 'arrowBorder');
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
			var yuv = this.fill.getYuv();
			var gradient = new Ui.LinearGradient({ stops: [
				{ offset: 0, color: new Ui.Color({ y: yuv.y + 0.2, u: yuv.u, v: yuv.v }) },
				{ offset: 1, color: new Ui.Color({ y: yuv.y - 0.1, u: yuv.u, v: yuv.v }) }
			] });
			this.background.setFill(gradient);
			this.darkShadow.setFill(new Ui.Color({ y: yuv.y - 0.9, u: yuv.u, v: yuv.v }));
			this.lightShadow.setFill(new Ui.Color({ y: yuv.y + 0.3, u: yuv.u, v: yuv.v }));
		}
	},

	/**
	 * @private
	 */

	genPath: function(width, height, radius, arrowBorder, arrowSize, arrowOffset) {
		if(arrowBorder == 'none') {
			var v1 = width - radius;
			var v2 = height - radius;
			return 'M'+radius+',0 L'+v1+',0 Q'+width+',0 '+width+','+radius+' L'+width+','+v2+' Q'+width+','+height+' '+v1+','+height+' L'+radius+','+height+' Q0,'+height+' 0,'+v2+' L0,'+radius+' Q0,0 '+radius+',0 z';
		}
		else if(arrowBorder == 'left') {
			var v1 = width - this.radius;
			var v2 = height - this.radius;
			return 'M'+(radius+arrowSize)+',0 L'+v1+',0 Q'+width+',0 '+width+','+radius+' L'+width+','+v2+' Q'+width+','+height+' '+v1+','+height+' L'+(radius+arrowSize)+','+height+' Q'+arrowSize+','+height+' '+arrowSize+','+v2+' L'+arrowSize+','+(arrowOffset+arrowSize)+' L0,'+arrowOffset+' L'+arrowSize+','+(arrowOffset-arrowSize)+' L'+arrowSize+','+radius+' Q'+arrowSize+',0 '+(radius+arrowSize)+',0 z';
		}
		else if(arrowBorder == 'right') {
			var v1 = width - (this.radius + arrowSize);
			var v2 = height - this.radius;
			return 'M'+radius+',0 L'+v1+',0 Q'+(width - arrowSize)+',0 '+(width - arrowSize)+','+radius+' L'+(width - arrowSize)+','+(arrowOffset - arrowSize)+' L'+width+','+arrowOffset+' L'+(width - arrowSize)+','+(arrowOffset + arrowSize)+' L '+(width - arrowSize)+','+v2+' Q'+(width - arrowSize)+','+height+' '+v1+','+height+' L'+radius+','+height+' Q0,'+height+' 0,'+v2+' L0,'+radius+' Q0,0 '+radius+',0 z';
		}
		else if(arrowBorder == 'top') {
			var v1 = width - this.radius;
			var v2 = height - this.radius;
			return 'M'+radius+','+arrowSize+' L'+(arrowOffset - arrowSize)+','+arrowSize+' L'+arrowOffset+',0 L'+(arrowOffset + arrowSize)+','+arrowSize+' L'+v1+','+arrowSize+' Q'+width+','+arrowSize+' '+width+','+(arrowSize + radius)+' L'+width+','+v2+' Q'+width+','+height+' '+v1+','+height+' L'+radius+','+height+' Q0,'+height+' 0,'+v2+' L0,'+(arrowSize+radius)+' Q0,'+arrowSize+' '+radius+','+arrowSize+' z';
		}
		else if(arrowBorder == 'bottom') {
			var v1 = width - this.radius;
			var v2 = height - (this.radius + arrowSize);
			return 'M'+radius+',0 L'+v1+',0 Q'+width+',0 '+width+','+radius+' L'+width+','+v2+' Q'+width+','+(height-arrowSize)+' '+v1+','+(height-arrowSize)+' L '+(arrowOffset+arrowSize)+','+(height-arrowSize)+' L'+arrowOffset+','+height+' L'+(arrowOffset-arrowSize)+','+(height-arrowSize)+' L'+radius+','+(height-arrowSize)+' Q0,'+(height-arrowSize)+' 0,'+v2+' L0,'+radius+' Q0,0 '+radius+',0 z';
		}
	},

	onResize: function(popup, width, height) {
		this.darkShadow.setWidth(width);
		this.darkShadow.setHeight(height);
		this.darkShadow.setPath(this.genPath(width, height, this.radius, this.arrowBorder, this.arrowSize, this.arrowOffset));

		if(this.arrowBorder == 'none') {
			this.lightShadow.setWidth(width - 2);
			this.lightShadow.setHeight(height - 2);
			this.setPosition(this.lightShadow, 1, 1);
			this.lightShadow.setPath(this.genPath(width-2, height-2, this.radius-1, this.arrowBorder));

			this.background.setWidth(width - 4);
			this.background.setHeight(height - 4);
			this.setPosition(this.background, 2, 2);
			this.background.setPath(this.genPath(width-4, height-4, this.radius-1.4, this.arrowBorder));
		}
		else if(this.arrowBorder == 'left') {
			this.lightShadow.setWidth(width - 3);
			this.lightShadow.setHeight(height - 2);
			this.setPosition(this.lightShadow, 2, 1);
			this.lightShadow.setPath(this.genPath(width-2, height-2, this.radius-1, this.arrowBorder, this.arrowSize-1, this.arrowOffset-1));
			
			this.background.setWidth(width - 4.7);
			this.background.setHeight(height - 3.7);
			this.setPosition(this.background, 3.2, 2);
			this.background.setPath(this.genPath(width-4.7, height-3.7, this.radius-1.4, this.arrowBorder, this.arrowSize-1.3, this.arrowOffset-2));
		}
		else if(this.arrowBorder == 'right') {
			this.lightShadow.setWidth(width - 3);
			this.lightShadow.setHeight(height - 2);
			this.setPosition(this.lightShadow, 1, 1);
			this.lightShadow.setPath(this.genPath(width-3, height-2, this.radius-1, this.arrowBorder, this.arrowSize-1, this.arrowOffset-1));
			
			this.background.setWidth(width - 5.7);
			this.background.setHeight(height - 3.7);
			this.setPosition(this.background, 2.2, 2);
			this.background.setPath(this.genPath(width-5.7, height-3.7, this.radius-1.4, this.arrowBorder, this.arrowSize-1.3, this.arrowOffset-2));
		}
		else if(this.arrowBorder == 'top') {
			this.lightShadow.setWidth(width - 2);
			this.lightShadow.setHeight(height - 3);
			this.setPosition(this.lightShadow, 1, 2);
			this.lightShadow.setPath(this.genPath(width-2, height-3, this.radius-1, this.arrowBorder, this.arrowSize-1, this.arrowOffset-1));
			
			this.background.setWidth(width - 4);
			this.background.setHeight(height - 5);
			this.setPosition(this.background, 2, 3);
			this.background.setPath(this.genPath(width-4, height-5, this.radius-1.4, this.arrowBorder, this.arrowSize-1.3, this.arrowOffset-2));
		}
		else if(this.arrowBorder == 'bottom') {
			this.lightShadow.setWidth(width - 2);
			this.lightShadow.setHeight(height - 3);
			this.setPosition(this.lightShadow, 1, 1);
			this.lightShadow.setPath(this.genPath(width-2, height-3, this.radius-1, this.arrowBorder, this.arrowSize-1, this.arrowOffset-1));
			
			this.background.setWidth(width - 4);
			this.background.setHeight(height - 5);
			this.setPosition(this.background, 2, 2);
			this.background.setPath(this.genPath(width-4, height-5, this.radius-1.4, this.arrowBorder, this.arrowSize-1.3, this.arrowOffset-2));
		}
	}
	/**#@-*/
});

