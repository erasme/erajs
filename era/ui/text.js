
Ui.Html.extend('Ui.Text', {
	constructor: function(config) {
		this.getDrawing().style.whiteSpace = 'pre-wrap';
		this.setSelectable(false);
	},

	setTextTransform: function(textTransform) {
		this.getDrawing().style.textTransform = textTransform;
		this.invalidateMeasure();
	}
});
