

Ui.Container.extend('Ui.LBox', {
	paddingTop: 0,
	paddingBottom: 0,
	paddingLeft: 0,
	paddingRight: 0,

	constructor: function(config) {
		if(config.padding != undefined)
			this.setPadding(config.padding);
		if(config.paddingTop != undefined)
			this.setPaddingTop(config.paddingTop);
		if(config.paddingBottom != undefined)
			this.setPaddingBottom(config.paddingBottom);
		if(config.paddingLeft != undefined)
			this.setPaddingLeft(config.paddingLeft);
		if(config.paddingRight != undefined)
			this.setPaddingRight(config.paddingRight);
	},

	//
	// Set the padding for all borders
	//
	setPadding: function(padding) {
		this.setPaddingTop(padding);
		this.setPaddingBottom(padding);
		this.setPaddingLeft(padding);
		this.setPaddingRight(padding);
	},

	//
	// Return the current element top padding
	//
	getPaddingTop: function() {
		return this.paddingTop;
	},

	//
	// Set the current element top padding
	//
	setPaddingTop: function(paddingTop) {
		if(this.paddingTop != paddingTop) {
			this.paddingTop = paddingTop;
			this.invalidateMeasure();
		}
	},

	//
	// Return the current element bottom padding
	//
	getPaddingBottom: function() {
		return this.paddingBottom;
	},

	//
	// Set the current element bottom padding
	//
	setPaddingBottom: function(paddingBottom) {
		if(this.paddingBottom != paddingBottom) {
			this.paddingBottom = paddingBottom;
			this.invalidateMeasure();
		}
	},

	//
	// Return the current element left padding
	//
	getPaddingLeft: function() {
		return this.paddingLeft;
	},

	//
	// Set the current element left padding
	//
	setPaddingLeft: function(paddingLeft) {
		if(this.paddingLeft != paddingLeft) {
			this.paddingLeft = paddingLeft;
			this.invalidateMeasure();
		}
	},

	//
	// Return the current element right padding
	//
	getPaddingRight: function() {
		return this.paddingRight;
	},

	//
	// Set the current element right padding
	//
	setPaddingRight: function(paddingRight) {
		if(this.paddingRight != paddingRight) {
			this.paddingRight = paddingRight;
			this.invalidateMeasure();
		}
	},

}, {
	//
	// Return the required size for the current element
	//
	measureCore: function(width, height, force) {
		var left = this.getPaddingLeft();
		var right = this.getPaddingRight();
		var top = this.getPaddingTop();
		var bottom = this.getPaddingBottom();
		var constraintWidth = width - (left + right);
		var constraintHeight = height - (top + bottom);
		var minWidth = 0;
		var minHeight = 0;
		for(var i = 0; i < this.getChildren().length; i++) {
			var child = this.getChildren()[i];
			var size = child.measure(constraintWidth, constraintHeight, force);
			if(size.width > minWidth)
				minWidth = size.width;
			if(size.height > minHeight)
				minHeight = size.height;
		}
		minWidth += left + right;
		minHeight += top + bottom;
		return { width: minWidth, height: minHeight };
	},

	//
	// Arrange children
	//
	arrangeCore: function(width, height, force) {
		var left = this.getPaddingLeft();
		var right = this.getPaddingRight();
		var top = this.getPaddingTop();
		var bottom = this.getPaddingBottom();
		width -= left + right;
		height -= top + bottom;
		for(var i = 0; i < this.getChildren().length; i++)
			this.getChildren()[i].arrange(left, top, width, height, force);
	},
});

