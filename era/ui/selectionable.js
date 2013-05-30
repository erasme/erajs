
Ui.Draggable.extend('Ui.Selectionable', {
	isSelected: false,
	bg: undefined,
	contentBox: undefined,

	constructor: function(config) {
		
		this.bg = new Ui.Rectangle({ fill: '#dddddd', radius: 4, margin: 2 });
		this.bg.hide();
		this.append(this.bg);
		
		this.contentBox = new Ui.LBox({ margin: 5 });
		this.append(this.contentBox);
		
		this.connect(this, 'press', this.onSelectionablePress);
		this.connect(this, 'activate', this.onSelectionableActivate);
		this.connect(this, 'dragstart', this.onSelectionableDragStart);
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
		 if(!this.getIsSelected())
			this.onSelectionablePress();
	},
		
	onSelectionableActivate: function() {
		if(this.getIsLoaded()) {
		 	if(!this.getIsSelected())
				this.onSelectionablePress();
			var handler = this.getParentSelectionHandler();
			if(handler !== undefined)
				handler.executeDefaultAction();
		}
	},

	onSelectionablePress: function() {
		if(this.getIsLoaded()) {
			var handler = this.getParentSelectionHandler();
			if(handler !== undefined) {
				if(this.getIsSelected())
					handler.remove(this);
				else
					handler.append(this);
				this.setIsSelected(!this.getIsSelected());
			}
		}
	}
}, {
	setContent: function(content) {
		this.contentBox.setContent(content);	
	}
});