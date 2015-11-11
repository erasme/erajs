Ui.Pressable.extend('Ui.ListViewHeader', 
/** @lends Ui.ListViewHeader#*/
{
	title: undefined,
	uiTitle: undefined,
	background: undefined,

	/**
	 * @constructs
	 * @class
	 * @extends Ui.Pressable
	 */
	constructor: function(config) {
		this.background = new Ui.Rectangle({ verticalAlign: 'bottom', height: 4 });
		this.append(this.background);
		this.uiTitle = new Ui.Label({ margin: 8, fontWeight: 'bold' });
		this.append(this.uiTitle);

		this.connect(this, 'down', this.onListViewHeaderDown);
		this.connect(this, 'up', this.onListViewHeaderUp);
	},

	getTitle: function() {
		return this.title;
	},

	setTitle: function(title) {
		if(this.title !== title) {
			this.title = title;
			this.uiTitle.setText(title);
		}
	},

	/**#@+ 
	 * @private 
	 */
	getColor: function() {
		return Ui.Color.create(this.getStyleProperty('color'));
	},

	getColorDown: function() {
		var yuv = Ui.Color.create(this.getStyleProperty('color')).getYuv();
		return new Ui.Color({ y: yuv.y + 0.40, u: yuv.u, v: yuv.v });
	},
	
	onListViewHeaderDown: function() {
		this.background.setFill(this.getColorDown());
	},

	onListViewHeaderUp: function() {
		this.background.setFill(this.getColor());
	}
	/**#@-*/
}, 
/** @lends Ui.ListViewHeader#*/
{
	onStyleChange: function() {
		this.background.setFill(this.getStyleProperty('color'));
		var spacing = this.getStyleProperty('spacing');
		this.uiTitle.setMargin(spacing + 2);
	}
}, 
/** @lends Ui.ListViewHeader*/
{
	style: {
		color: '#444444',
		spacing: 5
	}
});

Ui.Container.extend('Ui.ListViewHeadersBar', {
	headers: undefined,
	sortColKey: undefined,
	sortInvert: false,
	sortArrow: undefined,
	cols: undefined,

	constructor: function(config) {
		this.addEvents('header');

		this.headers = config.headers;
		delete(config.headers);

		this.sortArrow = new Ui.Icon({ icon: 'sortarrow', width: 10, height: 10, margin: 4 });
		this.appendChild(this.sortArrow);

		this.cols = [];

		for(i = 0; i < this.headers.length; i++) {
			var header = this.headers[i];
			header['Ui.ListViewHeadersBar.ui'] = new Ui.ListViewHeader({ title: header.title, width: header.width });
			this.connect(header['Ui.ListViewHeadersBar.ui'], 'press', this.onHeaderPress);
			header.colWidth = header.width;
			this.appendChild(header['Ui.ListViewHeadersBar.ui']);

			var col = new Ui.ListViewColBar({ header: header['Ui.ListViewHeadersBar.ui'] });
			this.cols.push(col);
			this.appendChild(col);
		}
	},

	getSortColKey: function() {
		return this.sortColKey;
	},

	getSortInvert: function() {
		return this.sortInvert;
	},

	sortBy: function(key, invert) {
		this.sortColKey = key;
		this.sortInvert = invert === true;
		if(this.sortInvert)
			this.sortArrow.setTransform(Ui.Matrix.createRotate(180));
		else
			this.sortArrow.setTransform();
		this.invalidateArrange();
	},

	onHeaderPress: function(header) {
		var key;
		for(var col = 0; col < this.headers.length; col++) {
			var h = this.headers[col];
			if(h['Ui.ListViewHeadersBar.ui'] === header) {
				key = h.key;
			}
		}
		if(key !== undefined) {
			this.fireEvent('header', this, key);

		}
	}
}, {
	measureCore: function(width, height) {
		this.rowsHeight = 0;
		this.headersHeight = 0;
		var minHeight = 0;
		var col; var size; var header;
		// measure headers
		for(col = 0; col < this.headers.length; col++) {
			header = this.headers[col];
			size = header['Ui.ListViewHeadersBar.ui'].measure(0, 0);
			if(size.height > minHeight)
				minHeight = size.height;
		}
		this.headersHeight = minHeight;
		var minWidth = 0;
		for(col = 0; col < this.headers.length; col++)
			minWidth += this.headers[col]['Ui.ListViewHeadersBar.ui'].getMeasureWidth();
		
		this.sortArrow.measure(0, 0);

		// measure col bars
		for(var i = 0; i < this.cols.length; i++) {
			col = this.cols[i];
			col.measure(0, this.headersHeight + this.rowsHeight);
		}

		return { width: minWidth, height: this.headersHeight };
	},

	arrangeCore: function(width, height) {
		var x = 0; var header; var colWidth; var col;
		var availableWidth = width;

		for(col = 0; col < this.headers.length; col++) {
			header = this.headers[col];
			var colbar = this.cols[col];
			colWidth = header['Ui.ListViewHeadersBar.ui'].getMeasureWidth();
			if(col == this.headers.length - 1)
				colWidth = Math.max(colWidth, availableWidth);
			header['Ui.ListViewHeadersBar.ui'].arrange(x, 0, colWidth, this.headersHeight);

			colbar.setHeaderHeight(this.headersHeight);
			colbar.arrange(x+colWidth-colbar.getMeasureWidth(), 0, 
				colbar.getMeasureWidth(), this.headersHeight);

			if(this.sortColKey === header.key) {
				this.sortArrow.arrange(x+colWidth-height*0.8,
					height*0.1,
					height*0.8, height*0.8);
			}

			x += colWidth;
			availableWidth -= colWidth;
		}
	}
});

