
Ui.Transition.extend('Ui.Slide', {
	direction: 'right',

	constructor: function(config) {
		if(config.direction != undefined)
			this.setDirection(config.direction);
	},

	setDirection: function(direction) {
		this.direction = direction;
	},

}, {
	run: function(current, next, progress) {
		if(current != undefined) {
			if(progress == 1) {
				current.hide();
				current.setTransformOrigin(0, 0);
				current.setTransform(undefined);
			}
			else {
				current.setTransformOrigin(0, 0);
				if(this.direction == 'right')
					current.setTransform(Ui.Matrix.createTranslate(-current.getLayoutWidth() * progress, 0));
				else if(this.direction == 'left')
					current.setTransform(Ui.Matrix.createTranslate(current.getLayoutWidth() * progress, 0));
				else if(this.direction == 'top')
					current.setTransform(Ui.Matrix.createTranslate(0, current.getLayoutHeight() * progress));
				else
					current.setTransform(Ui.Matrix.createTranslate(0, -current.getLayoutHeight() * progress));
			}
		}
		if(next != undefined) {
			if(progress == 1) {
				next.setTransformOrigin(0, 0);
				next.setTransform(undefined);
			}
			else {
				next.setTransformOrigin(0, 0);
				if(this.direction == 'right')
					next.setTransform(Ui.Matrix.createTranslate(next.getLayoutWidth() * (1 - progress), 0));
				else if(this.direction == 'left')
					next.setTransform(Ui.Matrix.createTranslate(-next.getLayoutWidth() * (1 - progress), 0));
				else if(this.direction == 'top')
					next.setTransform(Ui.Matrix.createTranslate(0, -next.getLayoutHeight() * (1 - progress)));
				else
					next.setTransform(Ui.Matrix.createTranslate(0, next.getLayoutHeight() * (1 - progress)));
			}
		}
	},
}, {
	constructor: function() {
		Ui.Transition.register('slide', this);
	},
});

