Ui.Container.extend('Ui.Box', 
/**@lends Ui.Box#*/
{
	paddingTop: 0,
	paddingBottom: 0,
	paddingLeft: 0,
	paddingRight: 0,
	uniform: false,
	spacing: 0,
	star: 0,
	vertical: true,

	/**
	*	@constructs
	*	@class
	*	@extends Ui.Container
	*/
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
	// Append a child at the begining of the box
	//
	prepend: function(child, resizable) {
		if(resizable == undefined)
			resizable = false;
		child.boxResizable = resizable;
		this.prependChild(child);
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

	/**#@+
	* @private
	*/
	measureUniform: function(width, height) {
		var constraintSize = this.vertical?height:width;
		var constraintOpSize = this.vertical?width:height;

		constraintSize -= this.spacing * (this.getChildren().length - 1);
		var childConstraintSize = constraintSize / this.getChildren().length;
		var countResizable = 0;
		var uniformSize = 0;
		var minOpSize = 0;

		var loop = true;
		while(loop) {
			for(var i = 0; i < this.getChildren().length; i++) {
				var child = this.getChildren()[i];
				if(child.boxResizable)
					countResizable++;
				var size;
				if(this.vertical)
					size = child.measure(constraintOpSize, childConstraintSize);
				else
					size = child.measure(childConstraintSize, constraintOpSize);
				if((this.vertical?size.width:size.height) > minOpSize)
					minOpSize = this.vertical?size.width:size.height;
				if((this.vertical?size.height:size.width) > uniformSize)
					uniformSize = this.vertical?size.height:size.width;
			}
			if((minOpSize > constraintOpSize) || (uniformSize > childConstraintSize)) {
				if(uniformSize > childConstraintSize)
					childConstraintSize = uniformSize;
				constraintOpSize = minOpSize;
				minOpSize = 0;
				uniformSize = 0;
				countResizable = 0;
			}
			else
				loop = false;
		}
		if((countResizable > 0) && (uniformSize * this.getChildren().length < constraintSize))
			uniformSize = constraintSize / this.getChildren().length;

		this.uniformSize = uniformSize;
		var minSize = this.uniformSize * this.getChildren().length;
		minSize += this.spacing * (this.getChildren().length - 1);
		if(this.vertical)
			return { width: minOpSize, height: minSize };
		else
			return { width: minSize, height: minOpSize };
	},

	measureNonUniformVertical: function(width, height) {
		var constraintWidth = width;
		var constraintHeight = height;
		constraintHeight -= this.spacing * (this.getChildren().length - 1);

		var countResizable = 0;
		var minWidth = 0;
		var minHeight = 0;
		var loop = true;

		while(loop) {
			for(var i = 0; i < this.getChildren().length; i++) {
				var child = this.getChildren()[i];
				var size = child.measure(constraintWidth, 0);
				if(size.width > minWidth)
					minWidth = size.width;
				if(!child.boxResizable) {
					minHeight += size.height;
				}
				else {
					child.boxStarDone = false;
					countResizable++;
				}
			}
			if(minWidth > constraintWidth) {
				constraintWidth = minWidth;
				minWidth = 0;
				minHeight = 0;
				countResizable = 0;
			}
			else
				loop = false;
		}
		if(countResizable > 0) {
			var remainHeight = constraintHeight - minHeight;
			var starFound = true;
			var star = remainHeight / countResizable;
			do {
				starFound = true;
				for(var i = 0; i < this.getChildren().length; i++) {
					var child = this.getChildren()[i];
					if(child.boxResizable) {
						if(!child.boxStarDone) {
							if(child.getMeasureHeight() > star) {
								child.boxStarDone = true;
								starFound = false;
								remainHeight -= child.getMeasureHeight();
								minHeight += child.getMeasureHeight();
								countResizable--;
								star = remainHeight / countResizable;
								break;
							}
							else {
								child.measure(constraintWidth, star);
							}
						}
					}
				}
			} while(!starFound);
		}
		minHeight += this.spacing * (this.getChildren().length - 1);
		if(countResizable > 0) {
			minHeight += star * countResizable;
			this.star = star;
		}
		return { width: minWidth, height: minHeight };
	},

	measureNonUniformHorizontal: function(width, height) {
		var constraintWidth = width;
		var constraintHeight = height;
		constraintWidth -= this.spacing * (this.getChildren().length - 1);

		var countResizable;
		var minWidth;
		var minHeight;
		var loop = true;

		while(loop) {
			countResizable = 0;
			minWidth = 0;
			minHeight = 0;

			// handle not resizable
			for(var i = 0; i < this.getChildren().length; i++) {
				var child = this.getChildren()[i];
				if(!child.boxResizable) {
					var size = child.measure(0, constraintHeight);
					if(size.height > minHeight)
						minHeight = size.height;
					minWidth += size.width;
				}
				else {
					child.boxStarDone = false;
					countResizable++;
				}
			}
			if(countResizable > 0) {
				var remainWidth = constraintWidth - minWidth;
				var starFound = true;
				var star = remainWidth / countResizable;
				do {
					starFound = true;
					for(var i = 0; i < this.getChildren().length; i++) {
						var child = this.getChildren()[i];
						if(child.boxResizable) {
							if(!child.boxStarDone) {
								var size = child.measure(star, constraintHeight);
								if(size.height > minHeight)
									minHeight = size.height;
								if(size.width > star) {
									child.boxStarDone = true;
									starFound = false;
									remainWidth -= size.width;
									minWidth += size.width;
									countResizable--;
									star = remainWidth / countResizable;
									break;
								}
							}
						}
					}
				} while(!starFound);
			}
			if(minHeight > constraintHeight)
				constraintHeight = minHeight;
			else
				loop = false;
		}

		minWidth += this.spacing * (this.getChildren().length - 1);
		if(countResizable > 0) {
			minWidth += star * countResizable;
			this.star = star;
		}
		return { width: minWidth, height: minHeight };
	}
	/**#@-*/
}, 
/**@lends Ui.Box#*/
{
	measureCore: function(width, height) {
		var left = this.getPaddingLeft();
		var right = this.getPaddingRight();
		var top = this.getPaddingTop();
		var bottom = this.getPaddingBottom();
		var constraintWidth = Math.max(0, width - (left + right));
		var constraintHeight = Math.max(0, height - (top + bottom));
		var size;

		if(this.uniform)
			size = this.measureUniform(constraintWidth, constraintHeight);
		else {
			if(this.vertical)
				size = this.measureNonUniformVertical(constraintWidth, constraintHeight);
			else
				size = this.measureNonUniformHorizontal(constraintWidth, constraintHeight);
		}
		size.width += left + right;
		size.height += top + bottom;
		return size;
	},

	arrangeCore: function(width, height) {
		var left = this.paddingLeft;
		var right = this.paddingRight;
		var top = this.paddingTop;
		var bottom = this.paddingBottom;
		width -= left + right;
		height -= top + bottom;

		var offset = this.vertical?top:left;
		for(var i = 0; i < this.getChildren().length; i++) {
			var child = this.getChildren()[i];
			if(i != 0)
				offset += this.spacing;

			if(this.uniform) {
				if(this.vertical)
					child.arrange(left, offset, width, this.uniformSize);
				else
					child.arrange(offset, top, this.uniformSize, height);
				offset += this.uniformSize;
			}
			else {
				if((child.boxResizable) && ((this.vertical?child.getMeasureHeight():child.getMeasureWidth()) < this.star)) {
					if(this.vertical)
						child.arrange(left, offset, width, this.star);
					else
						child.arrange(offset, top, this.star, height);
					offset += this.star;
				}
				else {
					if(this.vertical) {
						child.arrange(left, offset, width, child.getMeasureHeight());
						offset += child.getMeasureHeight();
					}
					else {
						child.arrange(offset, top, child.getMeasureWidth(), height);
						offset += child.getMeasureWidth();
					}
				}
			}
		}
	}
});


Ui.Box.extend('Ui.VBox', 
/**@lends Ui.VBox#*/
{
	/**
	*	@constructs
	*	@class
	*	@extends Ui.Box
	*/
	constructor: function(config) {
		this.setOrientation('vertical');
	}
});

Ui.Box.extend('Ui.HBox', 
/**@lends Ui.HBox#*/
{
	/**
	*	@constructs
	*	@class
	*	@extends Ui.Box
	*/
	constructor: function(config) {
		this.setOrientation('horizontal');
	}
});
