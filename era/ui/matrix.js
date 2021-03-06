Core.Object.extend('Ui.Matrix', 
/**@lends Ui.Matrix#*/
{
	a: 1,
	b: 0,
	c: 0,
	d: 1,
	e: 0,
	f: 0,

	/**
	 * The matrix format is like that
	 *
	 * | a | c | e |
	 * | b | d | f |
	 * | 0 | 0 | 1 |
	 */

	/**
	 * @constructs
	 * @class
	 * @extends Core.Object
	 */
	constructor: function(config) {
	},

	isTranslateOnly: function() {
		return((this.a === 1) && (this.b === 0) && (this.c === 0) && (this.d === 1));
	},

	isIdentity: function() {
		return((this.a === 1) && (this.b === 0) && (this.c === 0) && (this.d === 1) && (this.e === 0) && (this.f === 0));
	},

	translate: function(x, y) {
		return this.multiply(Ui.Matrix.createTranslate(x, y));
	},

	rotate: function(angle) {
		return this.multiply(Ui.Matrix.createRotate(angle));
	},

	scale: function(scaleX, scaleY) {
		if(scaleY === undefined)
			scaleY = scaleX;
		return this.multiply(Ui.Matrix.createScale(scaleX, scaleY));
	},

	multiply: function(matrix) {
		var a = matrix.a * this.a + matrix.b * this.c;
		var c = matrix.c * this.a + matrix.d * this.c;
		var e = matrix.e * this.a + matrix.f * this.c + this.e;

		var b = matrix.a * this.b + matrix.b * this.d;
		var d = matrix.c * this.b + matrix.d * this.d;
		var f = matrix.e * this.b + matrix.f * this.d + this.f;

		return Ui.Matrix.createMatrix(a, b, c, d, e, f);
	},

	getDeterminant: function() {
		return ((this.a * this.d) - (this.b * this.c));
	},

	inverse: function() {
		var determinant = this.getDeterminant();
		if(determinant === 0)
			throw("Matrix not invertible");

		var invd = 1 / determinant;
		var ta =  this.d * invd;
		var tb = -this.b * invd;
		var tc = -this.c * invd;
		var td =  this.a * invd;
		var te = ((this.c * this.f) - (this.e * this.d)) * invd;
		var tf = ((this.e * this.b) - (this.a * this.f)) * invd;
		return new Ui.Matrix.createMatrix(ta, tb, tc, td, te, tf);
	},

	setMatrix: function(a, b, c, d, e, f) {
		this.a = a; this.b = b;
		this.c = c; this.d = d;
		this.e = e; this.f = f;
	},
	
	getA: function() {
		return this.a;
	},

	getB: function() {
		return this.b;
	},

	getC: function() {
		return this.c;
	},

	getD: function() {
		return this.d;
	},

	getE: function() {
		return this.e;
	},

	getF: function() {
		return this.f;
	},

	clone: function() {
		return Ui.Matrix.createMatrix(this.a, this.b, this.c, this.d, this.e, this.f);
	}
}, 
/**@lends Ui.Matrix#*/
{
	toString: function() {
		return 'matrix('+this.a.toFixed(4)+','+this.b.toFixed(4)+','+this.c.toFixed(4)+','+this.d.toFixed(4)+','+this.e.toFixed(4)+','+this.f.toFixed(4)+')';
	}
}, 
/**@lends Ui.Matrix*/
{
	createMatrix: function(a, b, c, d, e, f) {
		var matrix = new Ui.Matrix();
		matrix.setMatrix(a, b, c, d, e, f);
		return matrix;
	},

	createTranslate: function(x, y) {
		return Ui.Matrix.createMatrix(1, 0, 0, 1, x, y);
	},

	createScaleAt: function(scaleX, scaleY, centerX, centerY) {
		return Ui.Matrix.createMatrix(scaleX, 0, 0, scaleY, centerX - (scaleX * centerX), centerY - (scaleY * centerY));
	},

	createScale: function(scaleX, scaleY) {
		if(scaleY === undefined)
			scaleY = scaleX;
		return Ui.Matrix.createScaleAt(scaleX, scaleY, 0, 0);
	},

	createRotateAt: function(angle, centerX, centerY) {
		// convert from degree to radian
		angle = (angle % 360) * Math.PI / 180;
		var sin = Math.sin(angle);
		var cos = Math.cos(angle);
		var offsetX = (centerX * (1.0 - cos)) + (centerY * sin);
		var offsetY = (centerY * (1.0 - cos)) - (centerX * sin);
		return Ui.Matrix.createMatrix(cos, sin, -sin, cos, offsetX, offsetY);
	},

	createRotate: function(angle) {
		return Ui.Matrix.createRotateAt(angle, 0, 0);
	},

	parse: function(stringMatrix) {
		var matrix;
		if(typeof(stringMatrix) === 'string') {
			// parse the matrix
			var res;
			if((res = stringMatrix.match(/^matrix\((-?\d+\.?\d*),(-?\d+\.?\d*),(-?\d+\.?\d*),(-?\d+\.?\d*),(-?\d+\.?\d*),(-?\d+\.?\d*)\)$/)) !== null) {
				var a = parseFloat(res[1]);
				var b = parseFloat(res[2]);
				var c = parseFloat(res[3]);
				var d = parseFloat(res[4]);
				var e = parseFloat(res[5]);
				var f = parseFloat(res[6]);
				matrix = new Ui.Matrix();
				matrix.setMatrix(a, b, c, d, e, f);
			}
		}
		if(matrix === undefined)
			throw('Unknown matrix format ('+stringMatrix+')');
		return matrix;
	}
});

		