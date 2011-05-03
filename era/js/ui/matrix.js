

Core.Object.extend('Ui.Matrix', {
	svgMatrix: undefined,

	constructor: function(config) {
		if(config.SVGMatrix != undefined)
			this.svgMatrix = config.SVGMatrix;
		else
			this.svgMatrix = Ui.App.current.svgRoot.createSVGMatrix();
	},

	translate: function(x, y) {
		this.svgMatrix = this.svgMatrix.translate(x, y);
	},

	rotate: function(angle) {
		this.svgMatrix = this.svgMatrix.rotate(angle);
	},

	scale: function(scaleX, scaleY) {
		if(scaleY == undefined)
			scaleY = scaleX;
		this.svgMatrix = this.svgMatrix.scaleNonUniform(scaleX, scaleY);
	},

	multiply: function(matrix) {
		this.svgMatrix = this.svgMatrix.multiply(matrix.svgMatrix);
	},

	inverse: function() {
		this.svgMatrix = this.svgMatrix.inverse();
	},

	setMatrix: function(a, b, c, d, e, f) {
		this.svgMatrix.a = a;
		this.svgMatrix.b = b;
		this.svgMatrix.c = c;
		this.svgMatrix.d = d;
		this.svgMatrix.e = e;
		this.svgMatrix.f = f;
	},
	
	getA: function() {
		return this.svgMatrix.a;
	},

	getB: function() {
		return this.svgMatrix.b;
	},

	getC: function() {
		return this.svgMatrix.c;
	},

	getD: function() {
		return this.svgMatrix.d;
	},

	getE: function() {
		return this.svgMatrix.e;
	},

	getF: function() {
		return this.svgMatrix.f;
	},

}, {
	toString: function() {
		return 'matrix('+this.svgMatrix.a.toFixed(4)+', '+this.svgMatrix.b.toFixed(4)+', '+this.svgMatrix.c.toFixed(4)+', '+this.svgMatrix.d.toFixed(4)+', '+this.svgMatrix.e.toFixed(4)+', '+this.svgMatrix.f.toFixed(4)+')';
	},
});

Ui.Matrix.createRotate = function(angle) {
	var matrix = new Ui.Matrix();
	matrix.rotate(angle);
	return matrix;
};

Ui.Matrix.createTranslate = function(x, y) {
	var matrix = new Ui.Matrix();
	matrix.translate(x, y);
	return matrix;
};

Ui.Matrix.createScale = function(scaleX, scaleY) {
	var matrix = new Ui.Matrix();
	matrix.scale(scaleX, scaleY);
	return matrix;
};

Ui.Matrix.createMatrix = function(a, b, c, d, e, f) {
	var matrix = new Ui.Matrix();
	matrix.setMatrix(a, b, c, d, e, f);
	return matrix;
};

