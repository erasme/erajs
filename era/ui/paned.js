Ui.Container.extend('Ui.Paned', 
/**@lends Ui.Paned#*/
{
	vertical: true,
	cursor: undefined,
	content1Box: undefined,
	content1: undefined,
	minContent1Size: 0,
	content2Box: undefined,
	content2: undefined,
	minContent2Size: 0,
	pos: 0.5,

	/**
	*	@constructs
	*	@class
	*	@extends Ui.Container
	*/
	constructor: function(config) {
		this.addEvents('change');
	
		this.content1Box = new Ui.LBox();
		this.appendChild(this.content1Box);

		this.content2Box = new Ui.LBox();
		this.appendChild(this.content2Box);

		this.cursor = new Ui.Movable();
		this.appendChild(this.cursor);

		this.cursor.setContent(new Ui.VPanedCursor());
		this.connect(this.cursor, 'move', this.onCursorMove);
	},

	//
	// Get the layout orientation.
	// Possible values: [vertical|horizontal|
	//
	getOrientation: function() {
		if(this.vertical)
			return 'vertical';
		else
			return 'horizontal';
	},

	//
	// Set the layout orientation.
	// Possible values: [vertical|horizontal|
	//
	setOrientation: function(orientation) {
		var vertical = true;
		if(orientation != 'vertical')
			vertical = false;
		if(this.vertical != vertical) {
			this.vertical = vertical;
			if(this.vertical)
				this.cursor.setContent(new Ui.VPanedCursor());
			else
				this.cursor.setContent(new Ui.HPanedCursor());
			this.invalidateMeasure();
		}
	},

	getPos: function() {
		return this.pos;
	},
	
	setPos: function(pos) {
		this.pos = pos;
		this.invalidateMeasure();
	},

	getContent1: function() {
		return this.content1;
	},

	setContent1: function(content1) {
		if(this.content1 !== content1) {
			if(this.content1 !== undefined)
				this.content1Box.remove(this.content1);
			this.content1 = content1;
			if(this.content1 !== undefined)
				this.content1Box.append(this.content1);
		}
	},

	getContent2: function() {
		return this.content2;
	},

	setContent2: function(content2) {
		if(this.content2 !== content2) {
			if(this.content2 !== undefined)
				this.content2Box.remove(this.content2);
			this.content2 = content2;
			if(this.content2 !== undefined)
				this.content2Box.append(this.content2);
		}
	},

	invert: function() {
		var tmp;
		tmp = this.content1Box;
		this.content1Box = this.content2Box;
		this.content2Box = tmp;

		tmp = this.content1;
		this.content1 = this.content2;
		this.content2 = tmp;

		this.pos = 1 - this.pos;
		this.invalidateArrange();
	},

	onCursorMove: function() {
		this.disconnect(this.cursor, 'move', this.onCursorMove);
		var p;
		var aSize;
		if(this.vertical) {
			p = this.cursor.getPositionY();
			aSize = this.getLayoutHeight() - this.cursor.getLayoutHeight();
		}
		else {
			p = this.cursor.getPositionX();
			aSize = this.getLayoutWidth() - this.cursor.getLayoutWidth();
		}

		this.pos = p / aSize;

		if(aSize * this.pos < this.minContent1Size)
			this.pos = this.minContent1Size / aSize;
		if(aSize * (1 - this.pos) < this.minContent2Size)
			this.pos = 1 - (this.minContent2Size / aSize);
		p = this.pos * aSize;

		if(p < 0)
			p = 0;
		if(p > aSize)
			p = aSize;

		if(this.vertical)
			this.cursor.setPosition(0, p);
		else
			this.cursor.setPosition(p, 0);

		this.invalidateMeasure();
		this.connect(this.cursor, 'move', this.onCursorMove);
		this.fireEvent('change', this, this.pos);
	}
}, 
/**@lends Ui.Paned#*/
{
	measureCore: function(width, height) {
		var cursorSize; var content1Size; var content2Size;
		if(this.vertical) {
			cursorSize = this.cursor.measure(width, 0);

			this.minContent1Size = this.content1Box.measure(width, 0).height;
			this.minContent2Size = this.content2Box.measure(width, 0).height;

			content1Size = this.content1Box.measure(width, (height - cursorSize.height) * this.pos);
			content2Size = this.content2Box.measure(width, (height - cursorSize.height) * (1 - this.pos));

			return { width: Math.max(cursorSize.width, Math.max(content1Size.width, content2Size.width)), height: content1Size.height + cursorSize.height + content2Size.height };
		}
		else {
			cursorSize = this.cursor.measure(0, height);

			this.minContent1Size = this.content1Box.measure(0, 0).width;
			this.minContent2Size = this.content2Box.measure(0, 0).width;

			content1Size = this.content1Box.measure((width - cursorSize.width) * this.pos, height);
			content2Size = this.content2Box.measure((width - cursorSize.width) * (1 - this.pos), height);

			return { width: content1Size.width + cursorSize.width + content2Size.width, height: Math.max(cursorSize.height, Math.max(content1Size.height, content2Size.height)) };
		}
	},

	arrangeCore: function(width, height) {
		if(this.vertical) {
			var cHeight = this.cursor.getMeasureHeight();
			var aHeight = height - cHeight;

			this.cursor.arrange(0, 0, width, cHeight);
			this.cursor.setPosition(0, aHeight * this.pos);

			this.content1Box.arrange(0, 0, width, aHeight * this.pos);
			this.content2Box.arrange(0, (aHeight * this.pos) + cHeight, width, aHeight * (1 - this.pos));
		}
		else {
			var cWidth = this.cursor.getMeasureWidth();
			var aWidth = width - cWidth;

			this.content1Box.arrange(0, 0, aWidth * this.pos, height);
			this.cursor.arrange(0, 0, cWidth, height);
			this.cursor.setPosition(aWidth * this.pos, 0);
			this.content2Box.arrange((aWidth * this.pos) + cWidth, 0, aWidth * (1 - this.pos), height);
		}
	}
});


