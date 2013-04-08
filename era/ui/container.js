Ui.Element.extend('Ui.Container', 
/** @lends Ui.Container#*/
{
	children: undefined,

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
		child.getDrawing().style.zIndex = this.children.length;
		child.setIsLoaded(this.isLoaded);
		child.setParentVisible(this.getIsVisible());
		this.onChildInvalidateMeasure(child);
	},

	/**
	 * Add a child in the container at the begining
	 */
	prependChild: function(child) {
		child.parent = this;
		this.children.unshift(child);
		if(this.getDrawing().firstChild != undefined)
			this.getDrawing().insertBefore(child.getDrawing(), this.getDrawing().firstChild);
		else
			this.getDrawing().appendChild(child.getDrawing());
		for(var i = 0; i < this.children.length; i++)
			this.children[i].getDrawing().style.zIndex = i + 1;
		child.setIsLoaded(this.isLoaded);
		child.setParentVisible(this.getIsVisible());
		this.onChildInvalidateMeasure(child);
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
		for(var i = 0; i < this.children.length; i++)
			this.children[i].getDrawing().style.zIndex = i + 1;
		child.setIsLoaded(false);
		child.setParentVisible(false);
		this.onChildInvalidateMeasure(child, true);
	},

	/**
	 * Insert a child element in the current container at the given position
	 */

	insertChildAt: function(child, position) {
		this.appendChild(child);
		this.moveChildAt(child, position);
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
		while((i < this.children.length) && (this.children[i] != child)) { i++ };
		if(i < this.children.length) {
			this.children.splice(i, 1);
			this.children.splice(position, 0, child);
			for(var i = 0; i < this.children.length; i++)
				this.children[i].getDrawing().style.zIndex = i + 1;
		}
		this.onChildInvalidateMeasure(child);
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
	},

	/**
	 * @return the child position in the container or
	 * -1 if the container does not have this child
	 */
	getChildPosition: function(child) {
		for(var i = 0; i < this.children.length; i++){
			if(this.children[i] === child){
				return i;
			}
		}
		return -1;
	},

	/**
	 * @return true if the element passed is one of the container's children
	 */
	hasChild: function(child) {
		return this.getChildPosition(child) !== -1;
	},

	/**
	 * Remove all the container's children
	 */
	clear: function(){
		while(this.getFirstChild() != null){
			this.removeChild(this.getFirstChild());
		}
	}
}, 
/** @lends Ui.Container#*/
{
	get: function(name) {
		if(this.name == name)
			return this;
		else {
			for(var i = 0; i < this.children.length; i++) {
				var child = this.children[i];
				var res = child.get(name);
				if(res != undefined)
					return res;
			}
		}
		return undefined;
	},

	/**#@+
	 * @private
	 */
	setIsLoaded: function(isLoaded) {
		if(this.isLoaded != isLoaded) {
			this.isLoaded = isLoaded;
			if(isLoaded)
				this.onLoad();
			else
				this.onUnload();
			for(var i = 0; i < this.children.length; i++)
				this.children[i].setIsLoaded(isLoaded);
		}
	},

	onInternalStyleChange: function() {
		if(!this.isLoaded)
			return;
		this.onStyleChange();
		if(this.children != undefined) {
			for(var i = 0; i < this.children.length; i++)
				this.children[i].setParentStyle(this.mergeStyle);
		}
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
	}
	/**#@-*/
});

