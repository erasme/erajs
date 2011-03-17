
Era.ScrollingArea = Era.extend('scrollingarea', Era.SingleContainer, {

	constructor: function(config) {
		this.superConstructor(config);
		this.ui.style.overflow = 'auto';

		this.connect(this, 'mousedown', function(mouse, button) {
			if(button != 0)
				return;

			this.startMove = mouse.getPagePosition();

			mouse.capture(this);

			this.connect(this, 'mousemove', function(mouse) {
				var point = mouse.getPagePosition();
				var deltaMove = { x: point.x - this.startMove.x, y: point.y - this.startMove.y };

			});
			this.connect(this, 'mouseup', function(mouse, button) {
				if(button != 0)
					return;

				mouse.release();
				this.disconnect(this, 'mousemove');
				this.disconnect(this, 'mouseup');
			});
		});

	},

	
});


