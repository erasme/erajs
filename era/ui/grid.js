
Ui.Container.extend('Ui.Grid', 
/**@lends Ui.Grid#*/
{
	cols: undefined,
	rows: undefined,

	/**
	 * @constructs
	 * @class
	 * @extends Ui.Container
	 */
	constructor: function(config) {
		this.cols = [ { auto: true, star: false, absolute: false, actualWidth: 0, offset: 0, width: 0 } ];
		this.rows = [ { auto: true, star: false, absolute: false, actualHeight: 0, offset: 0, height: 0 } ];
	},

	setCols: function(cols) {
		this.cols = [];
		cols = cols.split(',');
		for(var i = 0; i < cols.length; i++) {
			var col = cols[i];
			if(col == 'auto')
				this.cols.push({ auto: true, star: false, absolute: false, actualWidth: 0, offset: 0, width: 0 });
			else if(col == '*')
				this.cols.push({ auto: false, star: true, absolute: false, actualWidth: 0, offset: 0, width: 1 });
			else if(col.match(/^[0-9]+\.?[0-9]*\*$/))
				this.cols.push({ auto: false, star: true, absolute: false, actualWidth: 0, offset: 0, width: parseInt(col.slice(0, col.length-1)) });
			else if(col.match(/^[0-9]+$/))
				this.cols.push({ auto: false, star: false, absolute: true, actualWidth: 0, offset: 0, width: parseInt(col) });
			else if(DEBUG)
				throw('Ui.Grid column definition "'+col+'" not supported');
		}
		this.invalidateMeasure();
	},

	setRows: function(rows) {
		this.rows = [];
		rows = rows.split(',');
		for(var i = 0; i < rows.length; i++) {
			var row = rows[i];
			if(row == 'auto')
				this.rows.push({ auto: true, star: false, absolute: false, actualHeight: 0, offset: 0, height: 0 });
			else if(row == '*')
				this.rows.push({ auto: false, star: true, absolute: false, actualHeight: 0, offset: 0, height: 1 });
			else if(row.match(/^[0-9]+\.?[0-9]*\*$/))
				this.rows.push({ auto: false, star: true, absolute: false, actualHeight: 0, offset: 0, height: parseInt(row.slice(0, row.length-1)) });
			else if(row.match(/^[0-9]+$/))
				this.rows.push({ auto: false, star: false, absolute: true, actualHeight: 0, offset: 0, height: parseInt(row) });
			else if(DEBUG)
				throw('Ui.Grid row definition "'+row+'" not supported');
		}
	},

	setContent: function(content) {
		while(this.getFirstChild() !== undefined)
			this.removeChild(this.getFirstChild());
		if((content !== undefined) && (typeof(content) === 'object')) {
			if(content.constructor == Array) {
				for(var i = 0; i < content.length; i++)
					this.appendChild(Ui.Element.create(content[i]));
			}
			else
				this.appendChild(Ui.Element.create(content));
		}
	},

	/**
	 * Attach a given child on the grid
	 */
	attach: function(child, col, row, colSpan, rowSpan) {
		if(colSpan === undefined)
			colSpan = 1;
		if(rowSpan === undefined)
			rowSpan = 1;

		Ui.Grid.setCol(child, col);
		Ui.Grid.setRow(child, row);
		Ui.Grid.setColSpan(child, colSpan);
		Ui.Grid.setRowSpan(child, rowSpan);

//		child.gridCol = col;
//		child.gridRow = row;
//		child.gridColSpan = colSpan;
//		child.gridRowSpan = rowSpan;
		this.appendChild(child);
	},

	/**
	 * Remove a given child from the grid
	 */
	detach: function(child) {
//		child.gridCol = undefined;
//		child.gridRow = undefined;
//		child.gridColSpan = undefined;
//		child.gridRowSpan = undefined;
		this.removeChild(child);
	},

	/**#@+
	 * @private
	 */

	getColMin: function(colPos) {
		var i; var i2; var currentColumn;
		var col = this.cols[colPos];
		var min = 0;
		for(i = 0; i < this.getChildren().length; i++) {
			var child = this.getChildren()[i];
			var childCol = Ui.Grid.getCol(child);
			var childColSpan = Ui.Grid.getColSpan(child);
				
			if((childColSpan == 1) && (childCol == colPos)) {
				if(child.getMeasureWidth() > min)
					min = child.getMeasureWidth();
			}
			else if((childCol <= colPos) && (childCol + childColSpan > colPos)) {
				var isLastAuto = true;
				var hasStar = false;
				var prev = 0.0;
					
				for(i2 = childCol; i2 < colPos; i2++) {
					currentColumn = this.cols[i2];
					prev += currentColumn.actualWidth;
					if(currentColumn.star) {
						hasStar = true;
						break;
					}
				}
				
				if(!hasStar) {
					for(i2 = colPos+1; i2 < childCol + childColSpan; i2++) {
						currentColumn = this.cols[i2];
						if(currentColumn.star) {
							hasStar = true;
							break;
						}
						if(currentColumn.auto) {
							isLastAuto = false;
							break;
						}
					}
				}
				if(!hasStar && isLastAuto) {
					if((child.getMeasureWidth() - prev) > min)
						min = child.getMeasureWidth() - prev;
				}
			}
		}
		return min;
	},

	getRowMin: function(rowPos)
	{
		var i; var i2; var currentRow;
		var row = this.rows[rowPos];
		var min = 0;

		for(i = 0; i < this.getChildren().length; i++) {
			var child = this.getChildren()[i];
			var childRow = Ui.Grid.getRow(child);
			var childRowSpan = Ui.Grid.getRowSpan(child);
			
			if((childRowSpan == 1) && (childRow == rowPos)) {
				if(child.getMeasureHeight() > min)
					min = child.getMeasureHeight();
			}
			else if((childRow <= rowPos) && (childRow + childRowSpan > rowPos)) {
				var isLastAuto = true;
				var hasStar = false;
				var prev = 0.0;
				
				for(i2 = childRow; i2 < rowPos; i2++) {
					currentRow = this.rows[i2];
					prev += currentRow.actualHeight;
					if(currentRow.star) {
						hasStar = true;
						break;
					}
				}

				if(!hasStar) {
					for(i2 = rowPos+1; i2 < childRow + childRowSpan; i2++) {
						currentRow = this.rows[i2];
						if(currentRow.star) {
							hasStar = true;
							break;
						}
						if(currentRow.auto) {
							isLastAuto = false;
							break;
						}
					}
				}
				if(!hasStar && isLastAuto) {
					if((child.getMeasureHeight() - prev) > min)
						min = child.getMeasureHeight() - prev;
				}
			}
		}
		return min;
	}

	/**#@-*/
}, 
/**@lends Ui.Grid#*/
{
	measureCore: function(width, height) {
		var i; var child; var col; var colSpan; var colPos;
		var childX; var childWidth; var x; var row; var rowPos;

		for(i = 0; i < this.getChildren().length; i++) {
			child = this.getChildren()[i];
			var constraintWidth = (width * Ui.Grid.getColSpan(child)) / this.cols.length;
			var constraintHeight = (height * Ui.Grid.getRowSpan(child)) / this.rows.length;
			child.measure(constraintWidth, constraintHeight);
		}

		var colStarCount = 0.0;
		var colStarSize = 0.0;
		var rowStarCount = 0.0;
		var rowStarSize = 0.0;
			
		var offsetX = 0;
		for(colPos = 0; colPos < this.cols.length; colPos++) {
			col = this.cols[colPos];
			col.offset = offsetX;
			if(col.absolute)
				col.actualWidth += col.width;
			else if(col.star) {
				col.actualWidth = 0;
				colStarCount += col.width;
			}
			else if(col.auto) {
				col.actualWidth = this.getColMin(colPos);
			}
			offsetX += col.actualWidth;
		}

		// propose a star width
		var starWidth = 0.0;
		if(colStarCount > 0.0)
			starWidth = (width - offsetX) / colStarCount;

		// update to column auto with the proposed star width
		offsetX = 0;
		for(i = 0; i < this.cols.length; i++) {
			col = this.cols[i];
			col.offset = offsetX;
			if(col.star)
				col.actualWidth = starWidth * col.width;
			offsetX += col.actualWidth;
		}

		// redo the element measure with the correct width constraint
		for(i = 0; i < this.getChildren().length; i++) {
			child = this.getChildren()[i];
			col = Ui.Grid.getCol(child);
			colSpan = Ui.Grid.getColSpan(child);
				
			childX = this.cols[col].offset;
			childWidth = 0.0;
				
			for(x = col; x < col+colSpan; x++)
				childWidth += this.cols[x].actualWidth;

			child.measure(childWidth, height);
		}
			
		// redo the width measure with the new element measure
		offsetX = 0;
		for(colPos = 0; colPos < this.cols.length; colPos++) {
			col = this.cols[colPos];
			col.offset = offsetX;
			if(col.absolute) {
				col.actualWidth = col.width;
			}
			else if(col.star) {
				col.actualWidth = Math.max(this.getColMin(colPos), starWidth * col.width);
				colStarSize += col.actualWidth;
			}
			else if(col.auto) {
				col.actualWidth = this.getColMin(colPos);
			}
			offsetX += col.actualWidth;
		}
						
		// redo the element measure with the correct width constraint
		for(i = 0; i < this.getChildren().length; i++) {
			child = this.getChildren()[i];
			col = Ui.Grid.getCol(child);
			colSpan = Ui.Grid.getColSpan(child);
				
			childX = this.cols[col].offset;
			childWidth = 0.0;
				
			for(x = col; x < col+colSpan; x++)
				childWidth += this.cols[x].actualWidth;

			child.measure(childWidth, height);
		}
		
		// do the height measure
		var offsetY = 0;
		for(rowPos = 0; rowPos < this.rows.length; rowPos++) {
			row = this.rows[rowPos];
			row.offset = offsetY;
			if(row.absolute)
				row.actualHeight = row.height;
			else if(row.star) {
				row.actualHeight = 0;
				rowStarCount += row.height;
			}
			else if(row.auto)
				row.actualHeight = this.getRowMin(rowPos);
			offsetY += row.actualHeight;
		}
		
		// propose a star height
		var starHeight = 0.0;
		if(rowStarCount > 0.0)
			starHeight = (height - offsetY) / rowStarCount;
			
		// update to column with the proposed star width
		offsetY = 0;
		for(i = 0; i < this.rows.length; i++) {
			row = this.rows[i];
			row.offset = offsetY;
			if(row.star)
				row.actualHeight = starHeight * row.height;
			offsetY += row.actualHeight;
		}
			
		// redo the element measure height the correct height constraint
		for(i = 0; i < this.getChildren().length; i++) {
			child = this.getChildren()[i];
			col = Ui.Grid.getCol(child);
			colSpan = Ui.Grid.getColSpan(child);
				
			childX = this.cols[col].offset;
			childWidth = 0.0;
				
			for(x = col; x < col+colSpan; x++)
				childWidth += this.cols[x].actualWidth;
				
			row = Ui.Grid.getRow(child);
			var rowSpan = Ui.Grid.getRowSpan(child);
			
			var childY = this.rows[row].offset;
			var childHeight = 0.0;
				
			for(var y = row; y < row+rowSpan; y++)
				childHeight += this.rows[y].actualHeight;

			child.measure(childWidth, childHeight);
		}
				
		// redo the height measure with the new element measure
		offsetY = 0;
		for(rowPos = 0; rowPos < this.rows.length; rowPos++) {
			row = this.rows[rowPos];
			row.offset = offsetY;
			if(row.absolute) {
				row.actualHeight = row.height;
			}
			else if(row.star) {
				var rowMin = this.getRowMin(rowPos);
				row.actualHeight = Math.max(rowMin, starHeight * row.height);
				rowStarSize += row.actualHeight;
			}
			else if(row.auto) {
				row.actualHeight = this.getRowMin(rowPos);
			}
			offsetY += row.actualHeight;
		}
		return { width: offsetX, height: offsetY };
	},

	arrangeCore: function(width, height) {
		for(var i = 0; i < this.getChildren().length; i++) {
			var child = this.getChildren()[i];
			var col = Ui.Grid.getCol(child);
			var colSpan = Ui.Grid.getColSpan(child);
			var row = Ui.Grid.getRow(child);
			var rowSpan = Ui.Grid.getRowSpan(child);
				
			var childX = this.cols[col].offset;
			var childY = this.rows[row].offset;
			var childWidth = 0.0;
			var childHeight = 0.0;
				
			for(var x = col; x < col+colSpan; x++)
				childWidth += this.cols[x].actualWidth;
			for(var y = row; y < row+rowSpan; y++)
				childHeight += this.rows[y].actualHeight;
			
			child.arrange(childX, childY, childWidth, childHeight);
		}
	}
}, {
	getCol: function(child) {
		return (child['Ui.Grid.col'] !== undefined)?child['Ui.Grid.col']:0;
	},

	setCol: function(child, col) {
		if(Ui.Grid.getCol(child) != col) {
			child['Ui.Grid.col'] = col;
			child.invalidateMeasure();
		}
	},

	getRow: function(child) {
		return (child['Ui.Grid.row'] !== undefined)?child['Ui.Grid.row']:0;
	},

	setRow: function(child, row) {
		if(Ui.Grid.getRow(child) !== row) {
			child['Ui.Grid.row'] = row;
			child.invalidateMeasure();
		}
	},

	getColSpan: function(child) {
		return (child['Ui.Grid.colSpan'] !== undefined)?child['Ui.Grid.colSpan']:1;
	},

	setColSpan: function(child, colSpan) {
		if(Ui.Grid.getColSpan(child) !== colSpan) {
			child['Ui.Grid.colSpan'] = colSpan;
			child.invalidateMeasure();
		}
	},

	getRowSpan: function(child) {
		return (child['Ui.Grid.rowSpan'] !== undefined)?child['Ui.Grid.rowSpan']:1;
	},

	setRowSpan: function(child, rowSpan) {
		if(Ui.Grid.getRowSpan(child) !== rowSpan) {
			child['Ui.Grid.rowSpan'] = rowSpan;
			child.invalidateMeasure();
		}
	}
});
