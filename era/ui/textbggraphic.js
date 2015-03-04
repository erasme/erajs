
Ui.CanvasElement.extend('Ui.TextBgGraphic', {
	textHasFocus: false,

	setHasFocus: function(hasFocus) {
		if(this.textHasFocus !== hasFocus) {
			this.textHasFocus = hasFocus;
			this.invalidateDraw();
		}
	},

	getBackground: function() {
		var color;
		if(this.textHasFocus)
			color = Ui.Color.create(this.getStyleProperty('focusBackground'));
		else
			color = Ui.Color.create(this.getStyleProperty('background'));
		return color;
	}

}, {
	updateCanvas: function(ctx) {	
		var w = this.getLayoutWidth();
		var h = this.getLayoutHeight();

		var radius = this.getStyleProperty('radius');
		radius = Math.max(0, Math.min(radius, Math.min(w/2, h/2)));
		var borderWidth = this.getStyleProperty('borderWidth');
		
		var lh = Math.max(8, h-4-16);
	
		// handle disable
		if(this.getIsDisabled())
			ctx.globalAlpha = 0.2;
		
		ctx.fillStyle = this.getBackground().getCssRgba();
		ctx.beginPath();

		ctx.roundRect(0, 0, w, h, radius, radius, radius, radius);

		/*ctx.moveTo(0, h-lh-4);
		ctx.lineTo(0, h-4);
		ctx.lineTo(w, h-4);
		ctx.lineTo(w, h-8-4+borderWidth);
		ctx.lineTo(w-borderWidth, h-8-4+borderWidth);
		ctx.lineTo(w-borderWidth, h-4-borderWidth);
		ctx.lineTo(borderWidth, h-4-borderWidth);
		ctx.lineTo(borderWidth, h-lh-4);*/

		/*ctx.moveTo(0, h-4);
		ctx.lineTo(w, h-4);
		ctx.lineTo(w, h-4-borderWidth);
		ctx.lineTo(0, h-4-borderWidth);*/
		ctx.closePath();
		ctx.fill();
	},
	
	onDisable: function() {
		this.invalidateDraw();
	},

	onEnable: function() {
		this.invalidateDraw();
	},

	onStyleChange: function() {
		this.spacing = Math.max(0, this.getStyleProperty('spacing'));
		this.iconSize = Math.max(0, this.getStyleProperty('iconSize'));
		this.fontFamily = this.getStyleProperty('fontFamily');
		this.fontSize = Math.max(0, this.getStyleProperty('fontSize'));
		this.fontWeight = this.getStyleProperty('fontWeight');
		this.invalidateDraw();
	}
}, {
	style: {
		radius: 3,
		borderWidth: 2,
		background: 'rgba(120,120,120,0.2)',
		focusBackground: 'rgba(33,211,255,0.4)'
	}
});