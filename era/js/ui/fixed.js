

Ui.Container.extend('Ui.Fixed', {

	constructor: function(config) {
		this.addEvents('resize');
	},

	setPosition: function(item, x, y) {
		if(x != undefined)
			item.fixedX = x;
		if(y != undefined)
			item.fixedY = y;
		this.invalidateArrange();
	},

	append: function(child, x, y) {
		child.fixedX = x;
		child.fixedY = y;
		this.appendChild(child);
	},

}, {
	//
	// Return the required size for the current element
	//
	measureCore: function(width, height) {
		for(var i = 0; i < this.getChildren().length; i++)
			this.getChildren()[i].measure(width, height);
		return { width: 0, height: 0 };
	},

	//
	// Arrange children
	//
	arrangeCore: function(width, height) {
		this.fireEvent('resize', this, width, height);
		for(var i = 0; i < this.getChildren().length; i++) {
			var child = this.getChildren()[i];
			child.arrange((child.fixedX == undefined)?0:child.fixedX, (child.fixedY == undefined)?0:child.fixedY, child.getMeasureWidth(), child.getMeasureHeight());
		}
	},

	onChildInvalidateMeasure: function(child) {
		child.measure(this.getLayoutWidth(), this.getLayoutHeight());
	},

	onChildInvalidateArrange: function(child) {
		child.arrange((child.fixedX == undefined)?0:child.fixedX, (child.fixedY == undefined)?0:child.fixedY, child.getMeasureWidth(), child.getMeasureHeight());
	},
});

