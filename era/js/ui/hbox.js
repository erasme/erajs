

Ui.Container.extend('Ui.HBox', {
	paddingTop: 0,
	paddingBottom: 0,
	paddingLeft: 0,
	paddingRight: 0,
	uniform: false,
	spacing: 0,
	starWidth: 0,

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
	// Private
	//

	measureChildrenUniform: function(width, height, force) {
		var minWidth = 0;
		var minHeight = 0;

		width -= this.spacing * (this.getChildren().length - 1);

		var countResizable = 0;
		var constraintWidth = width / this.getChildren().length;

		for(var i = 0; i < this.getChildren().length; i++) {
			var child = this.getChildren()[i];
			if(!child.hboxResizable) {
				var size = child.measure(constraintWidth, height);
				if(size.width > minWidth)
					minWidth = size.width;
				if(size.height > minHeight)
					minHeight = size.height;
			}
			else
				countResizable++;
		}

		if(countResizable == 0) {
			minWidth *= this.getChildren().length;
		}
		else {			
			var starWidth = width / this.getChildren().length;
			if(minWidth > starWidth)
				starWidth = minWidth;

			var resizableMinHeight = 0;
			var starFound = true;

			do {
				resizableMinHeight = 0;
				starFound = true;
				minWidth = 0;

				for(var i = 0; i < this.getChildren().length; i++) {
					var child = this.getChildren()[i];
					if(child.hboxResizable) {
						var size = child.measure(starWidth, height);
						if(size.width > starWidth) {
							starFound = false;
							starWidth = size.width;
							break;
						}
						else {
							if(size.height > resizableMinHeight)
								resizableMinHeight = size.height;
						}
					}
				}
			} while(!starFound);
			if(resizableMinHeight > minHeight)
				minHeight = resizableMinHeight;
			minWidth = starWidth * this.getChildren().length;
		}
		minWidth += this.spacing * (this.getChildren().length - 1);
		return { width: minWidth, height: minHeight };
	},

	measureChildrenNonUniform: function(width, height, force) {
		var minWidth = 0;
		var minHeight = 0;

		width -= this.spacing * (this.getChildren().length - 1);

		var countResizable = 0;
		var constraintWidth = width;

		for(var i = 0; i < this.getChildren().length; i++) {
			var child = this.getChildren()[i];
			if(!child.hboxResizable) {
				var size = child.measure(constraintWidth, height);
				if(size.height > minHeight)
					minHeight = size.height;
				minWidth += size.width;
				constraintWidth -= size.width;
			}
			else {
				child.hboxStarDone = false;
				countResizable++;
			}
		}
		if(countResizable > 0) {
			var remainWidth = width - minWidth;

			var resizableMinHeight = 0;
			var starFound = true;
			var starWidth = remainWidth / countResizable;

			do {
				resizableMinHeight = 0;
				starFound = true;
				minWidth = 0;

				for(var i = 0; i < this.getChildren().length; i++) {
					var child = this.getChildren()[i];
					if(!child.hboxResizable) {
						child.measure(child.getMeasureWidth(), height);
						minWidth += child.getMeasureWidth();
					}
					else {
						if(!child.hboxStarDone) {
							var size = child.measure(starWidth, height);
							if(size.width > starWidth) {
								child.hboxStarDone = true;
								starFound = false;
								remainWidth -= size.width;
								countResizable--;
								starWidth = remainWidth / countResizable;
								break;
							}
							else {
								if(size.height > resizableMinHeight)
									resizableMinHeight = size.height;
								minWidth += starWidth;
							}
						}
						else {
							if(child.getMeasureHeight() > resizableMinHeight)
								resizableMinHeight = child.getMeasureHeight();
							minWidth += child.getMeasureWidth();
						}
					}
				}
			} while(!starFound);
			if(resizableMinHeight > minHeight)
				minHeight = resizableMinHeight;
		}
		else {
			minWidth = 0;
			for(var i = 0; i < this.getChildren().length; i++) {
				var child = this.getChildren()[i];
				child.measure(child.getMeasureWidth(), height);
				minWidth += child.getMeasureWidth();
			}
		}
		minWidth += this.spacing * (this.getChildren().length - 1);
		this.starWidth = starWidth;
		return { width: minWidth, height: minHeight };
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
			size = this.measureChildrenUniform(constraintWidth, constraintHeight, force);
		else
			size = this.measureChildrenNonUniform(constraintWidth, constraintHeight, force);
		size.width += left + right;
		size.height += top + bottom;
		return size;
	},

	arrangeCore: function(width, height, force) {
		var left = this.getPaddingLeft();
		var right = this.getPaddingRight();
		var top = this.getPaddingTop();
		var bottom = this.getPaddingBottom();
		width -= left + right;
		height -= top + bottom;

		var x = left;
		var childWidth = width / this.getChildren().length;
		for(var i = 0; i < this.getChildren().length; i++) {
			var child = this.getChildren()[i];
			if(!this.uniform) {
				if((child.hboxResizable) && (child.getMeasureWidth() < this.starWidth))
					childWidth = this.starWidth;
				else
					childWidth = child.getMeasureWidth();
			}
			if(i != 0)
				x += this.spacing;
			child.arrange(x, top, childWidth, height, force);
			x += childWidth;
		}
	},

	appendChild: function(child, resizable) {
		if(resizable == undefined)
			resizable = false;
		child.hboxResizable = resizable;
		Ui.HBox.base.appendChild.call(this, child);
	},

	insertBefore: function(newElement, beforeElement, resizable) {
		if(resizable == undefined)
			resizable = false;
		child.hboxResizable = resizable;
		Ui.HBox.base.insertBefore.call(this, newElement, beforeElement);
	}
});

