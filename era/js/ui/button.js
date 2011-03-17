//
// Define the Button class.
//
Ui.Pressable.extend('Ui.Button', {
	background: undefined,
	contentBox: undefined,
	content: undefined,

	constructor: function(config) {
		this.setPadding(3);

		this.background = new Ui.Rectangle({ radius: 8, fill: 'lightblue' });
		this.appendChild(this.background);

		this.contentBox = new Ui.LBox({ paddingLeft: 15, paddingRight: 15, paddingTop: 11, paddingBottom: 11 });
		this.appendChild(this.contentBox);

		if(config.text != undefined) {
			this.content = new Ui.Label({ text: config.text });
			this.contentBox.appendChild(this.content);
		}

		this.connect(this, 'down', this.onButtonDown);
		this.connect(this, 'up', this.onButtonUp);
	},

	setContent: function(content) {
		if(this.content != content) {
			if(this.content != undefined)
				this.contentBox.removeChild(this.content);
			this.content = content;
			if(this.content != undefined)
				this.contentBox.appendChild(this.content);
		}
	},

	onButtonDown: function() {
		this.background.setFill('#38acec');
	},

	onButtonUp: function() {
		this.background.setFill('lightblue');
	},
}, {
});
