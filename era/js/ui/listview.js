//
// Define the ListView class.
//
Ui.VBox.extend('Ui.ListView', {
	data: undefined,
	headers: undefined,

	constructor: function(config) {
		if(config.headers != undefined)
			this.headers = config.headers;
		else
			this.headers = [ { width: 100, type: 'string', title: 'Title', key: 'default' }];
		this.data = [];

		var headerBg = new Ui.LBox({ height: 10 });
		this.append(headerBg);

		headerBg.append(new Ui.Rectangle({ fill: 'lightblue' }));

		var headerRow = new Ui.HBox();
		headerBg.append(headerRow);

		for(var i = 0; i < this.headers.length; i++) {
			var headerTitle = new Ui.LBox({ margin: 1 });
			headerTitle.append(new Ui.Rectangle({ fill: 'orange' }));
			headerTitle.append(new Ui.Label({ text: this.headers[i].title, margin: 8 }));

			headerRow.append(headerTitle);
		}

		if(config.data != undefined) {
			for(var i = 0; i < config.data.length; i++)
				this.appendData(config.data[i]);
		}
	},

	appendData: function(data) {
	},

	removeData: function(data) {
	},

	removeDataAt: function(position) {
	},

	getData: function() {
		return this.data;
	},

}, {
	arrangeCore: function(width, height) {
	}


});
