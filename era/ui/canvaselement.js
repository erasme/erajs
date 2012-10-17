Ui.Element.extend('Ui.CanvasElement', 
/**@lends Ui.CanvasElement#*/
{
	context: undefined,

	/**
	 * @constructs
	 * @class The base class for all Canvas drawing
	 * @extends Ui.Element
	 */
	constructor: function(config){
	},

	/**
	 * Call this method when the canvas need to be redraw
	 */
	update: function() {
		this.context.clearRect(0, 0, this.getLayoutWidth(), this.getLayoutHeight());
		this.context.save();
		this.updateCanvas(this.context);
		this.context.restore();
	},

	/**
	 * Override this method to provide the Canvas rendering
	 */
	updateCanvas: function(context) {
	}
}, 
/**@lends Ui.CanvasElement#*/
{
	renderDrawing: function() {
		var canvas = document.createElement('canvas');
		if('G_vmlCanvasManager' in window)
			canvas = G_vmlCanvasManager.initElement(canvas);
		this.context = canvas.getContext('2d');
		this.canvas = canvas;
		return canvas;
	},

	arrangeCore: function(width, height) {
		this.getDrawing().setAttribute('width', width, null);
		this.getDrawing().setAttribute('height', height, null);
		this.update();
	}
});

