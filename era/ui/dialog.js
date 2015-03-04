
Ui.Button.extend('Ui.DialogCloseButton', {
	constructor: function() {
		this.setIcon('backarrow');
		this.setText('Fermer');
	}
}, {}, {
	style: {
		showText: false,
		background: 'rgba(250,250,250,0)',
		backgroundBorder: 'rgba(250,250,250,0)',
		activeBackground: 'rgba(250,250,250,0)',
		activeBackgroundBorder: 'rgba(250,250,250,0)'
	}
});

Ui.CanvasElement.extend('Ui.DialogGraphic', {
	background: undefined,

	constructor: function() {
		this.background = Ui.Color.create('#f8f8f8');
	}
	
}, {
	setBackground: function(color) {
		this.background = Ui.Color.create(color);
		this.invalidateDraw();
	},

	updateCanvas: function(ctx) {	
		var w = this.getLayoutWidth();
		var h = this.getLayoutHeight();

		// shadow
		ctx.roundRectFilledShadow(0, 0, w, h, 2, 2, 2, 2, false, 3, new Ui.Color({ a: 0.3 }));

		// content background
		ctx.fillStyle = this.background.getCssRgba();
		ctx.fillRect(3, 3, w-6, h-6);
	}
});

Ui.CompactLabel.extend('Ui.DialogTitle', {}, {}, {
	style: {
		color: '#666666',
		textAlign: 'left',
		fontWeight: 'bold',
		fontSize: 18,
		maxLine: 2
	}
});

Ui.LBox.extend('Ui.DialogButtonBox', {
	bg: undefined,
	actionBox: undefined,
	cancelButton: undefined,
	actionButtonsBox: undefined,
	titleLabel: undefined,
	
	constructor: function(config) {
		this.addEvents('cancel');

		this.bg = new Ui.Rectangle();
		this.append(this.bg);

		this.actionBox = new Ui.HBox({ margin: 5, spacing: 10 });
		this.append(this.actionBox);

		this.actionButtonsBox = new Ui.MenuToolBar({ spacing: 5 });
		this.actionBox.append(this.actionButtonsBox, true);

		this.titleLabel = new Ui.DialogTitle({ width: 50, verticalAlign: 'center' });
		this.actionButtonsBox.append(this.titleLabel, true);
	},

	setTitle: function(title) {
		this.titleLabel.setText(title);
	},

	setCancelButton: function(button) {
		if(this.cancelButton !== undefined) {
			if(Ui.Pressable.hasInstance(this.cancelButton))
				this.disconnect(this.cancelButton, 'press', this.onCancelPress);
			this.actionBox.remove(this.cancelButton);
		}
		this.cancelButton = button;
		if(this.cancelButton !== undefined) {
			if(Ui.Pressable.hasInstance(this.cancelButton))
				this.connect(this.cancelButton, 'press', this.onCancelPress);
			this.actionBox.prepend(this.cancelButton);
		}
	},

	setActionButtons: function(buttons) {
		this.actionButtonsBox.setContent(buttons);
		this.actionButtonsBox.prepend(this.titleLabel, true);
	},

	getActionButtons: function() {
		var buttons = [];
		for(var i = 1; i < this.actionButtonsBox.getLogicalChildren().length; i++)
			buttons.push(this.actionButtonsBox.getLogicalChildren()[i]);
		return buttons;
	},

	onCancelPress: function() {
		this.fireEvent('cancel', this);
	}
}, {
	onStyleChange: function() {
		this.bg.setFill(this.getStyleProperty('background'));
	}
}, {
	style: {
		background: '#e8e8e8'
	}
});

