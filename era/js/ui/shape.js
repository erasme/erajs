
Ui.Element.extend('Ui.Shape', {
	shapeDrawing: undefined,
	vmlFill: undefined,
	svgPath: undefined,

	fill: 'black',
	path: undefined,

	constructor: function(config) {
		if(config.fill != undefined)
			this.setFill(config.fill);
		if(config.path != undefined)
			this.setPath(config.path);
	},

	setFill: function(fill) {
		if(this.fill != fill) {
			this.fill = fill;
			if(navigator.supportSVG) {
				if(Ui.Color.hasInstance(fill))
					fill = fill.getCssHtml();
				this.svgPath.style.fill = fill;
			}
			else if(navigator.supportVML) {
				console.log('setFill for VML');
				if(Ui.Color.hasInstance(fill))
					fill = fill.getCssHtml();
				this.vmlFill.type = 'solid';
				this.vmlFill.color = fill;
			}
		}
	},

	setPath: function(path) {
		if(this.path != path) {
			this.path = path;
			if(navigator.supportSVG) {
				this.svgPath.setAttributeNS(null, 'd', this.path, null);
			}
			else if(navigator.supportVML) {
				this.shapeDrawing.path = this.pathToVML(path);
			}
		}
	},

	pathToVML: function(path) {
//		this.vml.path = 'm '+this.radiusTopLeft+',0 l '+(width-this.radiusTopRight)+',0 qx '+width+','+this.radiusTopRight+
//			' l '+width+','+(height-this.radiusBottomRight)+' qy '+(width-this.radiusBottomRight)+','+height+
//			' l '+this.radiusBottomLeft+','+height+' qx 0,'+(height-this.radiusBottomLeft)+' l 0,'+this.radiusTopLeft+
//			' qy '+this.radiusTopLeft+',0 x e';

//		shape.setPath('m 9.1916229,24 7.0000001,-7 7,7 14,-14 7,7 -21,21 z');

		path = 'm 9,24 l 16,17 l 23,24 l 37,10 l 44,17 l 23,38 x e';

		return path;
	}

}, {
	render: function() {
		if(navigator.supportSVG) {
			this.shapeDrawing = document.createElementNS(svgNS, 'svg');
			this.svgPath = document.createElementNS(svgNS, 'path');
			this.svgPath.style.fillOpacity = '1';
			this.svgPath.style.stroke = 'none';
			this.shapeDrawing.appendChild(this.svgPath);
		}
		else if(navigator.supportVML) {
			this.shapeDrawing = document.createElement('vml:shape');
			this.shapeDrawing.stroked = false;
			this.vmlFill = document.createElement('vml:fill');
			this.vmlFill.type = 'solid';
			this.vmlFill.color = 'black';
			this.shapeDrawing.appendChild(this.vmlFill);
		}
		this.shapeDrawing.style.display = 'block';
		this.shapeDrawing.style.position = 'absolute';
		this.shapeDrawing.style.left = '0px';
		this.shapeDrawing.style.top = '0px';
		return this.shapeDrawing;
	},

	arrangeCore: function(width, height) {
		width = Math.round(width);
		height = Math.round(height);
		this.shapeDrawing.style.width = width+'px';
		this.shapeDrawing.style.height = height+'px';
		if((!navigator.supportSVG) && (navigator.supportVML)) {
			this.shapeDrawing.coordorigin = '0 0';
			this.shapeDrawing.coordsize = width+' '+height;
		}
	}
});

