Ui.LBox.extend('Ui.Pressable', 
/** @lends Ui.Pressable# */
{
	isDown: false,
	lock: false,
	lastTime: undefined,
	startPosition: undefined,

    /**
     * @constructs   
     * @class A pressable is a container which can be pressed   
     * @extends Ui.LBox
	 * @param {mixed} [config] see {@link Ui.LBox} constructor for more options.  
     */
	constructor: function(config) {
		this.addEvents('press', 'down', 'up', 'activate');

		this.getDrawing().style.cursor = 'pointer';
		// to disable double tap zoom and allow dblclick
		this.getDrawing().style.touchAction = 'manipulation';

		this.setFocusable(true);
		this.setRole('button');

		this.connect(this.getDrawing(), 'click', this.onClick);

		// handle mouse
		this.connect(this.getDrawing(), 'mousedown', this.onMouseDown);

		// handle touches
		this.connect(this.getDrawing(), 'touchstart', this.onTouchStart);

		// handle keyboard
		this.connect(this.getDrawing(), 'keydown', this.onKeyDown);
		this.connect(this.getDrawing(), 'keyup', this.onKeyUp);
	},

	getIsDown: function() {
		return this.isDown;
	},

	setLock: function(lock) {
		this.lock = lock;
		if(lock)
			this.getDrawing().style.cursor = '';
		else
			this.getDrawing().style.cursor = 'pointer';
	},

	getLock: function() {
		return this.lock;
	},

	/**#@+
	 * @private
	 */
	onClick: function(event) {
		event.preventDefault();
		event.stopPropagation();
		var currentTime = (new Date().getTime())/1000;
		var deltaTime = (currentTime - this.lastTime);
		this.fireEvent('press', this, event.clientX, event.clientY);
		// test for activate signal
		if((this.lastTime !== undefined) && (deltaTime < 0.250))
			this.fireEvent('activate', this);
		this.lastTime = currentTime;
	},

	onMouseDown: function(event) {
		if((event.button !== 0) || this.getIsDisabled() || this.lock)
			return;		
		event.stopPropagation();
		this.connect(window, 'mouseup', this.onMouseUp, true);
		this.onDown();
	},

	onMouseUp: function(event) {
		event.stopPropagation();
		this.disconnect(window, 'mouseup', this.onMouseUp, true);
		this.onUp();
	},

	onTouchStart: function(event) {
		if((event.changedTouches.length !== 1) || this.getIsDisabled() || this.lock)
			return;
		this.startPosition = { x: event.changedTouches[0].clientX, y: event.changedTouches[0].clientY };
		this.connect(this.getDrawing(), 'touchmove', this.onTouchMove);
		this.connect(this.getDrawing(), 'touchcancel', this.onTouchCancel);
		this.connect(this.getDrawing(), 'touchend', this.onTouchEnd);
		this.onDown();
	},

	onTouchMove: function(event) {
		var deltaX = event.changedTouches[0].clientX - this.startPosition.x;
		var deltaY = event.changedTouches[0].clientY - this.startPosition.y;
		var delta = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
		if(delta > 20)
			this.onTouchCancel(event);
	},

	onTouchCancel: function(event) {
		this.disconnect(this.getDrawing(), 'touchmove', this.onTouchMove);
		this.disconnect(this.getDrawing(), 'touchcancel', this.onTouchCancel);
		this.disconnect(this.getDrawing(), 'touchend', this.onTouchEnd);
		this.onUp();
	},

	onTouchEnd: function(event) {
		event.preventDefault();

		this.disconnect(this.getDrawing(), 'touchmove', this.onTouchMove);
		this.disconnect(this.getDrawing(), 'touchcancel', this.onTouchCancel);
		this.disconnect(this.getDrawing(), 'touchend', this.onTouchEnd);
		this.onUp();
	
		this.getDrawing().click();
	},
	
	onKeyDown: function(event) {
		var key = event.which;
		if((key == 13) && !this.getIsDisabled() && !this.lock) {
			event.preventDefault();
			event.stopPropagation();
			this.onDown();
		}
	},

	onKeyUp: function(event) {
		var key = event.which;
		if((this.isDown) && (key == 13) && !this.getIsDisabled() && !this.lock) {
			event.preventDefault();
			event.stopPropagation();
			this.onUp();
			this.fireEvent('press', this);
		}
	},

	onDown: function() {
		this.isDown = true;
		this.fireEvent('down', this);
	},

	onUp: function() {
		this.isDown = false;
		this.fireEvent('up', this);
	}
	/**#@-*/
}, {
	onDisable: function() {
		Ui.Pressable.base.onDisable.call(this);
		this.getDrawing().style.cursor = '';
	},

	onEnable: function() {
		Ui.Pressable.base.onEnable.call(this);
		if(this.lock)
			this.getDrawing().style.cursor = '';
		else
			this.getDrawing().style.cursor = 'pointer';
	}
});
