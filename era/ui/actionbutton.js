
Ui.Pressable.extend('Ui.ActionButton', {
	dropbox: undefined,
	graphic: undefined,
	action: undefined,
	selection: undefined,

	constructor: function(config) {
		this.action = config.action;
		delete(config.action);
		this.selection = config.selection;
		delete(config.selection);

		this.dropbox = new Ui.DropBox();
		this.setContent(this.dropbox);

		this.graphic = new Ui.ButtonGraphic();
		this.dropbox.setContent(this.graphic);

		this.connect(this, 'down', this.onButtonDown);
		this.connect(this, 'up', this.onButtonUp);
		this.connect(this, 'focus', this.onButtonFocus);
		this.connect(this, 'blur', this.onButtonBlur);
		this.connect(this, 'press', this.onButtonPressDrop);
		this.connect(this.dropbox, 'drop', this.onButtonPressDrop);
	},

	addMimetype: function(mimetype) {
		this.dropbox.addMimetype(mimetype);
	},

	getText: function() {
		return this.graphic.getText();
	},

	setText: function(text) {
		this.graphic.setText(text);
	},

	getIcon: function() {
		return this.graphic.getIcon();
	},

	setIcon: function(icon) {
		this.graphic.setIcon(icon);
	},
	
	getOrientation: function() {
		return this.graphic.getOrientation();
	},
    
	setOrientation: function(orientation) {
		this.graphic.setOrientation(orientation);
	},
	
	onButtonDown: function() {
		this.graphic.setIsDown(true);
	},
	
	onButtonUp: function() {
		this.graphic.setIsDown(false);
	},
	
	onButtonFocus: function() {
		this.graphic.setHasFocus(true);
	},
	
	onButtonBlur: function() {
		this.graphic.setHasFocus(false);
	},

	onButtonPressDrop: function() {
		var scope = this;
		if('scope' in this.action)
			scope = this.action.scope;
		this.action.callback.call(scope, this.selection);
		// clear the selection after the action done
		this.selection.clear();
	}
});
