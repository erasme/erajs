
Ui.Popup.extend('Ui.MenuToolBarPopup', {
});

Ui.Button.extend('Ui.MenuToolBarButton', {
	constructor: function() {
		this.setIcon('arrowbottom');
	}
});

Ui.Container.extend('Ui.MenuToolBar', 
{
	paddingTop: 0,
	paddingBottom: 0,
	paddingLeft: 0,
	paddingRight: 0,
	star: 0,
	measureLock: undefined,
	items: undefined,
	menuButton: undefined,
	itemsAlign: 'left',
	menuPosition: 'right',
	uniform: false,
	uniformSize: 0,
	spacing: 0,
	itemsWidth: 0,
	keepItems: undefined,
	menuNeeded: false,
	bg: undefined,

	constructor: function(config) {
		this.items = [];

		this.bg = new Ui.Rectangle();
		this.appendChild(this.bg);

		this.menuButton = new Ui.MenuToolBarButton();
		this.connect(this.menuButton, 'press', this.onMenuButtonPress);
		this.appendChild(this.menuButton);
	},
	
	getUniform: function() {
		return this.uniform;
	},
	
	setUniform: function(uniform) {
		if(this.uniform !== uniform) {
			this.uniform = uniform;
			this.invalidateMeasure();
		}
	},
	
	getMenuPosition: function() {
		return this.menuPosition;
	},

	setMenuPosition: function(menuPosition) {
		if(this.menuPosition !== menuPosition) {
			this.menuPosition = menuPosition;
			this.invalidateArrange();
		}
	},

	getItemsAlign: function() {
		return this.itemsAlign;
	},

	setItemsAlign: function(align) {
		if(this.itemsAlign !== align) {
			this.itemsAlign = align;
			this.invalidateArrange();
		}
	},

	getLogicalChildren: function() {
		return this.items;
	},

	/**
	 * Set the padding for all borders
	 */
	setPadding: function(padding) {
		this.setPaddingTop(padding);
		this.setPaddingBottom(padding);
		this.setPaddingLeft(padding);
		this.setPaddingRight(padding);
	},

	/**
	 * Return the current element top padding
	 */
	getPaddingTop: function() {
		return this.paddingTop;
	},

	/*
	 * Set the current element top padding
	 */
	setPaddingTop: function(paddingTop) {
		if(this.paddingTop != paddingTop) {
			this.paddingTop = paddingTop;
			this.invalidateMeasure();
		}
	},

	/**
	 * Return the current element bottom padding
	 */
	getPaddingBottom: function() {
		return this.paddingBottom;
	},

	/**
	 * Set the current element bottom padding
	 */
	setPaddingBottom: function(paddingBottom) {
		if(this.paddingBottom != paddingBottom) {
			this.paddingBottom = paddingBottom;
			this.invalidateMeasure();
		}
	},

	//
	// Return the current element left padding
	//
	getPaddingLeft: function() {
		return this.paddingLeft;
	},

	/**
	 * Set the current element left padding
	 */
	setPaddingLeft: function(paddingLeft) {
		if(this.paddingLeft != paddingLeft) {
			this.paddingLeft = paddingLeft;
			this.invalidateMeasure();
		}
	},

	/**
	 * Return the current element right padding
	 */
	getPaddingRight: function() {
		return this.paddingRight;
	},

	/**
	 * Set the current element right padding
	 */
	setPaddingRight: function(paddingRight) {
		if(this.paddingRight != paddingRight) {
			this.paddingRight = paddingRight;
			this.invalidateMeasure();
		}
	},

	/**
	 * Return the space inserted between each
	 * child
	 */
	getSpacing: function() {
		return this.spacing;
	},

	/**
	 * Set the space value inserted between each child
	 */
	setSpacing: function(spacing) {
		if(this.spacing !== spacing) {
			this.spacing = spacing;
			this.invalidateMeasure();
		}
	},

	/**
	 * Append a child at the end of the box
	 */
	append: function(child, resizable) {
		child = Ui.Element.create(child);
		if(resizable)
			Ui.MenuToolBar.setResizable(child, true);
		this.items.push(child);
		this.invalidateMeasure();
	},

	/**
	 * Append a child at the begining of the box
	 */
	prepend: function(child, resizable) {
		child = Ui.Element.create(child);
		if(resizable)
			Ui.MenuToolBar.setResizable(child, true);
		this.items.unshift(child);
		this.invalidateMeasure();
	},
	
	remove: function(child) {
		var i = 0;
		while((i < this.items.length) && (this.items[i] != child)) { i++ };
		if(i < this.items.length) {
			this.items.splice(i, 1);
			if(child.getParent() === this)
				child.getParent().removeChild(child);
			this.invalidateMeasure();
		}
	},

	moveAt: function(child, position) {
		if(position < 0)
			position = this.items.length + position;
		if(position < 0)
			position = 0;
		if(position >= this.items.length)
			position = this.items.length;
		var i = 0;
		while((i < this.items.length) && (this.items[i] !== child)) { i++ };
		if(i < this.items.length) {
			this.items.splice(i, 1);
			this.items.splice(position, 0, child);
		}
		this.onChildInvalidateMeasure(child, 'move');
	},
	
	insertAt: function(child, position, resizable) {
		this.append(child, resizable);
		this.moveAt(child, position);
	},

	setContent: function(content) {
		if(content === undefined)
			this.clear();
		else if(typeof(content) === 'object') {
			if(content.constructor !== Array) {
				content = [ content ];
			}
			// removed items that disapears
			for(var i = 0; i < this.items.length; i++) {
				var found = false;
				for(var i2 = 0; (found === false) && (i2 < content.length); i2++) {
					found = (this.items[i] === content[i2]);
				}
				if((found === false) && (this.items[i].getParent() === this))
					this.removeChild(this.items[i]);
			}
			this.items = content;
			this.invalidateMeasure();
		}
	},

	/**#@+
	* @private
	*/
	onMenuButtonPress: function() {
		var dialog = new Ui.MenuToolBarPopup({ expandable: true });
		var scroll = new Ui.ScrollingArea();
		dialog.setContent(scroll);
		//var vbox = new Ui.VBox({ spacing: this.spacing, margin: 10 });
		var flow = new Ui.Flow({ spacing: this.spacing, margin: 10 });
		scroll.setContent(flow);
		for(var i = 0; i < this.items.length; i++) {
			var item = this.items[i];
			if(item.getParent() !== this)
				flow.append(item);
		}
		dialog.show(this.menuButton, 'bottom');
	}
	/**#@-*/
}, 
{
	clear: function() {
		for(var i = 0; i < this.items.length; i++) {
			if(this.items[i].getParent() === this)
				this.items[i].getParent().removeChild(this.items[i]);
		}
		this.items = [];
		this.invalidateMeasure();
	},

	measureCore: function(width, height) {
		var left = this.getPaddingLeft();
		var right = this.getPaddingRight();
		var top = this.getPaddingTop();
		var bottom = this.getPaddingBottom();
		var constraintWidth = Math.max(0, width - (left + right));
		var constraintHeight = Math.max(0, height - (top + bottom));
		var size;

//		console.log(this+'.measureCore('+width+','+height+') START');

		this.measureLock = true;

		this.bg.measure(width, height);

		// measure the menu button
		var buttonSize = this.menuButton.measure(0, 0);
		
		var minSizes = [];

		// set all item as graphical childs and get their min sizes
		for(var i = 0; i < this.items.length; i++) {
			var item = this.items[i];
			if(item.getParent() !== this) {
				if(item.getParent() !== undefined)
					item.getParent().removeChild(item);
				this.appendChild(item);
			}
			minSizes.push(item.measure(0, 0));
		}
		
		// decide which items will be directly displayed (not in the menu)
		this.keepItems = [];
		var totalWidth = 0;
		var countResizable = 0;
		var maxItemWidth = 0;
		var maxItemHeight = buttonSize.height;
		var minItemsSize = 0;

		var i = (this.menuPosition === 'left')?(i = this.items.length-1):0;
		while((i>= 0) && (i< this.items.length)) {
			var minSize = minSizes[i];
			if(totalWidth + minSize.width + this.spacing > constraintWidth)
				break;
			totalWidth += minSize.width + this.spacing;
			if(totalWidth + buttonSize.width > constraintWidth)
				break;
			if(this.menuPosition === 'left')
				this.keepItems.unshift(this.items[i]);
			else
				this.keepItems.push(this.items[i]);
			if(Ui.MenuToolBar.getResizable(this.items[i]))
				countResizable++;
			else
				minItemsSize += minSize.width;
			if(minSize.width > maxItemWidth)
				maxItemWidth = minSize.width;
			if(minSize.height > maxItemHeight)
				maxItemHeight = minSize.height;
			if(this.menuPosition === 'left')
				i--;
			else
				i++;
		}
		this.menuNeeded = this.keepItems.length !== this.items.length;

		var constraintSize = constraintWidth;
		if(this.menuNeeded) {
			constraintSize -= buttonSize.width + this.spacing;
			// remove graphical childs that dont fit
			while((i>= 0) && (i< this.items.length)) {
				this.removeChild(this.items[i]);
				if(this.menuPosition === 'left')
					i--;
				else
					i++;
			}
		}

		// measure using items we keept
		if(this.uniform) {
			// we can respect the uniform constraint
			if((this.keepItems.length * (maxItemWidth + this.spacing)) - this.spacing <= constraintWidth) {
				for(var i = 0; i < this.keepItems.length; i++)
					this.keepItems[i].measure(maxItemWidth, maxItemHeight);
				this.uniformSize = maxItemWidth;
				size = { width: ((this.keepItems.length * (maxItemWidth + this.spacing)) - this.spacing), height: maxItemHeight };
			}
			// we cant respect, do our best, dont care
			else {
				this.uniformSize = undefined;
				size = { width: totalWidth, height: maxItemHeight };
			}
		}
		// measure is not uniform
		else {
			if(countResizable > 0) {
				var remainWidth = constraintSize - minItemsSize - ((this.keepItems.length - 1) * this.spacing);
				var starFound = true;
				var star = remainWidth / countResizable;
				do {
					starFound = true;
					for(var i = 0; i < this.keepItems.length; i++) {
						var child = this.getChildren()[i];
						if(Ui.MenuToolBar.getResizable(child)) {
							if(!child.menutoolbarStarDone) {
								var size = child.measure(star, constraintHeight);
								if(size.height > maxItemHeight)
									maxItemHeight = size.height;
								if(size.width > star) {
									child.menutoolbarStarDone = true;
									starFound = false;
									remainWidth -= size.width;
									minItemsSize += size.width;
									countResizable--;
									star = remainWidth / countResizable;
									break;
								}
							}
						}
					}
				} while(!starFound);
				
				minItemsSize += this.spacing * (this.keepItems.length - 1);
				if(countResizable > 0) {
					minItemsSize += star * countResizable;
					this.star = star;
				}
				else
					this.star = 0;
				size = { width: minItemsSize, height: maxItemHeight };
			}
			else
				size = { width: totalWidth, height: maxItemHeight };
		}

		if(this.menuNeeded)
			size.width += buttonSize.width + this.spacing;
		
		size.width += left + right;
		size.height += top + bottom;
		this.measureLock = undefined;
		
//		console.log(this+'.measureCore('+width+','+height+') STOP');
		return size;
	},

	arrangeCore: function(width, height) {
		this.bg.arrange(0, 0, width, height);

		var left = this.paddingLeft;
		var right = this.paddingRight;
		var top = this.paddingTop;
		var bottom = this.paddingBottom;
		width -= left + right;
		height -= top + bottom;

		var x = left;
		var y = top;
		var first = true;
		if(this.itemsAlign !== 'left')
			x = width - this.getMeasureWidth();
		
		if(this.menuNeeded && (this.menuPosition === 'left')) {
			first = false;
			this.menuButton.arrange(x, y, this.menuButton.getMeasureWidth(), height);
			x += this.menuButton.getMeasureWidth();
		}
		
		for(var i = 0; i < this.keepItems.length; i++) {
			var item = this.keepItems[i];
			if(first)
				first = false;
			else 				
				x += this.spacing;
			var itemWidth;
			if(this.uniform && (this.uniformSize !== undefined))
				itemWidth = this.uniformSize;
			else {
				itemWidth = item.getMeasureWidth();
				if(Ui.MenuToolBar.getResizable(item) && (itemWidth < this.star))
					itemWidth = this.star;
			}
			item.arrange(x, y, itemWidth, height);
			x += itemWidth;
		}
		
		if(this.menuNeeded && (this.menuPosition !== 'left')) {
			if(first)
				first = false;
			else 				
				x += this.spacing;
			this.menuButton.arrange(x, y, this.menuButton.getMeasureWidth(), height);
		}
		
		if(!this.menuNeeded)
			this.menuButton.getDrawing().style.visibility = 'hidden';
		else
			this.menuButton.getDrawing().style.visibility = '';
	},
	
	onChildInvalidateMeasure: function(child, event) {
//		console.log('onChildInvalidateMeasure lock ? '+this.measureLock+', isValid ? '+this.measureValid);
		if(this.measureLock !== true)
			Ui.MenuToolBar.base.onChildInvalidateMeasure.call(this, child, event);
	},
	
	onStyleChange: function() {
		this.bg.setFill(this.getStyleProperty('background'));
	}
	
}, {

	getResizable: function(child) {
		return child['Ui.MenuToolBar.resizable']?true:false;
	},

	setResizable: function(child, resizable) {
		if(Ui.MenuToolBar.getResizable(child) != resizable) {
			child['Ui.MenuToolBar.resizable'] = resizable;
			child.invalidateMeasure();
		}
	},

	style: {
		background: 'rgba(255,255,255,0)'
	}
});