Ui.Selectionable.extend('Ui.ListViewRow', {
	headers: undefined,
	data: undefined,
	cells: undefined,
	background: undefined,
	selectionActions: undefined,

	constructor: function(config) {
		this.headers = config.headers;
		delete(config.headers);

		this.data = config.data;
		delete(config.data);

		this.setDraggableData(this.data);

		this.cells = [];

		this.background = new Ui.Rectangle();
		this.appendChild(this.background);
		for(var col = 0; col < this.headers.length; col++) {
			var key = this.headers[col].key;
			var cell;
			if(this.headers[col].ui !== undefined)
				cell = new  this.headers[col].ui({ key: key });
			else
				cell = new Ui.ListViewCellString({ key: key });
			cell.setValue(this.data[this.headers[col].key]);
			this.cells.push(cell);
			this.appendChild(cell);
		}
	},

	getData: function() {
		return this.data;
	},

	setSelectionActions: function(value) {
		this.selectionActions = value;
	}
	
}, {

	onPress: function() {
		this.setIsSelected(!this.getIsSelected());
	},

	onSelect: function() {
		this.select();
		this.onStyleChange();
	},

	onUnselect: function() {
		this.unselect();
		this.onStyleChange();
	},

	getSelectionActions: function() {
		return this.selectionActions;
	},

	measureCore: function(width, height) {
		this.background.measure(width, height);
		var minHeight = 0;
		for(col = 0; col < this.headers.length; col++) {
			var child = this.cells[col];
			var size = child.measure(0, 0);
			if(size.height > minHeight)
				minHeight = size.height;
		}
		return { width: 0, height: minHeight };
	},

	arrangeCore: function(width, height) {
		this.background.arrange(0, 0, width, height);
		var x = 0;
		for(col = 0; col < this.headers.length; col++) {
			var header = this.headers[col];
			var cell = this.cells[col];
			colWidth = header['Ui.ListViewHeadersBar.ui'].getLayoutWidth();
			cell.arrange(x, 0, colWidth, height);
			x += colWidth;
		}
	},

	onStyleChange: function() {
		if(this.getIsSelected())
			this.background.setFill(this.getStyleProperty('selectColor'));
		else
			this.background.setFill(this.getStyleProperty('color'));
	}
}, {
	style: {
		color: new Ui.Color({ r: 0.99, g: 0.99, b: 0.99, a: 0.1 }),
		selectColor: new Ui.Color({ r: 0.88, g: 0.88, b: 0.88 })
	}
});

Ui.ListViewRow.extend('Ui.ListViewRowOdd', {}, {}, {
	style: {
		color: new Ui.Color({ r: 0.5, g: 0.5, b: 0.5, a: 0.05 }),
		selectColor: new Ui.Color({ r: 0.88, g: 0.88, b: 0.88 })
	}
});
Ui.ListViewRow.extend('Ui.ListViewRowEven', {}, {}, {
	style: {
		color: new Ui.Color({ r: 0.5, g: 0.5, b: 0.5, a: 0.1 }),
		selectColor: new Ui.Color({ r: 0.88, g: 0.88, b: 0.88 })
	}
});

