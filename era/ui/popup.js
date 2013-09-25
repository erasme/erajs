Ui.Container.extend('Ui.Popup', 
/**@lends Ui.Popup#*/
{
	background: undefined,
	shadow: undefined,
	contentBox: undefined,
	ppContent: undefined,
	posX: undefined,
	posY: undefined,
	attachedElement: undefined,
	attachedBorder: undefined,
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

		this.background = new Ui.PopupBackground({ radius: 0, fill: '#f8f8f8' });
		this.appendChild(this.background);

		this.contentBox = new Ui.LBox({ padding: 4, paddingLeft: 3 });
		this.appendChild(this.contentBox);

		this.connect(this.shadow.getDrawing(), 'mousedown', this.onMouseDown);
//		this.connect(this.contentBox.getDrawing(), 'mousedown', this.onContentMouseDown);

		this.connect(this.shadow.getDrawing(), 'touchstart', this.onTouchStart);
//		this.connect(this.contentBox.getDrawing(), 'touchstart', this.onContentTouchStart);

		// handle keyboard
		this.connect(this.getDrawing(), 'keyup', this.onKeyUp);
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
		content = Ui.Element.create(content);
		if(this.ppContent !== content) {
			if(this.ppContent != undefined)
				this.contentBox.remove(this.ppContent);
			this.ppContent = content;
			if(this.ppContent !== undefined)
				this.contentBox.append(this.ppContent);
		}
	},

	onKeyUp: function(event) {
		var key = event.which;
		// escape
		if((key == 27) && (this.autoHide)) {
			event.preventDefault();
			event.stopPropagation();
			this.hide();
		}
	},

	onWindowResize: function() {
		if(this.visible && this.autoHide && (this.posX != undefined)) {
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
				if((posY !== undefined) && (typeof(posY) === 'string'))
					this.attachedBorder =  posY;
				var point = this.attachedElement.pointToWindow({ x: this.attachedElement.getLayoutWidth(), y: this.attachedElement.getLayoutHeight()/2 });
				this.posX = point.x;
				this.posY = point.y;
			}
			else if((posX != undefined) && (posY != undefined)) {
				this.posX = posX;
				this.posY = posY;
			}
			else {
				this.posX = undefined;
				this.posY = undefined;
			}
			this.invalidateArrange();
			Ui.App.current.appendDialog(this);
			this.connect(window, 'resize', this.onWindowResize);
		}
	},

	onHidden: function() {
		Ui.App.current.removeDialog(this);
		this.disconnect(window, 'resize', this.onWindowResize);
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
		if((this.posX === undefined) && (this.attachedElement === undefined)) {
			this.setCenter(width, height);
		}
		// handle open at an element
		else if(this.attachedElement != undefined) {
			var borders = ['left', 'right', 'top', 'bottom', 'center'];
			if(this.attachedBorder !== undefined)
				borders.unshift(this.attachedBorder);
			for(var i = 0; i < borders.length; i++) {
				var border = borders[i];
				if(border === 'left') {
					var point = this.attachedElement.pointToWindow({ x: this.attachedElement.getLayoutWidth(), y: this.attachedElement.getLayoutHeight()/2 });
				  	if(this.contentBox.getMeasureWidth() + point.x + 10 < width) {
						this.setLeft(point.x, point.y, width, height);
						break;
					}
				}
				else if(border === 'right') {
					var point = this.attachedElement.pointToWindow({ x: 0, y: this.attachedElement.getLayoutHeight()/2 });
					if(this.contentBox.getMeasureWidth() + 10 < point.x) {
						this.setRight(point.x, point.y, width, height);
						break;
					}
				}
				else if(border === 'top') {
					var point = this.attachedElement.pointToWindow({ x: this.attachedElement.getLayoutWidth()/2, y: 0 });
					if(this.contentBox.getMeasureHeight() + 10 < point.y) {
						this.setTop(point.x, point.y, width, height);
						break;
					}
				}
				else if(border === 'bottom') {
					var point = this.attachedElement.pointToWindow({ x: this.attachedElement.getLayoutWidth()/2, y: this.attachedElement.getLayoutHeight() });
					if(this.contentBox.getMeasureHeight() + 10 + point.y < height) {
						this.setBottom(point.x, point.y, width, height);
						break;
					}
				}
				else {
					this.setCenter(width, height);
					break;
				}
			}
		}
		// handle open at a position
		else {
			var borders = ['left', 'right', 'top', 'bottom', 'center'];
			if(this.attachedBorder !== undefined)
				borders.unshift(this.attachedBorder);
			for(var i = 0; i < borders.length; i++) {
				var border = borders[i];
				if(border === 'left') {				
					if(this.contentBox.getMeasureWidth() + this.posX + 10 < width) {
						this.setLeft(this.posX, this.posY, width, height);
						break;
					}
				}
				else if(border === 'right') {
					if(this.contentBox.getMeasureWidth() + 10 < this.posX) {
						this.setRight(this.posX, this.posY, width, height);
						break;
					}
				}
				else if(border === 'top') {
					if(this.contentBox.getMeasureHeight() + 10 < this.posY) {
						this.setTop(this.posX, this.posY, width, height);
						break;
					}
				}
				else if(border === 'bottom') {
					if(this.contentBox.getMeasureHeight() + 10 + this.posY < height) {
						this.setBottom(this.posX, this.posY, width, height);
						break;
					}
				}
				else {
					this.setCenter(width, height);
					break;
				}
			}
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
		else if(px < 2) {
			this.background.setArrowOffset(x+2);
			px = 2;
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
		else if(px < 2) {
			this.background.setArrowOffset(x+2);
			px = 2;
		}
		else
			this.background.setArrowOffset(30);
		this.shadow.setOpacity(0);
		this.background.arrange(px, py - 10, this.contentBox.getMeasureWidth(), this.contentBox.getMeasureHeight() + 10);
		this.contentBox.arrange(px, py, this.contentBox.getMeasureWidth(), this.contentBox.getMeasureHeight());
	},

	setCenter: function(width, height) {
		this.background.setArrowBorder('none');

		if(this.expandable) {
			this.background.arrange(40, 40, width-80, height-80);
			this.shadow.setOpacity(1);
			this.contentBox.arrange(40, 40, width-80, height-80);
		}
		else {
			x = (width - this.contentBox.getMeasureWidth())/2;
			y = (height - this.contentBox.getMeasureHeight())/2;
			this.background.arrange(x, y, this.contentBox.getMeasureWidth(), this.contentBox.getMeasureHeight());
			this.shadow.setOpacity(1);
			this.contentBox.arrange(x, y, this.contentBox.getMeasureWidth(), this.contentBox.getMeasureHeight());
		}
	}
}, 
/**@lends Ui.Popup*/
{
	style: {
		color: Ui.Color.create('#f8f8f8'),
		shadowColor: new Ui.Color({ r: 1, g: 1, b: 1, a: 0.5 })
	}
});

