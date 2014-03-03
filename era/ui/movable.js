
Ui.MovableBase.extend('Ui.Movable', {

	constructor: function(config) {
		this.setFocusable(true);

		this.contentBox = new Ui.LBox();
		this.appendChild(this.contentBox);

		this.contentBox.getDrawing().style.cursor = 'move';
		this.connect(this.getDrawing(), 'keydown', this.onKeyDown);
	},

	onKeyDown: function(event) {
		if(this.getIsDisabled())
			return;
		var key = event.which;
		// horizontal move
		if(((key == 37) || (key == 39)) && this.moveHorizontal) {
			event.preventDefault();
			event.stopPropagation();
			if(key == 37)
				this.setPosition(this.posX - 10, undefined);
			if(key == 39)
				this.setPosition(this.posX + 10, undefined);
		}
		// vertical move
		if(((key == 38) || (key == 40)) && this.moveVertical) {
			event.preventDefault();
			event.stopPropagation();
			if(key == 38)
				this.setPosition(undefined, this.posY - 10);
			if(key == 40)
				this.setPosition(undefined, this.posY + 10);
		}
	}

}, {
	onMove: function(x, y) {
		this.contentBox.setTransform(Ui.Matrix.createTranslate(this.posX, this.posY));
	},

	measureCore: function(width, height) {
		return this.contentBox.measure(width, height);
	},

	arrangeCore: function(width, height) {
		// we dont want to see this parent but 0px is not possible
		// because Chrome dont handle touch events when the size is 0
		this.getDrawing().style.width = '1px';
		this.getDrawing().style.height = '1px';
		this.contentBox.arrange(0, 0, width, height);
	},

	getContent: function() {
		return this.contentBox.getChildren()[0];
	},

	setContent: function(content) {
		this.contentBox.setContent(content);
	},
	
	onDisable: function() {
		this.contentBox.getDrawing().style.cursor = 'inherit';
	},
	
	onEnable: function() {
		this.contentBox.getDrawing().style.cursor = 'move';
	}
});
