Ui.Overable.extend('Ui.Pressable', 
/** @lends Ui.Pressable# */
{
	lock: false,
	lastTime: undefined,

    /**
     * @constructs   
     * @class A pressable is a container which can be pressed   
     * @extends Ui.LBox
	 * @param {mixed} [config] see {@link Ui.LBox} constructor for more options.  
     */
	constructor: function(config) {
		this.addEvents('press', 'down', 'up', 'activate');

		this.getDrawing().style.cursor = 'pointer';

		this.setFocusable(true);
		this.setRole('button');

		// handle pointers
		this.connect(this, 'ptrdown', this.onPointerDown);

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

	press: function() {
		this.onPress();
	},

	activate: function() {
		this.onActivate();
	},

	/**#@+
	 * @private
	 */

	onMouseOver: function(event) {
		if(this.task !== undefined) {
			this.task.abort();
			this.task = undefined;
		}
		else {
			this.isOver = true;
			this.fireEvent('enter', this);
		}
	},

	onMouseOut: function(event) {
		this.task = new Core.DelayedTask({ delay: 0, scope: this, callback: this.onDelayedMouseOut });
	},
	
	onDelayedMouseOut: function(event) {
		this.isOver = false;
		this.fireEvent('leave', this);
		this.task = undefined;
	},
	
	onPointerDown: function(event) {	
		if(this.getIsDisabled() || this.isDown || this.lock)
			return;
		
		var watcher = event.pointer.watch(this);
		this.connect(watcher, 'move', function() {
			if(watcher.pointer.getIsMove())
				watcher.cancel();
		});
		this.connect(watcher, 'up', function(event) {
			this.onUp();
			this.onPress(event.pointer.getX(), event.pointer.getY());

			// test for activate signal
			var currentTime = (new Date().getTime())/1000;
			if((this.lastTime !== undefined) && (currentTime - this.lastTime < 0.250))
				this.onActivate(event.pointer.getX(), event.pointer.getY());
			this.lastTime = currentTime;

			watcher.capture();
		});
		this.connect(watcher, 'cancel', function() {
			this.onUp();
		});
		this.onDown();
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
			this.onPress();
		}
	},

	onDown: function() {
		this.isDown = true;
		this.fireEvent('down', this);
	},

	onUp: function() {
		this.isDown = false;
		this.fireEvent('up', this);
	},

	onPress: function(x, y) {
		this.fireEvent('press', this, x, y);
	},

	onActivate: function(x, y) {
		this.fireEvent('activate', this);
	}
	/**#@-*/
}, {
	onDisable: function() {
		Ui.Pressable.base.onDisable.apply(this, arguments);
		this.getDrawing().style.cursor = '';
	},

	onEnable: function() {
		Ui.Pressable.base.onEnable.apply(this, arguments);
		if(this.lock)
			this.getDrawing().style.cursor = '';
		else
			this.getDrawing().style.cursor = 'pointer';
	}
});
