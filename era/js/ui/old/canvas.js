
Era.Canvas = Era.extend('canvas', Era.Container, {
	constructor: function(config) {
		this.superConstructor(config);
		this.addClass('canvas');
	},
});
