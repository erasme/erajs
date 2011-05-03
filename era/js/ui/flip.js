
Ui.Transition.extend('Ui.Flip', {
	orientation: 'horizontal',

	constructor: function(config) {
		if(config.orientation != undefined)
			this.setOrientation(config.orientation);
	},

	setOrientation: function(orientation) {
		this.orientation = orientation;
	},

}, {
	run: function(current, next, progress) {
		if(progress < 0.5) {
			if(current != undefined) {
				current.setTransformOrigin(0.5, 0.5);
				if(this.orientation == 'horizontal')
					current.setTransform(Ui.Matrix.createScale((1 - progress*2), 1));
				else
					current.setTransform(Ui.Matrix.createScale(1, (1 - progress*2)));
			}
			if(next != undefined)
				next.hide();
		}
		else {
			if(current != undefined) {
				current.hide();
				current.setTransformOrigin(0, 0);
				current.setTransform(undefined);
			}
			if(next != undefined) {
				if(progress == 1) {
					next.show();
					next.setTransformOrigin(0, 0);
					next.setTransform(undefined);
				}
				else {
					next.show();
					next.setTransformOrigin(0.5, 0.5);
					if(this.orientation == 'horizontal')
						next.setTransform(Ui.Matrix.createScale((progress-0.5)*2, 1));
					else
						next.setTransform(Ui.Matrix.createScale(1, (progress-0.5)*2));
				}
			}
		}
	},
}, {
	constructor: function() {
		Ui.Transition.register('flip', this);
	},
});

