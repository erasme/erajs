
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

		this.getDropBox().addType('all', this.onActionButtonEffect.bind(this));
	},

	onActionButtonEffect: function(data, dataTransfer) {
		if('draggable' in dataTransfer) {
			var elements = this.selection.getElements();
			var found = undefined;
			for(var i = 0; (found === undefined) && (i < elements.length); i++) {
				if(elements[i] === dataTransfer.draggable)
					found = elements[i];
			}
			if(found !== undefined)
				return [ 'run' ];
		}
		return [];
	},

	onActionButtonDrop: function() {
		var scope = this;
		if('scope' in this.action)
			scope = this.action.scope;
		this.action.callback.call(scope, this.selection);
		// clear the selection after the action done
		this.selection.clear();
	}
}, {}, {
	style: {
		textTransform: 'uppercase',
		radius: 0,
		borderWidth: 0,
		foreground: 'rgba(250,250,250,1)',
		background: 'rgba(60,60,60,0)',
		backgroundBorder: 'rgba(60,60,60,0)',
		focusColor: '#f6caa2'
	}
});
