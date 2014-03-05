
Ui.Draggable.extend('Ui.Selectionable', {
	isSelected: false,
	focusRing: undefined,
	bg: undefined,
	contentBox: undefined,
	handler: undefined,

	constructor: function(config) {
		
		this.setData(this);

		this.bg = new Ui.Rectangle({ margin: 2 });
		this.bg.hide();
		this.append(this.bg);

		this.focusRing = new Ui.Frame({ frameWidth: 2 });
		this.focusRing.hide();
		this.append(this.focusRing);
		
		this.contentBox = new Ui.LBox({ margin: 5 });
		this.append(this.contentBox);
		
		this.connect(this, 'press', this.onPress);
		this.connect(this, 'activate', this.onActivate);
		this.connect(this, 'dragstart', this.onSelectionableDragStart);
		this.connect(this, 'dragend', this.onSelectionableDragEnd);
		this.connect(this, 'focus', this.onSelectionableFocus);
		this.connect(this, 'blur', this.onSelectionableBlur);
	},

	getIsSelected: function() {
		return this.isSelected;
	},
	
	setIsSelected: function(isSelected) {
		this.isSelected = isSelected;
		if(this.isSelected)
			this.bg.show();
		else
			this.bg.hide();		
	},
		
	// ex:
	// {
	//   delete: { text: 'Delete', icon: 'trash', callback: this.onDelete, multiple: true },
	//   edit: ...
	// }
	getSelectionActions: function() {
		return {};
	},

	getParentSelectionHandler: function() {	
		// search for the selection handler
		var parent = this.getParent();
		while(parent !== undefined) {
			if('getSelectionHandler' in parent)
				break;
			parent = parent.getParent();
		}
		if(parent !== undefined)
			return parent.getSelectionHandler();
		else
			return undefined;
	},
	
	onSelectionableDragStart: function() {
		this.select();
	},
	
	onSelectionableDragEnd: function() {
		if(this.getIsSelected()) {
			var handler = this.getParentSelectionHandler();
			if(handler !== undefined)
				handler.clear();
		}
	},
		
	onActivate: function() {
		if(this.getIsLoaded()) {
			this.select();
			var handler = this.getParentSelectionHandler();
			if(handler !== undefined)
				handler.executeDefaultAction();
		}
	},

	onPress: function() {
		if(this.getIsSelected())
			this.unselect();
		else
			this.select();
	},

	select: function() {
		if(this.getIsLoaded()) {
			this.handler = this.getParentSelectionHandler();
			if(this.handler !== undefined) {
				this.handler.append(this);
				this.setIsSelected(true);
			}
		}
	},
	
	unselect: function() {
		if(this.handler !== undefined) {
			this.handler.remove(this);
			this.setIsSelected(false);
		}
	},

	onSelectionableFocus: function() {
		this.focusRing.show();
	},
	
	onSelectionableBlur: function() {
		this.focusRing.hide();
	}

}, {
	onStyleChange: function() {
		this.focusRing.setFill(this.getStyleProperty('focus'));
		this.bg.setFill(this.getStyleProperty('shadow'));
	},

	setContent: function(content) {
		this.contentBox.setContent(content);	
	},
	
	onUnload: function() {
		if(this.getIsSelected())
			this.unselect();
		Ui.Selectionable.base.onUnload.call(this);
	},

	onDisable: function() {
		Ui.Selectionable.base.onDisable.apply(this, arguments);
		this.contentBox.setOpacity(0.4);
	},

	onEnable: function() {
		Ui.Selectionable.base.onEnable.apply(this, arguments);
		this.contentBox.setOpacity(1);
	}
}, {
	style: {
		focus: '#21d3ff',
		shadow: '#dddddd'
	}
});