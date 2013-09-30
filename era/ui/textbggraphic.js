
Ui.CanvasElement.extend('Ui.TextBgGraphic', {}, {
	updateCanvas: function(ctx) {	
		var w = this.getLayoutWidth();
		var h = this.getLayoutHeight();
		
		var lh = Math.max(8, h-4-16);
	
		// handle disable
		if(this.getIsDisabled())
			ctx.globalAlpha = 0.2;
				
		ctx.fillStyle = 'rgb(100,100,100)';
		ctx.fillRect(0, h-2-4, w, 2);
		ctx.fillRect(0, h-lh-4, 2, lh);
		ctx.fillRect(w-2, h-8-4, 2, 8);		
	},
	
	onDisable: function() {
		this.invalidateDraw();
	},

	onEnable: function() {
		this.invalidateDraw();
	}
});