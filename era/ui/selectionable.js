Ui.Draggable.extend('Ui.Selectionable', {
	isSelected: false,
	handler: undefined,

	constructor: function(config) {
		this.connect(this, 'activate', this.onSelectionableActivate);
		this.connect(this, 'dragstart', this.onSelectionableDragStart);
		this.connect(this, 'dragend', this.onSelectionableDragEnd);
	},

	getIsSelected: function() {
		return this.isSelected;
	},
	
	setIsSelected: function(isSelected) {
		if(this.isSelected !== isSelected) {
			this.isSelected = isSelected;
			if(this.isSelected)
				this.onSelect();
			else
				this.onUnselect();
		}
	},

	onSelect: function() {
	},

	onUnselect: function() {
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
		
	onSelectionableActivate: function() {
		if(this.getIsLoaded()) {
			this.select();
			var handler = this.getParentSelectionHandler();
			if(handler !== undefined) {
				if(handler.getDefaultAction() !== undefined)
					handler.executeDefaultAction();
				else
					this.unselect();
			}
		}
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
	}

}, {
	onUnload: function() {
		if(this.getIsSelected())
			this.unselect();
		Ui.Selectionable.base.onUnload.call(this);
	}
});

/*
Ui.Draggable.extend('Ui.Selectionable', {
	isSelected: false,
	focusRing: undefined,
	bg: undefined,
	contentBox: undefined,
	handler: undefined,

	constructor: function(config) {
		this.setData(this);

		this.bg = new Ui.Element({ margin: 2 });
		this.append(this.bg);

		this.focusRing = new Ui.Frame({ frameWidth: 2 });
		this.append(this.focusRing);
		
		this.contentBox = new Ui.LBox({ margin: 2 });
		this.append(this.contentBox);
		
		this.connect(this, 'press', this.onPress);
		this.connect(this, 'activate', this.onActivate);
		this.connect(this, 'dragstart', this.onSelectionableDragStart);
		this.connect(this, 'dragend', this.onSelectionableDragEnd);
		this.connect(this, 'focus', this.updateColors);
		this.connect(this, 'blur', this.updateColors);
		this.connect(this, 'enter', this.updateColors);
		this.connect(this, 'leave', this.updateColors);
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
	
	getBackground: function() {
		var color;
		if(this.isSelected) {
			if(this.getHasFocus() && !this.getIsMouseFocus())
				color = Ui.Color.create(this.getStyleProperty('focusActiveBackground'));
			else
				color = Ui.Color.create(this.getStyleProperty('activeBackground'));
		}
		else {
			if(this.getHasFocus() && !this.getIsMouseFocus())
				color = Ui.Color.create(this.getStyleProperty('focusBackground'));
			else
				color = Ui.Color.create(this.getStyleProperty('background'));
		}
		var yuv = color.getYuva();
		var deltaY = 0;
		if(this.getIsDown())
			deltaY = -0.20;
		else if(this.getIsOver()) {
			deltaY = 0.20;
			yuv.a = Math.max(0.4, yuv.a);
		}
		return new Ui.Color({ y: yuv.y + deltaY, u: yuv.u, v: yuv.v, a: yuv.a });
	},

	getBackgroundBorder: function() {
		var color;
		if(this.isSelected) {
			if(this.getHasFocus() && !this.getIsMouseFocus())
				color = Ui.Color.create(this.getStyleProperty('focusActiveBackgroundBorder'));
			else
				color = Ui.Color.create(this.getStyleProperty('activeBackgroundBorder'));
		}
		else {
			if(this.getHasFocus() && !this.getIsMouseFocus())
				color = Ui.Color.create(this.getStyleProperty('focusBackgroundBorder'));
			else
				color = Ui.Color.create(this.getStyleProperty('backgroundBorder'));
		}
		var yuv = color.getYuva();
		var deltaY = 0;
		if(this.getIsDown())
			deltaY = -0.20;
		else if(this.getIsOver())
			deltaY = 0.20;
		return new Ui.Color({ y: yuv.y + deltaY, u: yuv.u, v: yuv.v, a: yuv.a });
	},

	getForeground: function() {
		var color;
		if(this.isActive) {
			if(this.getHasFocus() && !this.getIsMouseFocus())
				color = Ui.Color.create(this.getStyleProperty('focusActiveForeground'));
			else
				color = Ui.Color.create(this.getStyleProperty('activeForeground'));
		}
		else {
			if(this.getHasFocus() && !this.getIsMouseFocus())
				color = Ui.Color.create(this.getStyleProperty('focusForeground'));
			else
				color = Ui.Color.create(this.getStyleProperty('foreground'));
		}
		var deltaY = 0;
		if(this.getIsDown())
			deltaY = -0.20;
		else if(this.getIsOver())
			deltaY = 0.20;
		var yuv = color.getYuva();
		return new Ui.Color({ y: yuv.y + deltaY, u: yuv.u, v: yuv.v, a: yuv.a });
	},
	
	updateColors: function() {	
		this.bg.setBackground(this.getBackground());
		this.focusRing.setFill(this.getBackgroundBorder());
	}

}, {
	onStyleChange: function() {
		this.focusRing.setFrameWidth(this.getStyleProperty('borderWidth'));
		this.bg.setMargin(this.getStyleProperty('borderWidth'));
		this.contentBox.setMargin(this.getStyleProperty('borderWidth'));
		this.updateColors();
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
		borderWidth: 2,
		background: 'rgba(250,250,250,0)',
		backgroundBorder: 'rgba(140,140,140,1)',
		foreground: '#444444',
		activeBackground: 'rgba(250,250,250,1)',
		activeBackgroundBorder: 'rgba(140,140,140,1)',
		activeForeground: 'rgb(33,211,255)',
		focusBackground: 'rgb(33,211,255)',
		focusBackgroundBorder: new Ui.Color({ r: 0.04, g: 0.43, b: 0.5 }),
		focusForeground: '#222222',
		focusActiveBackground: 'rgb(33,211,255)',
		focusActiveBackgroundBorder: new Ui.Color({ r: 0.04, g: 0.43, b: 0.5 }),
		focusActiveForeground: 'white',
		padding: 5
	}
});*/