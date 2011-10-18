

Ui.Container.extend('Ui.Flow', 
/**@lends Ui.Flow#*/
{
	uniform: false,
	uniformWidth: undefined,
	uniformHeight: undefined,

	/**
	 * @constructs
	 * @class
	 * @extends Ui.Container
	 */	
	constructor: function(config) {
	},

	/**
	 * True if all children will be arrange to have the
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
			if((ctx.lineX != 0) && (ctx.lineX + size.width > width)) {
				line.width = ctx.lineX;
				line.height = ctx.lineHeight;
				ctx.lineX = 0;
				ctx.lineY += ctx.lineHeight;
				ctx.lineHeight = 0;

				ctx.lineCount++;
				line = { pos: ctx.lineCount, y: ctx.lineY, width: 0, height: 0 };
			}
			child.flowLine = line;
			child.flowLineX = ctx.lineX;
			ctx.lineX += size.width;
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
		var maxWidth = 0;
		var maxHeight = 0;
		for(var i = 0; i < this.getChildren().length; i++) {
			var child = this.getChildren()[i];
			var size = child.measure(width, height);
			if(size.width > maxWidth)
				maxWidth = size.width;
			if(size.height > maxHeight)
				maxHeight = size.height;
		}
		var countPerLine = Math.max(Math.floor(width / maxWidth), 1);
		var nbLine = Math.ceil(this.getChildren().length / countPerLine);

		for(var i = 0; i < this.getChildren().length; i++)
			this.getChildren()[i].measure(maxWidth, maxHeight);
		this.uniformWidth = maxWidth;
		this.uniformHeight = maxHeight;
		return { width: maxWidth * countPerLine, height: nbLine * maxHeight };
	}
	/**#@-*/
}, 
/**@lends Ui.Flow#*/
{
	measureCore: function(width, height) {
		if(this.getChildren().length == 0)
			return { width: 0, height: 0 };

//		console.log(this+'.measureCore('+width+','+height+')');
		if(this.uniform)
			return this.measureChildrenUniform(width, height);
		else
			return this.measureChildrenNonUniform(width, height);
	},

	arrangeCore: function(width, height) {
		if(this.uniform) {
			var x = 0;
			var y = 0; 
			for(var i = 0; i < this.getChildren().length; i++) {
				var child = this.getChildren()[i];
				if(x + this.uniformWidth > width) {
					x = 0;
					y += this.uniformHeight;
				}
				child.arrange(x, y, this.uniformWidth, this.uniformHeight);
				x += this.uniformWidth;
			}
		}
		else {
			for(var i = 0; i < this.getChildren().length; i++) {
				var child = this.getChildren()[i];
				child.arrange(child.flowLineX, child.flowLine.y, child.getMeasureWidth(), child.flowLine.height);
			}
		}
	}
});

