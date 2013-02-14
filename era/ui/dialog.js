
Ui.Container.extend('Ui.Dialog', {
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

	constructor: function(config) {
		this.addEvents('close');

		this.bg = new Ui.Rectangle({ fill: '#ffffff', opacity: 0.5 });
		this.appendChild(this.bg);

//		this.lbox = new Ui.LBox({ verticalAlign: 'center', horizontalAlign: 'center', margin: 20 });
		this.lbox = new Ui.LBox();
		this.appendChild(this.lbox);

		this.lbox.append(new Ui.Shadow({ shadowWidth: 5, radius: 2, inner: false, opacity: 0.3 }));
		this.lbox.append(new Ui.Rectangle({ fill: '#f8f8f8', margin: 3 }));

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
//		this.vbox.append(this.contentBox, true);

		this.buttonsBox = new Ui.VBox();

		this.buttonsBox.append(new Ui.Rectangle({ height: 1, fill: '#d8d8d8' }));

		lbox = new Ui.LBox({ height: 32 });
		this.buttonsBox.append(lbox);

		lbox.append(new Ui.Rectangle({ fill: '#e8e8e8' }));

		var hbox = new Ui.HBox({ margin: 5, spacing: 30 });
		lbox.append(hbox);

		this.cancelBox = new Ui.LBox();
		hbox.append(this.cancelBox);

		this.actionButtonsBox = new Ui.HBox({ uniform: true, horizontalAlign: 'right' });
		hbox.append(this.actionButtonsBox, true);
		
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

