Ui.LBox.extend('Ui.ToolBar', 
/**@lends Ui.ToolBar*/
{
	hbox: undefined,
	scroll: undefined,

	/**
	 * @constructs
	 * @class
	 * @extends Ui.VBox
	 */
	constructor: function(config) {
		var content = new Ui.LBox();
		Ui.ToolBar.base.append.call(this, content);

		this.scroll = new Ui.ScrollingArea({ scrollVertical: false, verticalAlign: 'center' });
		content.append(this.scroll);

		this.hbox = new Ui.HBox();
		this.scroll.setContent(this.hbox);
	}
}, 
/**@lends Ui.ToolBar#*/
{
	append: function(child, resizable) {
		this.hbox.append(child, resizable);
	},

	remove: function(child) {
		this.hbox.remove(child);
	},

	setContent: function(content) {
		this.hbox.setContent(content);
	},

	onStyleChange: function() {
		var spacing = this.getStyleProperty('spacing');
		this.hbox.setMargin(spacing);
		this.hbox.setSpacing(spacing);

	}
}, 
/**@lends Ui.ToolBar*/
{
	style: {
		spacing: 3
	}
});

