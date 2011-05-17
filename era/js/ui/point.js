

Core.Object.extend('Ui.Point', {
	svgPoint: undefined,
	x: 0,
	y: 0,

	constructor: function(config) {
		if(config.SVGPoint != undefined)
			this.svgPoint = config.SVGPoint;
		else
			this.svgPoint = Ui.App.current.svgRoot.createSVGPoint();
		if(config.point != undefined) {
			this.setX(config.point.x);
			this.setY(config.point.y);
		}
		if(config.x != undefined)
			this.setX(config.x);
		if(config.y != undefined)
			this.setY(config.y);
	},

	matrixTransform: function(matrix) {
		this.svgPoint = this.svgPoint.matrixTransform(matrix.svgMatrix);
		this.x = this.svgPoint.x;
		this.y = this.svgPoint.y;
	},

	setPoint: function(x, y) {
		this.svgPoint.x = x;
		this.svgPoint.y = y;
		this.x = x;
		this.y = y;
	},

	getX: function() {
		return this.x;
	},

	setX: function(x) {
		this.svgPoint.x = x;
		this.x = x;
	},

	getY: function() {
		return this.y;
	},

	setY: function(y) {
		this.svgPoint.y = y;
		this.y = y;
	},

	clone: function() {
		return new Ui.Point({ x: this.x, y: this.y });
	},
}, {
	toString: function() {
		return 'point('+this.x.toFixed(4)+', '+this.y.toFixed(4)+')';
	},
});