/*
Ui.Container.extend('Ui.ListView', {
	data: undefined,
	headers: undefined,
	firstRow: undefined,
	firstCol: undefined,
	cols: undefined,
	rowsHeight: 0,
	headersHeight: 0,
	selectedRow: undefined,
	headersVisible: true,
	mode: 'manual',
	sortColKey: undefined,
	sortInvert: false,
	sortArrow: undefined,

	constructor: function(config) {
		this.addEvents('select', 'unselect', 'activate', 'header');

		this.rowContainer = new Ui.Container();
		this.appendChild(this.rowContainer);

		if(config.headers !== undefined) {
			this.headers = config.headers;
			delete(config.headers);
		}
		else
			this.headers = [{ width: 100, type: 'string', title: 'Title', key: 'default' }];
		this.data = [];
		this.cols = [];
		var i;
		for(i = 0; i < this.headers.length; i++) {
			var header = this.headers[i];
			header.ui = new Ui.ListViewHeader({ title: header.title, width: header.width });
			this.connect(header.ui, 'press', this.onHeaderPress);
			header.rows = [];
			header.colWidth = header.width;
			this.appendChild(header.ui);
		}
		this.sortArrow = new Ui.Icon({ icon: 'sortarrow', width: 10, height: 10, margin: 4 });
		this.appendChild(this.sortArrow);

		this.firstRow = new Ui.Rectangle({ width: 1, height: 1, fill: 'black', opacity: 0.3 });
		this.appendChild(this.firstRow);
		this.firstCol = new Ui.Rectangle({ width: 1, height: 1, fill: 'black', opacity: 0.3 });
		this.appendChild(this.firstCol);
		for(i = 0; i < this.headers.length; i++) {
			var col = new Ui.ListViewColBar({ header: this.headers[i].ui });
			this.cols.push(col);
			this.appendChild(col);
		}
	},

	setMode: function(mode) {
		if(this.mode !== mode) {
			if(DEBUG && (mode !== 'manual') && (mode !== 'auto'))
				throw('Ui.ListView only support mode [auto|manual]');
			this.mode = mode;

			for(var i = 0; i < this.cols.length; i++) {
				if(this.mode === 'manual')
					this.cols[i].enable();
				else
					this.cols[i].disable();
			}
			this.invalidateMeasure();
		}
	},

	showHeaders: function() {
		if(!this.headersVisible) {
			this.headersVisible = true;
			for(var i = 0; i < this.headers.length; i++) {
				var header = this.headers[i];
				header.ui.show();
			}
			this.invalidateMeasure();
		}
	},

	hideHeaders: function() {
		if(this.headersVisible) {
			this.headersVisible = false;
			for(var i = 0; i < this.headers.length; i++) {
				var header = this.headers[i];
				header.ui.hide();
			}
			this.invalidateMeasure();
		}
	},

	getSelectedRow: function() {
		return this.selectedRow;
	},

	appendData: function(data) {
		this.data.push(data);
		data.listViewCells = {};

		for(var col = 0; col < this.headers.length; col++) {
			var key = this.headers[col].key;
			var cell = new Ui.ListViewCellString({ key: key });
			this.connect(cell, 'down', this.onCellDown);
			this.connect(cell, 'up', this.onCellUp);
			this.connect(cell, 'press', this.onCellSelect);
			this.connect(cell, 'activate', this.onCellActivate);
			cell.setValue(data[this.headers[col].key]);

			data.listViewCells[key] = cell;

			this.headers[col].rows.push(cell);
			this.rowContainer.appendChild(cell);
		}
		this.invalidateMeasure();
	},

	updateData: function(data) {
		for(var col = 0; col < this.headers.length; col++) {
			var key = this.headers[col].key;
			data.listViewCells[key].setValue(data[key]);
		}
	},

	removeData: function(data) {
		var row = this.findDataRow(data);
		if(row != -1)
			this.removeDataAt(row);
	},

	removeDataAt: function(position) {
		if(position < this.data.length) {
			if(this.selectedRow === position)
				this.fireEvent('unselect', this, this.selectedRow);
			for(var col = 0; col < this.headers.length; col++) {
				var cell = this.data[position].listViewCells[this.headers[col].key];
				if(this.selectedRow == position)
					cell.unselect();
				this.disconnect(cell, 'down', this.onCellDown);
				this.disconnect(cell, 'up', this.onCellUp);
				this.disconnect(cell, 'press', this.onCellSelect);
				this.disconnect(cell, 'activate', this.onCellActivate);
				this.rowContainer.removeChild(cell);
				this.headers[col].rows.splice(position, 1);
			}
			this.data.splice(position, 1);
			if(this.selectedRow !== undefined) {
				if(this.selectedRow === position)
					this.selectedRow = undefined;
				else if(position < this.selectedRow)
					this.selectedRow--;
			}
			this.invalidateMeasure();
		}
	},

	clearData: function() {
		while(this.data.length > 0)
			this.removeDataAt(0);
	},

	getData: function() {
		return this.data;
	},

	setData: function(data) {
		this.clearData();
		if(data !== undefined) {
			for(var i = 0; i < data.length; i++)
				this.appendData(data[i]);
		}
	},

	selectRow: function(row) {
		var col;
		if((row >= 0) && (row < this.data.length)) {
			if(this.selectedRow !== undefined) {
				if(this.selectedRow == row)
					return;
				for(col = 0; col < this.headers.length; col++)
					this.data[this.selectedRow].listViewCells[this.headers[col].key].unselect();
				this.fireEvent('unselect', this, this.selectedRow);
			}
			this.selectedRow = row;
			for(col = 0; col < this.headers.length; col++) {
				var tmpCell = this.data[row].listViewCells[this.headers[col].key];
				this.disconnect(tmpCell, 'press', this.onCellSelect);
				tmpCell.select();
				this.connect(tmpCell, 'press', this.onCellSelect);
			}
			this.fireEvent('select', this, this.selectedRow);
		}
	},

	unselectCurrentRow: function() {
		var col;
		if(this.selectedRow !== undefined) {
			for(col = 0; col < this.headers.length; col++)
				this.data[this.selectedRow].listViewCells[this.headers[col].key].unselect();
			this.fireEvent('unselect', this, this.selectedRow);
		}
		this.selectedRow = undefined;
	},

	sortBy: function(key, invert) {
		this.sortColKey = key;
		this.sortInvert = invert === true;
		if(this.sortInvert)
			this.sortArrow.setTransform(Ui.Matrix.createRotate(180));
		else
			this.sortArrow.setTransform();

		this.data.sort(function(a, b) {
			var res;
			if(a[key] < b[key])
				res = -1;
			else if(a[key] > b[key])
				res = 1;
			else
				res = 0;
			return invert ? -res : res;
		});
		this.invalidateArrange();
	},

	findDataRow: function(data) {
		for(var row = 0; row < this.data.length; row++) {
			if(data == this.data[row])
				return row;
		}
		return -1;
	},

	findCellRow: function(cell) {
		var key = cell.getKey();
		var headerCol;
		for(var col = 0; col < this.headers.length; col++) {
			if(this.headers[col].key === key) {
				headerCol = this.headers[col];
				break;
			}
		}
		if(headerCol === undefined)
			return -1;
		var foundRow;
		for(var row = 0; row < this.data.length; row++) {
			if(cell === this.data[row].listViewCells[key]) {
				foundRow = row;
				break;
			}
		}
		if(foundRow === undefined)
			return -1;
		return foundRow;
	},

	onCellDown: function(cell) {
		var row = this.findCellRow(cell);
		if(row != -1) {
			for(var col = 0; col < this.headers.length; col++)
				this.data[row].listViewCells[this.headers[col].key].down();
		}
	},

	onCellUp: function(cell) {
		var row = this.findCellRow(cell);
		if(row != -1) {		
			for(var col = 0; col < this.headers.length; col++)
				this.data[row].listViewCells[this.headers[col].key].up();
		}
	},

	onCellSelect: function(cell) {
		var row = this.findCellRow(cell);
		if(row != -1) {
			if(cell.getIsSelected())
				this.selectRow(row);
			else
				this.unselectCurrentRow();
		}
	},

	onCellActivate: function(cell) {
		var row = this.findCellRow(cell);
		if(row != -1)
			this.fireEvent('activate', this, row, cell.getKey());
	},

	onHeaderPress: function(header) {
		var key;
		for(var col = 0; col < this.headers.length; col++) {
			var h = this.headers[col];
			if(h.ui === header) {
				key = h.key;
			}
		}

		if(key !== undefined) {
			this.fireEvent('header', this, key);
			this.sortBy(key, (this.sortColKey === key)?!this.sortInvert:false);
		}
	}
}, 
{
	measureCoreAuto: function(width, height) {
		var col; var colWidth; var header; var heightDone;
		var minHeight; var availableWidth; var size;
		for(col = 0; col < this.headers.length; col++)
			this.headers[col].minWidth = 0;
		var widthDone;
		do {
			widthDone = true;
			this.rowsHeight = 0;
			this.headersHeight = 0;
			do {
				heightDone = true;
				minHeight = 0;
				availableWidth = width;
				for(col = 0; col < this.headers.length; col++) {
					header = this.headers[col];
					colWidth = header.minWidth;
					if(col == this.headers.length - 1)
						colWidth = Math.max(availableWidth, colWidth);
					if(this.headersVisible)
						size = header.ui.measure(colWidth, this.headersHeight);
					else
						size = { width: 0, height: 0 };
					if(size.height > minHeight)
						minHeight = size.height;
					if(size.width > header.minWidth) {
						header.minWidth = size.width;
						widthDone = false;
					}
					availableWidth -= header.minWidth;
				}
				if(minHeight > this.headersHeight) {
					this.headersHeight = minHeight;
					heightDone = false;
				}
			} while(!heightDone);

			for(var dataRow = 0; dataRow < this.data.length; dataRow++) {
				var data = this.data[dataRow];
				data.rowHeight = 0;
				do {
					heightDone = true;
					minHeight = 0;
					availableWidth = width;
					for(col = 0; col < this.headers.length; col++) {
						header = this.headers[col];
						var cell = data.listViewCells[header.key];
						colWidth = header.minWidth;
						if(col == this.headers.length - 1)
							colWidth = Math.max(availableWidth, colWidth);
						size = cell.measure(colWidth, data.rowHeight);
						if(size.height > minHeight)
							minHeight = size.height;
						if(size.width > header.minWidth) {
							header.minWidth = size.width;
							widthDone = false;
						}
						availableWidth -= header.minWidth;
					}
					if(minHeight != data.rowHeight) {
						heightDone = false;
						data.rowHeight = minHeight;
					}
				} while(!heightDone);
				this.rowsHeight += data.rowHeight;
			}
		} while(!widthDone);

		var minWidth = 0;
		for(col = 0; col < this.headers.length; col++)
			minWidth += this.headers[col].minWidth;

		return { width: minWidth, height: this.headersHeight + this.rowsHeight };
	},

	measureCoreManual: function(width, height) {
		this.rowsHeight = 0;
		this.headersHeight = 0;
		var minHeight = 0;
		var col; var size; var header;
		// measure headers
		for(col = 0; col < this.headers.length; col++) {
			header = this.headers[col];
			size = header.ui.measure(0, 0);
			if(size.height > minHeight)
				minHeight = size.height;
		}
		if(this.headersVisible)
			this.headersHeight = minHeight;
		// measure content
		for(var dataRow = 0; dataRow < this.data.length; dataRow++) {
			var data = this.data[dataRow];
			minHeight = 0;
			for(col = 0; col < this.headers.length; col++) {
				header = this.headers[col];
				var cell = data.listViewCells[header.key];
				var colWidth = header.ui.getMeasureWidth();
				size = cell.measure(colWidth, 0);
				if(size.height > minHeight)
					minHeight = size.height;
			}
			data.rowHeight = minHeight;
			this.rowsHeight += data.rowHeight;
		}
		var minWidth = 0;
		for(col = 0; col < this.headers.length; col++)
			minWidth += this.headers[col].ui.getMeasureWidth();
		
		this.sortArrow.measure(0, 0);

		var size = this.firstRow.measure(width, 0);
		this.headersHeight = Math.max(this.headersHeight, size.height);

		this.firstCol.measure(0, this.headersHeight + this.rowsHeight);
		// measure col bars
		for(var i = 0; i < this.cols.length; i++) {
			col = this.cols[i];
			col.measure(0, this.headersHeight + this.rowsHeight);
		}

		return { width: minWidth, height: this.headersHeight + this.rowsHeight };
	},

	arrangeCoreAuto: function(width, height) {
		// update headers
		var x = 0;
		var availableWidth = width;
		var col; var colWidth; var header;
		for(col = 0; col < this.headers.length; col++) {
			header = this.headers[col];
			var colbar = this.cols[col];
			colWidth = header.minWidth;
			if(col == this.headers.length - 1)
				colWidth = Math.max(colWidth, availableWidth);
			header.ui.arrange(x, 0, colWidth, this.headersHeight);

			colbar.setHeaderHeight(this.headersHeight);
			colbar.arrange(x+colWidth-colbar.getMeasureWidth(), 0, colbar.getMeasureWidth(), this.headersHeight + this.rowsHeight);

			x += colWidth;
			availableWidth -= colWidth;
		}

		// handle no data case
		if(this.data.length === 0)
			return;
		
		var y = 0;
		for(var row = 0; row < this.data.length; row++) {
			var data = this.data[row];
			x = 0;
			availableWidth = width;
			for(col = 0; col < this.headers.length; col++) {
				header = this.headers[col];
				colWidth = header.minWidth;
				if(col == this.headers.length - 1)
					colWidth = Math.max(colWidth, availableWidth);
				var cell = data.listViewCells[header.key];
				cell.arrange(x, y, colWidth, data.rowHeight);
				x += colWidth;
				availableWidth -= colWidth;
			}
			y += data.rowHeight;
		}
		this.rowContainer.arrange(0, this.headersHeight, width, height - this.headersHeight);
	},

	arrangeCoreManual: function(width, height) {
		// update headers
		var x = 0; var header; var colWidth; var col;
		var availableWidth = width;

		this.firstRow.arrange(0, this.headersHeight - this.firstRow.getMeasureHeight(), width, this.firstRow.getMeasureHeight());

		this.firstCol.arrange(0, 0, this.firstCol.getMeasureWidth(), this.headersHeight + this.rowsHeight);

		for(col = 0; col < this.headers.length; col++) {
			header = this.headers[col];
			var colbar = this.cols[col];
			colWidth = header.ui.getMeasureWidth();
			if(col == this.headers.length - 1)
				colWidth = Math.max(colWidth, availableWidth);
			header.ui.arrange(x, 0, colWidth, this.headersHeight);

			colbar.setHeaderHeight(this.headersHeight);
			colbar.arrange(x+colWidth-colbar.getMeasureWidth(), 0, colbar.getMeasureWidth(), this.headersHeight + this.rowsHeight);

			if(this.sortColKey === header.key) {
				this.sortArrow.arrange(x+colWidth-this.headersHeight*0.8,
					this.headersHeight*0.1,
					this.headersHeight*0.8, this.headersHeight*0.8);
			}

			x += colWidth;
			availableWidth -= colWidth;
		}
		// handle no data case
		if(this.data.length === 0)
			return;

		var y = 0;
		for(var row = 0; row < this.data.length; row++) {
			var data = this.data[row];
			x = 0;
			availableWidth = width;
			for(col = 0; col < this.headers.length; col++) {
				header = this.headers[col];
				colWidth = header.ui.getMeasureWidth();
				if(col == this.headers.length - 1)
					colWidth = Math.max(colWidth, availableWidth);
				var cell = data.listViewCells[header.key];
				cell.arrange(x, y, colWidth, data.rowHeight);
				x += colWidth;
				availableWidth -= colWidth;
			}
			y += data.rowHeight;
		}
		this.rowContainer.arrange(0, this.headersHeight, width, height - this.headersHeight);
	},

	measureCore: function(width, height) {
		if(this.mode === 'auto')
			return this.measureCoreAuto(width, height);
		else
			return this.measureCoreManual(width, height);
	},

	arrangeCore: function(width, height) {
		if(this.mode === 'auto')
			this.arrangeCoreAuto(width, height);
		else
			this.arrangeCoreManual(width, height);
	}
});*/

