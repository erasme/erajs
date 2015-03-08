

Ui.Container.extend('Ui.Toaster', {
	arrangeClock: undefined,

	constructor: function(config) {
		this.setMargin(10);
		this.setEventsHidden(true);
	},

	appendToast: function(toast) {
		toast.newToast = true;
		if(this.getChildren().length === 0)
			Ui.App.current.appendTopLayer(this, false, 2);
		this.appendChild(toast);

//		if((this.arrangeClock === undefined) && (this.getChildren().length > 0)) {			
//		}
	},

	removeToast: function(toast) {
		this.removeChild(toast);
		if(this.getChildren().length === 0)
			Ui.App.current.removeTopLayer(this);
	},

	onArrangeTick: function(clock, progress, delta) {
		//console.log(this+'.onArrangeTick progress: '+progress+', last: '+this.lastLayoutY+', new: '+this.getLayoutY());
		for(var i = 0; i < this.getChildren().length; i++) {
			var child = this.getChildren()[i];
			if(progress === 1) {
				child.setTransform(undefined);
				child.newToast = false;
			}
			else if(child.newToast !== true)
				child.setTransform(Ui.Matrix.createTranslate(
					(child.lastLayoutX - child.getLayoutX()) * (1-progress),
					(child.lastLayoutY - child.getLayoutY()) * (1-progress)));
		}
		if(progress === 1)
			this.arrangeClock = undefined;
	}
}, {
	measureCore: function(width, height) {
		var spacing = 10;
		var maxWidth = 0;
		var totalHeight = 0;
		for(var i = 0; i < this.getChildren().length; i++) {
			var child = this.getChildren()[i];
			var size = child.measure(0, 0);
			totalHeight += size.height;
			if(size.width > maxWidth)
				maxWidth = size.width;
		}
		totalHeight += Math.max(0, this.getChildren().length - 1) * spacing;
		return { width: maxWidth, height: totalHeight };
	},

	arrange: function() {
		Ui.Toaster.base.arrange.apply(this, arguments);
	},

	arrangeCore: function(width, height) {
		var spacing = 10;
		var y = 0;
		for(var i = 0; i < this.getChildren().length; i++) {
			var child = this.getChildren()[i];
			child.lastLayoutX = child.getLayoutX();
			child.lastLayoutY = child.getLayoutY();
			y += child.getMeasureHeight();
			child.arrange(0, height - y, this.getMeasureWidth(), child.getMeasureHeight());
			y += spacing;
		}
		if(this.arrangeClock === undefined) {
			this.arrangeClock = new Anim.Clock({ duration: 1, speed: 5 });
			this.connect(this.arrangeClock, 'timeupdate', this.onArrangeTick);
			this.arrangeClock.begin();
		}
	}
}, {
	current: undefined,

	constructor: function() {
		Ui.Toaster.current = new Ui.Toaster();
	},

	appendToast: function(toast) {
		Ui.Toaster.current.appendToast(toast);
	},

	removeToast: function(toast) {
		Ui.Toaster.current.removeToast(toast);
	}
});

Ui.LBox.extend('Ui.Toast', {
	isClosed: true,
	openClock: undefined,
	toastContentBox: undefined,

	constructor: function(config) {
		this.addEvents('close');

		this.append(new Ui.Shadow({ shadowWidth: 2, radius: 1, inner: false, opacity: 0.8 }));
		this.append(new Ui.Rectangle({ fill: '#666666', width: 200, height: 30, margin: 2, opacity: 0.5 }));

		this.toastContentBox = new Ui.LBox({ margin: 2, width: 200 });
		this.append(this.toastContentBox);
	},

	getIsClosed: function() {
		return this.isClosed;
	},

	open: function() {
		if(this.isClosed) {
//			Ui.App.current.appendDialog(this, false);
			this.isClosed = false;

			if(this.openClock === undefined) {
				this.openClock = new Anim.Clock({ duration: 1, target: this, speed: 5 });
				this.openClock.setEase(new Anim.PowerEase({ mode: 'out' }));
				this.connect(this.openClock, 'timeupdate', this.onOpenTick);
				// set the initial state
				this.setOpacity(0);
				// the start of the animation is delayed to the next arrange
			}
			new Core.DelayedTask({ delay: 2, scope: this, callback: this.close });
			Ui.Toaster.appendToast(this);
		}
	},

	close: function() {
		if(!this.isClosed) {
			this.isClosed = true;
			this.disable();
			if(this.openClock === undefined) {
				this.openClock = new Anim.Clock({ duration: 1, target: this, speed: 5 });
				this.openClock.setEase(new Anim.PowerEase({ mode: 'out' }));
				this.connect(this.openClock, 'timeupdate', this.onOpenTick);
				this.openClock.begin();
			}
		}
	},

	onOpenTick: function(clock, progress, delta) {
		var end = (progress >= 1);

		if(this.isClosed)
			progress = 1 - progress;
		
		this.setOpacity(progress);

		this.setTransform(Ui.Matrix.createTranslate(-20 * (1-progress), 0));

		if(end) {
			this.openClock.stop();
			this.openClock = undefined;
			if(this.isClosed) {
//				Ui.App.current.removeDialog(this);
				this.enable();
				this.fireEvent('close', this);
				Ui.Toaster.removeToast(this);
			}
		}
	}
}, {
	setContent: function(content) {
		if(typeof(content) === 'string')
			var content = new Ui.Text({ text: content, verticalAlign: 'center', margin: 5, color: '#deff89' });
		this.toastContentBox.setContent(content);
	},

	getContent: function() {
		return this.toastContentBox.getContent();
	},

	arrangeCore: function(width, height) {
		Ui.Toast.base.arrangeCore.apply(this, arguments);
		// the delayed open animation
		if((this.openClock !== undefined) && !this.openClock.getIsActive())
			this.openClock.begin();
	}
}, {
	send: function(content, button) {
		var toast = new Ui.Toast({ content: content });
		toast.open();
	}
});

