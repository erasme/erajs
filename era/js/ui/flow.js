

Ui.Container.extend('Ui.Flow', {
	uniform: false,
	uniformWidth: undefined,
	uniformHeight: undefined,

	constructor: function(config) {
		if(config.uniform != undefined)
			this.setUniform(config.uniform);
	},

	//
	// True if all children will be arrange to have the
	// same width and height
	//
	getUniform: function() {
		return this.uniform;
	},

	//
	// Set true to force children arrangement to have the
	// same width and height
	//
	setUniform: function(uniform) {
		if(this.uniform != uniform) {
			this.uniform = uniform;
			this.invalidateMeasure();
		}
	},

	//
	// Append a child at the end of the flow
	//
	append: function(child) {
		this.appendChild(child);
	},

	//
	// Remove a child from the flow
	//
	remove: function(child) {
		this.removeChild(child);
	},

	//
	// Private
	//

	measureChildrenNonUniform: function(width, height, force) {
		var line = { pos: 0, y: 0, width: 0, height: 0 };
		var lineCount = 0;
		var lineX = 0;
		var lineY = 0;
		var lineHeight = 0;
		var minWidth = 0;

		for(var i = 0; i < this.getChildren().length; i++) {
			var child = this.getChildren()[i];
			var size = child.measure(width, height, force);
			if((lineX != 0) && (lineX + size.width > width)) {
				line.width = lineX;
				line.height = lineHeight;
				
				lineX = 0;
				lineY += lineHeight;
				lineHeight = 0;

				line = { pos: ++lineCount, y: lineY, width: 0, height: 0 };
			}
			child.flowLine = line;
			child.flowLineX = lineX;
			lineX += size.width;
			if(size.height > lineHeight)
				lineHeight = size.height;
			if(lineX > minWidth)
				minWidth = lineX;
		}
		lineY += lineHeight;
		line.width = lineX;
		line.height = lineHeight;

		return { width: minWidth, height: lineY };
	},

	measureChildrenUniform: function(width, height, force) {
		var maxWidth = 0;
		var maxHeight = 0;
		for(var i = 0; i < this.getChildren().length; i++) {
			var child = this.getChildren()[i];
			var size = child.measure(width, height, force);
			if(size.width > maxWidth)
				maxWidth = size.width;
			if(size.height > maxHeight)
				maxHeight = size.height;
		}
		var countPerLine = Math.max(Math.floor(width / maxWidth), 1);
		var nbLine = Math.ceil(this.getChildren().length / countPerLine);

		for(var i = 0; i < this.getChildren().length; i++)
			this.getChildren()[i].measure(maxWidth, maxHeight, force);
		this.uniformWidth = maxWidth;
		this.uniformHeight = maxHeight;
		return { width: maxWidth * countPerLine, height: nbLine * maxHeight };
	},

}, {
	measureCore: function(width, height, force) {
		if(this.uniform)
			return this.measureChildrenUniform(width, height, force);
		else
			return this.measureChildrenNonUniform(width, height, force);
	},

	arrangeCore: function(width, height, force) {
		if(this.uniform) {
			var x = 0;
			var y = 0; 
			for(var i = 0; i < this.getChildren().length; i++) {
				var child = this.getChildren()[i];
				if(x + this.uniformWidth > width) {
					x = 0;
					y += this.uniformHeight;
				}
				child.arrange(x, y, this.uniformWidth, this.uniformHeight, force);
				x += this.uniformWidth;
			}
		}
		else {
			for(var i = 0; i < this.getChildren().length; i++) {
				var child = this.getChildren()[i];
				child.arrange(child.flowLineX, child.flowLine.y, child.getMeasureWidth(), child.flowLine.height, force);
			}
		}
	},
});

