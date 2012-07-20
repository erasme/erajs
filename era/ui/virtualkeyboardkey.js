Ui.Button.extend('Ui.VirtualKeyboardKey', {
	key: undefined,

	constructor: function(config) {
	},

	setKey: function(key) {
		this.key = key;
	},

	getKey: function() {
		return this.key;
	}
});