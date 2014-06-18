Ui.Element.extend('Ui.SVGElement', {
	renderSVG: function(svg) {
	}
}, {
	renderDrawing: function() {
		var svg = document.createElementNS(svgNS, 'svg');
		svg.setAttribute('focusable', false);
		var content = this.renderSVG(svg);
		if(content !== undefined)
			svg.appendChild(content);
		return svg;
	}
});

