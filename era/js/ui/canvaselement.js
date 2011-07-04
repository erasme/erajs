//The base class for all Canvas drawing
Ui.Element.extend('Ui.CanvasElement', 
/**@lends Ui.CanvasElement#*/
{
	context: undefined,

	//
	// Override this method to provide the Canvas rendering
	//
	updateCanvas: function(context) {
	}
}, 
/**@lends Ui.CanvasElement#*/
{
	renderDrawing: function() {
		var canvas = document.createElement('canvas');
		this.context = canvas.getContext('2d');
		return canvas;
	},

	arrangeCore: function(width, height) {
		this.getDrawing().setAttribute('width', width, null);
		this.getDrawing().setAttribute('height', height, null);
		this.updateCanvas(this.context);
	}
});

