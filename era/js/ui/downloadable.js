//
// Define the Downloadable class.
//
Ui.LBox.extend('Ui.Downloadable', {
	isEnable: true,
	content: undefined,
	link: undefined,

	constructor: function(config) {
		if(config.src != undefined)
			this.setSrc(config.src);

		this.getDrawing().style.setProperty('cursor', 'pointer', null);
		this.setFocusable(true);
		this.setRole('button');

		this.connect(this.getDrawing(), 'click', this.onClick);

		this.addEvents('download');
	},

	setSrc: function(src) {
		this.getDrawing().setAttributeNS(null, 'href', src);
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
		console.log('downloadable click');
		this.fireEvent('download', this);
	},
}, {
	renderDrawing: function() {
		var linkDrawing = document.createElementNS(htmlNS, 'a');
		linkDrawing.style.setProperty('display', 'block', null);
		linkDrawing.style.setProperty('text-decoration', 'none', null);
//		linkDrawing.style.setProperty('color', 'none', null);

//		linkDrawing.dump();

		return linkDrawing;
	},
});

