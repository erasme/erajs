
Ui.Popup.extend('Ui.MenuToolBarPopup', {
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
	hbox: undefined,
	menuButton: undefined,
	menuPopup: undefined,
	menuVBox: undefined,

	constructor: function(config) {
		this.items = [];
		this.hbox = new Ui.HBox();
		this.appendChild(this.hbox);
		this.menuButton = new Ui.Button({ icon: 'arrowbottom' });
		this.connect(this.menuButton, 'press', this.onMenuButtonPress);
		this.menuPopup = new Ui.MenuToolBarPopup({ expandable: true });
		var scroll = new Ui.ScrollingArea();
		this.menuPopup.setContent(scroll);
		this.menuVBox = new Ui.VBox({ spacing: 10, margin: 10 });
		scroll.setContent(this.menuVBox);
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
		return this.hbox.getSpacing();
	},

	/**
	 * Set the space value inserted between each child
	 */
	setSpacing: function(spacing) {
		this.hbox.setSpacing(spacing);
		this.menuVBox.setSpacing(spacing);
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

	/**#@+
	* @private
	*/
	onMenuButtonPress: function() {
		this.menuPopup.show(this.menuButton, 'bottom');
	}
	/**#@-*/
}, 
{
	clear: function() {
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

		this.measureLock = true;
		
		this.menuVBox.clear();
		this.hbox.clear();
				
		var minSizes = [];
		var totalWidth = 0;

		for(var i = 0; i < this.items.length; i++) {
			var item = this.items[i];
			this.hbox.append(item, Ui.MenuToolBar.getResizable(item));
			var minSize = item.measure(0, 0);
			minSizes.push(minSize);
			totalWidth += minSize.width;
		}
		totalWidth += this.getSpacing() * (minSizes.length-1);

		// everything fit in the hbox
		if(totalWidth <= constraintWidth) {
			size = this.hbox.measure(constraintWidth, constraintHeight);
		}
		// we need a menu button
		else {
			this.hbox.append(this.menuButton);		
			var buttonSize = this.menuButton.measure(0, 0);

			this.hbox.clear();
			var totalWidth = 0;
			var i;
			for(i = 0; i < this.items.length; i++) {
				totalWidth += minSizes[i].width + this.getSpacing();
				if(totalWidth + buttonSize.width <= constraintWidth)
					this.hbox.append(this.items[i], Ui.MenuToolBar.getResizable(this.items[i]));
				else
					break;
			}
			this.hbox.append(this.menuButton);
			size = this.hbox.measure(constraintWidth, constraintHeight);
			// put the overflow in the menu popup
			for(; i < this.items.length; i++) {
				this.menuVBox.append(this.items[i], false);
			}
		}
		size.width += left + right;
		size.height += top + bottom;
		this.measureLock = undefined;
		return size;
	},

	arrangeCore: function(width, height) {
		var left = this.paddingLeft;
		var right = this.paddingRight;
		var top = this.paddingTop;
		var bottom = this.paddingBottom;
		width -= left + right;
		height -= top + bottom;
		this.hbox.arrange(left, top, width, height);
	},
	
	onChildInvalidateMeasure: function(child, event) {
		if(this.measureLock !== true)
			Ui.MenuToolBar.base.onChildInvalidateMeasure.call(this, child, event);
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
	}
});
