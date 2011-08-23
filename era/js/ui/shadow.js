
Ui.LBox.extend('Ui.Shadow', {
	radiusTopLeft: 0,
	radiusTopRight: 0,
	radiusBottomLeft: 0,
	radiusBottomRight: 0,
	shadowWidth: 0,
	inner: false,
	color: undefined,

	constructor: function(config) {
		this.color = Ui.Color.create('black');

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
		if('shadowWidth' in config)
			this.setShadowWidth(config.shadowWidth)
		else
			this.setShadowWidth(4);
		if('inner' in config)
			this.setInner(config.inner);
		if('color' in config)
			this.setColor(config.color);
	},

	getColor: function() {
		return this.color;
	},

	setColor: function(color) {
		if(this.color != color) {
			this.color = color;
			this.updateOpacityColor();
		}
	},

	getInner: function() {
		return this.inner;
	},

	setInner: function(inner) {
		if(this.inner != inner) {
			this.inner = inner;
			this.updateWidth();
			this.updateRadius();
			this.updateOpacityColor();
		}
	},

	setShadowWidth: function(shadowWidth) {
		if(this.shadowWidth != shadowWidth) {

			console.log('setShadowWidth: '+shadowWidth+', inner ? '+this.inner);

			this.shadowWidth = shadowWidth;
			this.updateWidth();
/*
//			if(!this.inner && (this.getLastChild() != undefined))
//				this.remove(this.getLastChild());
			while(this.shadowWidth > shadowWidth) {
				this.remove(this.getLastChild());
				this.shadowWidth--;
			}
			while(this.shadowWidth < shadowWidth) {
				this.append(new Ui.Rectangle({ fill: 'black', margin: this.shadowWidth }));
				//this.append(new Ui.Frame({ fill: 'black', frameWidth: 1, margin: this.shadowWidth }));
				this.shadowWidth++;
			}
//			if(!this.inner)
//				this.append(new Ui.Rectangle({ fill: 'black', margin: this.shadowWidth }));
*/
			this.updateOpacityColor();
			this.updateRadius();
		}
	},

	setRadius: function(radius) {
		this.radiusTopLeft = radius;
		this.radiusTopRight = radius;
		this.radiusBottomLeft = radius;
		this.radiusBottomRight = radius;
		this.updateRadius();
	},

	getRadiusTopLeft: function() {
		return this.radiusTopLeft;
	},

	setRadiusTopLeft: function(radiusTopLeft) {
		if(this.radiusTopLeft != radiusTopLeft) {
			this.radiusTopLeft = radiusTopLeft;
			this.updateRadius();
		}
	},

	getRadiusTopRight: function() {
		return this.radiusTopRight;
	},

	setRadiusTopRight: function(radiusTopRight) {
		if(this.radiusTopRight != radiusTopRight) {
			this.radiusTopRight = radiusTopRight;
			this.updateRadius();
		}
	},

	getRadiusBottomLeft: function() {
		return this.radiusBottomLeft;
	},

	setRadiusBottomLeft: function(radiusBottomLeft) {
		if(this.radiusBottomLeft != radiusBottomLeft) {
			this.radiusBottomLeft = radiusBottomLeft;
			this.updateRadius();
		}
	},

	getRadiusBottomRight: function() {
		return this.radiusBottomRight;
	},

	setRadiusBottomRight: function(radiusBottomRight) {
		if(this.radiusBottomRight != radiusBottomRight) {
			this.radiusBottomRight = radiusBottomRight;
			this.updateRadius();
		}
	},

	updateWidth: function() {
		console.log('updateWidth inner: '+this.inner);
		while(this.getFirstChild() != undefined)
			this.remove(this.getFirstChild());
		for(var i = 0; i < this.shadowWidth; i++) {
			if(this.inner)
				this.append(new Ui.Frame({ fill: 'black', frameWidth: this.shadowWidth - i }));
			else
				this.append(new Ui.Rectangle({ fill: 'black', margin: i }));
		}
	},

	updateOpacityColor: function() {
		var rgba = this.color.getRgba();
		var a = rgba.a;
		for(var i = 0; i < this.getChildren().length; i++) {
			var opacity;
			if(this.inner) {
				if(this.shadowWidth == 1)
					opacity = 1;
				else {
					var x = (i + 1) / this.shadowWidth;
					opacity = x * x;
//					opacity = 1 / (this.shadowWidth + 1);
//					opacity = 1 - (i / (this.shadowWidth - 1));
				}
			}
			else
				opacity = (i+1) / (this.shadowWidth + 1);
			rgba.a = a * opacity;
			this.getChildren()[i].setFill(new Ui.Color(rgba));
		}
	},

	updateRadius: function() {
		for(var i = 0; i < this.getChildren().length; i++) {
			var child = this.getChildren()[i];
			child.setRadiusTopLeft(this.radiusTopLeft);
			child.setRadiusTopRight(this.radiusTopRight);
			child.setRadiusBottomLeft(this.radiusBottomLeft);
			child.setRadiusBottomRight(this.radiusBottomRight);


//			child.setRadiusTopLeft(this.radiusTopLeft - (i * 1.1));
//			child.setRadiusTopRight(this.radiusTopRight - (i * 1.1));
//			child.setRadiusBottomLeft(this.radiusBottomLeft - (i * 1.1));
//			child.setRadiusBottomRight(this.radiusBottomRight - (i * 1.1));
		}
	}
});