Ui.ScrollLoader.extend('Ui.ListViewScrollLoader', {
	listView: undefined,
	data: undefined,

	constructor: function(config) {
		this.listView = config.listView;
		delete(config.listView);

		this.data = config.data;
		delete(config.data);
	},

	signalChange: function() {
		this.fireEvent('change', this);
	}

}, {
	getMin: function() {
		return 0;
	},

	getMax: function() {
		return this.data.length - 1;
	},

	getElementAt: function(position) {
		return this.listView.getElementAt(position);
	}
});

Ui.VBox.extend('Ui.ListView', 
{
	data: undefined,
	headers: undefined,
	headersBar: undefined,
	firstRow: undefined,
	firstCol: undefined,
	cols: undefined,
	rowsHeight: 0,
	headersHeight: 0,
	headersVisible: true,
	sortColKey: undefined,
	sortInvert: false,
	sortArrow: undefined,
	dataLoader: undefined,
	scroll: undefined,
	selectionActions: undefined,
	scrolled: true,
	vbox: undefined,

	constructor: function(config) {
		this.addEvents('select', 'unselect', 'activate', 'header');

		if(config.headers !== undefined) {
			this.headers = config.headers;
			delete(config.headers);
		}
		else
			this.headers = [{ width: 100, type: 'string', title: 'Title', key: 'default' }];

		this.selectionActions = {
			edit: {
				"default": true,
				text: 'Edit', icon: 'edit',
				scope: this, callback: this.onSelectionEdit, multiple: false
			}
		};

		this.headersBar = new Ui.ListViewHeadersBar({ headers: this.headers });
		this.connect(this.headersBar, 'header', this.onHeaderPress);
		this.append(this.headersBar);

		this.data = [];
		this.dataLoader = new Ui.ListViewScrollLoader({ data: this.data, listView: this });
		this.scroll = new Ui.VBoxScrollingArea({ loader: this.dataLoader });
		this.append(this.scroll, true);
	},

	setScrolled: function(scrolled) {
		if(this.scrolled !== (scrolled === true)) {
			this.scrolled = scrolled;
			if(this.scrolled) {
				this.remove(this.vbox);
				this.scroll = new Ui.VBoxScrollingArea({ loader: this.dataLoader });
				this.append(this.scroll, true);
			}
			else {
				this.remove(this.scroll);
				this.vbox = new Ui.VBox();
				this.append(this.vbox, true);
				this.updateData(this.data);
			}
		}
	},

	showHeaders: function() {
		if(!this.headersVisible) {
			this.headersVisible = true;
			this.headersBar.show();
		}
	},

	hideHeaders: function() {
		if(this.headersVisible) {
			this.headersVisible = false;
			this.headersBar.hide(true);
		}
	},

	getSelectionActions: function() {
		return this.selectionActions;
	},

	setSelectionActions: function(value) {
		this.selectionActions = value;
	},

	getElementAt: function(position) {
		if((position % 2) === 0)
			return new Ui.ListViewRowOdd({ headers: this.headers,
				data: this.data[position], selectionActions: this.selectionActions });
		else
			return new Ui.ListViewRowEven({ headers: this.headers,
				data: this.data[position], selectionActions: this.selectionActions });
	},

	appendData: function(data) {
		this.data.push(data);
		if(this.scrolled)
			this.dataLoader.signalChange();
		else
			this.vbox.append(this.getElementAt(this.data.length-1));
	},

	updateData: function(data) {
		if(this.scrolled)
			this.scroll.reload();
		else {
			this.vbox.clear();
			for(var i = 0; i < this.data.length; i++) {
				this.vbox.append(this.getElementAt(i));
			}
		}
	},

	removeData: function(data) {
		var row = this.findDataRow(data);
		if(row != -1)
			this.removeDataAt(row);
	},

	removeDataAt: function(position) {
		if(position < this.data.length) {
			this.data.splice(position, 1);
			if(this.scrolled)
				this.scroll.reload();
			else {
				this.vbox.clear();
				for(var i = 0; i < this.data.length; i++) {
					this.vbox.append(this.getElementAt(i));
				}
			}
		}
	},

	clearData: function() {
		this.data = [];	
		this.dataLoader = new Ui.ListViewScrollLoader({ data: this.data, listView: this });
		if(this.scrolled)
			this.scroll.setLoader(this.dataLoader);
		else
			this.vbox.clear();
	},

	getData: function() {
		return this.data;
	},

	setData: function(data) {
		if(data !== undefined) {
			this.data = data;
			this.dataLoader = new Ui.ListViewScrollLoader({ data: this.data, listView: this });
			if(this.scrolled)
				this.scroll.setLoader(this.dataLoader);
			else {
				this.vbox.clear();
				for(var i = 0; i < this.data.length; i++) {
					this.vbox.append(this.getElementAt(i));
				}
			}
		}
		else {
			this.clearData();
		}
	},

	sortBy: function(key, invert) {
		this.sortColKey = key;
		this.sortInvert = invert === true;
		this.headersBar.sortBy(this.sortColKey, this.sortInvert);
		this.data.sort(function(a, b) {
			var res;
			if(a[key] < b[key])
				res = -1;
			else if(a[key] > b[key])
				res = 1;
			else
				res = 0;
			return invert ? -res : res;
		});
		if(this.scrolled) {
			this.scroll.reload();
			this.invalidateArrange();
		}
		else {
			this.vbox.clear();
			for(var i = 0; i < this.data.length; i++) {
				this.vbox.append(this.getElementAt(i));
			}
		}
	},

	findDataRow: function(data) {
		for(var row = 0; row < this.data.length; row++) {
			if(data == this.data[row])
				return row;
		}
		return -1;
	},

	onHeaderPress: function(header, key) {
		this.sortBy(key, (this.sortColKey === key)?!this.sortInvert:false);
	},

	onSelectionEdit: function(selection) {
		var data = selection.getElements()[0].getData();
		this.fireEvent('activate', this, this.findDataRow(data), data);
	}
}, 
{
	onChildInvalidateArrange: function(child) {
		Ui.ListView.base.onChildInvalidateArrange.apply(this, arguments);
		if(child === this.headersBar) {
			if(this.scrolled && (this.scroll !== undefined))
				this.scroll.getActiveItems().forEach(function(item) { item.invalidateArrange();  });
			else if(!this.scrolled)
				this.vbox.getChildren().forEach(function(item) { item.invalidateArrange();  });
		}
	}
});

