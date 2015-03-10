Ui.ScrollingArea.extend('Ui.ToolBar', 
/**@lends Ui.ToolBar*/
{
	hbox: undefined,

	/**
	 * @constructs
	 * @class
	 * @extends Ui.VBox
	 */
	constructor: function(config) {
		this.setVerticalAlign('center');
		this.setScrollVertical(false);
		this.hbox = new Ui.HBox({ eventsHidden: true });
		Ui.ToolBar.base.setContent.call(this, this.hbox);
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
