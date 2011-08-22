Ui.Element.extend('Ui.Container', 
/** @lends Ui.Container#*/
{
	children: undefined,
	useZ: false,

    /**
    * @constructs
	* @class
    * @extends Ui.Element
	*/
	constructor: function(config) {
		this.children = [];
	},

	/**
	* Add a child in the container at the end
	*/
	appendChild: function(child) {
		child.parent = this;
		this.children.push(child);
		this.getDrawing().appendChild(child.getDrawing());
		if(this.useZ)
			child.getDrawing().style.zIndex = this.children.length;
		this.invalidateMeasure();
		child.setIsLoaded(this.isLoaded);
	},

	/**
	* Add a child in the container at the begining
	*/
	prependChild: function(child) {
		child.parent = this;
		this.children.unshift(child);
		this.invalidateMeasure();
		if(this.getDrawing().firstChild != undefined)
			this.getDrawing().insertBefore(child.getDrawing(), this.getDrawing().firstChild);
		else
			this.getDrawing().appendChild(child.getDrawing());
		if(this.useZ) {
			for(var i = 0; i < this.children.length; i++)
				this.children[i].getDrawing().style.zIndex = i + 1;
		}
		child.setIsLoaded(this.isLoaded);
	},

	/**
	* Remove a child element from the current container
	*/
	removeChild: function(child) {
		child.parent = undefined;
		this.getDrawing().removeChild(child.getDrawing());
		var i = 0;
		while((i < this.children.length) && (this.children[i] != child)) { i++ };
		if(i < this.children.length)
			this.children.splice(i, 1);
		if(this.useZ) {
			for(var i = 0; i < this.children.length; i++)
				this.children[i].getDrawing().style.zIndex = i + 1;
		}
		this.invalidateMeasure();
		child.setIsLoaded(false);
	},

	/**
	* Move a child from its current position to
	* the given position. Negative value allow
	* to specify position from the end.
	*/
	moveChildAt: function(child, position) {
		if(position < 0)
			position = this.children.length + position;
		if(position < 0)
			position = 0;
		if(position >= this.children.length)
			position = this.children.length;
		var i = 0;
		this.useZ = true;
		while((i < this.children.length) && (this.children[i] != child)) { i++ };
		if(i < this.children.length) {
			this.children.splice(i, 1);
			this.children.splice(position, 0, child);
			for(var i = 0; i < this.children.length; i++)
				this.children[i].getDrawing().style.zIndex = i + 1;
		}
	},

	/**
	* @return An array of children.
	* ATTENTION: use it only in READ ONLY
	*/
	getChildren: function() {
		return this.children;
	},

	/**
	* @return the first child or undefined
	* if the container has no children
	*/
	getFirstChild: function() {
		if(this.children.length > 0)
			return this.children[0];
		else
			return undefined;
	},

	/**
	* @return the last child or undefined
	* if the container has no children
	*/
	getLastChild: function() {
		if(this.children.length > 0)
			return this.children[this.children.length - 1];
		else
			return undefined;
	}
}, 
/** @lends Ui.Container#*/
{
	/**#@+
	 * @private
	 */
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

	onInternalVisible: function() {
		Ui.Container.base.onInternalVisible.call(this);
		for(var i = 0; i < this.children.length; i++)
			this.children[i].setParentVisible(true);
	},

	onInternalHidden: function() {
		Ui.Container.base.onInternalHidden.call(this);
		for(var i = 0; i < this.children.length; i++)
			this.children[i].setParentVisible(false);
	},

	onInternalSetOpacity: function(cumulOpacity) {
		if(this.children == undefined)
			return;
		Ui.Container.base.onInternalSetOpacity.call(this);
		for(var i = 0; i < this.children.length; i++)
			this.children[i].setParentCumulOpacity(cumulOpacity);
	}
	/**#@-*/
});

