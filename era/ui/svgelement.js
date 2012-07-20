Ui.Element.extend('Ui.SVGElement', {}, 
/**@name Ui.SVGElement
 * @class
 * @extends Ui.Element
 */
/**@lends Ui.SVGElement*/
{
	renderDrawing: function() {
		var svg = document.createElementNS(Core.Util.svgNS, 'svg');
		svg.setAttribute('focusable', false);
		return svg;
	}
});

