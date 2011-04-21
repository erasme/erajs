//
// Define the ListView class.
//
Ui.Container.extend('Ui.ListView', {
	data: undefined,
	headers: undefined,
	rowsHeight: 0,
	headersHeight: 0,
	rowHeight: 1,
	offsetX: 0,
	offsetY: 0,
	splitRow: -1,
	visibleRows: 0,

	scrollHorizontal: true,
	scrollVertical: true,

	constructor: function(config) {
		if(config.scrollHorizontal != undefined)
			this.setScrollHorizontal(config.scrollHorizontal);
		if(config.scrollVertical != undefined)
			this.setScrollVertical(config.scrollVertical);

		this.getDrawing().style.overflow = 'hidden';

		this.rowContainer = new Ui.Container();
		this.appendChild(this.rowContainer);
		this.rowContainer.getDrawing().style.overflow = 'hidden';
//		this.rowContainer.getDrawing().style.overflow = 'scroll';

//		this.rowContainerSizer = document.createElement('div');
//		this.rowContainer.getDrawing().appendChild(this.rowContainerSizer);

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
			// add a cell to measure
//			header.cell = new Ui.ListViewCellString();
//			header.cell.hide();
//			this.appendChild(header.cell);
		}

		if(config.data != undefined) {
			for(var i = 0; i < config.data.length; i++)
				this.appendData(config.data[i]);
		}

		this.connect(this.getDrawing(), 'mousewheel', this.onMouseWheel);

		this.connect(this.getDrawing(), 'mousedown', this.onMouseDown);

		this.connect(this.getDrawing(), 'touchstart', this.onTouchStart);
		this.connect(this.getDrawing(), 'touchmove', this.onTouchMove);
		this.connect(this.getDrawing(), 'touchend', this.onTouchEnd);


	},

	getScrollHorizontal: function() {
		return this.scrollHorizontal;
	},

	setScrollHorizontal: function(scroll) {
		if(scroll != this.scrollHorizontal) {
			this.scrollHorizontal = scroll;
			this.invalidateMeasure();
		}
	},

	getScrollVertical: function() {
		return this.scrollVertical;
	},

	setScrollVertical: function(scroll) {
		if(scroll != this.scrollVertical) {
			this.scrollVertical = scroll;
			this.invalidateMeasure();
		}
	},

	onMouseWheel: function(event) {
		event.preventDefault();
		event.stopPropagation();

		var deltaX = 0;
		var deltaY = 0;

		if((event.wheelDeltaX != undefined) && (event.wheelDelaY != undefined)) {
			deltaX = -event.wheelDeltaX / 12;
			deltaY = -event.wheelDeltaY / 12;
		}
		else if(event.wheelDelta != undefined)
			deltaY = -event.wheelDelta / 8;
		else if(event.detail != undefined)
			deltaY = event.detail * 10 / 3;

//		console.log('wheel delta: '+deltaY);
		this.setOffsetY(this.offsetY + deltaY);
	},

	onMouseDown: function(event) {
		this.mouseButton = event.button;

		event.preventDefault();
		event.stopPropagation();

		this.connect(window, 'mouseup', this.onMouseUp, true);
		this.connect(window, 'mousemove', this.onMouseMove, true);

		this.mouseStart = this.pointFromWindow({ x: event.clientX, y: event.clientY });
		this.startOffsetX = this.offsetX;
		this.startOffsetY = this.offsetY;
	},

	onMouseMove: function(event) {
		event.preventDefault();
		event.stopPropagation();

		var mousePos = this.pointFromWindow({ x: event.clientX, y: event.clientY });
		var deltaX = mousePos.x - this.mouseStart.x;
		var deltaY = mousePos.y - this.mouseStart.y;
		offsetX = this.startOffsetX - deltaX;
		offsetY = this.startOffsetY - deltaY;
		this.setOffset(offsetX, offsetY);

	},

	onMouseUp: function(event) {
		event.preventDefault();
		event.stopPropagation();

		if(event.button != this.mouseButton)
			return;

		this.disconnect(window, 'mousemove', this.onMouseMove);
		this.disconnect(window, 'mouseup', this.onMouseUp);
	},


	onTouchStart: function(event) {
		if(event.targetTouches.length != 1)
			return;

		if(this.isMoving)
			return;

		this.touchId = event.targetTouches[0].identifier;

		this.isMoving = true;

		event.preventDefault();
		event.stopPropagation();

		this.touchStart = this.pointFromWindow({ x: event.targetTouches[0].clientX, y: event.targetTouches[0].clientY });
		this.startOffsetX = this.offsetX;
		this.startOffsetY = this.offsetY;

//		console.log('TouchStart');
	},

	onTouchMove: function(event) {
		if(!this.isMoving)
			return;
		if(event.targetTouches[0].identifier != this.touchId)
			return;

		event.preventDefault();
		event.stopPropagation();

		var touchPos = this.pointFromWindow({ x: event.targetTouches[0].clientX, y: event.targetTouches[0].clientY });
		var deltaX = touchPos.x - this.touchStart.x;
		var deltaY = touchPos.y - this.touchStart.y;
		offsetY = this.startOffsetY - deltaY;

//		console.log('TouchMove deltaY: '+offsetY+' ('+(new Date()).getTime()+')');

		this.setOffsetY(offsetY);
	},

	onTouchEnd: function(event) {
		if(!this.isMoving)
			return;

		event.preventDefault();
		event.stopPropagation();

		this.isMoving = false;

//		console.log('TouchEnd');
	},

	appendData: function(data) {
		this.data.push(data);

		for(var col = 0; col < this.headers.length; col++) {
			var cell = new Ui.ListViewCellString();
			cell.setString(data[this.headers[col].key]);
			this.headers[col].rows.push(cell);
//			this.prependChild(cell);
			this.rowContainer.appendChild(cell);
		}
		this.invalidateMeasure();
		// measure data
//		if(!this.scrollVertical)
//			this.invalidateMeasure();
//		else
//			this.updateRowMeasure(data);
//		this.invalidateLayout();
//		this.updateLayout();
	},

	removeData: function(data) {
		for(var i = 0; i < this.data.length; i++) {
			if(this.data[i] == data) {
				this.data.splice(i, 1);
				this.invalidateLayout();
				break;
			}
		}
	},

	removeDataAt: function(position) {
		if(position < this.data.length) {
			this.data.splice(position, 1);
			this.invalidateLayout();
		}
	},

	getData: function() {
		return this.data;
	},

	setOffsetX: function(offsetX) {
		this.setOffset(offsetX, undefined);
	},

	setOffsetY: function(offsetY) {
		this.setOffset(undefined, offsetY);
	},

	setOffset: function(offsetX, offsetY) {
		if(offsetX == undefined)
			offsetX = this.offsetX;
		if(offsetY == undefined)
			offsetY = this.offsetY;

		if(!this.scrollHorizontal)
			offsetX = 0;
		if(!this.scrollVertical)
			offsetY = 0;

//		console.log('setOffset Y: '+offsetY+', rowsHeight: '+this.rowsHeight);

		var headersWidth = 0;
		for(var col = 0; col < this.headers.length; col++)
			headersWidth += this.headers[col].colWidth;

//		console.log('setOffset X: '+offsetX+', headersWidth: '+headersWidth);

		if(offsetX + this.getLayoutWidth() > headersWidth)
			offsetX  = headersWidth - this.getLayoutWidth();
		if(offsetY + (this.getLayoutHeight() - this.headersHeight) > this.rowsHeight)
			offsetY = this.rowsHeight - (this.getLayoutHeight() - this.headersHeight);
		if(offsetX < 0)
			offsetX = 0;
		if(offsetY < 0)
			offsetY = 0;

//		console.log('setOffset limited Y: '+offsetY);

		if((this.offsetX != offsetX) || (this.offsetY != offsetY)) {
			this.offsetX = offsetX;
			this.offsetY = offsetY;

//			console.log('setOffset('+this.offsetX+','+this.offsetY+')');

			this.rowContainer.getDrawing().scrollLeft = this.offsetX;
			this.rowContainer.getDrawing().scrollTop = this.offsetY;

//			console.log('getOffsetY '+this.rowContainer.getDrawing());
//			this.rowContainer.getDrawing().dump('scroll');

//			this.rowContainer.setTransform(Ui.Matrix.createTranslate(-this.offsetX, -this.offsetY));

//			this.invalidateLayout();
//			this.updateLayout();
			
		}
	},

	//
	// Private
	//

	updateRowMeasure: function(data) {
//		console.log('updateRowMeasure');

		var heightDone;
		var widthDone = true;
		if(data.rowHeight != undefined)
			this.rowsHeight -= data.rowHeight;
		do {
			heightDone = true;
			var minHeight = 0;
			for(var col = 0; col < this.headers.length; col++) {
				var header = this.headers[col];
				header.cell.setString(data[this.headers[col].key]);
				var size = header.cell.measure(header.colWidth, data.rowHeight);
				if(size.height > minHeight)
					minHeight = size.height;
				if(size.width > header.minWidth)
					header.minWidth = size.width;
				if(size.width > header.colWidth) {
					header.colWidth = size.width;
					widthDone = false;
				}
			}
			if(minHeight != data.rowHeight) {
				heightDone = false;
				data.rowHeight = minHeight;
			}
//			console.log('loop minHeight: '+minHeight);

		} while(!heightDone);
		this.rowsHeight += data.rowHeight;

		if(!widthDone) {
//			console.log('global updateMeasure needed');

			if(!this.scrollHorizontal)
				this.invalidateMeasure();
			else
				this.updateMeasure();
		}
	},

	updateMeasure: function() {
//		console.log('updateMeasure');
		var widthDone;
		do {
			widthDone = true;
			this.rowsHeight = 0;
			var heightDone;
			do {
				heightDone = true;
				var minHeight = 0;
				var availableWidth = this.getLayoutWidth();
				for(var col = 0; col < this.headers.length; col++) {
					var header = this.headers[col];
					header.minWidth = 0;
					var colWidth = header.colWidth;
					if(col == this.headers.length - 1)
						colWidth = Math.max(availableWidth, 0);
					var size = header.ui.measure(colWidth, 0);
					if(size.height > minHeight)
						minHeight = size.height;
					if(size.width > header.minWidth)
						header.minWidth = size.width;
					availableWidth -= header.colWidth;
				}
				this.headersHeight = minHeight;
			} while(!heightDone);

			for(var dataRow = 0; dataRow < this.data.length; dataRow++) {
//				console.log('dataRow: '+dataRow);

				var data = this.data[dataRow];
				var heightDone;
				do {
					heightDone = true;
					var minHeight = 0;
					var availableWidth = this.getLayoutWidth();
					for(var col = 0; col < this.headers.length; col++) {
						var header = this.headers[col];
						cell = this.headers[col].rows[dataRow];

//						header.cell.setString(data[this.headers[col].key]);

						var colWidth = header.colWidth;
						if(col == this.headers.length - 1)
							colWidth = Math.max(availableWidth, 0);
//						var size = header.cell.measure(colWidth, data.rowHeight);
						var size = cell.measure(colWidth, data.rowHeight);
						if(size.height > minHeight)
							minHeight = size.height;
						if(size.width > header.minWidth)
							header.minWidth = size.width;

						availableWidth -= header.colWidth;
					}
					if(minHeight != data.rowHeight) {
						heightDone = false;
						data.rowHeight = minHeight;
					}
//					console.log('loop rowHeight: '+data.rowHeight);

				} while(!heightDone);
				this.rowsHeight += data.rowHeight;
			}
			for(var col = 0; col < this.headers.length; col++) {
				var header = this.headers[col];
//				console.log('col: '+col+', minWidth: '+header.minWidth+', colWidth: '+header.colWidth);

				if(header.minWidth > header.colWidth) {
					header.colWidth = header.minWidth;
					widthDone = false;
				}
			}
		} while(!widthDone);
	},

}, {
	measureCore: function(width, height) {
		console.log(this+'.measureCore');
		this.updateMeasure();
		var minWidth = this.headersHeight * 2;
		var minHeight = this.headersHeight * 2;

		if(!this.scrollHorizontal) {
			minWidth = 0;
			for(var col = 0; col < this.headers.length; col++)
				minWidth += this.headers[col].minWidth;
		}
		if(!this.scrollVertical) {
			minHeight = this.headersHeight + this.rowsHeight;
		}
		return { width: minWidth, height: minHeight };
	},

	arrangeCore: function(width, height) {
//		this.setOffset(this.offsetX, this.offsetY);
		this.updateLayout();
	},

	onChildInvalidateMeasure: function(child) {
//		console.log(this+'.onChildInvalidateMeasure('+child+')');
//		Ui.ListView.base.onChildInvalidateMeasure.call(this, child);
	},

	onChildInvalidateArrange: function(child) {
//		console.log(this+'.onChildInvalidateArrange('+child+')');
//		Ui.ListView.base.onChildInvalidateArrange.call(this, child);
	},

	updateLayout: function() {
		console.log(this+'.updateLayout ('+(new Date()).getTime()+')');

		// update headers
//		var x = -this.offsetX;
		var x = 0;
		var availableWidth = this.getLayoutWidth();
		for(var col = 0; col < this.headers.length; col++) {
			var header = this.headers[col];
			var colWidth = header.colWidth;
			if(col == this.headers.length - 1)
				colWidth = Math.max(colWidth, availableWidth);
			header.ui.arrange(x, 0, colWidth, this.headersHeight);
			x += colWidth;
			availableWidth -= colWidth;
		}

		// handle no data case
		if(this.data.length == 0) {
//			for(var row = 0; row < this.headers[0].rows.length; row++) {
//				for(var col = 0; col < this.headers.length; col++) {
//					var cell = this.headers[col].rows[row];
//					cell.hide();
//				}
//			}
			return;
		}

//		var dataRow;
		var dataRow = 0;
//		var cumulHeight = 0;
//		for(dataRow = 0; cumulHeight + this.data[dataRow].rowHeight < this.offsetY; dataRow++) {
//			cumulHeight += this.data[dataRow].rowHeight;
//		}

//		var y = (cumulHeight - this.offsetY) + this.headersHeight;
		var y = 0;

//		console.log('first row is: '+dataRow+', y: '+y+', offsetY: '+this.offsetY);

//		var row = 0;
		while(/*(y < this.getLayoutHeight()) &&*/ (dataRow < this.data.length)) {
			var data = this.data[dataRow];
			// add a row
//			if(row >= this.headers[0].rows.length) {
//				console.log('addRow');
//				for(var col = 0; col < this.headers.length; col++) {
//					console.log('add cell');
//					var cell = new Ui.ListViewCellString();
//					this.headers[col].rows.push(cell);
//					this.prependChild(cell);
//				}
//			}
			// update the cell
//			var x = -this.offsetX;
			var x = 0;
			var availableWidth = this.getLayoutWidth();
			for(var col = 0; col < this.headers.length; col++) {
				var header = this.headers[col];
				var colWidth = header.colWidth;
				if(col == this.headers.length - 1)
					colWidth = Math.max(colWidth, availableWidth);
//				var cell = header.rows[row];
				var cell = header.rows[dataRow];
//				cell.show();
//				cell.setString(data[this.headers[col].key]);
//				cell.measure(colWidth, data.rowHeight);
//				console.log('arrange cell x: '+x+', y: '+y+', width: '+colWidth+', height: '+data.rowHeight);

//				cell.arrange(x, y, colWidth, data.rowHeight);

//				cell.setTransform(Ui.Matrix.createTranslate(x, y));
//				cell.arrange(0, 0, colWidth, data.rowHeight);
				cell.arrange(x, y, colWidth, data.rowHeight);

				x += colWidth;
				availableWidth -= colWidth;
			}
			y += data.rowHeight;
			dataRow++;
//			row++;
		}

//		this.rowContainer.arrange(0, this.headersHeight, 100, this.rowsHeight);
		this.rowContainer.arrange(0, this.headersHeight, this.getLayoutWidth(), this.getLayoutHeight() - this.headersHeight);

//		this.rowContainerSizer.style.width = 100+'px';
//		this.rowContainerSizer.style.height = this.rowsHeight+'px';

	},

});

Ui.LBox.extend('Ui.ListViewHeader', {
	title: undefined,
	uiTitle: undefined,

	constructor: function(config) {
		this.append(new Ui.Rectangle({ fill: 'lightblue' }));
		this.append(new Ui.Rectangle({ fill: 'orange', margin: 1 }));
		this.uiTitle = new Ui.Label({ margin: 8 });
		this.append(this.uiTitle);

		if(config.title != undefined)
			this.setTitle(config.title);
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
});

Ui.LBox.extend('Ui.ListViewCellString', {
	string: '',
	ui: undefined,
	
	constructor: function(config) {
		this.append(new Ui.Rectangle({ fill: 'pink' }));
		this.append(new Ui.Rectangle({ fill: 'white', margin: 1 }));
		this.ui = new Ui.Label({ margin: 8, horizontalAlign: 'left' });
		this.append(this.ui);

		if(config.title != undefined)
			this.setTitle(config.title);
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
});

