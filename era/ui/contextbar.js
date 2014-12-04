
Ui.Button.extend('Ui.ContextBarCloseButton', {}, {}, {
	style: {
		textWidth: 5,
		borderWidth: 0,
		background: 'rgba(250,250,250,0)'
	}
});

Ui.LBox.extend('Ui.ContextBar', {
	bg: undefined,
	selection: undefined,
	actionsBox: undefined,
	closeButton: undefined,

	constructor: function(config) {
		this.selection = config.selection;
		delete(config.selection);

		this.bg = new Ui.Rectangle();
		this.append(this.bg);

		var hbox = new Ui.HBox({ spacing: 5 });
		this.append(hbox);
		
		this.closeButton = new Ui.ContextBarCloseButton({ icon: 'backarrow' });
		hbox.append(this.closeButton);
		this.connect(this.closeButton, 'press', this.onClosePress);

		
		this.actionsBox = new Ui.MenuToolBar({ spacing: 5, menuPosition: 'left', itemsAlign: 'right' });
		hbox.append(this.actionsBox, true);
		
		this.connect(this.selection, 'change', this.onSelectionChange);
	},
	
	onClosePress: function() {
		this.selection.clear();
	},
	
	onSelectionChange: function() {
		this.closeButton.setText(this.selection.getElements().length);
		var actions = this.selection.getActions();
		
		this.actionsBox.clear();
		for(var actionName in actions) {
			var action = actions[actionName];
			if(action.hidden === true)
				continue;
			//console.log(this+'.onSelectionChange mimetype: '+this.selection.getElements()[0].getMimetype());
			var button = new Ui.ActionButton({ icon: action.icon, text: action.text, action: action, selection: this.selection });
			button.addType(this.selection.getElements()[0].constructor, 'move');
			this.actionsBox.append(button);
		}
	},

	onDrop: function(dropbox) {	
		var action = dropbox.dialogContextBarAction;
		var scope = this;
		if('scope' in action)
			scope = action.scope;
		action.callback.call(scope, this.selection);
	}
}, {
	onStyleChange: function() {
		this.bg.setFill(this.getStyleProperty('background'));
	}
}, {
	style: {
		background: '#cdf'
	}
});
