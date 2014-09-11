
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
	cancelBox: undefined,
	actionButtonsBox: undefined,
	titleLabel: undefined,
	
	constructor: function(config) {
		this.addEvents('cancel');

		this.bg = new Ui.Rectangle();
		this.append(this.bg);

		this.actionBox = new Ui.HBox({ margin: 5, spacing: 10 });
		this.append(this.actionBox);

		this.cancelBox = new Ui.LBox();
		this.actionBox.append(this.cancelBox);

		this.actionButtonsBox = new Ui.MenuToolBar({ spacing: 5 });
		this.actionBox.append(this.actionButtonsBox, true);

		this.titleLabel = new Ui.DialogTitle({ width: 50, verticalAlign: 'center' });
		this.actionButtonsBox.append(this.titleLabel, true);
	},

	setTitle: function(title) {
		this.titleLabel.setText(title);
	},

	setCancelButton: function(button) {
		var old = this.cancelBox.getFirstChild();
		if((old !== undefined) && Ui.Pressable.hasInstance(old))
			this.disconnect(old, 'press', this.onCancelPress);
		
		this.cancelBox.setContent(button);
		var newbutton = this.cancelBox.getFirstChild();
		if((newbutton !== undefined) && Ui.Pressable.hasInstance(newbutton))
			this.connect(newbutton, 'press', this.onCancelPress);
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
		Ui.App.current.appendDialog(this);
	},

	close: function() {
		Ui.App.current.removeDialog(this);
		this.fireEvent('close', this);
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

/*		this.title = title;

		if(((this.title === '') || (this.title === undefined))  && (this.titleLabel !== undefined)) {
			this.contentVBox.remove(this.titleLabel);
			this.titleLabel = undefined;
		}
		else {
			if(this.titleLabel === undefined) {
				this.titleLabel = new Ui.Label({ horizontalAlign: 'left', margin: 10, fontWeight: 'bold', fontSize: 18, color: '#666666' });
				this.contentVBox.prepend(this.titleLabel);
			}
			this.titleLabel.setText(this.title);
		}*/
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
		this.shadow.arrange(0, 0, width, height);
		var usedWidth = Math.max((width < this.preferredWidth)?width:this.preferredWidth, this.lbox.getMeasureWidth());		
		var usedHeight = Math.max((height < this.preferredHeight)?height:this.preferredHeight, this.lbox.getMeasureHeight());
		this.lbox.arrange((width-usedWidth)/2, (height-usedHeight)/2, usedWidth, usedHeight);
	}
}, {
	style: {
		shadow: 'rgba(255,255,255,0.7)',
		background: '#f8f8f8'
	}
});

