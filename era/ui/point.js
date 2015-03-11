Core.Object.extend('Ui.Point', 
/**@lends Ui.Point#*/
{
	x: 0,
	y: 0,

	/**
	 * @constructs
	 * @class
	 * @extends Core.Object
	 */
	constructor: function(config) {
	},

	matrixTransform: function(matrix) {
		var x = this.x * matrix.a + this.y * matrix.c + matrix.e;
		var y = this.x * matrix.b + this.y * matrix.d + matrix.f;
		this.x = x;
		this.y = y;
		return this;
	},

	multiply: function(value) {
		var res = this;
		if(typeof(value) === 'number')
			res = new Ui.Point({ x: this.x * value, y: this.y * value });
		else if(Ui.Matrix.hasInstance(value))
			res = new Ui.Point({
				x: this.x * value.a + this.y * value.c + value.e,
				y: this.x * value.b + this.y * value.d + value.f
			});
		return res;
	},

	divide: function(value) {
		var res = this;
		if(typeof(value) === 'number')
			res = new Ui.Point({ x: this.x / value, y: this.y / value });
		else if(Ui.Matrix.hasInstance(value)) {
			value = value.inverse();
			res = new Ui.Point({
				x: this.x * value.a + this.y * value.c + value.e,
				y: this.x * value.b + this.y * value.d + value.f
			});
		}
		return res;
	},

	add: function(value) {
		var res = this;
		if(typeof(value) === 'number')
			res = new Ui.Point({ x: this.x + value, y: this.y + value });
		else if(Ui.Point.hasInstance(value))
			res = new Ui.Point({ x: this.x + value.x, y: this.y + value.y });
		return res;
	},

	substract: function(value) {
		var res = this;
		if(typeof(value) === 'number')
			res = new Ui.Point({ x: this.x - value, y: this.y - value });
		else if(Ui.Point.hasInstance(value))
			res = new Ui.Point({ x: this.x - value.x, y: this.y - value.y });
		return res;
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

	getLength: function() {
		return Math.sqrt(this.x * this.x + this.y * this.y);
	},

	clone: function() {
		return new Ui.Point({ x: this.x, y: this.y });
	}
}, 
/**@lends Ui.Point#*/
{
	toString: function() {
		return 'point('+this.x.toFixed(4)+', '+this.y.toFixed(4)+')';
	}
});

