

Ui.Container.extend('Ui.VBox', {
	paddingTop: 0,
	paddingBottom: 0,
	paddingLeft: 0,
	paddingRight: 0,
	uniform: false,
	spacing: 0,
	starHeight: 0,

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
	// same height
	//
	getUniform: function() {
		return this.uniform;
	},

	//
	// Set true to force children arrangement to have the
	// same height
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

		height -= this.spacing * (this.getChildren().length - 1);

		var countResizable = 0;
		var constraintHeight = height / this.getChildren().length;

		for(var i = 0; i < this.getChildren().length; i++) {
			var child = this.getChildren()[i];
			if(!child.vboxResizable) {
				var size = child.measure(width, constraintHeight);
				if(size.width > minWidth)
					minWidth = size.width;
				if(size.height > minHeight)
					minHeight = size.height;
			}
			else
				countResizable++;
		}

		if(countResizable == 0) {
			minHeight *= this.getChildren().length;
		}
		else {			
			var starHeight = height / this.getChildren().length;
			if(minHeight > starHeight)
				starHeight = minHeight;

			var resizableMinWidth = 0;
			var starFound = true;

			do {
				resizableMinWidth = 0;
				starFound = true;
				minHeight = 0;

				for(var i = 0; i < this.getChildren().length; i++) {
					var child = this.getChildren()[i];
					if(child.vboxResizable) {
						var size = child.measure(width, starHeight);
						if(size.height > starHeight) {
							starFound = false;
							starHeight = size.height;
							break;
						}
						else {
							if(size.width > resizableMinWidth)
								resizableMinWidth = size.width;
						}
					}
				}
			} while(!starFound);
			if(resizableMinWidth > minWidth)
				minWidth = resizableMinWidth;
			minHeight = starHeight * this.getChildren().length;
		}
		minHeight += this.spacing * (this.getChildren().length - 1);
		return { width: minWidth, height: minHeight };
	},

	measureChildrenNonUniform: function(width, height, force) {
		var minWidth = 0;
		var minHeight = 0;

		height -= this.spacing * (this.getChildren().length - 1);

		var countResizable = 0;
		var constraintHeight = height;

		for(var i = 0; i < this.getChildren().length; i++) {
			var child = this.getChildren()[i];
			if(!child.vboxResizable) {
				var size = child.measure(width, constraintHeight);
				if(size.width > minWidth)
					minWidth = size.width;
				minHeight += size.height;
				constraintHeight -= size.height;
			}
			else {
				child.vboxStarDone = false;
				countResizable++;
			}
		}
		if(countResizable > 0) {
			var remainHeight = height - minHeight;

			var resizableMinWidth = 0;
			var starFound = true;
			var starHeight = remainHeight / countResizable;

			do {
				resizableMinWidth = 0;
				starFound = true;
				minHeight = 0;

				for(var i = 0; i < this.getChildren().length; i++) {
					var child = this.getChildren()[i];
					if(!child.vboxResizable) {
						child.measure(width, child.getMeasureHeight(), force);
						minHeight += child.getMeasureHeight();
					}
					else {
						if(!child.vboxStarDone) {
							var size = child.measure(width, starHeight, force);
							if(size.height > starHeight) {
								child.vboxStarDone = true;
								starFound = false;
								remainHeight -= size.height;
								countResizable--;
								starHeight = remainHeight / countResizable;
								break;
							}
							else {
								if(size.width > resizableMinWidth)
									resizableMinWidth = size.width;
								minHeight += starHeight;
							}
						}
						else {
							if(child.getMeasureWidth() > resizableMinWidth)
								resizableMinWidth = child.getMeasureWidth();
							minHeight += child.getMeasureHeight();
						}
					}
				}
			} while(!starFound);
			if(resizableMinWidth > minWidth)
				minWidth = resizableMinWidth;
		}
		else {
			minHeight = 0;
			for(var i = 0; i < this.getChildren().length; i++) {
				var child = this.getChildren()[i];
				child.measure(width, child.getMeasureHeight(), force);
				minHeight += child.getMeasureHeight();
			}
		}
		minHeight += this.spacing * (this.getChildren().length - 1);
		this.starHeight = starHeight;
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
		var y = top;
		var childHeight = (height - this.spacing * (this.getChildren().length - 1)) / this.getChildren().length;
		for(var i = 0; i < this.getChildren().length; i++) {
			var child = this.getChildren()[i];
			if(!this.uniform) {
				childHeight = child.getMeasureHeight();
				if((child.vboxResizable) && (child.getMeasureHeight() < this.starHeight))
					childHeight = this.starHeight;
				else
					childHeight = child.getMeasureHeight();
			}
			if(i != 0)
				y += this.spacing;
			child.arrange(left, y, width, childHeight, force);
			y += childHeight;
		}
	},

	appendChild: function(child, resizable) {
		if(resizable == undefined)
			resizable = false;
		child.vboxResizable = resizable;
		Ui.VBox.base.appendChild.call(this, child);
	},

	insertBefore: function(newElement, beforeElement, resizable) {
		if(resizable == undefined)
			resizable = false;
		child.vboxResizable = resizable;
		Ui.VBox.base.insertBefore.call(this, newElement, beforeElement);
	}
});

