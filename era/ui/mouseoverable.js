Ui.LBox.extend('Ui.MouseOverable', 
/** @lends Ui.MouseOverable#*/
{
	task: undefined,
	isOver: false,

    /**
    *   @constructs   
    *   @class A pressable is a container which can be pressed   
    *   @extends Ui.LBox
	*	@param {mixed} [config] see {@link Ui.LBox} constructor for more options.  
    */
	constructor: function(config) {
		this.addEvents('enter', 'leave', 'move');
		// handle mouse
		this.connect(this.getDrawing(), 'mouseover', this.onMouseOver);
		this.connect(this.getDrawing(), 'mouseout', this.onMouseOut);
		this.connect(this.getDrawing(), 'mousemove', this.onMouseMove, true);
	},

	getIsOver: function() {
		return this.isOver;
	},

	/**#@+
	 * @private
	 */

	onMouseOver: function(event) {
		if(this.task != undefined) {
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

	onMouseMove: function(event) {		
		if(this.isOver)
			this.fireEvent('move', this);
	}
	/**#@-*/
});
