
Ui.CanvasElement.extend('Ui.DialogGraphic', {
	background: undefined,

	constructor: function() {
		this.background = Ui.Color.create('#f8f8f8');
	},

	setBackground: function(color) {
		this.background = Ui.Color.create(color);
		this.invalidateDraw();
	}
}, {
	updateCanvas: function(ctx) {	
		var w = this.getLayoutWidth();
		var h = this.getLayoutHeight();

		// shadow
		this.roundRectFilledShadow(0, 0, w, h, 2, 2, 2, 2, false, 3, new Ui.Color({ a: 0.3 }));

		// content background
		ctx.fillStyle = this.background.getCssRgba();
		ctx.fillRect(3, 3, w-6, h-6);
	}
});

Ui.LBox.extend('Ui.DialogButtonBox', {
	bg: undefined,
	actionBox: undefined,
	cancelBox: undefined,
	actionButtonsBox: undefined,
	
	constructor: function(config) {
		this.addEvents('cancel');

		this.bg = new Ui.Rectangle({ fill: '#e8e8e8' });
		this.append(this.bg);

		this.actionBox = new Ui.HBox({ margin: 5, spacing: 30 });
		this.append(this.actionBox);

		this.cancelBox = new Ui.LBox();
		this.actionBox.append(this.cancelBox);

		this.actionButtonsBox = new Ui.MenuToolBar({ spacing: 5, itemsAlign: 'right', menuPosition: 'left', uniform: true });
		this.actionBox.append(this.actionButtonsBox, true);
	},
	
	setCancelButton: function(button) {
		var old = this.cancelBox.getFirstChild();
		if((old !== undefined) && Ui.Pressable.hasInstance(old))
			this.disconnect(old, 'press', this.onCancelPress);
		
		this.cancelBox.setContent(button);
		var newbutton = this.cancelBox.getFirstChild();
		if((newbutton != undefined) && Ui.Pressable.hasInstance(newbutton))
			this.connect(newbutton, 'press', this.onCancelPress);
	},

	setActionButtons: function(buttons) {
		this.actionButtonsBox.setContent(buttons);
	},

	onCancelPress: function() {
		this.fireEvent('cancel', this);
	}
});

Ui.Container.extend('Ui.Dialog', {
	dialogSelection: undefined,
	bg: undefined,
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
	preferedWidth: 100,
	preferedHeight: 100,
	actionBox: undefined,
	contextBox: undefined,

	constructor: function(config) {
		this.addEvents('close');

		this.dialogSelection = new Ui.Selection();

		this.bg = new Ui.Rectangle({ fill: 'rgba(255,255,255,0.7)' });
		this.appendChild(this.bg);

		this.lbox = new Ui.LBox();
		this.appendChild(this.lbox);

		this.graphic = new Ui.DialogGraphic();
		this.lbox.append(this.graphic);

		this.vbox = new Ui.VBox({ margin: 3 });
		this.lbox.append(this.vbox);

		this.scroll = new Ui.ScrollingArea({ marginLeft: 2, marginTop: 2, marginRight: 2 });
		this.scroll.setScrollHorizontal(false);
		this.scroll.setScrollVertical(false);
		this.vbox.append(this.scroll, true);
		
		this.contentVBox = new Ui.VBox();
		this.scroll.setContent(this.contentVBox);
		
		this.contentBox = new Ui.LBox({ margin: 8 });
		this.contentVBox.append(this.contentBox, true);

		this.buttonsBox = new Ui.VBox();
		this.buttonsBox.append(new Ui.Rectangle({ height: 1, fill: '#d8d8d8' }));

		var lbox = new Ui.LBox({ height: 32 });
		this.buttonsBox.append(lbox);
		this.buttonsBox.hide(true);
		this.vbox.append(this.buttonsBox);

		this.contextBox = new Ui.ContextBar({ selection: this.dialogSelection });
		this.contextBox.hide();
		lbox.append(this.contextBox);

		this.actionBox = new Ui.DialogButtonBox();
		this.connect(this.actionBox, 'cancel', this.close);
		lbox.append(this.actionBox);

		this.connect(this.dialogSelection, 'change', this.onDialogSelectionChange);

		// handle keyboard		
		this.connect(this.getDrawing(), 'keydown', this.onKeyDown);
	},

	// implement a selection handler for Selectionable elements
	getSelectionHandler: function() {
		return this.dialogSelection;
	},

	setPreferedWidth: function(width) {
		this.preferedWidth = width;
		this.invalidateMeasure();
	},

	setPreferedHeight: function(height) {
		this.preferedHeight = height;
		this.invalidateMeasure();
	},

	open: function() {
		Ui.App.current.appendDialog(this);
	},

	close: function() {
		Ui.App.current.removeDialog(this);
		this.fireEvent('close', this);
	},

	setFullScrolling: function(fullScrolling) {
		this.scroll.setScrollHorizontal(fullScrolling);
		this.scroll.setScrollVertical(fullScrolling);	
	},

	setTitle: function(title) {
		this.title = title;

		if(((this.title == '') || (this.title === undefined))  && (this.titleLabel !== undefined)) {
			this.contentVBox.remove(this.titleLabel);
			this.titleLabel = undefined;
		}
		else {
			if(this.titleLabel === undefined) {
				this.titleLabel = new Ui.Label({ horizontalAlign: 'left', margin: 10, fontWeight: 'bold', fontSize: 18, color: '#666666' });
				this.contentVBox.prepend(this.titleLabel);
			}
			this.titleLabel.setText(this.title);
		}
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

	onCancelPress: function() {
		this.close();
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
	}
	
}, {
	onStyleChange: function() {
		this.bg.setFill(this.getStyleProperty('shadow'));
		this.graphic.setBackground(this.getStyleProperty('background'));
	},

	measureCore: function(width, height) {
		this.bg.measure(width, height);
		this.lbox.measure((width < this.preferedWidth)?width:this.preferedWidth,
			(height < this.preferedHeight)?height:this.preferedHeight);
		return { width: width, height: height };
	},

	//
	// Arrange children
	//
	arrangeCore: function(width, height) {
		this.bg.arrange(0, 0, width, height);
		var usedWidth = Math.max((width < this.preferedWidth)?width:this.preferedWidth, this.lbox.getMeasureWidth());		
		var usedHeight = Math.max((height < this.preferedHeight)?height:this.preferedHeight, this.lbox.getMeasureHeight());
		this.lbox.arrange((width-usedWidth)/2, (height-usedHeight)/2, usedWidth, usedHeight);
	}
}, {
	style: {
		shadow: 'rgba(255,255,255,0.7)',
		background: '#f8f8f8'
	}
});

