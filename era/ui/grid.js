
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
		if(config.cols != undefined) {
			this.cols = [];
			var cols = config.cols.split(',');
			for(var i = 0; i < cols.length; i++) {
				var col = cols[i];
				if(col == 'auto')
					this.cols.push({ auto: true, star: false, absolute: false, actualWidth: 0, offset: 0, width: 0 });
				else if(col == '*')
					this.cols.push({ auto: false, star: true, absolute: false, actualWidth: 0, offset: 0, width: 1 });
				else if(col.match(/^[0-9]+\.?[0-9]*\*$/))
					this.cols.push({ auto: false, star: true, absolute: false, actualWidth: 0, offset: 0, width: new Number(col.slice(0, col.length-1)) });
				else if(col.match(/^[0-9]+$/))
					this.cols.push({ auto: false, star: false, absolute: true, actualWidth: 0, offset: 0, width: new Number(col) });
//#if DEBUG
				else
					throw('Ui.Grid column definition "'+col+'" not supported');
//#end
			}
		}
		else
			this.cols = [ { auto: true, star: false, absolute: false, actualWidth: 0, offset: 0, width: 0 } ];
		if(config.rows != undefined) {
			this.rows = [];
			var rows = config.rows.split(',');
			for(var i = 0; i < rows.length; i++) {
				var row = rows[i];
				if(row == 'auto')
					this.rows.push({ auto: true, star: false, absolute: false, actualHeight: 0, offset: 0, height: 0 });
				else if(row == '*')
					this.rows.push({ auto: false, star: true, absolute: false, actualHeight: 0, offset: 0, height: 1 });
				else if(row.match(/^[0-9]+\.?[0-9]*\*$/))
					this.rows.push({ auto: false, star: true, absolute: false, actualHeight: 0, offset: 0, height: new Number(row.slice(0, row.length-1)) });
				else if(row.match(/^[0-9]+$/))
					this.rows.push({ auto: false, star: false, absolute: true, actualHeight: 0, offset: 0, height: new Number(row) });
//#if DEBUG
				else
					throw('Ui.Grid row definition "'+row+'" not supported');
//#end
			}

		}
		else
			this.rows = [ { auto: true, star: false, absolute: false, actualHeight: 0, offset: 0, height: 0 } ];
	},

	/**
	 * Attach a given child on the grid
	 */
	attach: function(child, col, row, colSpan, rowSpan) {
		if(colSpan == undefined)
			colSpan = 1;
		if(rowSpan == undefined)
			rowSpan = 1;
		child.gridCol = col;
		child.gridRow = row;
		child.gridColSpan = colSpan;
		child.gridRowSpan = rowSpan;
		this.appendChild(child);
	},

	/**
	 * Remove a given child from the grid
	 */
	detach: function(child) {
		child.gridCol = undefined;
		child.gridRow = undefined;
		child.gridColSpan = undefined;
		child.gridRowSpan = undefined;
		this.removeChild(child);
	},

	/**#@+
	 * @private
	 */

	getColMin: function(colPos) {
		var col = this.cols[colPos];
		var min = 0;
		for(var i = 0; i < this.getChildren().length; i++) {
			var child = this.getChildren()[i];
			var childCol = child.gridCol;
			var childColSpan = child.gridColSpan;
				
			if((childColSpan == 1) && (childCol == colPos)) {
				if(child.getMeasureWidth() > min)
					min = child.getMeasureWidth();
			}
			else if((childCol <= colPos) && (childCol + childColSpan > colPos)) {
				var isLastAuto = true;
				var hasStar = false;
				var prev = 0.0;
					
				for(var i2 = childCol; i2 < colPos; i2++) {
					var currentColumn = this.cols[i2];
					prev += currentColumn.actualWidth;
					if(currentColumn.star) {
						hasStar = true;
						break;
					}
				}
				
				if(!hasStar) {
					for(var i2 = colPos+1; i2 < childCol + childColSpan; i2++) {
						var currentColumn = this.cols[i2];
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
		var row = this.rows[rowPos];
		var min = 0;

		for(var i = 0; i < this.getChildren().length; i++) {
			var child = this.getChildren()[i];
			var childRow = child.gridRow;
			var childRowSpan = child.gridRowSpan;
			
			if((childRowSpan == 1) && (childRow == rowPos)) {
				if(child.getMeasureHeight() > min)
					min = child.getMeasureHeight();
			}
			else if((childRow <= rowPos) && (childRow + childRowSpan > rowPos)) {
				var isLastAuto = true;
				var hasStar = false;
				var prev = 0.0;
				
				for(var i2 = childRow; i2 < rowPos; i2++) {
					var currentRow = this.rows[i2];
					prev += currentRow.actualHeight;
					if(currentRow.star) {
						hasStar = true;
						break;
					}
				}

				if(!hasStar) {
					for(var i2 = rowPos+1; i2 < childRow + childRowSpan; i2++) {
						var currentRow = this.rows[i2];
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
//		console.log(this+'.measureCore('+width+','+height+')');

		for(var i = 0; i < this.getChildren().length; i++) {
			var child = this.getChildren()[i];
			var constraintWidth = (width * child.gridColSpan) / this.cols.length;
			var constraintHeight = (height * child.gridRowSpan) / this.rows.length;
			child.measure(constraintWidth, constraintHeight);
		}

		var colStarCount = 0.0;
		var colStarSize = 0.0;
		var rowStarCount = 0.0;
		var rowStarSize = 0.0;
			
		var offsetX = 0;
		for(var colPos = 0; colPos < this.cols.length; colPos++) {
			var col = this.cols[colPos];
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
		for(var i = 0; i < this.cols.length; i++) {
			var col = this.cols[i];
			col.offset = offsetX;
			if(col.star)
				col.actualWidth = starWidth * col.width;
			offsetX += col.actualWidth;
		}

		// redo the element measure with the correct width constraint
		for(var i = 0; i < this.getChildren().length; i++) {
			var child = this.getChildren()[i];
			var col = child.gridCol;
			var colSpan = child.gridColSpan;
				
			var childX = this.cols[col].offset;
			var childWidth = 0.0;
				
			for(var x = col; x < col+colSpan; x++)
				childWidth += this.cols[x].actualWidth;

			child.measure(childWidth, height);
		}
			
		// redo the width measure with the new element measure
		offsetX = 0;
		for(var colPos = 0; colPos < this.cols.length; colPos++) {
			var col = this.cols[colPos];
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
		for(var i = 0; i < this.getChildren().length; i++) {
			var child = this.getChildren()[i];
			var col = child.gridCol;
			var colSpan = child.gridColSpan;
				
			var childX = this.cols[col].offset;
			var childWidth = 0.0;
				
			for(var x = col; x < col+colSpan; x++)
				childWidth += this.cols[x].actualWidth;

			child.measure(childWidth, height);
		}
		
		// do the height measure
		var offsetY = 0;
		for(var rowPos = 0; rowPos < this.rows.length; rowPos++) {
			var row = this.rows[rowPos];
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
		for(var i = 0; i < this.rows.length; i++) {
			var row = this.rows[i];
			row.offset = offsetY;
			if(row.star)
				row.actualHeight = starHeight * row.height;
			offsetY += row.actualHeight;
		}
			
		// redo the element measure height the correct height constraint
		for(var i = 0; i < this.getChildren().length; i++) {
			var child = this.getChildren()[i];
			var col = child.gridCol;
			var colSpan = child.gridColSpan;
				
			var childX = this.cols[col].offset;
			var childWidth = 0.0;
				
			for(var x = col; x < col+colSpan; x++)
				childWidth += this.cols[x].actualWidth;
				
			var row = child.gridRow;
			var rowSpan = child.gridRowSpan;
				
			var childY = this.rows[row].offset;
			var childHeight = 0.0;
				
			for(var y = row; y < row+rowSpan; y++)
				childHeight += this.rows[y].actualHeight;

			child.measure(childWidth, childHeight);
		}
				
		// redo the height measure with the new element measure
		offsetY = 0;
		for(var rowPos = 0; rowPos < this.rows.length; rowPos++) {
			var row = this.rows[rowPos];
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
			var col = child.gridCol;
			var colSpan = child.gridColSpan;
			var row = child.gridRow;
			var rowSpan = child.gridRowSpan;
				
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
});
