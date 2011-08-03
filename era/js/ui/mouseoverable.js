Ui.LBox.extend('Ui.MouseOverable', 
/** @lends Ui.MouseOverable#*/
{
	isDown: false,
	task: undefined,

    /**
    *   @constructs   
    *   @class A pressable is a container which can be pressed   
    *   @extends Ui.LBox
	*	@param {mixed} [config] see {@link Ui.LBox} constructor for more options.  
    */
	constructor: function(config) {
		this.addEvents('enter', 'leave');
		// handle mouse
		this.connect(this.getDrawing(), 'mouseover', this.onMouseOver);
		this.connect(this.getDrawing(), 'mouseout', this.onMouseOut);
	},

	/**#@+
	 * @private
	 */

	onMouseOver: function(event) {
		if(this.task != undefined) {
			this.task.abort();
			this.task = undefined;
		}
		else
			this.fireEvent('enter', this);
	},

	onMouseOut: function(event) {
		this.task = new Core.DelayedTask({ delay: 0, scope: this, callback: function() {
			this.fireEvent('leave', this);
			this.task = undefined;
		} });
	}
	/**#@-*/
});
