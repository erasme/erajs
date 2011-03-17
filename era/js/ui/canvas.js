

Ui.Container.extend('Ui.Canvas', {

	constructor: function(config) {
		this.addEvents('resize');
	},

	setElementPosition: function(item, x, y) {
		if(x != undefined)
			item.canvasX = x;
		if(y != undefined)
			item.canvasY = y;
		this.invalidateArrange();
	},

}, {
	//
	// Return the required size for the current element
	//
	measureCore: function(width, height, force) {
		for(var i = 0; i < this.getChildren().length; i++)
			this.getChildren()[i].measure(width, height, force);
		return { width: 0, height: 0 };
	},

	//
	// Arrange children
	//
	arrangeCore: function(width, height, force) {
		this.fireEvent('resize', this);
		for(var i = 0; i < this.getChildren().length; i++) {
			var child = this.getChildren()[i];
			child.arrange((child.canvasX == undefined)?0:child.canvasX, (child.canvasY == undefined)?0:child.canvasY, child.getMeasureWidth(), child.getMeasureHeight(), force);
		}
	},

	appendChild: function(child, x, y) {
		child.canvasX = x;
		child.canvasY = y;
		Ui.Canvas.base.appendChild.call(this, child);
	},

	insertBefore: function(newElement, beforeElement, x, y) {
		child.canvasX = x;
		child.canvasY = y;
		Ui.Canvas.base.insertBefore.call(this, newElement, beforeElement);
	}

});

