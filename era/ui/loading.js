//
// Define the Loading class.
//
Ui.LBox.extend('Ui.Loading', {
	icon: undefined,
	clock: undefined,

	constructor: function(config) {
		this.icon = Ui.Icon.create('loading', 4, 4, 'black');
		this.icon.setTransformOrigin(0.5, 0.5);
		this.append(this.icon);
		this.clock = new Anim.Clock({ repeat: 'forever', duration: 2, callback: this.onTick, scope: this });
	},

	//
	// Private
	//

	onTick: function(clock, progress) {
		this.icon.setTransform(Ui.Matrix.createRotate(progress * 360));
	}
}, {
	onLoad: function() {
		Ui.Loading.base.onLoad.call(this);
		this.clock.begin();
	},

	onUnload: function() {
		Ui.Loading.base.onUnload.call(this);
		this.clock.stop();
	},

	onStyleChange: function() {
		this.icon.setFill(this.getStyleProperty('color'));
	}
}, {
	style: {
		color: new Ui.Color({ r: 0.39, g: 0.39, b: 0.39 })
	}
});



