
Ui.Transition.extend('Ui.Fade', 
/**@lends Ui.Fade#*/
{
},
/**@lends Ui.Fade#*/ 
{
	run: function(current, next, progress) {
		if(current != undefined) {
			if(progress == 1) {
				current.setOpacity(1);
				current.hide();
			}
			else
				current.setOpacity(1 - progress);
		}
		if(next != undefined)
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

