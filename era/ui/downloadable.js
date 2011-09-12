Ui.LBox.extend('Ui.Downloadable', 
/**@lends Ui.Downloadable#*/
{
	content: undefined,
	link: undefined,

	/**
	 * @constructs
	 * @class
	 * @extends Ui.LBox
	 */
	constructor: function(config) {
		this.addEvents('download');

		if(config.src != undefined)
			this.setSrc(config.src);

		this.getDrawing().style.cursor = 'pointer';
		this.setFocusable(true);
		this.setRole('button');

		this.connect(this.getDrawing(), 'click', this.onClick);
	},

	setSrc: function(src) {
		this.getDrawing().setAttribute('href', src);
	},

	setContent: function(content) {
		if(this.content != content) {
			if(this.content != undefined)
				this.remove(this.content);
			if(content != undefined)
				this.append(content);
			this.content = content;
		}
	},

	onClick: function(event) {
		this.fireEvent('download', this);
	}
}, 
/**@lends Ui.Downloadable#*/
{
	renderDrawing: function() {
		var linkDrawing = document.createElement('a');
		linkDrawing.style.display = 'block';
		linkDrawing.style.textDecoration = 'none';
		return linkDrawing;
	}
});

