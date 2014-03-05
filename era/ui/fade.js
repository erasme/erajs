
Ui.Transition.extend('Ui.Fade', 
/**@lends Ui.Fade#*/
{
},
/**@lends Ui.Fade#*/ 
{
	run: function(current, next, progress) {	
		if(current !== undefined) {
			if(progress == 1) {
				current.hide();
				current.setOpacity(1);
			}
			else
				current.setOpacity(Math.min(1, Math.max(0, 1 - progress*3)));
		}
		if(next !== undefined)
			next.setOpacity(progress);
	}
}, 
/**@lends Ui.Fade*/
{
	/**
	* @constructs
	* @class
	* @extends Ui.Transition
	*/
	constructor: function() {
		Ui.Transition.register('fade', this);
	}
});

