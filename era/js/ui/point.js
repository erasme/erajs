

Core.Object.extend('Ui.Point', {
	x: 0,
	y: 0,

	constructor: function(config) {
		if('point' in config) {
			this.x = config.point.x;
			this.y = config.point.y;
		}
		if('x' in config)
			this.x = config.x;
		if('y' in config)
			this.y = config.y;
	},

	matrixTransform: function(matrix) {
		var x = this.x * matrix.a + this.y * matrix.c + matrix.e;
		var y = this.x * matrix.b + this.y * matrix.d + matrix.f;
		this.x = x;
		this.y = y;
	},

	setPoint: function(x, y) {
		this.x = x;
		this.y = y;
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

