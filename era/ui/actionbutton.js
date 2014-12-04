
Ui.Button.extend('Ui.ActionButton', {
	action: undefined,
	selection: undefined,

	constructor: function(config) {
		this.action = config.action;
		delete(config.action);
		this.selection = config.selection;
		delete(config.selection);

		this.connect(this.getDropBox(), 'drop', this.onActionButtonDrop);
		this.connect(this, 'press', this.onActionButtonDrop);
	},

	addType: function(type, effect) {
		this.getDropBox().addType(type, effect);
	},
	
	onActionButtonDrop: function() {
		var scope = this;
		if('scope' in this.action)
			scope = this.action.scope;
		this.action.callback.call(scope, this.selection);
		// clear the selection after the action done
		this.selection.clear();
	}
});
