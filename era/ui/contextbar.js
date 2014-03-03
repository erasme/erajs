
Ui.LBox.extend('Ui.ContextBar', {
	selection: undefined,
	counter: undefined,
	actionsBox: undefined,
	bg: undefined,
	
	constructor: function(config) {
		this.selection = config.selection;
		delete(config.selection);

		this.bg = new Ui.Rectangle();
		this.append(this.bg);
		
		var hbox = new Ui.HBox({ spacing: 5 });
		this.append(hbox);
		
		var closeButton = new Ui.Pressable({ margin: 5 });
		closeButton.setContent(
			new Ui.Icon({ icon: 'close', width: 25, height: 25, verticalAlign: 'center' })
		);
		hbox.append(closeButton);
		this.connect(closeButton, 'press', this.onClosePress);
		
		this.counter = new Ui.Label({
			horizontalAlign: 'center', verticalAlign: 'center', fontSize: 24
		});
		hbox.append(this.counter);
		
		this.actionsBox = new Ui.MenuToolBar({ spacing: 5, menuPosition: 'left', itemsAlign: 'right', uniform: true });
		hbox.append(this.actionsBox, true);
		
		this.connect(this.selection, 'change', this.onSelectionChange);
	},
	
	onClosePress: function() {
		this.selection.clear();
	},
	
	onSelectionChange: function() {
		this.counter.setText(this.selection.getElements().length);
		
		var actions = this.selection.getActions();
		
		this.actionsBox.clear();
		for(var actionName in actions) {
			var action = actions[actionName];
			if(action.hidden === true)
				continue;
			//console.log(this+'.onSelectionChange mimetype: '+this.selection.getElements()[0].getMimetype());
			var button = new Ui.ActionButton({ icon: action.icon, text: action.text, action: action, selection: this.selection });
			button.addMimetype(this.selection.getElements()[0].getMimetype());
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
		background: '#90C0FF'
	}
});
