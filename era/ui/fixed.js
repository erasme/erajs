Ui.Container.extend('Ui.Fixed', 
/**@lends Ui.Fixed#*/
{
	/**
	 * @constructs
	 * @class
	 * @extends Ui.Container
	 */
	constructor: function(config) {
		this.addEvents('resize');
	},

	setPosition: function(item, x, y) {
		if(x !== undefined)
			item['Ui.Fixed.x'] = x;
		if(y !== undefined)
			item['Ui.Fixed.y'] = y;
		this.updateItemTransform(item);
	},
	
	setRelativePosition: function(item, x, y, absolute) {
		if(x !== undefined)
			item['Ui.Fixed.relativeX'] = x;
		if(y !== undefined)
			item['Ui.Fixed.relativeY'] = y;
		item['Ui.Fixed.relativeAbsolute'] = absolute === true;
		this.updateItemTransform(item);
	},

	append: function(child, x, y) {
		child['Ui.Fixed.x'] = x;
		child['Ui.Fixed.y'] = y;
		this.appendChild(child);
	},

	remove: function(child) {
		delete(child['Ui.Fixed.x']);
		delete(child['Ui.Fixed.y']);
		delete(child['Ui.Fixed.relativeX']);
		delete(child['Ui.Fixed.relativeY']);
		delete(child['Ui.Fixed.relativeAbsolute']);
		this.removeChild(child);
	},

	updateItemTransform: function(child) {
		var x = 0;
		if(child['Ui.Fixed.x'] !== undefined)
			x = child['Ui.Fixed.x'];
		if(child['Ui.Fixed.relativeX'] !== undefined)
			x -= child['Ui.Fixed.relativeX'] * ((child['Ui.Fixed.relativeAbsolute'] === true)?1:child.getMeasureWidth());

		var y = 0;
		if(child['Ui.Fixed.y'] !== undefined)
			y = child['Ui.Fixed.y'];
		if(child['Ui.Fixed.relativeY'] !== undefined)
			y -= child['Ui.Fixed.relativeY'] * ((child['Ui.Fixed.relativeAbsolute'] === true)?1:child.getMeasureHeight());
		
		child.setTransform(Ui.Matrix.createTranslate(x, y));
	}
}, 
/**@lends Ui.Fixed#*/
{
	/**
	 * Return the required size for the current element
	 */
	measureCore: function(width, height) {
		for(var i = 0; i < this.getChildren().length; i++)
			this.getChildren()[i].measure(width, height);
		return { width: 0, height: 0 };
	},

	/**
	 * Arrange children
	 */
	arrangeCore: function(width, height) {
		this.fireEvent('resize', this, width, height);
		for(var i = 0; i < this.getChildren().length; i++) {
			var child = this.getChildren()[i];

			var x = 0;
			if(child['Ui.Fixed.x'] !== undefined)
				x = child['Ui.Fixed.x'];
			if(child['Ui.Fixed.relativeX'] !== undefined)
				x -= child['Ui.Fixed.relativeX'] * ((child['Ui.Fixed.relativeAbsolute'] === true)?1:child.getMeasureWidth());

			var y = 0;
			if(child['Ui.Fixed.y'] !== undefined)
				y = child['Ui.Fixed.y'];
			if(child['Ui.Fixed.relativeY'] !== undefined)
				y -= child['Ui.Fixed.relativeY'] * ((child['Ui.Fixed.relativeAbsolute'] === true)?1:child.getMeasureHeight());

			child.arrange(x, y, child.getMeasureWidth(), child.getMeasureHeight());
		}
	},

	onChildInvalidateMeasure: function(child, event) {
		if(event !== 'remove')
			child.measure(this.getLayoutWidth(), this.getLayoutHeight());
	},

	onChildInvalidateArrange: function(child) {
		child.arrange(0, 0, child.getMeasureWidth(), child.getMeasureHeight());
		this.updateItemTransform(child);
	}
});

