
Ui.Pressable.extend('Ui.Linkable', 
{
	link: undefined,
	openWindow: true,
	target: '_blank',
	
	constructor: function(config) {
		this.addEvents('link');
		this.connect(this, 'press', this.onPress);
	},

	setSrc: function(src) {
		this.link = src;
	},

	setOpenWindow: function(openWindow) {
		this.openWindow = openWindow;
	},

	setTarget: function(target) {
		this.target = target;
	},

	onPress: function() {
		this.fireEvent('link', this);
		if(this.openWindow)
			window.open(this.link, this.target);
		else
			window.location = this.link;
	}
});
	