Ui.Container.extend('Ui.Dialog', {
	dialogSelection: undefined,
	shadow: undefined,
	shadowGraphic: undefined,
	graphic: undefined,
	lbox: undefined,
	vbox: undefined,
	titleLabel: undefined,
	contentBox: undefined,
	contentVBox: undefined,
	actionButtons: undefined,
	cancelButton: undefined,
	buttonsBox: undefined,
	buttonsVisible: false,
	preferredWidth: 100,
	preferredHeight: 100,
	actionBox: undefined,
	contextBox: undefined,
	autoClose: true,
	openClock: undefined,
	isClosed: true,

	constructor: function(config) {
		this.addEvents('close');

		this.dialogSelection = new Ui.Selection();

		this.shadow = new Ui.Pressable({ focusable: false });
		this.shadow.getDrawing().style.cursor = 'inherit';
		this.appendChild(this.shadow);

		this.shadowGraphic = new Ui.Rectangle();
		this.shadow.setContent(this.shadowGraphic);

		this.lbox = new Ui.Form();
		this.connect(this.lbox, 'submit', this.onFormSubmit);
		this.appendChild(this.lbox);

		this.graphic = new Ui.DialogGraphic();
		this.lbox.append(this.graphic);

		this.vbox = new Ui.VBox({ margin: 3 });
		this.lbox.append(this.vbox);

		this.buttonsBox = new Ui.LBox({ height: 32 });
		this.buttonsBox.hide(true);
		this.vbox.append(this.buttonsBox);

		this.scroll = new Ui.ScrollingArea({ marginLeft: 2, marginTop: 2, marginRight: 2 });
		this.scroll.setScrollHorizontal(false);
		this.scroll.setScrollVertical(false);
		this.vbox.append(this.scroll, true);
		
		this.contentVBox = new Ui.VBox();
		this.scroll.setContent(this.contentVBox);
		
		this.contentBox = new Ui.LBox({ margin: 8 });
		this.contentVBox.append(this.contentBox, true);

		this.contextBox = new Ui.ContextBar({ selection: this.dialogSelection });
		this.contextBox.hide();
		this.buttonsBox.append(this.contextBox);

		this.actionBox = new Ui.DialogButtonBox();
		this.connect(this.actionBox, 'cancel', this.close);
		this.buttonsBox.append(this.actionBox);

		this.connect(this.dialogSelection, 'change', this.onDialogSelectionChange);

		// handle keyboard		
		this.connect(this.getDrawing(), 'keydown', this.onKeyDown);

		// handle auto hide
		this.connect(this.shadow, 'press', this.onShadowPress);
	},

	// implement a selection handler for Selectionable elements
	getSelectionHandler: function() {
		return this.dialogSelection;
	},

	setPreferredWidth: function(width) {
		this.preferredWidth = width;
		this.invalidateMeasure();
	},

	setPreferredHeight: function(height) {
		this.preferredHeight = height;
		this.invalidateMeasure();
	},

	open: function() {
		if(this.isClosed) {
			Ui.App.current.appendDialog(this);
			this.isClosed = false;

			if(this.openClock === undefined) {
				this.openClock = new Anim.Clock({ duration: 1, target: this, speed: 5 });
				this.openClock.setEase(new Anim.PowerEase({ mode: 'out' }));
				this.connect(this.openClock, 'timeupdate', this.onOpenTick);
				// set the initial state
				this.onOpenTick(this.openClock, 0, 0);
				// the start of the animation is delayed to the next arrange
			}
		}
	},

	close: function() {
		if(!this.isClosed) {
			// the removal of the dialog is delayed to the end of the animation
			this.fireEvent('close', this);

			this.isClosed = true;
			this.lbox.disable();

			if(this.openClock === undefined) {
				this.openClock = new Anim.Clock({ duration: 1, target: this, speed: 5 });
				this.openClock.setEase(new Anim.PowerEase({ mode: 'out' }));
				this.connect(this.openClock, 'timeupdate', this.onOpenTick);
				this.openClock.begin();
			}
		}
	},

	onOpenTick: function(clock, progress, delta) {
		var end = (progress >= 1);

		if(this.isClosed)
			progress = 1 - progress;
		this.shadow.setOpacity(progress);
		this.lbox.setOpacity(progress);
		this.lbox.setTransform(Ui.Matrix.createTranslate(0, -20 * (1-progress)));

		if(end) {
			this.openClock.stop();
			this.openClock = undefined;
			if(this.isClosed) {
				Ui.App.current.removeDialog(this);
				this.lbox.enable();
			}
		}
	},

	getDefaultButton: function() {
		var buttons = this.actionBox.getActionButtons();
		var defaultButton;
		for(var i = 0; (defaultButton === undefined) && (i < buttons.length); i++)
			if(Ui.DefaultButton.hasInstance(buttons[i]))
				defaultButton = buttons[i];
		return defaultButton;
	},

	defaultAction: function() {
		var defaultButton = this.getDefaultButton();
		if(defaultButton !== undefined)
			defaultButton.press();
	},

	setFullScrolling: function(fullScrolling) {
		this.scroll.setScrollHorizontal(fullScrolling);
		this.scroll.setScrollVertical(fullScrolling);	
	},

	setTitle: function(title) {
		this.actionBox.setTitle(title);
	},

	updateButtonsBoxVisible: function() {
		var visible = (this.cancelButton !== undefined) || (this.actionButtons !== undefined) ||
			(this.dialogSelection.getElements().length > 0);
		
		if(!this.buttonsVisible && visible) {
			this.buttonsVisible = true;
			this.buttonsBox.show();
		}
		else if(this.buttonsVisible && !visible) {
			this.buttonsVisible = false;
			this.buttonsBox.hide(true);
		}
	},
	
	setCancelButton: function(button) {
		this.cancelButton = button;
		this.actionBox.setCancelButton(button);
		this.updateButtonsBoxVisible();
	},

	setActionButtons: function(buttons) {
		this.actionButtons = buttons;
		this.actionBox.setActionButtons(buttons);
		this.updateButtonsBoxVisible();
	},

	setContent: function(content) {
		this.contentBox.setContent(content);
	},

	getContent: function() {
		return this.contentBox.getFirstChild();
	},

	setAutoClose: function(autoClose) {
		this.autoClose = autoClose;
	},

	onCancelPress: function() {
		this.close();
	},

	onFormSubmit: function() {
		this.defaultAction();
	},
	
	onDialogSelectionChange: function(selection) {
		if(selection.getElements().length === 0) {
			this.contextBox.hide();
			this.actionBox.show();
		}
		else {
			this.contextBox.show();
			this.actionBox.hide();
		}
		this.updateButtonsBoxVisible();
	},
	
	onKeyDown: function(event) {
		// delete key
		if(event.which === 46) {
			// selection is not empty
			if(this.dialogSelection.getElements().length !== 0) {
				if(this.dialogSelection.executeDeleteAction()) {
					event.preventDefault();
					event.stopPropagation();
				}
			}
		}
	},

	onShadowPress: function() {
		if(this.autoClose)
			this.close();
	}
	
}, {
	onStyleChange: function() {
		this.shadowGraphic.setFill(this.getStyleProperty('shadow'));
		this.graphic.setBackground(this.getStyleProperty('background'));
	},

	onChildInvalidateMeasure: function(child, type) {
		// Ui.Dialog is a layout root and can handle layout (measure/arrange) for its children
		this.invalidateLayout();
	},

	onChildInvalidateArrange: function(child) {
		// Ui.Dialog is a layout root and can handle layout (measure/arrange) for its children
		this.invalidateLayout();
	},

	measureCore: function(width, height) {
		this.shadow.measure(width, height);
		this.lbox.measure((width < this.preferredWidth)?width:this.preferredWidth,
			(height < this.preferredHeight)?height:this.preferredHeight);
		return { width: width, height: height };
	},

	//
	// Arrange children
	//
	arrangeCore: function(width, height) {
		// the delayed open animation
		if((this.openClock !== undefined) && !this.openClock.getIsActive())
			this.openClock.begin();

		this.shadow.arrange(0, 0, width, height);
		var usedWidth = Math.max((width < this.preferredWidth)?width:this.preferredWidth, this.lbox.getMeasureWidth());		
		var usedHeight = Math.max((height < this.preferredHeight)?height:this.preferredHeight, this.lbox.getMeasureHeight());
		this.lbox.arrange((width-usedWidth)/2, (height-usedHeight)/2, usedWidth, usedHeight);
	}
}, {
	style: {
		shadow: 'rgba(255,255,255,0.1)',
		background: '#f8f8f8'
	}
});

