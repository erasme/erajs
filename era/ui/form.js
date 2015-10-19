
Ui.LBox.extend('Ui.Form', {
	constructor: function(config) {
		this.addEvents('submit');
		this.connect(this.getDrawing(), 'submit', this.onSubmit);
	},
	
	onSubmit: function(event) {
		event.preventDefault();
		event.stopPropagation();
		this.fireEvent('submit', this);
	},

	submit: function() {
		this.getDrawing().submit();
	}
}, {
	renderDrawing: function() {
		var drawing;
		drawing = document.createElement('form');

		// create an input type submit button. Else
		// the form might never raise submit event
		var submit = document.createElement('input');
		submit.type = 'submit';
		submit.style.visibility = 'hidden';
		drawing.appendChild(submit);

		var container = document.createElement('div');
		this.setContainerDrawing(container);
		drawing.appendChild(container);
		return drawing;
	}
});
