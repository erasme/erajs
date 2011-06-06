
//
// Define the base class for all SVG drawing
//
Ui.Element.extend('Ui.SVGElement', {}, {
	renderDrawing: function() {
		return document.createElementNS(svgNS, 'svg');
	}
});

