
Ui.ToolBar.extend('Ui.MenuBar', {});

Ui.Pressable.extend('Ui.Menu',
/**@lends Ui.Menu#*/
{
	headerLabel: undefined,
	header: undefined,
	dialog: undefined,
	scope: undefined,

    /**
     * @constructs
	 * @class   
     * @extends Ui.Pressable
     */ 
	constructor: function(config) {
		this.addEvents('item');

		this.headerLabel = new Ui.Label({ margin: 5, horizontalAlign: 'left' });
		this.append(this.headerLabel);

		this.dialog = new Ui.MenuDialog({ element: this.headerLabel });
		this.connect(this.dialog, 'item', function(dialog, item) {
			this.fireEvent('item', this, item);
		});
		this.connect(this, 'press', this.onTitlePress);
	},

	setHeader: function(header) {
		if(this.header != header) {
			this.header = header;
			this.headerLabel.setText(header);
			this.dialog.setHeader(header);
		}
	},

	appendItem: function(item, callback, scope) {
		if(typeof(item) == 'string')
			item = new Ui.Label({ horizontalAlign: 'left', text: item });
		var menu = this;
		var pressable = this.dialog.appendItem(item);
		if(callback != undefined) {
			if(scope === undefined) {
				if(this.scope === undefined)
					scope = this;
				else
					scope = this.scope;
			}
			scope.connect(pressable, 'press', function(pressable) {
				callback.call(this, menu, pressable.getChildren()[0]);
			});
		}
	},

	setScope: function(scope) {
		this.scope = scope;
	},

	setItems: function(items) {
		this.dialog.clearItems();
		for(var i = 0; i < items.length; i++) {
			this.appendItem(items[i].item, items[i].callback, items[i].scope);
		}
	},

	appendSeparator: function() {
		this.dialog.appendSeparator();
	},

	getIsOpen: function() {
		return this.dialog.getIsVisible();
	},

	open: function() {
		this.dialog.show();
	},

	close: function() {
		this.dialog.hide();
	},

	onTitlePress: function() {
		this.open();
	}
});