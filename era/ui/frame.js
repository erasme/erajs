
Ui.Shape.extend('Ui.Frame', 
/**@lends Ui.Frame#*/
{
	radiusTopLeft: 0,
	radiusTopRight: 0,
	radiusBottomLeft: 0,
	radiusBottomRight: 0,
	frameWidth: 10,

	/**
	 * @constructs 
	 * @class
	 * @extends Ui.Shape
	 */
	constructor: function(config) {
		if('radius' in config)
			this.setRadius(config.radius);
		if('radiusTopLeft' in config)
			this.setRadiusTopLeft(config.radiusTopLeft);
		if('radiusTopRight' in config)
			this.setRadiusTopRight(config.radiusTopRight);
		if('radiusBottomLeft' in config)
			this.setRadiusBottomLeft(config.radiusBottomLeft);
		if('radiusBottomRight' in config)
			this.setRadiusBottomRight(config.radiusBottomRight);
		if('frameWidth' in config)
			this.setFrameWidth(config.frameWidth);
	},

	getFrameWidth: function() {
		return this.frameWidth;
	},

	setFrameWidth: function(frameWidth) {
		if(frameWidth != this.frameWidth) {
			this.frameWidth = frameWidth;
			this.invalidateArrange();
		}
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

		if(this.radiusTopLeft > this.frameWidth) {
			path += 'M'+this.radiusTopLeft+','+this.frameWidth+' ';
			path += 'Q'+this.frameWidth+','+this.frameWidth+' '+this.frameWidth+','+this.radiusTopLeft+' ';
		}
		else
			path += 'M'+this.frameWidth+','+(this.frameWidth)+' ';
		if(this.radiusBottomLeft > this.frameWidth) {
			path += 'L'+this.frameWidth+','+(height-this.radiusBottomLeft)+' ';
			path += 'Q'+this.frameWidth+','+(height-this.frameWidth)+' '+this.radiusBottomLeft+','+(height-this.frameWidth)+' ';
		}
		else
			path += 'L'+this.frameWidth+','+(height-this.frameWidth)+' ';
		if(this.radiusBottomRight > this.frameWidth) {
			path += 'L'+(width-this.radiusBottomRight)+','+(height-this.frameWidth)+' ';
			path += 'Q'+(width-this.frameWidth)+','+(height-this.frameWidth)+' '+(width-this.frameWidth)+','+(height-this.radiusBottomRight)+' ';
		}
		else
			path += 'L'+(width-this.frameWidth)+','+(height-this.frameWidth)+' ';
		if(this.radiusTopRight > this.frameWidth) {
			path += 'L'+(width-this.frameWidth)+','+this.radiusTopRight+' ';
			path += 'Q'+(width-this.frameWidth)+','+this.frameWidth+' '+(width-this.radiusTopRight)+','+this.frameWidth+' ';
		}
		else
			path += 'L'+(width-this.frameWidth)+','+(this.frameWidth)+' ';

		path += 'z';
		return path;
	}

}, 
/**@lends Ui.Frame#*/ 
{
	arrangeCore: function(width, height) {
		Ui.Frame.base.arrangeCore.call(this, width, height);
		this.setPath(this.genPath(width, height));
	}
});

