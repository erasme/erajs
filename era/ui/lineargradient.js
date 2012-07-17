Core.Object.extend('Ui.LinearGradient', 
/**@lends Ui.LinearGradient#*/
{
	orientation: 'vertical',
	stops: undefined,
	image: undefined,

    /**
     * @constructs
	 * @class   
     * @extends Core.Object
     */ 
	constructor: function(config) {
		if('stops' in config) {
			this.stops = config.stops;
			delete(config.stops);
		}
		else
			this.stops = [
				{ offset: 0, color: new Ui.Color({ r: 1, g: 1, b: 1, a: 1}) },
				{ offset: 1, color: new Ui.Color({ r: 0, g: 0, b: 0, a: 1}) }];
		if(config.orientation != undefined) {
			this.orientation = config.orientation;
			delete(config.orientation);
		}
		for(var i = 0; i < this.stops.length; i++)
			this.stops[i].color = Ui.Color.create(this.stops[i].color);		
	},

	getBackgroundImage: function() {
		if(this.image != undefined)
			return this.image;

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
				this.image += '0deg';
			for(var i = 0; i < this.stops.length; i++) {
				var stop = this.stops[i];
				this.image += ', '+stop.color.getCssRgba()+' '+Math.round(stop.offset * 100)+'%';
			}
			this.image += ')';
		}
		else if(navigator.supportCanvas) {
			var canvas = document.createElement('canvas');
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
					gradient.addColorStop(stop.offset, stop.color.getCssRgba());
				}
				context.fillStyle = gradient;
				context.fillRect(0, 0, 100, 1);
			}
			this.image = 'url('+canvas.toDataURL()+')';
		}
		else {
			this.image = 'url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAMAAAACCAYAAACddGYaAAAAAXNSR0IArs4c6QAAAAZiS0dEAO8AUQBRItXOlAAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9gJDxcIBl8Z3A0AAAAZdEVYdENvbW1lbnQAQ3JlYXRlZCB3aXRoIEdJTVBXgQ4XAAAAC0lEQVQI12NgwAUAABoAASRETuUAAAAASUVORK5CYII%3D)';
		}
		return this.image;
	},

	getSVGGradient: function() {
		var gradient = document.createElementNS(svgNS, 'linearGradient');
		gradient.setAttributeNS(null, 'gradientUnits', 'objectBoundingBox');
		gradient.setAttributeNS(null, 'x1', 0);
		gradient.setAttributeNS(null, 'y1', 0);
		if(this.orientation == 'vertical') {
			gradient.setAttributeNS(null, 'x2', 0);
			gradient.setAttributeNS(null, 'y2', 1);
		}
		else {
			gradient.setAttributeNS(null, 'x2', 1);
			gradient.setAttributeNS(null, 'y2', 0);
		}
		for(var i = 0; i < this.stops.length; i++) {
			var stop = this.stops[i];
			var svgStop = document.createElementNS(svgNS, 'stop');
			svgStop.setAttributeNS(null, 'offset', stop.offset);
			svgStop.style.stopColor = stop.color.getCssHtml();
			svgStop.style.stopOpacity = stop.color.getRgba().a;
			gradient.appendChild(svgStop);
		}
		return gradient;
	},

	getCanvasGradient: function(context, width, height) {
		var gradient;
		if(this.orientation == 'vertical')
			gradient = context.createLinearGradient(0, 0, 0, height);
		else
			gradient = context.createLinearGradient(0, 0, width, 0);
		for(var i = 0; i < this.stops.length; i++) {
			var stop = this.stops[i];
			gradient.addColorStop(stop.offset, stop.color.getCssRgba());
		}
		return gradient;
	},

	getVMLFill: function() {
		var fill = document.createElement('vml:fill');
		fill.type = 'gradient';
		if(this.orientation == 'vertical')
			fill.angle = 180;
		else
			fill.angle = 270;
		fill.color = this.stops[0].color.getCssHtml();
		fill.opacity = this.stops[0].color.getRgba().a;
		fill.color2 = this.stops[this.stops.length - 1].color.getCssHtml();
		fill.opacity2 = this.stops[this.stops.length - 1].color.getRgba().a;
		fill.method = 'None';
		if(this.stops.length > 2) {
			var colors = '';
			for(var i = 1; i < this.stops.length-1; i++) {
				if(colors != '')
					colors += ',';
				colors += Math.round(this.stops[i].offset * 100)+'% '+this.stops[i].color.getCssHtml();
			}
			fill.colors = colors;
		}
		return fill;
	}
});

