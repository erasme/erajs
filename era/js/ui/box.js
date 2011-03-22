

Ui.Container.extend('Ui.Box', {
	paddingTop: 0,
	paddingBottom: 0,
	paddingLeft: 0,
	paddingRight: 0,
	uniform: false,
	spacing: 0,
	star: 0,
	vertical: true,

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
		if(config.uniform != undefined)
			this.setUniform(config.uniform);
		if(config.spacing != undefined)
			this.setSpacing(config.spacing);
		if(config.orientation != undefined)
			this.setOrientation(config.orientation);
	},

	//
	// Get the layout orientation.
	// Possible values: [vertical|horizontal|
	//
	getOrientation: function() {
		if(this.vertical)
			return 'vertical';
		else
			return 'horizontal';
	},

	//
	// Set the layout orientation.
	// Possible values: [vertical|horizontal|
	//
	setOrientation: function(orientation) {
		var vertical = true;
		if(orientation != 'vertical')
			vertical = false;
		if(this.vertical != vertical) {
			this.vertical = vertical;
			this.invalidateMeasure();
		}
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

	//
	// True if all children will be arrange to have the
	// same width
	//
	getUniform: function() {
		return this.uniform;
	},

	//
	// Set true to force children arrangement to have the
	// same width
	//
	setUniform: function(uniform) {
		if(this.uniform != uniform) {
			this.uniform = uniform;
			this.invalidateMeasure();
		}
	},

	//
	// Return the space inserted between each
	// child
	//
	getSpacing: function() {
		return this.spacing;
	},

	//
	// Set the space value inserted between each child
	//
	setSpacing: function(spacing) {
		if(this.spacing != spacing) {
			this.spacing = spacing;
			this.invalidateMeasure();
		}
	},

	//
	// Append a child at the end of the box
	//
	append: function(child, resizable) {
		if(resizable == undefined)
			resizable = false;
		child.boxResizable = resizable;
		this.appendChild(child);
	},

	//
	// Remove a child from the box
	//
	remove: function(child) {
		this.removeChild(child);
	},

	//
	// Return if the given child is resizable or not 
	//
	getResizable: function(child) {
		return child.boxResizable;
	},

	//
	// Setup if the given child is resizable or not
	//
	setResizable: function(child, resizable) {
		if(child.boxResizable != resizable) {
			child.boxResizable = resizable;
			this.invalidateMeasure();
		}
	},

	//
	// Private
	//

	measureUniform: function(width, height, force) {
		var minWidth = 0;
		var minHeight = 0;
		var constraintWidth; var constraintHeight;
		if(this.vertical) {
			height -= this.spacing * (this.getChildren().length - 1);
			constraintWidth = width;
			constraintHeight = height / this.getChildren().length;
		}
		else {
			width -= this.spacing * (this.getChildren().length - 1);
			constraintWidth = width / this.getChildren().length;
			constraintHeight = height;
		}
		var countResizable = 0;

		for(var i = 0; i < this.getChildren().length; i++) {
			var child = this.getChildren()[i];
			if(!child.boxResizable) {
				var size = child.measure(constraintWidth, constraintHeight);
				if(size.width > minWidth)
					minWidth = size.width;
				if(size.height > minHeight)
					minHeight = size.height;
			}
			else
				countResizable++;
		}

		var minSize = 0;
		if(countResizable == 0)
			minSize = (this.vertical?minHeight:minWidth) * this.getChildren().length;
		else {			
			var star = (this.vertical?height:width) / this.getChildren().length;
			if(minSize > star)
				star = minSize;

			var resizableMinSize = 0;
			var starFound = true;

			do {
				resizableMinSize = 0;
				starFound = true;
				minSize = 0;

				for(var i = 0; i < this.getChildren().length; i++) {
					var child = this.getChildren()[i];
					if(child.boxResizable) {
						var size;
						if(this.vertical)
							size = child.measure(width, star);
						else
							size = child.measure(star, height);
						if((this.vertical?size.height:size.width) > star) {
							starFound = false;
							star = this.vertical?size.height:size.width;
							break;
						}
						else {
							if((this.vertical?size.width:size.height) > resizableMinSize)
								resizableMinSize = this.vertical?size.width:size.height;
						}
					}
				}
			} while(!starFound);

			if(this.vertical) {
				if(resizableMinSize > minWidth)
					minWidth = resizableMinSize;
			}
			else {
				if(resizableMinSize > minHeight)
					minHeight = resizableMinSize;
			}
			minSize = star * this.getChildren().length;
		}
		minSize += this.spacing * (this.getChildren().length - 1);
		if(this.vertical)
			return { width: minWidth, height: minSize };
		else
			return { width: minSize, height: minHeight };
	},

	measureNonUniform: function(width, height, force) {
		var minWidth = 0;
		var minHeight = 0;

		var constraintWidth = width;
		var constraintHeight = height;
		if(this.vertical)
			constraintHeight -= this.spacing * (this.getChildren().length - 1);
		else
			constraintWidth -= this.spacing * (this.getChildren().length - 1);

		var constraintSize = this.vertical?constraintHeight:constraintWidth;
		var countResizable = 0;
		var minSize = 0;
		var minOpSize = 0;

		for(var i = 0; i < this.getChildren().length; i++) {
			var child = this.getChildren()[i];
			if(!child.boxResizable) {
				var size = child.measure(constraintWidth, constraintHeight);
				if((this.vertical?size.width:size.height) > minOpSize)
					minOpSize = this.vertical?size.width:size.height;
				minSize += this.vertical?size.height:size.width;
			}
			else {
				child.boxStarDone = false;
				countResizable++;
			}
		}
		if(countResizable > 0) {
			var remainSize = constraintSize - minSize;

			var resizableMinOpSize = 0;
			var starFound = true;
			var star = remainSize / countResizable;

			do {
				resizableMinOpSize = 0;
				starFound = true;
				minSize = 0;

				for(var i = 0; i < this.getChildren().length; i++) {
					var child = this.getChildren()[i];
					if(!child.boxResizable) {
						if(this.vertical)
							child.measure(constraintWidth, child.getMeasureHeight(), force);
						else
							child.measure(child.getMeasureWidth(), constraintHeight, force);
						minSize += this.vertical?child.getMeasureHeight():child.getMeasureWidth();
					}
					else {
						if(!child.boxStarDone) {
							var size;
							if(this.vertical)
								size = child.measure(constraintWidth, star, force);
							else
								size = child.measure(star, constraintHeight, force);
							if((this.vertical?size.height:size.width) > star) {
								child.boxStarDone = true;
								starFound = false;
								remainSize -= this.vertical?size.height:size.width;
								countResizable--;
								star = remainSize / countResizable;
								break;
							}
							else {
								if((this.vertical?size.width:size.height) > resizableMinOpSize)
									resizableMinOpSize = this.vertical?size.width:size.height;
								minSize += star;
							}
						}
						else {
							if((this.vertical?child.getMeasureWidth():child.getMeasureHeight()) > resizableMinOpSize)
								resizableMinOpSize = this.vertical?child.getMeasureWidth():child.getMeasureHeight();
							minSize += this.vertical?child.getMeasureHeight():child.getMeasureWidth();
						}
					}
				}
			} while(!starFound);
			if(resizableMinOpSize > minOpSize)
				minOpSize = resizableMinOpSize;
		}
		minSize += this.spacing * (this.getChildren().length - 1);
		this.star = star;
		if(this.vertical)
			return { width: minOpSize, height: minSize };
		else
			return { width: minSize, height: minOpSize };
	},
}, {
	measureCore: function(width, height, force) {
		var left = this.getPaddingLeft();
		var right = this.getPaddingRight();
		var top = this.getPaddingTop();
		var bottom = this.getPaddingBottom();
		var constraintWidth = width - (left + right);
		var constraintHeight = height - (top + bottom);
		var size;
		if(this.uniform)
			size = this.measureUniform(constraintWidth, constraintHeight, force);
		else
			size = this.measureNonUniform(constraintWidth, constraintHeight, force);
		size.width += left + right;
		size.height += top + bottom;
		return size;
	},

	arrangeCore: function(width, height, force) {
		var left = this.paddingLeft;
		var right = this.paddingRight;
		var top = this.paddingTop;
		var bottom = this.paddingBottom;
		width -= left + right;
		height -= top + bottom;

		var offset = this.vertical?top:left;
		var childSize = ((this.vertical?height:width) - this.spacing * (this.getChildren().length - 1)) / this.getChildren().length;
		for(var i = 0; i < this.getChildren().length; i++) {
			var child = this.getChildren()[i];
			if(!this.uniform) {
				childSize = this.vertical?child.getMeasureHeight():child.getMeasureWidth();
				if(child.boxResizable && (childSize < this.star))
					childSize = this.star;
			}
			if(i != 0)
				offset += this.spacing;
			if(this.vertical)
				child.arrange(left, offset, width, childSize, force);
			else
				child.arrange(offset, top, childSize, height, force);
			offset += childSize;
		}
	},
});


Ui.Box.extend('Ui.VBox', {
	constructor: function(config) {
		this.setOrientation('vertical');
	},
});

Ui.Box.extend('Ui.HBox', {
	constructor: function(config) {
		this.setOrientation('horizontal');
	},
});