Ui.CanvasElement.extend('Ui.PopupBackground', 
/**@lends Ui.PopupBackground#*/
{
	radius: 8,
	fill: 'black',
	// [left|right|top|bottom]
	arrowBorder: 'left',
	arrowOffset: 30,
	arrowSize: 10,

	/**
     * @constructs
	 * @class
     * @extends Ui.CanvasElement
	 */
	constructor: function(config) {
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
	}
	/**#@-*/
}, {
	updateCanvas: function(ctx) {
		var width = this.getLayoutWidth();
		var height = this.getLayoutHeight();
		
		if(this.arrowBorder == 'none') {
			ctx.fillStyle = 'rgba(0,0,0,0.1)';		
			ctx.fillRect(0, 0, width, height);
			ctx.fillStyle = 'rgba(0,0,0,0.5)';
			ctx.fillRect(1, 1, width-2, height-2);
			ctx.fillStyle = this.fill.getCssRgba();
			ctx.fillRect(2, 2, width-4, height-4);
		}
		else {
			ctx.fillStyle = 'rgba(0,0,0,0.1)';		
			this.svgPath(this.genPath(width, height, this.radius, this.arrowBorder, this.arrowSize, this.arrowOffset));
			ctx.fill();
			ctx.save();
			ctx.fillStyle = 'rgba(0,0,0,0.5)';
			ctx.translate(1,1);
			this.svgPath(this.genPath(width-2, height-2, this.radius-1, this.arrowBorder, this.arrowSize-1, this.arrowOffset-1));
			ctx.fill();
			ctx.restore();
			ctx.fillStyle = this.fill.getCssRgba();
			ctx.translate(2,2);
			this.svgPath(this.genPath(width-4, height-4, this.radius-2, this.arrowBorder, this.arrowSize-1, this.arrowOffset-2));
			ctx.fill();
		}
	}
});

