

Ui.Container.extend('Ui.Flow', 
/**@lends Ui.Flow#*/
{
	uniform: false,
	uniformWidth: undefined,
	uniformHeight: undefined,
	itemAlign: 'left',
	spacing: 0,

	/**
	 * @constructs
	 * @class
	 * @extends Ui.Container
	 */	
	constructor: function(config) {
	},

	/*
	 * Replace all item by the given one or the
	 * array of given items
	 */
	setContent: function(content) {
		while(this.getFirstChild() !== undefined)
			this.removeChild(this.getFirstChild());
		if((content !== undefined) && (typeof(content) == 'object')) {
			if(content.constructor == Array) {
				for(var i = 0; i < content.length; i++)
					this.appendChild(Ui.Element.create(content[i]));
			}
			else
				this.appendChild(Ui.Element.create(content));
		}
	},
	
	/*
	 * Return the space between each item and each line
	 */
	getSpacing: function() {
		return this.spacing;
	},
	
	/*
	 * Set the space between each item and each line
	 */
	setSpacing: function(spacing) {
		if(this.spacing != spacing) {
			this.spacing = spacing;
			this.invalidateMeasure();
			this.invalidateArrange();
		}
	},
	
	/*
	 * Return item horizontal alignment [left|right]
	 */
	getItemAlign: function() {
		return this.itemAlign;
	},
	
	/*
	 * Choose howto horizontaly align items [left|right]
	 */
	setItemAlign: function(itemAlign) {
		if(itemAlign != this.itemAlign) {
			this.itemAlign = itemAlign;
			this.invalidateMeasure();
			this.invalidateArrange();
		}
	},

	/**
	 * true if all children will be arrange to have the
	 * same width and height
	 */
	getUniform: function() {
		return this.uniform;
	},

	/**
	 * Set true to force children arrangement to have the
	 * same width and height
	 */
	setUniform: function(uniform) {
		if(this.uniform != uniform) {
			this.uniform = uniform;
			this.invalidateMeasure();
		}
	},

	/**
	 * Append a child at the end of the flow
	 */
	append: function(child) {
		this.appendChild(child);
	},

	/**
	 * Append a child at the begining of the flow
	 */
	prepend: function(child) {
		this.prependChild(child);
	},

	/**
	 * Append a child at the given position
	 */
	insertAt: function(child, position) {
		this.insertChildAt(child, position);
	},

	/*
	 * Move a given item from its current position to
	 * the given one
	 */
	moveAt: function(child, position) {
		this.moveChildAt(child, position);
	},

	/**
	 * Remove a child from the flow
	 */
	remove: function(child) {
		this.removeChild(child);
	},

	/**#@+
	 * @private
	 */

	measureChildrenNonUniform: function(width, height) {
		var line = { pos: 0, y: 0, width: 0, height: 0 };
		var ctx = { lineX: 0, lineY: 0, lineCount: 0, lineHeight: 0, minWidth: 0 };

		for(var i = 0; i < this.getChildren().length; i++) {
			var child = this.getChildren()[i];
			var size = child.measure(width, height);
			if((ctx.lineX !== 0) && (ctx.lineX + size.width > width)) {
				line.width = ctx.lineX - this.spacing;
				line.height = ctx.lineHeight;
				ctx.lineX = 0;
				ctx.lineY += ctx.lineHeight + this.spacing;
				ctx.lineHeight = 0;

				ctx.lineCount++;
				line = { pos: ctx.lineCount, y: ctx.lineY, width: 0, height: 0 };
			}
			child.flowLine = line;
			child.flowLineX = ctx.lineX;
			ctx.lineX += size.width + this.spacing;
			if(size.height > ctx.lineHeight)
				ctx.lineHeight = size.height;
			if(ctx.lineX > ctx.minWidth)
				ctx.minWidth = ctx.lineX;
		}
		ctx.lineY += ctx.lineHeight;
		line.width = ctx.lineX;
		line.height = ctx.lineHeight;

		return { width: ctx.minWidth, height: ctx.lineY };
	},

	measureChildrenUniform: function(width, height) {
		var i; var child; var size;
		var maxWidth = 0;
		var maxHeight = 0;
		for(i = 0; i < this.getChildren().length; i++) {
			child = this.getChildren()[i];
			size = child.measure(width, height);
			if(size.width > maxWidth)
				maxWidth = size.width;
			if(size.height > maxHeight)
				maxHeight = size.height;
		}
		var countPerLine = Math.max(Math.floor((width+this.spacing)/(maxWidth+this.spacing)), 1);
		
		var nbLine = Math.ceil(this.getChildren().length / countPerLine);

		for(i = 0; i < this.getChildren().length; i++)
			this.getChildren()[i].measure(maxWidth, maxHeight);
		this.uniformWidth = maxWidth;
		this.uniformHeight = maxHeight;
		return {
			width: maxWidth*countPerLine + (countPerLine-1)*this.spacing,
			height: nbLine*maxHeight + (nbLine-1)*this.spacing
		};
	}
	/**#@-*/
}, 
/**@lends Ui.Flow#*/
{
	measureCore: function(width, height) {
		if(this.getChildren().length === 0)
			return { width: 0, height: 0 };
		if(this.uniform)
			return this.measureChildrenUniform(width, height);
		else
			return this.measureChildrenNonUniform(width, height);
	},

	arrangeCore: function(width, height) {
		var x; var y; var i; var child;
		if(this.uniform) {
			if(this.itemAlign === 'left') {
				x = 0;
				y = 0;
				for(i = 0; i < this.getChildren().length; i++) {
					child = this.getChildren()[i];
					if(x + this.uniformWidth > width) {
						x = 0;
						y += this.uniformHeight + this.spacing;
					}
					child.arrange(x, y, this.uniformWidth, this.uniformHeight);
					x += this.uniformWidth + this.spacing;
				}
			}
			else if(this.itemAlign === 'right') {
				var nbItemPerLine = Math.max(Math.floor((width+this.spacing)/(this.uniformWidth+this.spacing)), 1);
				var lineWidth = nbItemPerLine*this.uniformWidth + (nbItemPerLine-1)*this.spacing;
				
				if(this.getChildren().length < nbItemPerLine)
					x = width - ((this.getChildren().length*(this.uniformWidth+this.spacing)) - this.spacing);
				else
					x = width - lineWidth;
				y = 0;
				for(i = 0; i < this.getChildren().length; i++) {
					child = this.getChildren()[i];
					if(x + this.uniformWidth > width) {
						if(this.getChildren().length - i < nbItemPerLine)
							x = width - (((this.getChildren().length-i)*(this.uniformWidth+this.spacing)) - this.spacing);
						else
							x = width - lineWidth;
						y += this.uniformHeight + this.spacing;
					}
					child.arrange(x, y, this.uniformWidth, this.uniformHeight);
					x += this.uniformWidth + this.spacing;
				}
			}
		}
		else {
			for(i = 0; i < this.getChildren().length; i++) {
				child = this.getChildren()[i];
				if(this.itemAlign == 'left')
					child.arrange(child.flowLineX, child.flowLine.y, child.getMeasureWidth(), child.flowLine.height);
				else
					child.arrange(child.flowLineX+(width - child.flowLine.width), child.flowLine.y, child.getMeasureWidth(), child.flowLine.height);
			}
		}
	}
});

