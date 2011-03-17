
Era.ProgressBar = Era.extend('progressbar', Era.VBox, {
	value: undefined,

	constructor: function(config) {
		this.superConstructor(config);
		this.addClass('novalue');
		this.content = new Era.ProgressBarContent();
		this.add(this.content);
		if((config != undefined) && (config.value != undefined))
			this.setValue(config.value);
	},

	getValue: function() {
		return this.value;
	},

	setValue: function(value) {
		if(value == undefined) {
			if(this.value != undefined) {
				this.value = undefined;
				this.addClass('novalue');
			}
		}
		else {
			if(this.value == undefined)
				this.removeClass('novalue');
			this.value = value;
			this.content.ui.style.webkitTransform = 'scaleX('+this.value+')';
		}
	},
});

Era.ProgressBarContent = Era.extend('progressbarcontent', Era.Element, {
	constructor: function(config) {
		this.superConstructor(config);
	},
});

