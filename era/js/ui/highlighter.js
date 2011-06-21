//
// Define the Highligher class.
//
Ui.VBox.extend('Ui.Highlighter', {
	text: undefined,
	request: undefined,

	constructor: function(config) {
	},

	getText: function() {
		return this.text;
	},

	setText: function(text) {
		if(this.request != undefined) {
			this.request.abort();
			this.request = null;
		}
		if(this.text != text) {
			this.text = text;
			while(this.getFirstChild() != undefined)
				this.removeChild(this.getFirstChild());

			if(this.text != undefined) {
				var lines = this.text.split('\n');
				for(var i = 0; i < lines.length; i++) {
					var line = lines[i];
					this.append(new Ui.Label({ text: line, horizontalAlign: 'left' }));
				}
			}
		}
	},

	setSrc: function(src) {
		while(this.getFirstChild() != undefined)
			this.removeChild(this.getFirstChild());

		this.request = new Core.HttpRequest({ url: src });
		this.connect(this.request, 'done', this.onRequestDone);
		this.request.send();
	},

	onRequestDone: function() {
		var text = this.request.getResponseText();
		this.request = undefined;
		this.setText(text);
	}
});

