

Core.Object.extend('Ui.Point', {
	x: 0,
	y: 0,

	constructor: function(config) {
		this.autoConfig(config, 'point', 'x', 'y');
	},

	matrixTransform: function(matrix) {
		var x = this.x * matrix.a + this.y * matrix.c + matrix.e;
		var y = this.x * matrix.b + this.y * matrix.d + matrix.f;
		this.x = x;
		this.y = y;
	},

	setPoint: function(point) {
		this.x = point.x;
		this.y = point.y;
	},

	getX: function() {
		return this.x;
	},

	setX: function(x) {
		this.x = x;
	},

	getY: function() {
		return this.y;
	},

	setY: function(y) {
		this.y = y;
	},

	clone: function() {
		return new Ui.Point({ x: this.x, y: this.y });
	}
}, {
	toString: function() {
		return 'point('+this.x.toFixed(4)+', '+this.y.toFixed(4)+')';
	}
});

