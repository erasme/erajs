

Ui.ScrollingArea.extend('Ui.IconList', {
	fbox: undefined,

	constructor: function(config) {
		this.fbox = new Ui.FBox({ uniform: true });
		this.setContent(this.fbox);
	},

	appendIcon: function(icon) {
		this.fbox.appendChild(icon);
	},

	removeIcon: function(icon) {
		this.fbox.removeChild(icon);
	},

	clear: function() {
		while(this.fbox.children.length > 0) {
			this.fbox.removeChild(this.fbox.children[0]);
		}
	},

}, {
});

Ui.Selectable.extend('Ui.IconListItem', {
	constructor: function(config) {
		this.setPadding(10);
		this.setVerticalAlign('top');
		this.setHorizontalAlign('center');
	},
}, {
});
