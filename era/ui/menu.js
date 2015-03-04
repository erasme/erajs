
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

		var vbox = new Ui.VBox();
		this.append(vbox);
		
		this.headerLabel = new Ui.Label({ margin: 5, marginBottom: 0, horizontalAlign: 'left' });
		vbox.append(this.headerLabel);
		
		vbox.append(new Ui.Rectangle({ height: 1, width: 1, fill: '#aaaaaa', marginLeft: 5, marginRight: 5 }));

		this.dialog = new Ui.MenuDialog({ element: this.headerLabel });
		this.connect(this.dialog, 'item', this.onItemPress);
		this.connect(this, 'press', this.onTitlePress);
	},

	setHeader: function(header) {
		if(this.header != header) {
			this.header = header;
			this.headerLabel.setText(header);
		}
	},

	appendItem: function(item, callback, scope) {
		if(typeof(item) == 'string')
			item = new Ui.Label({ horizontalAlign: 'left', text: item });
		var menu = this;
		var pressable = this.dialog.appendItem(item);
		if(callback !== undefined) {
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

	onItemPress: function(dialog, item) {
		this.fireEvent('item', this, item);
	},

	onTitlePress: function() {
		this.open();
	}
});

Ui.Popup.extend('Ui.MenuDialog', 
/**@lends Ui.MenuDialog#*/
{
	element: undefined,
	content: undefined,

	/**
	 * @constructs
	 * @class
	 * @extends Ui.Popup
	 */
	constructor: function(config) {
		this.addEvents('item');

		if('element' in config) {
			this.element = config.element;
			delete(config.element);
		}
		else
			throw('element property is NEEDED for Ui.MenuDialog');
		
		this.setAutoClose(true);

		this.content = new Ui.VBox();
		this.setContent(this.content);

		// handle keyboard
		this.connect(this.getDrawing(), 'keydown', this.onKeyDown);
	},

	clearItems: function() {
		while(this.content.getFirstChild() !== undefined) {
			this.content.remove(this.content.getFirstChild());
		}
	},

	appendItem: function(item) {
		var menuItem = new Ui.MenuItem();
		menuItem.setContent(item);
		this.connect(menuItem, 'press', this.onItemPress);
		this.content.append(menuItem);
		return menuItem;
	},
	
	appendSeparator: function() {
		this.content.append(new Ui.Separator());
	},

	onItemPress: function(menuitem) {
		var item = menuitem.getContent();
		this.fireEvent('item', this, item);
		this.hide();
	},

	onKeyDown: function(event) {
		var i;
		var key = event.which;
		// escape
		if(key == 27) {
			event.preventDefault();
			event.stopPropagation();
			this.hide();
		}
		// arrow down
		else if(key == 40) {
			for(i = 0; i < this.content.getChildren().length; i++) {
				if(!Ui.MenuItem.hasInstance(this.content.getChildren()[i]))
					continue;
				if(this.content.getChildren()[i].getIsCurrent()) {
					for(i = i+1;i < this.content.getChildren().length; i++) {
						if(Ui.MenuItem.hasInstance(this.content.getChildren()[i])) {
							event.preventDefault();
							event.stopPropagation();
							this.content.getChildren()[i].setCurrent();
							break;
						}
					}
				}
			}
		}
		// arrow up
		else if(key == 38) {
			var prev;
			for(i = 0; i < this.content.getChildren().length; i++) {
				if(!Ui.MenuItem.hasInstance(this.content.getChildren()[i]))
					continue;
				if(this.content.getChildren()[i].getIsCurrent()) {
					if(prev !== undefined) {
						event.preventDefault();
						event.stopPropagation();
						prev.setCurrent();
					}
					break;
				}
				prev = this.content.getChildren()[i];
			}
		}
	}
}, 
/**@lends Ui.MenuDialog#*/
{
	show: function() {
		var oldVisible = this.getIsVisible();
		Ui.MenuDialog.base.show.call(this, this.element, 'bottom');
	}
});

Ui.Overable.extend('Ui.MenuItem', 
/**@lends Ui.MenuItem#*/
{
	background: undefined,
	pressable: undefined,

	/**
	 * @constructs
	 * @class
	 * @extends Ui.Overable
	 */
	constructor: function() {
		this.addEvents('press');

		this.background = new Ui.Rectangle({ fill: '#cecece', opacity: 0 });
		this.append(this.background);

		this.pressable = new Ui.Pressable({ padding: 10 });
		this.append(this.pressable);
		this.connect(this.pressable, 'press', this.onItemPress);

		this.connect(this, 'enter', this.onEnter);
		this.connect(this, 'leave', this.onLeave);
		this.connect(this.pressable, 'down', this.onDown);
		this.connect(this.pressable, 'up', this.onUp);

		this.connect(this.pressable, 'focus', this.onItemFocus);
		this.connect(this.pressable, 'blur', this.onItemBlur);
	},

	getIsCurrent: function() {
		return this.pressable.getHasFocus();
	},

	setCurrent: function() {
		this.pressable.focus();
	},

	getContent: function() {
		return this.pressable.getChildren()[0];
	},

	onEnter: function() {
		this.pressable.focus();
	},

	onLeave: function() {
	},

	onDown: function() {
		this.background.setOpacity(1);
	},

	onUp: function() {
		this.background.setOpacity(0);
	},

	onItemFocus: function() {
		this.background.setOpacity(0.6);
	},

	onItemBlur: function() {
		this.background.setOpacity(0);
	},
	
	onItemPress: function() {
		this.fireEvent('press', this);
	}
}, {
	setContent: function(content) {
		this.pressable.append(content);
	}
});

