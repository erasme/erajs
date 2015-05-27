Ui.Container.extend('Ui.Popup', 
/**@lends Ui.Popup#*/
{
	popupSelection: undefined,
	background: undefined,
	shadow: undefined,
	shadowGraphic: undefined,
	contextBox: undefined,
	contentBox: undefined,
	scroll: undefined,
	posX: undefined,
	posY: undefined,
	attachedElement: undefined,
	attachedBorder: undefined,
	lbox: undefined,
	autoClose: true,
	preferredWidth: undefined,
	preferredHeight: undefined,
	openClock: undefined,
	isClosed: true,

	/**
     * @constructs
	 * @class
     * @extends Ui.Container
     * @param {Boolean} [config.autoClose]
	 */
	constructor: function(config) {
		this.addEvents('close');

		this.setHorizontalAlign('stretch');
		this.setVerticalAlign('stretch');

		this.popupSelection = new Ui.Selection();

		this.shadow = new Ui.Pressable({ focusable: false });
		this.shadow.getDrawing().style.cursor = 'inherit';
		this.appendChild(this.shadow);

		this.shadowGraphic = new Ui.Rectangle();
		this.shadow.setContent(this.shadowGraphic);

		this.background = new Ui.PopupBackground({ radius: 0, fill: '#f8f8f8' });
		this.background.setTransformOrigin(0, 0);
		this.appendChild(this.background);

		this.contentBox = new Ui.LBox({ margin: 2, marginTop: 1 });
		this.contentBox.setTransformOrigin(0, 0);
		this.appendChild(this.contentBox);

		this.scroll = new Ui.ScrollingArea({ margin: 2, marginTop: 1 });
		this.contentBox.append(this.scroll);

		this.contextBox = new Ui.ContextBar({ selection: this.popupSelection, verticalAlign: 'top' });
		this.contextBox.hide(true);
		this.contentBox.append(this.contextBox);

		this.connect(this.popupSelection, 'change', this.onPopupSelectionChange);

		// handle auto hide
		this.connect(this.shadow, 'press', this.onShadowPress);
	},

	setPreferredWidth: function(width) {
		this.preferredWidth = width;
		this.invalidateMeasure();
	},

	setPreferredHeight: function(height) {
		this.preferredHeight = height;
		this.invalidateMeasure();
	},

	// implement a selection handler for Selectionable elements
	getSelectionHandler: function() {
		return this.popupSelection;
	},

	setAutoClose: function(autoClose) {
		this.autoClose = autoClose;
	},

	getContent: function() {
		return this.scroll.getContent();
	},

	setContent: function(content) {
		this.scroll.setContent(content);
	},

	onWindowResize: function() {
		if(this.autoClose && (this.posX !== undefined))
			this.close();
	},

	onShadowPress: function() {
		if(this.autoClose)
			this.close();
	},

	onOpenTick: function(clock, progress, delta) {
		var end = (progress >= 1);

		if(this.isClosed)
			progress = 1 - progress;
		
		this.setOpacity(progress);

		var arrowBorder = this.background.getArrowBorder();
		var arrowOffset = this.background.getArrowOffset();

		/*var atX = 0; var atY = 0;
		if(arrowBorder === 'left') {
			atX = 0;
			atY = arrowOffset;
		}
		else if(arrowBorder === 'right') {
			atX = this.background.getLayoutWidth();
			atY = arrowOffset;
		}
		else if(arrowBorder === 'top') {
			atX = arrowOffset;
			atY = 0;
		}
		else if(arrowBorder === 'bottom') {
			console.log(this+'.onOpenTick bottom');
			atX = arrowOffset;
			atY = this.background.getLayoutHeight();
		}
		else if(arrowBorder === 'none') {
			atX = this.background.getLayoutWidth() / 2;
			atY = this.background.getLayoutHeight() / 2;
		}
		this.background.setTransform(Ui.Matrix.createScaleAt(progress, progress, atX, atY));
		this.contentBox.setTransform(Ui.Matrix.createScaleAt(progress, progress, atX, atY));*/

		if(arrowBorder === 'right') {
			this.background.setTransform(Ui.Matrix.createTranslate(20 * (1-progress), 0));
			this.contentBox.setTransform(Ui.Matrix.createTranslate(20 * (1-progress), 0));
		}
		else if(arrowBorder === 'left') {
			this.background.setTransform(Ui.Matrix.createTranslate(-20 * (1-progress), 0));
			this.contentBox.setTransform(Ui.Matrix.createTranslate(-20 * (1-progress), 0));
		}
		else if((arrowBorder === 'top') || (arrowBorder === 'none')) {
			this.background.setTransform(Ui.Matrix.createTranslate(0, -20 * (1-progress)));
			this.contentBox.setTransform(Ui.Matrix.createTranslate(0, -20 * (1-progress)));
		}
		else if(arrowBorder === 'bottom') {
			this.background.setTransform(Ui.Matrix.createTranslate(0, 20 * (1-progress)));
			this.contentBox.setTransform(Ui.Matrix.createTranslate(0, 20 * (1-progress)));
		}

		if(end) {
			this.openClock.stop();
			this.openClock = undefined;
			if(this.isClosed) {
				Ui.App.current.removeDialog(this);
				this.enable();
			}
		}
	},

	onPopupSelectionChange: function(selection) {
		if(selection.getElements().length === 0)
			this.contextBox.hide(true);
		else
			this.contextBox.show();
	}
}, 
/**@lends Ui.Popup#*/
{
	onStyleChange: function() {
		this.background.setFill(this.getStyleProperty('background'));
		this.shadowGraphic.setFill(this.getStyleProperty('shadow'));
	},

	onChildInvalidateMeasure: function(child, type) {
		// Ui.Popup is a layout root and can handle layout (measure/arrange) for its children
		this.invalidateLayout();
	},

	onChildInvalidateArrange: function(child) {
		// Ui.Popup is a layout root and can handle layout (measure/arrange) for its children
		this.invalidateLayout();
	},

	open: function(posX, posY) {
		if(this.isClosed) {
			Ui.App.current.appendDialog(this);
			this.isClosed = false;

			this.attachedElement = undefined;
			this.posX = undefined;
			this.posY = undefined;

			if((typeof(posX) == 'object') && (Ui.Element.hasInstance(posX))) {
				this.attachedElement = posX;
				if((posY !== undefined) && (typeof(posY) === 'string'))
					this.attachedBorder =  posY;
				var point = this.attachedElement.pointToWindow({ x: this.attachedElement.getLayoutWidth(), y: this.attachedElement.getLayoutHeight()/2 });
				this.posX = point.x;
				this.posY = point.y;
			}
			else if((posX !== undefined) && (posY !== undefined)) {
				this.posX = posX;
				this.posY = posY;
			}
			else {
				this.posX = undefined;
				this.posY = undefined;
			}
			if(this.openClock === undefined) {
				this.openClock = new Anim.Clock({ duration: 1, target: this, speed: 5 });
				this.openClock.setEase(new Anim.PowerEase({ mode: 'out' }));
				this.connect(this.openClock, 'timeupdate', this.onOpenTick);
				// set the initial state
				this.setOpacity(0);
				// the start of the animation is delayed to the next arrange
			}

			this.invalidateArrange();
			this.connect(window, 'resize', this.onWindowResize);
		}
	},

	close: function() {
		if(!this.isClosed) {
			this.isClosed = true;

			this.fireEvent('close', this);

			//Ui.App.current.removeDialog(this);
			this.disconnect(window, 'resize', this.onWindowResize);

			this.disable();
			if(this.openClock === undefined) {
				this.openClock = new Anim.Clock({ duration: 1, target: this, speed: 5 });
				this.openClock.setEase(new Anim.PowerEase({ mode: 'out' }));
				this.connect(this.openClock, 'timeupdate', this.onOpenTick);
				this.openClock.begin();
			}
		}
	},

	measureCore: function(width, height) {
//		console.log(this+'.measureCore('+width+','+height+')');

		var constraintWidth = Math.max(width - 40, 0);
		var constraintHeight = Math.max(height - 40, 0);

		if((this.preferredWidth !== undefined) && (this.preferredWidth < constraintWidth))
			constraintWidth = this.preferredWidth;
		if((this.preferredHeight !== undefined) && (this.preferredHeight < constraintHeight))
			constraintHeight = this.preferredHeight;
		
		this.background.measure(constraintWidth, constraintHeight);
		var size = this.contentBox.measure(constraintWidth, constraintHeight);

//		console.log('contentBox = '+size.width+' x '+size.height);

		if((this.posX !== undefined) || (this.attachedElement !== undefined))
			return { width: Math.max(50, size.width), height: Math.max(50, size.height) };
		else
			return { width: Math.max(width, size.width + 40), height: Math.max(height, size.height + 40) };
	},

	arrangeCore: function(width, height) {
		// the delayed open animation
		if((this.openClock !== undefined) && !this.openClock.getIsActive())
			this.openClock.begin();

		var x = 0; var y = 0; var point; var borders; var border; var i;

		//console.log(this+'.arrangeCore('+width+','+height+')');

		this.shadow.arrange(0, 0, width, height);

		// handle open center screen
		if(((this.posX === undefined) && (this.attachedElement === undefined)) || (width < 150) || (height < 150)) {
			this.setCenter(width, height);
		}
		// handle open at an element
		else if(this.attachedElement !== undefined) {
			borders = ['right', 'left', 'top', 'bottom', 'center'];
			if(this.attachedBorder !== undefined)
				borders.unshift(this.attachedBorder);
			for(i = 0; i < borders.length; i++) {
				border = borders[i];
				if(border === 'left') {
					point = this.attachedElement.pointToWindow({ x: 0, y: this.attachedElement.getLayoutHeight()/2 });
					if(this.contentBox.getMeasureWidth() + 10 < point.x) {
						this.setLeft(point.x, point.y, width, height);
						break;
					}
				}
				else if(border === 'right') {
					point = this.attachedElement.pointToWindow({ x: this.attachedElement.getLayoutWidth(), y: this.attachedElement.getLayoutHeight()/2 });
					if(this.contentBox.getMeasureWidth() + point.x + 10 < width) {
						this.setRight(point.x, point.y, width, height);
						break;
					}
				}
				else if(border === 'top') {
					point = this.attachedElement.pointToWindow({ x: this.attachedElement.getLayoutWidth()/2, y: 0 });
					if(this.contentBox.getMeasureHeight() + 10 < point.y) {
						this.setTop(point.x, point.y, width, height);
						break;
					}
				}
				else if(border === 'bottom') {
					point = this.attachedElement.pointToWindow({ x: this.attachedElement.getLayoutWidth()/2, y: this.attachedElement.getLayoutHeight() });
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
			borders = ['right', 'left', 'top', 'bottom', 'center'];
			if(this.attachedBorder !== undefined)
				borders.unshift(this.attachedBorder);
			for(i = 0; i < borders.length; i++) {
				border = borders[i];
				if(border === 'left') {				
					if(this.contentBox.getMeasureWidth() + 10 < this.posX) {
						this.setLeft(this.posX, this.posY, width, height);
						break;
					}
				}
				else if(border === 'right') {
					if(this.contentBox.getMeasureWidth() + this.posX + 10 < width) {
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

	setRight: function(x, y, width, height) {
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
		this.background.arrange(px - 10, py, this.contentBox.getMeasureWidth() + 10, this.contentBox.getMeasureHeight());
		this.contentBox.arrange(px, py, this.contentBox.getMeasureWidth(), this.contentBox.getMeasureHeight());
	},

	setLeft: function(x, y, width, height) {
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
		this.background.arrange(px, py - 10, this.contentBox.getMeasureWidth(), this.contentBox.getMeasureHeight() + 10);
		this.contentBox.arrange(px, py, this.contentBox.getMeasureWidth(), this.contentBox.getMeasureHeight());
	},

	setCenter: function(width, height) {
		this.background.setArrowBorder('none');

/*		if(this.expandable) {
			this.background.arrange(20, 20, width-40, height-40);
			this.shadow.setOpacity(1);
			this.contentBox.arrange(20, 20, width-40, height-40);
		}
		else {*/
			x = (width - this.contentBox.getMeasureWidth())/2;
			y = (height - this.contentBox.getMeasureHeight())/2;			
			this.background.arrange(x, y, this.contentBox.getMeasureWidth(), this.contentBox.getMeasureHeight());
			this.contentBox.arrange(x, y, this.contentBox.getMeasureWidth(), this.contentBox.getMeasureHeight());
//		}
	}
}, 
/**@lends Ui.Popup*/
{
	style: {
		background: '#f8f8f8',
		shadow: new Ui.Color({ r: 1, g: 1, b: 1, a: 0.1 })
	}
});

Ui.CanvasElement.extend('Ui.PopupBackground', 
/**@lends Ui.PopupBackground#*/
{
	radius: 8,
	fill: 'black',
	// [left|right|top|bottom|none]
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

	getArrowBorder: function() {
		return this.arrowBorder;
	},

	setArrowBorder: function(arrowBorder) {
		if(this.arrowBorder != arrowBorder) {
			this.arrowBorder = arrowBorder;
			this.invalidateArrange();
		}
	},

	getArrowOffset: function() {
		return this.arrowOffset;
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
		var v1; var v2;
		if(arrowBorder == 'none') {
			v1 = width - radius;
			v2 = height - radius;
			return 'M'+radius+',0 L'+v1+',0 Q'+width+',0 '+width+','+radius+' L'+width+','+v2+' Q'+width+','+height+' '+v1+','+height+' L'+radius+','+height+' Q0,'+height+' 0,'+v2+' L0,'+radius+' Q0,0 '+radius+',0 z';
		}
		else if(arrowBorder == 'left') {
			v1 = width - this.radius;
			v2 = height - this.radius;
			return 'M'+(radius+arrowSize)+',0 L'+v1+',0 Q'+width+',0 '+width+','+radius+' L'+width+','+v2+' Q'+width+','+height+' '+v1+','+height+' L'+(radius+arrowSize)+','+height+' Q'+arrowSize+','+height+' '+arrowSize+','+v2+' L'+arrowSize+','+(arrowOffset+arrowSize)+' L0,'+arrowOffset+' L'+arrowSize+','+(arrowOffset-arrowSize)+' L'+arrowSize+','+radius+' Q'+arrowSize+',0 '+(radius+arrowSize)+',0 z';
		}
		else if(arrowBorder == 'right') {
			v1 = width - (this.radius + arrowSize);
			v2 = height - this.radius;
			return 'M'+radius+',0 L'+v1+',0 Q'+(width - arrowSize)+',0 '+(width - arrowSize)+','+radius+' L'+(width - arrowSize)+','+(arrowOffset - arrowSize)+' L'+width+','+arrowOffset+' L'+(width - arrowSize)+','+(arrowOffset + arrowSize)+' L '+(width - arrowSize)+','+v2+' Q'+(width - arrowSize)+','+height+' '+v1+','+height+' L'+radius+','+height+' Q0,'+height+' 0,'+v2+' L0,'+radius+' Q0,0 '+radius+',0 z';
		}
		else if(arrowBorder == 'top') {
			v1 = width - this.radius;
			v2 = height - this.radius;
			return 'M'+radius+','+arrowSize+' L'+(arrowOffset - arrowSize)+','+arrowSize+' L'+arrowOffset+',0 L'+(arrowOffset + arrowSize)+','+arrowSize+' L'+v1+','+arrowSize+' Q'+width+','+arrowSize+' '+width+','+(arrowSize + radius)+' L'+width+','+v2+' Q'+width+','+height+' '+v1+','+height+' L'+radius+','+height+' Q0,'+height+' 0,'+v2+' L0,'+(arrowSize+radius)+' Q0,'+arrowSize+' '+radius+','+arrowSize+' z';
		}
		else if(arrowBorder == 'bottom') {
			v1 = width - this.radius;
			v2 = height - (this.radius + arrowSize);
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
			ctx.svgPath(this.genPath(width, height, this.radius, this.arrowBorder, this.arrowSize, this.arrowOffset));
			ctx.fill();
			ctx.save();
			ctx.fillStyle = 'rgba(0,0,0,0.5)';
			ctx.translate(1,1);
			ctx.svgPath(this.genPath(width-2, height-2, this.radius-1, this.arrowBorder, this.arrowSize-1, this.arrowOffset-1));
			ctx.fill();
			ctx.restore();
			ctx.fillStyle = this.fill.getCssRgba();
			ctx.translate(2,2);
			ctx.svgPath(this.genPath(width-4, height-4, this.radius-2, this.arrowBorder, this.arrowSize-1, this.arrowOffset-2));
			ctx.fill();
		}
	}
});

Ui.Popup.extend('Ui.MenuPopup', {});

Ui.Separator.extend('Ui.MenuPopupSeparator', {});

