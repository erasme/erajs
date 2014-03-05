Ui.Container.extend('Ui.ListView', 
 /** @lends Ui.ListView#*/
{
	/**
	 * Fires when a row in the listView is selected
	 * @name Ui.ListView#select
	 * @event
	 * @param {Ui.ListView} listview The listview itself
	 * @param {number} row The selected row position.
	 */
	/**
	 * Fires when a row in the listView is unselected
	 * @name Ui.ListView#unselect
	 * @event
	 * @param {Ui.ListView} listview The listview itself
	 * @param {number} row The row position that has been unselect.
	 */
	/**
	 * Fires when a cell is activate (ie double-click)
	 * @name Ui.ListView#activate
	 * @event
	 * @param {Ui.ListView} listview The listview itself
	 * @param {number} row The cell's row position.
	 * @param {string} key The cell's key 
	 */
	/**
	 * Fires when a header is selected
	 * @name Ui.ListView#header
	 * @event
	 * @param {Ui.ListView} listview The listview itself
	 * @param {string} key The header's key 
	 */

	data: undefined,
	headers: undefined,
	cols: undefined,
	rowsHeight: 0,
	headersHeight: 0,
	selectedRow: undefined,
	headersVisible: true,
	mode: 'manual',

	/**
	 * @constructs
	 * @class
	 * @extends Ui.Container
	 */
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
			this.connect(header.ui, 'up', this.onHeaderUp);
			header.rows = [];
			header.colWidth = header.width;
			this.appendChild(header.ui);
		}
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

	/**
	* Show the headers
	*/
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

	/**
	* Hide the headers
	*/
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
		for(var col = 0; col < this.headers.length; col++) {
			var cell = new Ui.ListViewCellString({ key: this.headers[col].key });
			this.connect(cell, 'down', this.onCellDown);
			this.connect(cell, 'up', this.onCellUp);
			this.connect(cell, 'toggle', this.onCellSelect);
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
			if(this.selectedRow === position)
				this.fireEvent('unselect', this, this.selectedRow);
			this.data.splice(position, 1);
			for(var col = 0; col < this.headers.length; col++) {
				var cell = this.headers[col].rows[position];
				if(this.selectedRow == position)
					cell.untoggle();
				this.disconnect(cell, 'down', this.onCellDown);
				this.disconnect(cell, 'up', this.onCellUp);
				this.disconnect(cell, 'toggle', this.onCellSelect);
				this.disconnect(cell, 'activate', this.onCellActivate);
				this.rowContainer.removeChild(cell);
				this.headers[col].rows.splice(position, 1);
			}
			if(this.selectedRow !== undefined) {
				if(this.selectedRow === position)
					this.selectedRow = undefined;
				else if(position < this.selectedRow)
					this.selectedRow--;
			}
			this.invalidateMeasure();
		}
	},

	/**
	* Remove all data
	*/
	clearData: function() {
		while(this.data.length > 0)
			this.removeDataAt(0);
	},

	/**
	* @return the array of data
	*/
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

	/**
	* Select the given row
	*/
	selectRow: function(row) {
		var col;
		if((row >= 0) && (row < this.data.length)) {
			if(this.selectedRow !== undefined) {
				if(this.selectedRow == row)
					return;
				for(col = 0; col < this.headers.length; col++)
					this.headers[col].rows[this.selectedRow].untoggle();
				this.fireEvent('unselect', this, this.selectedRow);
			}
			this.selectedRow = row;
			for(col = 0; col < this.headers.length; col++) {
				var tmpCell = this.headers[col].rows[row];
				this.disconnect(tmpCell, 'toggle', this.onCellSelect);
				tmpCell.toggle();
				this.connect(tmpCell, 'toggle', this.onCellSelect);
			}
			this.fireEvent('select', this, this.selectedRow);
		}
	},

	/**#@+ 
	 * @private 
	 */
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
		for(var row = 0; row < headerCol.rows.length; row++) {
			if(cell === headerCol.rows[row]) {
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
		if(row != -1)
			this.selectRow(row);
	},

	onCellActivate: function(cell) {
		var row = this.findCellRow(cell);
		if(row != -1)
			this.fireEvent('activate', this, row, cell.getKey());
	},

	onHeaderUp: function(header) {
		var key;
		for(var col = 0; col < this.headers.length; col++){
			var h = this.headers[col];
			if(h.ui === header){
				key = h.key;
			}
		}

		if(key !== undefined){
			this.fireEvent('header', this, key);
		}
	}

	/**#@-*/
}, 
 /** @lends Ui.ListView#*/
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
						var cell = this.headers[col].rows[dataRow];
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
				var cell = this.headers[col].rows[dataRow];
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
				var cell = header.rows[row];
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
		for(col = 0; col < this.headers.length; col++) {
			header = this.headers[col];
			var colbar = this.cols[col];
			colWidth = header.ui.getMeasureWidth();
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
				colWidth = header.ui.getMeasureWidth();
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
});

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
		if(this.title != title) {
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

Ui.Togglable.extend('Ui.ListViewCellString',
/** @lends Ui.ListViewCellString#*/
{
	string: '',
	ui: undefined,
	background: undefined,
	border: undefined,
	cellDown: false,
	cellSelected: false,
	key: undefined,
	
	/**
	 * @constructs
	 * @class
	 * @extends Ui.Selectable
	 */
	constructor: function(config) {
		this.setClipToBounds(true);
		this.border = new Ui.Rectangle({ height: 1, verticalAlign: 'bottom' });
		this.append(this.border);

		this.background = new Ui.Rectangle({ fill: 'white', marginBottom: 1, marginRight: 1 });
		this.append(this.background);
		this.ui = new Ui.Label({ margin: 8, horizontalAlign: 'left' });
		this.append(this.ui);

		this.connect(this, 'toggle', this.onCellSelect);
		this.connect(this, 'untoggle', this.onCellUnselect);
	},

	getKey: function() {
		return this.key;
	},

	setKey: function(key) {
		this.key = key;
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
		if(!this.getIsToggled())
			this.background.setFill(this.getBackgroundDownColor());
	},

	up: function() {
		this.cellDown = false;
		if(!this.getIsToggled())
			this.background.setFill(this.getBackgroundColor());
	},

	/**#@+ 
	 * @private 
	 */
	getDarkColor: function() {
		var yuv = this.getStyleProperty('color').getYuv();
		return new Ui.Color({ y: yuv.y - 0.30, u: yuv.u, v: yuv.v });
	},

	getBackgroundSelectColor: function() {
		return this.getStyleProperty('selectColor');
	},

	getBackgroundColor: function() {
		return this.getStyleProperty('color');
	},

	getBackgroundDownColor: function() {
		var yuv = this.getStyleProperty('color').getYuv();
		return new Ui.Color({ y: yuv.y - 0.10, u: yuv.u, v: yuv.v });
	},

	onCellSelect: function() {
		this.background.setFill(this.getBackgroundSelectColor());
	},

	onCellUnselect: function() {
		this.background.setFill(this.getBackgroundColor());
	}
	/**#@-*/
}, 
/** @lends Ui.ListViewCellString#*/
{
	onStyleChange: function() {
		var color = this.getStyleProperty('color');
		var yuv = color.getYuv();
		var darkColor = new Ui.Color({ y: yuv.y - 0.30, u: yuv.u, v: yuv.v });
		this.background.setFill(color);
		this.border.setFill(darkColor);

		var spacing = this.getStyleProperty('spacing');
		this.ui.setMargin(spacing + 2);
	}
}, 
/** @lends Ui.ListViewCellString*/
{
	style: {
		color: new Ui.Color({ r: 0.99, g: 0.99, b: 0.99, a: 0.1 }),
		selectColor: new Ui.Color({ r: 0.88, g: 0.88, b: 0.88 }),
		spacing: 5
	}
});


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

