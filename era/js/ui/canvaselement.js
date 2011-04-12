
//
// Define the base class for all Canvas drawing
//
Ui.Element.extend('Ui.CanvasElement', {
	context: undefined,

	//
	// Override this method to provide the Canvas rendering
	//
	updateCanvas: function(context) {
	},
}, {
	renderDrawing: function() {
		var canvas = document.createElementNS(htmlNS, 'canvas');
		this.context = canvas.getContext('2d');
		return canvas;
	},

	arrangeCore: function(width, height) {
		this.getDrawing().setAttribute('width', width, null);
		this.getDrawing().setAttribute('height', height, null);
		this.updateCanvas(this.context);
	},
       
	updateRenderCore: function() {
		this.updateCanvas(this.context);
	},
});

