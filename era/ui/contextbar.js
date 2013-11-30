
Ui.LBox.extend('Ui.ContextBar', {
	selection: undefined,
	counter: undefined,
	actionsBox: undefined,
	
	constructor: function(config) {
		this.selection = config.selection;
		delete(config.selection);
		
		this.append(new Ui.Rectangle({ fill: '#1070FF', opacity: 0.2 }));
		
		var hbox = new Ui.HBox({ spacing: 5 });
		this.append(hbox);
		
		var closeButton = new Ui.Pressable({ margin: 5 });
		closeButton.setContent(
			new Ui.Icon({ icon: 'close', width: 30, height: 30, verticalAlign: 'center', fill: '#444444' })
		);
		hbox.append(closeButton);
		this.connect(closeButton, 'press', this.onClosePress);
		
		this.counter = new Ui.Label({
			horizontalAlign: 'center', verticalAlign: 'center', fontSize: 24, color: '#444444'
		});
		hbox.append(this.counter);
		
		this.actionsBox = new Ui.MenuToolBar({ spacing: 5, menuPosition: 'left', itemsAlign: 'right', uniform: true });
		hbox.append(this.actionsBox, true);
		
		this.connect(this.selection, 'change', this.onSelectionChange);
	},
	
	onClosePress: function() {
		//console.log(this+'.onClosePress '+this.selection);
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
			var dropbox = new Ui.DropBox();
			dropbox.dialogContextBarAction = action;
			dropbox.addMimetype(this.selection.getElements()[0].getMimetype());
			//dropbox.addMimetype(this.selection.getElements()[0].classType);
			//console.log('dropbox allow: '+this.selection.getElements()[0].classType);
			this.connect(dropbox, 'drop', this.onDrop);
			
			var pressable = new Ui.Pressable({ margin: 5 });
			dropbox.setContent(pressable);
			pressable.dialogContextBarAction = action;
			this.connect(pressable, 'press', this.onActionPress);
			var hbox = new Ui.HBox({ spacing: 5 });
			pressable.setContent(hbox);
			var color;
			if('color' in action)
				color = Ui.Color.create(action.color);
			else
			 	color = Ui.Color.create('#444444');
			hbox.append(new Ui.Icon({ icon: action.icon, width: 30, height: 30, verticalAlign: 'center', fill: color }));
			hbox.append(new Ui.Label({ text: action.text, horizontalAlign: 'center', verticalAlign: 'center', color: color }));
			this.actionsBox.append(dropbox);
		}
	},
	
	onActionPress: function(pressable) {
		var action = pressable.dialogContextBarAction;
		var scope = this;
		if('scope' in action)
			scope = action.scope;
		action.callback.call(scope, this.selection);
		// clear the selection after the action done
		this.selection.clear();
	},

	onDrop: function(dropbox) {	
		var action = dropbox.dialogContextBarAction;
		var scope = this;
		if('scope' in action)
			scope = action.scope;
		action.callback.call(scope, this.selection);
	}
});
