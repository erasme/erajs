
Era.AutoScaleBox = Era.extend('autoscalebox', Era.Element, {
	content: undefined,
	verticalAlign: 'center',
	horizontalAlign: 'center',

	constructor: function(config) {
		if(!config)
			config = {};
		config.resizable = true;
		this.superConstructor(config);
		this.ui.style.position = 'relative';

		this.contentArea = new Era.VBox();
		this.contentArea.ui.style.position = 'absolute';
		this.ui.appendChild(this.contentArea.ui);

		this.connect(this, 'resized', this.updatePosition);
		if(config && (config.verticalAlign != undefined))
			this.setVerticalAlign(config.verticalAlign);
		if(config && (config.horizontalAlign != undefined))
			this.setHorizontalAlign(config.horizontalAlign);
		if(config && (config.content != undefined))
			this.setContent(Era.create(config.content));
	},

	setContent: function(content) {
		if(this.content != undefined)
			this.contentArea.remove(this.content);

		this.content = content;
		this.contentArea.add(this.content);

		this.connect(this.content, 'resized', this.updatePosition);
		this.setVerticalAlign(this.verticalAlign);
		this.setHorizontalAlign(this.horizontalAlign);
	},

	updatePosition: function() {
		if(this.content != undefined) {
			var size = this.getSize();
			var contentSize = this.content.getTotalSize();

			var scaleX = size.width  / contentSize.width;
			var scaleY = size.height / contentSize.height;
			var scale = (scaleX < scaleY) ? scaleX : scaleY;

			this.contentArea.ui.style.webkitTransformOrigin = '0px 0px';
			this.contentArea.ui.style.webkitTransform = 'scale('+(scale)+')';

			if(this.horizontalAlign == 'left')
				this.contentArea.ui.style.left = '0px';
			else if(this.horizontalAlign == 'center')
				this.contentArea.ui.style.left = ((size.width - (contentSize.width * scale)) / 2)+'px';
			else
				this.contentArea.ui.style.left = (size.width - (contentSize.width * scale))+'px';

			if(this.verticalAlign == 'top')
				this.contentArea.ui.style.top = '0px';
			else if(this.verticalAlign == 'center')
				this.contentArea.ui.style.top = ((size.height - (contentSize.height * scale)) / 2)+'px';
			else
				this.contentArea.ui.style.top = (size.height - (contentSize.height * scale))+'px';
		}
	},

	setVerticalAlign: function(align) {
		this.verticalAlign = align;
		if(this.content != undefined)
			this.updatePosition();
	},

	setHorizontalAlign: function(align) {
		this.horizontalAlign = align;
		if(this.content != undefined)
			this.updatePosition();
	},
});

