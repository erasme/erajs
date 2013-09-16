
Ui.Draggable.extend('Ui.Selectionable', {
	isSelected: false,
	bg: undefined,
	contentBox: undefined,

	constructor: function(config) {
		
		this.setData(this);
		
		this.bg = new Ui.Rectangle({ fill: '#dddddd', radius: 0, margin: 2 });
		this.bg.hide();
		this.append(this.bg);
		
		this.contentBox = new Ui.LBox({ margin: 5 });
		this.append(this.contentBox);
		
		this.connect(this, 'press', this.onPress);
		this.connect(this, 'activate', this.onActivate);
		this.connect(this, 'dragstart', this.onSelectionableDragStart);
		this.connect(this, 'dragend', this.onSelectionableDragEnd);
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
	//   delete: { text: 'Delete', icon: 'trash', scope: this, callback: this.onDelete, multiple: true },
	//   edit: ...
	// }
	getSelectionActions: function() {
		return {};
	},

	getParentSelectionHandler: function() {	
		// search for the selection handler
		var parent = this.getParent();
		while(parent != undefined) {
			if('getSelectionHandler' in parent)
				break;
			parent = parent.getParent();
		}
		if(parent != undefined)
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
			var handler = this.getParentSelectionHandler();
			if(handler !== undefined) {
				handler.append(this);
				this.setIsSelected(true);
			}
		}
	},
	
	unselect: function() {
		if(this.getIsLoaded()) {
			var handler = this.getParentSelectionHandler();
			if(handler !== undefined) {
				handler.remove(this);
				this.setIsSelected(false);
			}
		}
	}
}, {
	setContent: function(content) {
		this.contentBox.setContent(content);	
	}
});