Ui.LBox.extend('Ui.Embed', 
/**@lends Ui.Embed#*/
{
	content: undefined,
	div: undefined,
	divId: undefined,
	updateTask: undefined,

	/**
	 * @constructs
	 * @class
	 * @extends Ui.LBox
	 */
	constructor: function(config) {
		if(Ui.App.current == undefined)
			new Ui.App();
		this.getDrawing().style.cursor = 'default';
		if('div' in config)
			this.setDiv(config.div);
		else if('divId' in config)
			this.setDivId(config.divId);
		this.setIsLoaded(true);
		this.connect(Ui.App.current, 'ready', this.onReady);
	},

	getDiv: function() {
		return this.div;
	},

	setDiv: function(div) {
		if(this.div != undefined)
			this.div.removeChild(this.getDrawing());
		this.div = div;
		if(this.div != undefined) {
			this.div.style.position = 'relative';
			this.div.style.left = '0px';
			this.div.style.top = '0px';
			this.div.style.width = this.getWidth()+'px';
			this.div.style.height = this.getHeight()+'px';
			this.div.appendChild(this.getDrawing());
			this.update();
		}
	},

	setDivId: function(divId) {
		this.divId = divId;
	},

	getContent: function() {
		return this.content;
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

	update: function() {
		var aWidth = (this.getWidth() != undefined)?this.getWidth():0;
		var aHeight = (this.getHeight() != undefined)?this.getHeight():0;
		
		var size = this.measure(aWidth, aHeight);
		aWidth = Math.max(aWidth, size.width);
		aHeight = Math.max(aHeight, size.height);
		this.arrange(0, 0, aWidth, aHeight);
		this.updateTask = undefined;
		if(this.div != undefined) {
			this.div.style.width = Math.round(aWidth)+'px';
			this.div.style.height = Math.round(aHeight)+'px';
		}
	},

	onReady: function() {
		console.log(this+'.onReady');
		if((this.div == undefined) && (this.divId != undefined)) {
			this.setDiv(document.getElementById(this.divId));
		}
	}
}, 
/**@lends Ui.Embed#*/
{
	invalidateMeasure: function() {
		this.invalidateArrange();
		this.measureValid = false;
		if(this.updateTask == undefined)
			this.updateTask = new Core.DelayedTask({ delay: 0, scope: this, callback: this.update });
	},

	invalidateArrange: function() {
		this.arrangeValid = false;
		if(this.updateTask == undefined)
			this.updateTask = new Core.DelayedTask({ delay: 0, scope: this, callback: this.update });
	}
});


