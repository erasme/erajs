
Ui.Pressable.extend('Ui.Togglable', {
	isToggled: false,

	constructor: function(config) {
		this.addEvents('toggle', 'untoggle');

		this.setRole('checkbox');
		this.getDrawing().setAttribute('aria-checked', 'false');

		this.connect(this, 'press', this.onPress);
	},
	
	getIsToggled: function() {
		return this.isToggled;
	},

	onPress: function() {
		if(!this.isToggled)
			this.onToggle();
		else
			this.onUntoggle();
	},
	
	onToggle: function() {
		if(!this.isToggled) {
			this.isToggled = true;
			this.getDrawing().setAttribute('aria-checked', 'true');
			this.fireEvent('toggle', this);
		}
	},

	onUntoggle: function() {
		if(this.isToggled) {
			this.isToggled = false;
			this.getDrawing().setAttribute('aria-checked', 'false');
			this.fireEvent('untoggle', this);
		}
	},

	toggle: function() {
		this.onToggle();
	},

	untoggle: function() {
		this.onUntoggle();
	}
});
	