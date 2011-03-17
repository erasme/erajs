
//
// Define the base class for all SVG drawing
//
Ui.Element.extend('Ui.SVGElement', {
	svg: undefined,

	constructor: function(config) {
	},

	//
	// Override this method to provide the SVG rendering
	// content
	//
	renderSVG: function() {
		return undefined;
	},

}, {
	render: function() {
		this.svg = document.createElementNS(svgNS, 'svg');
		this.svg.style.position = 'absolute';
		this.svg.style.left = '0px';
		this.svg.style.top = '0px';
		var content = this.renderSVG();
		if(content != undefined)
			this.svg.appendChild(content);
		return this.svg;
	},
});

