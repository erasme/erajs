
Ui.Element.extend('Ui.Container', {
	children: undefined,

	constructor: function(config) {
		this.children = [];
	},

	//
	// Add a child in the container at the end
	//
	appendChild: function(child) {
		child.parent = this;
		this.children.push(child);
		this.getDrawing().appendChild(child.getDrawing());
		this.invalidateMeasure();
		child.setIsLoaded(this.isLoaded);
	},

	//
	// Add a child in the container at the begining
	//
	prependChild: function(child) {
		child.parent = this;
		this.children.unshift(child);
		this.invalidateMeasure();
		if(this.getDrawing().firstChild != undefined)
			this.getDrawing().insertBefore(child.getDrawing(), this.getDrawing().firstChild);
		else
			this.getDrawing().appendChild(child.getDrawing());
		child.setIsLoaded(this.isLoaded);
	},

	//
	// Remove a child element from the current container
	//
	removeChild: function(child) {
		child.parent = undefined;
		this.getDrawing().removeChild(child.getDrawing());
		var i = 0;
		while((i < this.children.length) && (this.children[i] != child)) { i++ };
		if(i < this.children.length)
			this.children.splice(i, 1);

		this.invalidateMeasure();
		child.setIsLoaded(false);
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

