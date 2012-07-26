
Ui.LBox.extend('Ui.Dialog', {
	lbox: undefined,
	vbox: undefined,
	titleLabel: undefined,
	contentBox: undefined,
	actionButtons: undefined,
	cancelBox: undefined,

	constructor: function(config) {
		this.append(new Ui.Rectangle({ fill: '#ffffff', opacity: 0.5 }));

		this.lbox = new Ui.LBox({ verticalAlign: 'center', horizontalAlign: 'center', margin: 20 });
		this.append(this.lbox);

		this.lbox.append(new Ui.Shadow({ shadowWidth: 5, radius: 6, inner: false, opacity: 0.3 }));
		this.lbox.append(new Ui.Rectangle({ radius: 3, fill: '#f8f8f8', margin: 3 }));

		this.vbox = new Ui.VBox({ margin: 3 });
		this.lbox.append(this.vbox);

		this.contentBox = new Ui.LBox({ margin: 10 });
		this.vbox.append(this.contentBox, true);

		this.vbox.append(new Ui.Rectangle({ height: 1, fill: '#d8d8d8' }));

		lbox = new Ui.LBox({ height: 32 });
		this.vbox.append(lbox);

		lbox.append(new Ui.Rectangle({ radiusBottomLeft: 3, radiusBottomRight: 3, fill: '#e8e8e8' }));

		var hbox = new Ui.HBox({ margin: 5, spacing: 30 });
		lbox.append(hbox);

		this.cancelBox = new Ui.LBox();
		hbox.append(this.cancelBox);

		this.actionButtons = new Ui.HBox({ uniform: true, horizontalAlign: 'right' });
		hbox.append(this.actionButtons, true);
		
	},

	open: function() {
		Ui.AppUtil.current.appendDialog(this);
	},

	close: function() {
		Ui.AppUtil.current.removeDialog(this);
	},

	setTitle: function(title) {
		this.title = title;

		if(((this.title == '') || (this.title === undefined))  && (this.titleLabel !== undefined)) {
			this.vbox.remove(this.titleLabel);
			this.titleLabel = undefined;
		}
		else {
			if(this.titleLabel === undefined) {
				this.titleLabel = new Ui.Label({ horizontalAlign: 'left', margin: 10, fontWeight: 'bold', fontSize: 18, color: '#666666' });
				this.vbox.prepend(this.titleLabel);
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
	},

	setActionButtons: function(buttons) {
		this.actionButtons.setContent(buttons);
	},

	onCancelPress: function() {
		this.close();
	}

}, {
	setContent: function(content) {
		this.contentBox.setContent(content);
	}
});

