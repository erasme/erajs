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
		this.append(this.background);

//		this.append(new Ui.Rectangle({ radius: 8, fill: '#f9f9f9', margin: 2 }));

		this.contentBox = new Ui.LBox({ paddingLeft: 15, paddingRight: 15, paddingTop: 11, paddingBottom: 11 });
		this.append(this.contentBox);

		if(config.text != undefined) {
			this.content = new Ui.Label({ text: config.text });
			this.contentBox.append(this.content);
		}

		this.connect(this, 'down', this.onButtonDown);
		this.connect(this, 'up', this.onButtonUp);
	},

	setContent: function(content) {
		if(this.content != content) {
			if(this.content != undefined)
				this.contentBox.remove(this.content);
			this.content = content;
			if(this.content != undefined)
				this.contentBox.append(this.content);
		}
	},

	getBackgroundColor: function() {
		var color = this.getStyleProperty('backgroundColor');
		if(color == undefined)
			color = 'lightblue';
		return color;
	},

	onButtonDown: function() {
		this.background.setFill('#38acec');
	},

	onButtonUp: function() {
		this.background.setFill(this.getBackgroundColor());//'lightblue');
	},
}, {
	onStyleChange: function() {
		console.log(this+'.onStyleChange '+this.getStyleProperty('backgroundColor'));
		this.background.setFill(this.getStyleProperty('backgroundColor'));
	},

	onDisable: function() {
		Ui.Button.base.onDisable.call(this);
		this.content.setColor('red');
	},

	onEnable: function() {
		Ui.Button.base.onEnable.call(this);
		this.content.setColor('black');
	},
});