Ui.Paned.extend('Ui.VPaned',
/**@lends Ui.VPaned#*/
{
	/**
	*	@constructs
	*	@class
	*	@extends Ui.Paned
	*/
	constructor: function(config) {
		this.setOrientation('vertical');
	}
});

Ui.Paned.extend('Ui.HPaned', 
/**@lends Ui.HPaned#*/
{
	/**
	*	@constructs
	*	@class
	*	@extends Ui.Paned
	*/
	constructor: function(config) {
		this.setOrientation('horizontal');
	}
});

Ui.LBox.extend('Ui.HPanedCursor',
/**@lends Ui.HPanedCursor#*/
{
	/**
	*	@constructs
	*	@class
	*	@extends Ui.LBox
	*/
	constructor: function(config) {
		this.append(new Ui.Rectangle({ fill: new Ui.Color({ r: 0, g: 0, b: 0, a: 0.05 }) }));
		this.append(new Ui.Rectangle({ fill: 'rgba(140,140,140,1)', width: 1, margin: 5, marginRight: 10, height: 30, verticalAlign: 'center' }));
		this.append(new Ui.Rectangle({ fill: 'rgba(140,140,140,1)', width: 1, margin: 5, marginLeft: 10, height: 30, verticalAlign: 'center' }));
		this.append(new Ui.Frame({ frameWidth: 1, fill: 'rgba(140,140,140,1)' }));

//		var hbox = new Ui.HBox({ verticalAlign: 'center', height: 30 });
//		this.append(hbox);

//		hbox.append(new Ui.Rectangle({ fill: new Ui.Color({ r: 0, g: 0, b: 0, a: 0.6 }), width: 1, marginLeft: 10 }));
//		hbox.append(new Ui.Rectangle({ fill: new Ui.Color({ r: 0.31, g: 0.66, b: 1, a: 0.6 }), width: 1 }));

//		hbox.append(new Ui.Rectangle({ fill: new Ui.Color({ r: 0, g: 0, b: 0, a: 0.6 }), width: 1, marginLeft: 5 }));
//		hbox.append(new Ui.Rectangle({ fill: new Ui.Color({ r: 0.31, g: 0.66, b: 1, a: 0.6 }), width: 1, marginRight: 10 }));
	}
});

Ui.LBox.extend('Ui.VPanedCursor',
/**@lends Ui.VPanedCursor#*/
{
	/**
	*	@constructs
	*	@class
	*	@extends Ui.LBox
	*/
	constructor: function(config) {
		this.append(new Ui.Rectangle({ fill: 'rgba(250,250,250,1)' }));
		this.append(new Ui.Rectangle({ fill: 'rgba(140,140,140,1)', height: 1, margin: 5, marginTop: 10, width: 30, horizontalAlign: 'center' }));
		this.append(new Ui.Rectangle({ fill: 'rgba(140,140,140,1)', height: 1, margin: 5, marginBottom: 10, width: 30, horizontalAlign: 'center' }));
		this.append(new Ui.Frame({ frameWidth: 1, radius: 0, fill: 'rgba(140,140,140,1)' }));
	
//		var vbox = new Ui.VBox({ horizontalAlign: 'center', width: 30 });
//		this.append(vbox);

//		vbox.append(new Ui.Rectangle({ fill: new Ui.Color({ r: 0, g: 0, b: 0, a: 0.6 }), height: 1, marginTop: 10 }));
//		vbox.append(new Ui.Rectangle({ fill: new Ui.Color({ r: 0.31, g: 0.66, b: 1, a: 0.6 }), height: 1 }));

//		vbox.append(new Ui.Rectangle({ fill: new Ui.Color({ r: 0, g: 0, b: 0, a: 0.6 }), height: 1, marginTop: 5 }));
//		vbox.append(new Ui.Rectangle({ fill: new Ui.Color({ r: 0.31, g: 0.66, b: 1, a: 0.6 }), height: 1, marginBottom: 10 }));
	}
});
