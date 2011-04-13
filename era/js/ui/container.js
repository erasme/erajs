
Ui.Element.extend('Ui.Container', {
	children: undefined,
	childChanged: false,

	constructor: function(config) {
		this.children = [];
	},

	//
	// Add a child in the container at the end
	//
	appendChild: function(child) {
		child.parent = this;
		this.children.push(child);
		this.childChanged = true;
		this.invalidateMeasure();
		this.invalidateRender();
		child.setIsLoaded(this.isLoaded);
	},

	//
	// Add a child in the container at the begining
	//
	prependChild: function(child) {
		child.parent = this;
		this.children.unshift(child);
		this.childChanged = true;
		this.invalidateMeasure();
		this.invalidateRender();
		child.setIsLoaded(this.isLoaded);
	},

	//
	// Remove a child element from the current container
	//
	removeChild: function(child) {
		child.parent = undefined;
		this.childChanged = true;
		var i = 0;
		while((i < this.children.length) && (this.children[i] != child)) { i++ };
		if(i < this.children.length)
			this.children.splice(i, 1);
		this.invalidateMeasure();
		this.invalidateRender();
		child.setIsLoaded(false);
	},

	//
	// Insert a child element before another element already
	// in the container
	//
	insertBefore: function(newElement, beforeElement) {
		this.childChanged = true;
		var i = 0;
		while((i < this.children.length) && (this.children[i] != beforeElement)) { i++ };
		if(i < this.length)
			this.children = this.children.splice(i, 0, newElement);
		else
			this.children.push(newElement);
		this.invalidateMeasure();
		this.invalidateRender();
		newElement.setIsLoaded(this.isLoaded);
	},

	//
	// Return an array of children.
	// ATTENTION: use it only in READ ONLY
	//
	getChildren: function() {
		return this.children;
	},

}, {
	setIsLoaded: function(isLoaded) {
		if(isLoaded != this.isLoaded) {
			for(var i = 0; i < this.children.length; i++)
				this.children[i].setIsLoaded(isLoaded);
			Ui.Container.base.setIsLoaded.call(this, isLoaded);
		}
	},

	updateRenderCore: function() {
		// update childs
		if(this.childChanged) {
			this.childChanged = false;
			for(var i = 0; i < this.children.length; i++) {
				var child = this.children[i];
				child.getDrawing().style.zIndex = i;
				var found = false;
				for(var i2 = 0; (i2 < this.getDrawing().childNodes.length) && !found; i2++) {
					if(this.getDrawing().childNodes[i2] === child.getDrawing())
						found = true;
				}
				if(!found)
					this.getDrawing().appendChild(child.getDrawing());
			}
			var removeList = [];
			for(var i2 = 0; i2 < this.getDrawing().childNodes.length; i2++) {
				var found = false;
				for(var i = 0; (i < this.children.length) && !found; i++) {
					var child = this.children[i];
					if(child.getDrawing() === this.getDrawing().childNodes[i2])
						found = true;
				}
				if(!found)
					removeList.push(this.getDrawing().childNodes[i2]);
			}
			for(var i = 0; i < removeList.length; i++)
				this.getDrawing().removeChild(removeList[i]);
		}
		if(this.children.length != this.getDrawing().childNodes.length)
			throw('updateRenderChildren PROBLEM');
	},

	onInternalStyleChange: function() {
		this.onStyleChange();
		for(var i = 0; i < this.children.length; i++)
			this.children[i].setParentStyle(this.mergeStyle);
	},

	onInternalDisable: function() {
		Ui.Container.base.onInternalDisable.call(this);
		for(var i = 0; i < this.children.length; i++)
			this.children[i].setParentDisabled(true);
	},

	onInternalEnable: function() {
		Ui.Container.base.onInternalEnable.call(this);
		for(var i = 0; i < this.children.length; i++)
			this.children[i].setParentDisabled(false);
	},
});

