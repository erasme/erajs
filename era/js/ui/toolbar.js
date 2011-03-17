
Ui.LBox.extend('Ui.ToolBar', {
	hbox: undefined,
	background: undefined,

	constructor: function(config) {
		this.background = new Ui.Rectangle({ fill: '#d9d9d9', margin: 4, radius: 8 });
		Ui.ToolBar.base.appendChild.call(this, this.background);

		this.hbox = new Ui.HBox({ spacing: 10, margin: 8 });
		Ui.ToolBar.base.appendChild.call(this, this.hbox);
	},
}, {
	appendChild: function(child, resizable) {
		this.hbox.appendChild(child, resizable);
	},

	insertBefore: function(newElement, beforeElement, resizable) {
		this.hbox.insertBefore(newElement, beforeElement);
	},

	removeChild: function(child, resizable) {
		this.hbox.removeChild(child, resizable);
	},
});
