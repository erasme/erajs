
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
		
		var lh = Math.max(8, h-4-16);
	
		// handle disable
		if(this.getIsDisabled())
			ctx.globalAlpha = 0.2;
		
		ctx.fillStyle = this.getBackground().getCssRgba();
		ctx.beginPath();
		ctx.moveTo(0, h-lh-4);
		ctx.lineTo(0, h-4);
		ctx.lineTo(w, h-4);
		ctx.lineTo(w, h-8-4+2);
		ctx.lineTo(w-2, h-8-4+2);
		ctx.lineTo(w-2, h-4-2);
		ctx.lineTo(2, h-4-2);
		ctx.lineTo(2, h-lh-4);
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
		background: '#444444',
		focusBackground: '#f6caa2'
	}
});