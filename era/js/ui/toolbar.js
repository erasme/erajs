
Ui.LBox.extend('Ui.ToolBar', {
	hbox: undefined,
	background: undefined,

	constructor: function(config) {
		this.background = new Ui.Rectangle({ fill: '#d9d9d9', margin: 4, radius: 8 });
		Ui.ToolBar.base.append.call(this, this.background);

		this.hbox = new Ui.HBox({ spacing: 10, margin: 8 });
		Ui.ToolBar.base.append.call(this, this.hbox);
	},
}, {
	append: function(child, resizable) {
		this.hbox.append(child, resizable);
	},

	remove: function(child) {
		this.hbox.remove(child);
	},
});
