Ui.Element.extend('Ui.Container', 
/** @lends Ui.Container#*/
{
	children: undefined,
	containerDrawing: undefined,

    /**
	 * @constructs
	 * @class
	 * @extends Ui.Element
	 */
	constructor: function(config) {
		this.children = [];
		if(this.containerDrawing === undefined)
			this.containerDrawing = this.getDrawing();
	},

	getContainerDrawing: function() {
		return this.containerDrawing;
	},

	setContainerDrawing: function(containerDrawing) {
		this.containerDrawing = containerDrawing;
	},
	
	/**
	 * Add a child in the container at the end
	 */
	appendChild: function(child) {
		child.parent = this;
		this.children.push(child);
		this.containerDrawing.appendChild(child.getDrawing());
		child.setIsLoaded(this.isLoaded);
		child.setParentVisible(this.getIsVisible());
		child.setParentDisabled(this.getIsDisabled());
		this.onChildInvalidateMeasure(child, 'add');
	},

	/**
	 * Add a child in the container at the begining
	 */
	prependChild: function(child) {
		child.parent = this;
		this.children.unshift(child);
		if(this.containerDrawing.firstChild !== undefined)
			this.containerDrawing.insertBefore(child.getDrawing(), this.containerDrawing.firstChild);
		else
			this.containerDrawing.appendChild(child.getDrawing());
		child.setIsLoaded(this.isLoaded);
		child.setParentVisible(this.getIsVisible());
		child.setParentDisabled(this.getIsDisabled());
		this.onChildInvalidateMeasure(child, 'add');
	},

	/**
	 * Remove a child element from the current container
	 */
	removeChild: function(child) {
		child.parent = undefined;
		this.containerDrawing.removeChild(child.getDrawing());
		var i = 0;
		while((i < this.children.length) && (this.children[i] !== child)) { i++; }
		if(i < this.children.length)
			this.children.splice(i, 1);
		child.setIsLoaded(false);
		child.setParentVisible(false);
		this.onChildInvalidateMeasure(child, 'remove');
	},

	/**
	 * Insert a child element in the current container at the given position
	 */

	insertChildAt: function(child, position) {
		position = Math.max(0, Math.min(position, this.children.length));

		child.parent = this;
		this.children.splice(position, 0, child);
		if((this.containerDrawing.firstChild !== undefined) && (position < this.children.length-1))
			this.containerDrawing.insertBefore(child.getDrawing(), this.containerDrawing.childNodes[position]);
		else
			this.containerDrawing.appendChild(child.getDrawing());
		child.setIsLoaded(this.isLoaded);
		child.setParentVisible(this.getIsVisible());
		child.setParentDisabled(this.getIsDisabled());
		this.onChildInvalidateMeasure(child, 'add');
	},

	insertChildBefore: function(child, beforeChild) {
		this.insertChildAt(child, this.getChildPosition(beforeChild));
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
		while((i < this.children.length) && (this.children[i] !== child)) { i++; }
		if(i < this.children.length) {
			this.children.splice(i, 1);
			this.children.splice(position, 0, child);
			this.containerDrawing.removeChild(child.getDrawing());
			if((this.containerDrawing.firstChild !== undefined) && (position < this.containerDrawing.childNodes.length))
				this.containerDrawing.insertBefore(child.getDrawing(), this.containerDrawing.childNodes[position]);
			else
				this.containerDrawing.appendChild(child.getDrawing());
		}
		this.onChildInvalidateMeasure(child, 'move');
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
		while(this.getFirstChild() !== undefined){
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
				if(res !== undefined)
					return res;
			}
		}
		return undefined;
	},

	elementFromPoint: function(x , y) {
		if(!this.getIsVisible())
			return undefined;
		
		var matrix = this.getLayoutTransform();
		var point = new Ui.Point({ x: x, y: y });
		point.matrixTransform(matrix);

		var isInside = ((point.x >= 0) && (point.x <= this.layoutWidth) &&
		   (point.y >= 0) && (point.y <= this.layoutHeight));

		if(this.getClipToBounds() && !isInside)
			return undefined;
		
		if(this.children !== undefined) {
			for(var i = this.children.length-1; i >= 0; i--) {
				var found = this.children[i].elementFromPoint(point.x, point.y);
				if(found !== undefined)
					return found;
			}
		}
		if(!this.getEventsHidden() && isInside)
			return this;
		
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
		if(this.children !== undefined) {
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

