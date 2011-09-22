
Ui.IFrame.extend('Ui.Program', {
	arguments: undefined,

	constructor: function(config) {
		this.connect(window, 'message', this.onMessage, false);
		if(!('location' in config))
			throw("location config parameter is NEEDED");
		var location = config.location;
		if('arguments' in config)
			location += '?base64='+encodeURIComponent(JSON.stringify(config.arguments).toBase64());
		this.setSrc(location);
		this.addEvents('message');
	},

	sendMessage: function(msg) {
		this.getIFrame().contentWindow.postMessage(msg.serialize(), '*');
	},

	//
	// Private
	//
	onMessage: function(event) {
		if(this.getIFrame().contentWindow === event.source) {
			event.preventDefault();
			event.stopPropagation();
			var msg = JSON.parse(event.data);
			this.fireEvent('message', this, msg);
		}
	}
});

