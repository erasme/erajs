
Ui.Container.extend('Ui.ScaleBox', {
	fixedWidth: 400,
	fixedHeight: 300,

	constructor: function(config) {
	},

	setFixedSize: function(width, height) {
		var changed = false;
		if((width !== undefined) && (this.fixedWidth !== width)) {
			this.fixedWidth = width;
			changed = true;
		}
		if((height !== undefined) && (this.fixedHeight !== height)) {
			this.fixedHeight = height;
			changed = true;
		}
		if(changed)
			this.invalidateMeasure();
	},

	setFixedWidth: function(width) {
		this.setFixedSize(width);
	},

	setFixedHeight: function(height) {
		this.setFixedSize(undefined, height);
	},

	append: function(child) {
		child.setTransformOrigin(0, 0);
		this.appendChild(child);
	},

	remove: function(child) {
		this.removeChild(child);
		child.setTransformOrigin(0.5, 0.5);
	},

	setContent: function(content) {
		this.clear();
		this.append(content);
	}
}, {
	measureCore: function(width, height) {
		var ratio = this.fixedWidth / this.fixedHeight;
		var aratio = width / height;
		var aw, ah;

		if(ratio > aratio) {
			aw = width;
			ah = aw / ratio;
		}
		else {
			ah = height;
			aw = ah * ratio;
		}
		for(var i = 0; i < this.getChildren().length; i++)
			this.getChildren()[i].measure(this.fixedWidth, this.fixedHeight);

		return { width: aw, height: ah };
	},

	arrangeCore: function(width, height) {
		var ratio = this.fixedWidth / this.fixedHeight;
		var aratio = width/height;
		var aw, ah, ax, ay;

		if(ratio > aratio) {
			aw = width;
			ah = aw / ratio;
			ax = 0;
			ay = (height - ah)/2;
		}
		else {
			ah = height;
			aw = ah * ratio;
			ay = 0;
			ax = (width - aw)/2;
		}
		var scale = aw / this.fixedWidth;

		for(var i = 0; i < this.getChildren().length; i++) {
			var child = this.getChildren()[i];
			child.arrange(ax, ay, this.fixedWidth, this.fixedHeight);
			child.setTransform(Ui.Matrix.createScale(scale, scale));
		}
	}
});

