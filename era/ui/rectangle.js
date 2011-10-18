Ui.Shape.extend('Ui.Rectangle', 
/**@lends Ui.Rectangle#*/
{
	radiusTopLeft: 0,
	radiusTopRight: 0,
	radiusBottomLeft: 0,
	radiusBottomRight: 0,

	/**
	 * @constructs
	 * @class
	 * @extends Ui.Shape
	 */
	constructor: function(config) {
	},

	setRadius: function(radius) {
		this.setRadiusTopLeft(radius);
		this.setRadiusTopRight(radius);
		this.setRadiusBottomLeft(radius);
		this.setRadiusBottomRight(radius);
	},

	getRadiusTopLeft: function() {
		return this.radiusTopLeft;
	},

	setRadiusTopLeft: function(radiusTopLeft) {
		if(this.radiusTopLeft != radiusTopLeft) {
			this.radiusTopLeft = radiusTopLeft;
			this.invalidateArrange();
		}
	},

	getRadiusTopRight: function() {
		return this.radiusTopRight;
	},

	setRadiusTopRight: function(radiusTopRight) {
		if(this.radiusTopRight != radiusTopRight) {
			this.radiusTopRight = radiusTopRight;
			this.invalidateArrange();
		}
	},

	getRadiusBottomLeft: function() {
		return this.radiusBottomLeft;
	},

	setRadiusBottomLeft: function(radiusBottomLeft) {
		if(this.radiusBottomLeft != radiusBottomLeft) {
			this.radiusBottomLeft = radiusBottomLeft;
			this.invalidateArrange();
		}
	},

	getRadiusBottomRight: function() {
		return this.radiusBottomRight;
	},

	setRadiusBottomRight: function(radiusBottomRight) {
		if(this.radiusBottomRight != radiusBottomRight) {
			this.radiusBottomRight = radiusBottomRight;
			this.invalidateArrange();
		}
	},

	/**#@+
	 * @private
	 */

	genPath: function(width, height) {
		var radius = this.radiusTopLeft;
		var radius2 = this.radiusTopLeft;
		var v1 = width - radius;
		var v2 = height - radius;

		var path = '';
		if(this.radiusTopLeft > 0)
			path += 'M0,'+this.radiusTopLeft+' Q0,0 '+this.radiusTopLeft+',0 ';
		else
			path += 'M0,0 ';
		if(this.radiusTopRight > 0)
			path += 'L'+(width-this.radiusTopRight)+',0 Q'+width+',0 '+width+','+this.radiusTopRight+' ';
		else
			path += 'L'+width+',0 ';
		if(this.radiusBottomRight > 0)
			path += 'L'+width+','+(height-this.radiusBottomRight)+' Q'+width+','+height+' '+(width-this.radiusBottomRight)+','+height+' ';
		else
			path += 'L'+width+','+height+' ';
		if(this.radiusBottomLeft > 0)
			path += 'L'+this.radiusBottomLeft+','+height+' Q0,'+height+' 0,'+(height-this.radiusBottomLeft)+' ';
		else
			path += 'L0,'+height+' ';
		path += 'z';
		return path;
	}

	/**#@-*/

}, 
/**@lends Ui.Rectangle#*/ 
{
	arrangeCore: function(width, height) {
		Ui.Rectangle.base.arrangeCore.call(this, width, height);
		this.setPath(this.genPath(width, height));
	}
});

