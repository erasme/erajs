
Ui.Element.extend('Ui.ProgressBar', {
	value: undefined,
	progressBarDrawing: undefined,
	progressBarBgDrawing: undefined,
	progressBarBarDrawing: undefined,

	constructor: function(config) {
		if(config.value != undefined)
			this.value = config.value;
	},

	getValue: function() {
		return this.value;
	},

	setValue: function(value) {
		this.value = value;
		this.updateValue();
	},

	updateValue: function() {
		this.progressBarBarDrawing.style.removeProperty('width');
		var left = new Number(window.getComputedStyle(this.progressBarBarDrawing, null).getPropertyValue('left').replace(/px$/, ''));
		var right = new Number(window.getComputedStyle(this.progressBarBarDrawing, null).getPropertyValue('right').replace(/px$/, ''));
		var barWidth = this.layoutWidth - (left + right);
		this.progressBarBarDrawing.style.setProperty('width', (barWidth*this.value)+'px', null);
	},
}, {
	render: function() {
		this.progressBarDrawing = document.createElementNS(htmlNS, 'div');

		this.progressBarBgDrawing = document.createElementNS(htmlNS, 'div');
		this.progressBarBgDrawing.setAttributeNS(null, 'class', 'ui-progressbar-bg');
		this.progressBarBgDrawing.style.setProperty('position', 'absolute', null);
		this.progressBarDrawing.appendChild(this.progressBarBgDrawing);

		this.progressBarBarDrawing = document.createElementNS(htmlNS, 'div');
		this.progressBarBarDrawing.setAttributeNS(null, 'class', 'ui-progressbar-bar');
		this.progressBarBarDrawing.style.setProperty('position', 'absolute', null);
		this.progressBarDrawing.appendChild(this.progressBarBarDrawing);

		return this.progressBarDrawing;
	},

	arrangeCore: function(width, height) {
		this.updateValue();
	},

});

