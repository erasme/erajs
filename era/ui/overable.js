Ui.LBox.extend('Ui.Overable', 
/** @lends Ui.Overable#*/
{
	watcher: undefined,

    /**
    *   @constructs   
    *   @class A pressable is a container which can be pressed   
    *   @extends Ui.LBox
	*	@param {mixed} [config] see {@link Ui.LBox} constructor for more options.  
    */
	constructor: function(config) {
		this.addEvents('enter', 'leave', 'move');

		this.connect(this, 'ptrmove', function(event) {
			if(!this.getIsDisabled() && !event.pointer.getIsDown() && (this.watcher === undefined)) {
				this.watcher = event.pointer.watch(this);
				this.fireEvent('enter', this);
				this.connect(this.watcher, 'move', function() {
					if(!this.watcher.getIsInside())
						this.watcher.cancel();
				});
				this.connect(this.watcher, 'down', function() {
					this.watcher.cancel();
				});
				this.connect(this.watcher, 'up', function() {
					this.watcher.cancel();
				});
				this.connect(this.watcher, 'cancel', function() {
					this.watcher = undefined;
					this.fireEvent('leave', this);
				});
			}
		});
	},

	getIsOver: function() {
		return (this.watcher !== undefined);
	}
});
