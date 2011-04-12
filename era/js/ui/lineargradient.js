

Object.extend('Ui.LinearGradient', {
	orientation: 'vertical',
	stops: undefined,
	image: undefined,

	constructor: function(config) {
		if(config.stops != undefined)
			this.stops = config.stops;
		else
			this.stops = [
				{ offset: 0, color: new Ui.Color({ r: 255, g: 255, b: 255, a: 1}) },
				{ offset: 1, color: new Ui.Color({ r: 0, g: 0, b: 0, a: 1}) }];
		if(config.orientation != undefined)
			this.orientation = config.orientation;

		if(navigator.isWebkit) {
			this.image = '-webkit-gradient(linear, 0% 0%, ';
			if(this.orientation == 'vertical')
				this.image += '0% 100%';
			else
				this.image += '100% 0%';
			for(var i = 0; i < this.stops.length; i++) {
				var stop = this.stops[i];
				this.image += ', color-stop('+stop.offset+', '+stop.color.getCssRgba()+')';
			}
			this.image += ')';
		}
		else if(navigator.isGecko) {
			this.image = '-moz-linear-gradient(';
			if(this.orientation == 'vertical')
				this.image += '-90deg';
			else
				this.image += '-180deg';
			for(var i = 0; i < this.stops.length; i++) {
				var stop = this.stops[i];
				this.image += ', '+stop.color.getCssRgba()+' '+Math.round(stop.offset * 100)+'%';
			}
			this.image += ')';
		}
		else {
			var canvas = document.createElementNS(htmlNS, 'canvas');
			var context = canvas.getContext('2d');
			if(this.orientation == 'vertical') {
				canvas.setAttribute('width', 1, null);
				canvas.setAttribute('height', 100, null);
				var gradient = context.createLinearGradient(0, 0, 0, 100);
				for(var i = 0; i < this.stops.length; i++) {
					var stop = this.stops[i];
					gradient.addColorStop(stop.offset, stop.color.getCssRgba());
				}
				context.fillStyle = gradient;
				context.fillRect(0, 0, 1, 100);
			}
			else {
				canvas.setAttribute('width', 100, null);
				canvas.setAttribute('height', 1, null);
				var gradient = context.createLinearGradient(0, 0, 100, 0);
				for(var i = 0; i < this.stops.length; i++) {
					var stop = this.stops[i];
					gradient.addColorStop(stop.offset, stop.color.getCssRgbaTo());
				}
				context.fillStyle = gradient;
				context.fillRect(0, 0, 100, 1);
			}
			this.image = 'url('+canvas.toDataURL()+')';
		}
	},

	getBackgroundImage: function() {
		return this.image;

	},

}, {
});

