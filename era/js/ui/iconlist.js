

Ui.ScrollingArea.extend('Ui.IconList', {
	flow: undefined,

	constructor: function(config) {
		this.flow = new Ui.Flow({ uniform: true });
		this.setContent(this.flow);
	},

	append: function(icon) {
		this.flow.append(icon);
	},

	remove: function(icon) {
		this.flow.remove(icon);
	},

	clear: function() {
		while(this.flow.getChildren().length > 0) {
			this.flow.remove(this.flow.getChildren()[0]);
		}
	}
});

Ui.Selectable.extend('Ui.IconListItem', {
	constructor: function(config) {
		this.setPadding(10);
		this.setVerticalAlign('top');
		this.setHorizontalAlign('center');
	}
});
