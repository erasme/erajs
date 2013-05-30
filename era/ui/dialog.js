
Ui.CanvasElement.extend('Ui.DialogGraphic', {}, {
	updateCanvas: function(ctx) {	
		var w = this.getLayoutWidth();
		var h = this.getLayoutHeight();

		// shadow
		this.roundRectFilledShadow(0, 0, w, h, 2, 2, 2, 2, false, 3, new Ui.Color({ a: 0.3 }));

		// content background
		ctx.fillStyle = '#f8f8f8';
		ctx.fillRect(3, 3, w-6, h-6);
	}
});

Ui.HBox.extend('Ui.DialogContextBar', {
	selection: undefined,
	counter: undefined,
	actionsBox: undefined,
	
	constructor: function(config) {
		this.selection = config.selection;
		delete(config.selection);
		
		this.setSpacing(5);
		
		var closeButton = new Ui.Pressable({ margin: 10 });
		closeButton.setContent(
			new Ui.Icon({ icon: 'close', width: 30, height: 30, verticalAlign: 'center', fill: '#444444' })
		);
		this.append(closeButton);
		this.connect(closeButton, 'press', this.onClosePress);
		
		var lbox = new Ui.LBox({ width: 30 });
		this.append(lbox);
		this.counter = new Ui.Label({
			horizontalAlign: 'center', verticalAlign: 'center', fontSize: 24, color: '#444444'
		});
		lbox.setContent(this.counter);
		
		var sep = new Ui.Separator({ width: 1 });
		this.append(sep);
		
		this.actionsBox = new Ui.HBox({ uniform: true, spacing: 5, horizontalAlign: 'right' });
		this.append(this.actionsBox, true);
		
		this.connect(this.selection, 'change', this.onSelectionChange);
	},
	
	onClosePress: function() {
		console.log(this+'.onClosePress '+this.selection);
		this.selection.clear();
	},
	
	onSelectionChange: function() {
		this.counter.setText(this.selection.getElements().length);
		
		var actions = this.selection.getActions();
		
		this.actionsBox.setContent(undefined);
		var first = true;
		for(var actionName in actions) {
			var action = actions[actionName];
			if(action.hidden === true)
				continue;
			var dropbox = new Ui.DropBox();
			
			var pressable = new Ui.Pressable({ margin: 10 });
			dropbox.setContent(pressable);
			pressable.dialogContextBarAction = action;
			this.connect(pressable, 'press', this.onActionPress);
			var hbox = new Ui.HBox({ spacing: 5 });
			pressable.setContent(hbox);
			if(first)
				first = false;
			else
				hbox.append(new Ui.Separator({ width: 1 }));
			var color;
			if('color' in action)
				color = Ui.Color.create(action.color);
			else
			 	color = Ui.Color.create('#444444');
			hbox.append(new Ui.Icon({ icon: action.icon, width: 30, height: 30, verticalAlign: 'center', fill: color }));
			hbox.append(new Ui.Label({ text: action.text, horizontalAlign: 'center', verticalAlign: 'center', fontWeight: 'bold', color: color }));
			this.actionsBox.append(dropbox);
		}
	},
	
	onActionPress: function(pressable) {
		var action = pressable.dialogContextBarAction;
		var scope = this;
		if('scope' in action)
			scope = action.scope;
		action.callback.call(scope, this.selection);
	}
});

Ui.Container.extend('Ui.Dialog', {
	dialogSelection: undefined,
	bg: undefined,
	lbox: undefined,
	vbox: undefined,
	titleLabel: undefined,
	contentBox: undefined,
	contentVBox: undefined,
	actionButtonsBox: undefined,
	actionButtons: undefined,
	cancelBox: undefined,
	buttonsBox: undefined,
	buttonsVisible: false,
	preferedWidth: 100,
	preferedHeight: 100,
	actionBox: undefined,
	contextBox: undefined,

	constructor: function(config) {
		this.addEvents('close');

		this.dialogSelection = new Ui.Selection();

		this.bg = new Ui.Rectangle({ fill: 'rgba(255,255,255,0.5)' });
		this.appendChild(this.bg);

		this.lbox = new Ui.LBox();
		this.appendChild(this.lbox);

		this.lbox.append(new Ui.DialogGraphic());

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

		lbox = new Ui.LBox({ height: 32 });
		this.buttonsBox.append(lbox);

		this.actionBg = new Ui.Rectangle({ fill: '#e8e8e8' });
		lbox.append(this.actionBg);

		this.contextBox = new Ui.DialogContextBar({ selection: this.dialogSelection });
		this.contextBox.hide();
		lbox.append(this.contextBox);
		

		this.actionBox = new Ui.HBox({ margin: 5, spacing: 30 });
		lbox.append(this.actionBox);

		this.cancelBox = new Ui.LBox();
		this.actionBox.append(this.cancelBox);

		this.actionButtonsBox = new Ui.HBox({ uniform: true, horizontalAlign: 'right' });
		this.actionBox.append(this.actionButtonsBox, true);
		
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

	setCancelButton: function(button) {
		var old = this.cancelBox.getFirstChild();
		if((old != undefined) && Ui.Pressable.hasInstance(old))
			this.disconnect(old, 'press', this.onCancelPress);

		this.cancelBox.setContent(button);
		var newbutton = this.cancelBox.getFirstChild();
		if((newbutton != undefined) && Ui.Pressable.hasInstance(newbutton))
			this.connect(newbutton, 'press', this.onCancelPress);

		if(button != undefined) {
			if(!this.buttonsVisible) {
				this.buttonsVisible = true;
				this.vbox.append(this.buttonsBox);
			}
		}
		else {
			if(this.buttonsVisible) {
				if((this.actionButtons == undefined) || (this.actionButtons.length == 0)) {
					this.buttonsVisible = false;
					this.vbox.remove(this.buttonsBox);
				}
			}
		}
	},

	setActionButtons: function(buttons) {
		this.actionButtonsBox.setContent(buttons);
		if((buttons != undefined) && (buttons.length > 0)) {
			if(!this.buttonsVisible) {
				this.buttonsVisible = true;
				this.vbox.append(this.buttonsBox);
			}
		}
		else {
			if((this.buttonsVisible) && (this.cancelBox.getFirstChild() == undefined)) {
					this.buttonsVisible = false;
					this.vbox.remove(this.buttonsBox);				
			}
		}
	},

	setContent: function(content) {
		this.contentBox.setContent(content);
	},

	onCancelPress: function() {
		this.close();
	},
	
	onDialogSelectionChange: function(selection) {
		if(selection.getElements().length === 0) {
			this.actionBg.setFill('#e8e8e8');
			this.contextBox.hide();
			this.actionBox.show();
		}
		else {
			this.actionBg.setFill('#d8d8d8');
			this.contextBox.show();
			this.actionBox.hide();
		}
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
});

