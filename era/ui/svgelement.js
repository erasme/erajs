
//
// Define the base class for all SVG drawing
//
Ui.Element.extend('Ui.SVGElement', {}, {
	renderDrawing: function() {
		var svg = document.createElementNS(svgNS, 'svg');
		svg.setAttribute('focusable', false);
		return svg;
	}
});

