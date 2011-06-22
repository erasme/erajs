//
// Define the ListView class.
//
Ui.Container.extend('Ui.ListView', {
	data: undefined,
	headers: undefined,
	rowsHeight: 0,
	headersHeight: 0,
	selectedRow: undefined,

	constructor: function(config) {
		this.rowContainer = new Ui.Container();
		this.appendChild(this.rowContainer);

		if(config.headers != undefined)
			this.headers = config.headers;
		else
			this.headers = [ { width: 100, type: 'string', title: 'Title', key: 'default' }];
		this.data = [];

		for(var i = 0; i < this.headers.length; i++) {
			var header = this.headers[i];
			header.ui = new Ui.ListViewHeader({ title: header.title, width: header.width });
			header.rows = [];
			header.colWidth = header.width;
			this.appendChild(header.ui);
		}

		if(config.data != undefined) {
			for(var i = 0; i < config.data.length; i++)
				this.appendData(config.data[i]);
		}
		this.addEvents('select', 'unselect', 'activate');
	},

	getSelectedRow: function() {
		return this.selectedRow;
	},

	appendData: function(data) {
		this.data.push(data);
		for(var col = 0; col < this.headers.length; col++) {
			var cell = new Ui.ListViewCellString({ key: this.headers[col].key });
			this.connect(cell, 'down', this.onCellDown);
			this.connect(cell, 'up', this.onCellUp);
			this.connect(cell, 'select', this.onCellSelect);
			this.connect(cell, 'activate', this.onCellActivate);
			cell.setString(data[this.headers[col].key]);
			this.headers[col].rows.push(cell);
			this.rowContainer.appendChild(cell);
		}
		this.invalidateMeasure();
	},

	updateData: function(data) {
		var row = this.findDataRow(data);
		if(row != -1) {
			for(var col = 0; col < this.headers.length; col++) {
				this.headers[col].rows[row].setString(data[this.headers[col].key]);
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
			if(this.selectedRow == position)
				this.fireEvent('unselect', this.selectedRow);
			this.data.splice(position, 1);
			for(var col = 0; col < this.headers.length; col++) {
				var cell = this.headers[col].rows[position];
				if(this.selectedRow == position)
					cell.unselect();
				this.disconnect(cell, 'down', this.onCellDown);
				this.disconnect(cell, 'up', this.onCellUp);
				this.disconnect(cell, 'select', this.onCellSelect);
				this.disconnect(cell, 'activate', this.onCellActivate);
				this.rowContainer.removeChild(cell);
				this.headers[col].rows.splice(position, 1);
			}
			if(this.selectedRow != undefined) {
				if(this.selectedRow == position)
					this.selectedRow = undefined;
				else if(position < this.selectedRow)
					this.selectedRow--;
			}
			this.invalidateMeasure();
		}
	},

	//
	// Remove all data
	//
	clearData: function() {
		while(this.data.length > 0)
			this.removeDataAt(0);
	},

	getData: function() {
		return this.data;
	},

	//
	// Private
	//

	findDataRow: function(data) {
		for(var row = 0; row < this.data.length; row++) {
			if(data == this.data[row])
				return row;
		}
		return -1;
	},

	findCellRow: function(cell) {
		var key = cell.getKey();
		var headerCol = undefined;
		for(var col = 0; col < this.headers.length; col++) {
			if(this.headers[col].key == key) {
				headerCol = this.headers[col];
				break;
			}
		}
		if(headerCol == undefined)
			return -1;
		var foundRow = undefined;
		for(var row = 0; row < headerCol.rows.length; row++) {
			if(cell == headerCol.rows[row]) {
				foundRow = row;
				break;
			}
		}
		if(foundRow == undefined)
			return -1;
		return foundRow;
	},

	onCellDown: function(cell) {
		var row = this.findCellRow(cell);
		if(row != -1) {		
			for(var col = 0; col < this.headers.length; col++)
				this.headers[col].rows[row].down();
		}
	},

	onCellUp: function(cell) {
		var row = this.findCellRow(cell);
		if(row != -1) {		
			for(var col = 0; col < this.headers.length; col++)
				this.headers[col].rows[row].up();
		}
	},

	onCellSelect: function(cell) {
		var row = this.findCellRow(cell);
		if(row != -1) {
			if(this.selectedRow != undefined) {
				if(this.selectedRow == row)
					return;
				for(var col = 0; col < this.headers.length; col++)
					this.headers[col].rows[this.selectedRow].unselect();
				this.fireEvent('unselect', this, this.selectedRow);
			}
			this.selectedRow = row;
			for(var col = 0; col < this.headers.length; col++) {
				var tmpCell = this.headers[col].rows[row];
				this.disconnect(tmpCell, 'select', this.onCellSelect);
				tmpCell.select();
				this.connect(tmpCell, 'select', this.onCellSelect);
			}
			this.fireEvent('select', this, this.selectedRow);
		}
	},

	onCellActivate: function(cell) {
		var row = this.findCellRow(cell);
		if(row != -1)
			this.fireEvent('activate', this, row, cell.getKey());
	}
}, {
	measureCore: function(width, height) {
		for(var col = 0; col < this.headers.length; col++)
			this.headers[col].minWidth = 0;
		var widthDone;
		do {
			widthDone = true;
			this.rowsHeight = 0;
			this.headersHeight = 0;
			var heightDone;
			do {
				heightDone = true;
				var minHeight = 0;
				var availableWidth = width;
				for(var col = 0; col < this.headers.length; col++) {
					var header = this.headers[col];
					var colWidth = header.minWidth;
					if(col == this.headers.length - 1)
						colWidth = Math.max(availableWidth, colWidth);
					var size = header.ui.measure(colWidth, this.headersHeight);
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
				var heightDone;
				do {
					heightDone = true;
					var minHeight = 0;
					var availableWidth = width;
					for(var col = 0; col < this.headers.length; col++) {
						var header = this.headers[col];
						var cell = this.headers[col].rows[dataRow];
						var colWidth = header.minWidth;
						if(col == this.headers.length - 1)
							colWidth = Math.max(availableWidth, colWidth);
						var size = cell.measure(colWidth, data.rowHeight);
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
		for(var col = 0; col < this.headers.length; col++)
			minWidth += this.headers[col].minWidth;

		return { width: minWidth, height: this.headersHeight + this.rowsHeight };
	},

	arrangeCore: function(width, height) {
		// update headers
		var x = 0;
		var availableWidth = width;
		for(var col = 0; col < this.headers.length; col++) {
			var header = this.headers[col];
			var colWidth = header.minWidth;
			if(col == this.headers.length - 1)
				colWidth = Math.max(colWidth, availableWidth);
			header.ui.arrange(x, 0, colWidth, this.headersHeight);
			x += colWidth;
			availableWidth -= colWidth;
		}

		// handle no data case
		if(this.data.length == 0)
			return;

		var y = 0;
		for(var row = 0; row < this.data.length; row++) {
			var data = this.data[row];
			var x = 0;
			var availableWidth = width;
			for(var col = 0; col < this.headers.length; col++) {
				var header = this.headers[col];
				var colWidth = header.minWidth;
				if(col == this.headers.length - 1)
					colWidth = Math.max(colWidth, availableWidth);
				var cell = header.rows[row];
				cell.arrange(x, y, colWidth, data.rowHeight);
				x += colWidth;
				availableWidth -= colWidth;
			}
			y += data.rowHeight;
		}
		this.rowContainer.arrange(0, this.headersHeight, width, height - this.headersHeight);
	}
});

Ui.Pressable.extend('Ui.ListViewHeader', {
	title: undefined,
	uiTitle: undefined,
	background: undefined,
	border: undefined,

	constructor: function(config) {
		this.border = new Ui.Rectangle();
		this.append(this.border);

		this.background = new Ui.Rectangle({ marginTop: 1, marginBottom: 1, marginRight: 1 });
		this.append(this.background);
		this.uiTitle = new Ui.Label({ margin: 8 });
		this.append(this.uiTitle);

		if(config.title != undefined)
			this.setTitle(config.title);

		this.connect(this, 'down', this.onListViewHeaderDown);
		this.connect(this, 'up', this.onListViewHeaderUp);
	},

	getTitle: function() {
		return this.title;
	},

	setTitle: function(title) {
		if(this.title != title) {
			this.title = title;
			this.uiTitle.setText(title);
		}
	},

	//
	// Private
	//
	getGradient: function() {
		var yuv = this.getStyleProperty('color').getYuv();
		return new Ui.LinearGradient({ stops: [
			{ offset: 0, color: new Ui.Color({ y: yuv.y + 0.10, u: yuv.u, v: yuv.v }) },
			{ offset: 1, color: new Ui.Color({ y: yuv.y - 0.10, u: yuv.u, v: yuv.v }) },
		] });
	},

	getGradientDown: function() {
		var yuv = this.getStyleProperty('color').getYuv();
		return new Ui.LinearGradient({ stops: [
			{ offset: 0, color: new Ui.Color({ y: yuv.y + 0.10 - 0.20, u: yuv.u, v: yuv.v }) },
			{ offset: 1, color: new Ui.Color({ y: yuv.y - 0.10 - 0.20, u: yuv.u, v: yuv.v }) },
		] });
	},

	getDarkColor: function() {
		var yuv = this.getStyleProperty('color').getYuv();
		return new Ui.Color({ y: yuv.y - 0.30, u: yuv.u, v: yuv.v });
	},

	onListViewHeaderDown: function() {
		this.background.setFill(this.getGradientDown());
	},

	onListViewHeaderUp: function() {
		this.background.setFill(this.getGradient());
	}
}, {
	onStyleChange: function() {
		var gradient;
		var darkColor;
		var yuv = this.getStyleProperty('color').getYuv();
		gradient = new Ui.LinearGradient({ stops: [
			{ offset: 0, color: new Ui.Color({ y: yuv.y + 0.10, u: yuv.u, v: yuv.v }) },
			{ offset: 1, color: new Ui.Color({ y: yuv.y - 0.10, u: yuv.u, v: yuv.v }) },
		] });
		darkColor = new Ui.Color({ y: yuv.y - 0.30, u: yuv.u, v: yuv.v });
		this.background.setFill(gradient);
		this.border.setFill(darkColor);

		var spacing = this.getStyleProperty('spacing');
		this.uiTitle.setMargin(spacing + 2);
	}
}, {
	style: {
		color: new Ui.Color({ r: 0.96, g: 0.96, b: 0.96 }),
		spacing: 5
	}
});

Ui.Selectable.extend('Ui.ListViewCellString', {
	string: '',
	ui: undefined,
	background: undefined,
	border: undefined,
	cellDown: false,
	cellSelected: false,
	key: undefined,
	
	constructor: function(config) {
		this.key = config.key;

		this.border = new Ui.Rectangle({ fill: 'pink' });
		this.append(this.border);

		this.background = new Ui.Rectangle({ fill: 'white', marginBottom: 1, marginRight: 1 });
		this.append(this.background);
		this.ui = new Ui.Label({ margin: 8, horizontalAlign: 'left' });
		this.append(this.ui);

		if(config.title != undefined)
			this.setTitle(config.title);

		this.connect(this, 'select', this.onCellSelect);
		this.connect(this, 'unselect', this.onCellUnselect);
	},

	getKey: function() {
		return this.key;
	},

	getString: function() {
		return this.string;
	},

	setString: function(string) {
		if(this.string != string) {
			this.string = string;
			this.ui.setText(string);
		}
	},

	down: function() {
		this.cellDown = true;
		if(!this.getIsSelected())
			this.background.setFill(this.getBackgroundDownColor());
	},

	up: function() {
		this.cellDown = false;
		if(!this.getIsSelected())
			this.background.setFill(this.getBackgroundColor());
	},

	//
	// Private
	//
	getDarkColor: function() {
		var yuv = this.getStyleProperty('color').getYuv();
		return new Ui.Color({ y: yuv.y - 0.30, u: yuv.u, v: yuv.v });
	},

	getBackgroundSelectGradient: function() {
		var yuv = this.getStyleProperty('selectColor').getYuv();
		return new Ui.LinearGradient({ stops: [
			{ offset: 0, color: new Ui.Color({ y: yuv.y + 0.10, u: yuv.u, v: yuv.v }) },
			{ offset: 1, color: new Ui.Color({ y: yuv.y - 0.10, u: yuv.u, v: yuv.v }) },
		] });
	},

	getBackgroundColor: function() {
		return this.getStyleProperty('color');
	},

	getBackgroundDownColor: function() {
		var yuv = this.getStyleProperty('color').getYuv();
		return new Ui.Color({ y: yuv.y - 0.10, u: yuv.u, v: yuv.v });
	},

	onCellSelect: function() {
		this.background.setFill(this.getBackgroundSelectGradient());
	},

	onCellUnselect: function() {
		this.background.setFill(this.getBackgroundColor());
	}
}, {
	onStyleChange: function() {
		var color = this.getStyleProperty('color');
		var yuv = color.getYuv();
		var darkColor = new Ui.Color({ y: yuv.y - 0.30, u: yuv.u, v: yuv.v });
		this.background.setFill(color);
		this.border.setFill(darkColor);

		var spacing = this.getStyleProperty('spacing');
		this.ui.setMargin(spacing + 2);
	}
}, {
	style: {
		color: new Ui.Color({ r: 0.99, g: 0.99, b: 0.99 }),
		selectColor: new Ui.Color({ r: 0.31, g: 0.66, b: 1 }),
		spacing: 5
	}
});

