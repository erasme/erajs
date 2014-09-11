Ui.LBox.extend('Ui.Loading', 
/**@lends Ui.Loading#*/
{
	icon: undefined,
	clock: undefined,

    /**
     * @constructs
	 * @class   
     * @extends Ui.LBox
     */ 
	constructor: function(config) {
		this.icon = new Ui.Icon({ icon: 'loading' });
		this.icon.setTransformOrigin(0.5, 0.5);
		this.append(this.icon);
		this.clock = new Anim.Clock({ repeat: 'forever', duration: 2 });
		this.connect(this.clock, 'timeupdate', this.onTick);
	},

	/**@private*/
	onTick: function(clock, progress) {
		this.icon.setTransform(Ui.Matrix.createRotate(progress * 360));
	}
}, 
/**@lends Ui.Loading#*/
{
	onVisible: function() {
		Ui.Loading.base.onVisible.apply(this, arguments);
		this.clock.begin();
	},

	onHidden: function() {
		Ui.Loading.base.onHidden.apply(this, arguments);
		this.clock.stop();
	},

	onStyleChange: function() {
		this.icon.setFill(this.getStyleProperty('color'));
	}
}, 
/**@lends Ui.Loading*/
{
	style: {
		color: new Ui.Color({ r: 0.39, g: 0.39, b: 0.39 })
	}
});



