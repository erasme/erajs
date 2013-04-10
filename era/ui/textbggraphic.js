
Ui.CanvasElement.extend('Ui.TextBgGraphic', {
}, {
	updateCanvas: function(ctx) {	
		var width = this.getLayoutWidth();
		var height = this.getLayoutHeight();
		
		// light shadow
		ctx.fillStyle = 'rgba(255,255,255,0.25)';
		ctx.beginPath();
		this.roundRect(0, 1, width, height-1, 4, 4, 4, 4);
		ctx.closePath();
		ctx.fill();

		// dark shadow
		ctx.fillStyle = 'rgba(0,0,0,0.4)';
		ctx.beginPath();
		this.roundRect(0, 0, width, height-1, 4, 4, 4, 4);
		ctx.closePath();
		ctx.fill();

		// content background
		ctx.fillStyle = 'rgba(250,250,250,1)';
		ctx.beginPath();
		this.roundRect(1, 1, width-2, height-3, 3, 3, 3, 3);
		ctx.closePath();
		ctx.fill();
		
		// inner shadow
		this.roundRectFilledShadow(1, 1, width-2, height-3, 3, 3, 3, 3, true, 2, new Ui.Color({ a: 0.2 }));
	}
});