Ui.LBox.extend('Ui.ListViewCell',
/** @lends Ui.ListViewCell#*/
{
	value: undefined,
	ui: undefined,
	key: undefined,
	
	/**
	 * @constructs
	 * @class
	 * @extends Ui.Selectable
	 */
	constructor: function(config) {
		this.setClipToBounds(true);
		this.ui = new Ui.Label({ margin: 8, horizontalAlign: 'left' });
		this.append(this.ui);
	},

	getKey: function() {
		return this.key;
	},

	setKey: function(key) {
		this.key = key;
	},

	getValue: function() {
		return this.value;
	},

	setValue: function(value) {
		if(this.value !== value) {
			this.value = value;
			this.ui.setText(value);
		}
	}
}, 
{
	onStyleChange: function() {
		var spacing = this.getStyleProperty('spacing');
		this.ui.setMargin(spacing + 2);
	}
},
{
	style: {
		spacing: 5
	}
});

Ui.ListViewCell.extend('Ui.ListViewCellString');
	

Ui.Container.extend('Ui.ListViewColBar', {
	headerHeight: 0,
	header: undefined,
	grip: undefined,
	separator: undefined,

	constructor: function(config) {
		this.grip = new Ui.Movable({ moveVertical: false });
		this.appendChild(this.grip);
		this.connect(this.grip, 'move', this.onMove);
		this.connect(this.grip, 'up', this.onUp);

		var lbox = new Ui.LBox();
		this.grip.setContent(lbox);
		lbox.append(new Ui.Rectangle({ width: 1, opacity: 0.2, fill: 'black', marginLeft: 14, marginRight: 8+2, marginTop: 6, marginBottom: 6 }));
		lbox.append(new Ui.Rectangle({ width: 1, opacity: 0.2, fill: 'black', marginLeft: 19, marginRight: 3+2, marginTop: 6, marginBottom: 6 }));

		this.separator = new Ui.Rectangle({ width: 1, fill: 'black', opacity: 0.3 });
		this.appendChild(this.separator);
	},

	setHeader: function(header) {
		this.header = header;
	},

	setHeaderHeight: function(height) {
		this.headerHeight = height;
	},

	onMove: function() {
		this.separator.setTransform(Ui.Matrix.createTranslate(this.grip.getPositionX(), 0));
	},

	onUp: function() {
		var delta = this.grip.getPositionX();
		this.header.setWidth(Math.max(this.getMeasureWidth(), this.header.getMeasureWidth()+delta));
		this.invalidateArrange();
	}

}, {
	measureCore: function(width, height) {
		var size = this.grip.measure(width, height);
		this.separator.measure(width, height);
		return { width: size.width, height: 0 };
	},

	arrangeCore: function(width, height) {
		this.grip.setPosition(0, 0);
		this.separator.setTransform(Ui.Matrix.createTranslate(0, 0));
		this.grip.arrange(0, 0, width, this.headerHeight);
		this.separator.arrange(width-1, 0, 1, height);
	},

	onDisable: function() {
		Ui.ListViewColBar.base.onDisable.call(this);
		this.grip.hide();
	},

	onEnable: function() {
		Ui.ListViewColBar.base.onEnable.call(this);
		this.grip.show();
	}
});

