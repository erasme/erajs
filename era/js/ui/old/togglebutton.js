
// Define the back Button class.
Era.ToggleButton = Era.extend('togglebutton', Era.HBox, {
	state1: 'ON',
	state2: 'OFF',

	constructor: function(config) {
		this.superConstructor(config);
		if((config != undefined) && (config.state1 != undefined))
			this.state1 = config.state1;
		if((config != undefined) && (config.state2 != undefined))
			this.state2 = config.state2;
		if((config != undefined) && (config.initial != undefined)) {
			if(config.initial == this.state1)			
				this.addClass('state1');
			else
				this.addClass('state2');
		}
		else
			this.addClass('state1');

		this.movebox = new Era.ToggleButtonMove({ resizable: true, state1: this.state1, state2: this.state2 });
		this.add(this.movebox);
		this.addEvents('changed');
	},

	getState: function() {
		if(this.checkClass('state1'))
			return this.state1;
		else
			return this.state2;
	},

	setState: function(state,fireevent) {
		if(this.getState() == state)
			return;
		if(state == this.state1)
			this.replaceClass('state2', 'state1');
		else if(state == this.state2)
			this.replaceClass('state1', 'state2');
		else
			throw('Possible states for the toggle button are ['+this.state1+'|'+this.state2+']');
		if((fireevent != undefined) && fireevent)
			this.fireEvent('changed', state);
	},
});


// Define the back Button class.
Era.ToggleButtonMove = Era.extend('togglebuttonmove', Era.HBox, {
	constructor: function(config) {
		if(config == undefined)
			config = {};
		config.align = 'center';
		this.superConstructor(config);

		this.slider = new Era.Element({ baseCls: 'togglebuttonslider' });
		this.add(this.slider);

		var hbox = new Era.HBox({ resizable: true });
		this.add(hbox);

		this.state2 = new Era.Html({ baseCls: 'togglebutton2', resizable: true, html: config.state2 });
		hbox.add(this.state2);

		this.state1 = new Era.Html({ baseCls: 'togglebutton1', resizable: true, html: config.state1 });
		hbox.add(this.state1);

		this.connect(this, 'touchstart', function(event) {
			this.start = this.pointToPage({ x: 0, y: 0 });
			this.startMove = { x: event.targetTouches[0].pageX, y: event.targetTouches[0].pageY };
			this.deltaX = 0;
			this.deltaSign = 0;
			this.ui.style.webkitTransitionDuration = '0s';
		});

		this.connect(this, 'touchmove', function(event) {
			this.lastTouch = { x: event.targetTouches[0].pageX, y: event.targetTouches[0].pageY };
			var deltaX = this.lastTouch.x - this.startMove.x;
			var pos = this.getParent().pointFromPage({ x: (this.start.x + deltaX), y: this.start.y });
			if(deltaX > this.deltaX)
				this.deltaSign = 1;
			else
				this.deltaSign = -1;
			this.deltaX = deltaX;
			this.limitMove(pos);
			this.ui.style.webkitTransform = 'translate3d('+pos.x+'px, 0px, 0px)';
		});

		this.connect(this, 'touchend', function(event) {
			this.ui.style.webkitTransitionDuration = '';
			this.ui.style.webkitTransform = '';

			if(this.deltaSign > 0)
				this.getParent().setState(this.getParent().state1, true);
			else if(this.deltaSign < 0)
				this.getParent().setState(this.getParent().state2, true);
		});

		this.connect(this, 'mousedown', function(mouse, button) {
			if(button != 0)
				return;

			this.isMouseDown = true;
			this.start = this.pointToPage({ x: 0, y: 0 });
			this.startMove = mouse.getPagePosition();
			this.ui.style.webkitTransitionDuration = '0s';
			this.deltaX = 0;
			this.deltaSign = 0;

			mouse.capture(this);

			this.connect(this, 'mousemove', function(mouse) {
				if(this.isMouseDown) {
					var pagePos = mouse.getPagePosition();
					var deltaX = pagePos.x - this.startMove.x;
					var pos = this.getParent().pointFromPage({ x: (this.start.x + deltaX), y: this.start.y });
					if(deltaX > this.deltaX)
						this.deltaSign = 1;
					else
						this.deltaSign = -1;
					this.deltaX = deltaX;
					this.limitMove(pos);
					this.ui.style.webkitTransform = 'translate3d('+pos.x+'px, 0px, 0px)';
				}
			});

			this.connect(this, 'mouseup', function(mouse) {
				mouse.release();
				this.isMouseDown = false;
				this.disconnect(this, 'mousemove');
				this.disconnect(this, 'mouseup');
				this.ui.style.webkitTransitionDuration = '';
				this.ui.style.webkitTransform = '';

				if(this.deltaSign > 0)
					this.getParent().setState(this.getParent().state1, true);
				else if(this.deltaSign < 0)
					this.getParent().setState(this.getParent().state2, true);
			});
		});
	},

	limitMove: function(pos) {
		var size = this.getParent().getSize();
		pos.y = 0;
		if(pos.x < 0)
			pos.x = 0;
		if(pos.x + this.slider.getWidth() + this.ui.offsetLeft*2 > size.width)
			pos.x = size.width - (this.slider.getWidth() + this.ui.offsetLeft*2);
	},
});

