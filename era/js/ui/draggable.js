//
// Define the Draggable class.
//
Ui.LBox.extend('Ui.Draggable', {
	icon: undefined,
	downloadUrl: undefined,
	downloadMimetype: undefined,
	downloadFilename: undefined,
	allowedMode: 'copyMove',
	mimetype: undefined,
	data: undefined,

	constructor: function(config) {
		if(config.data != undefined) 
			this.setData(config.mimetype, config.data);
		if(config.downloadUrl != undefined)
			this.setDownloadUrl(config.downloadUrl, config.downloadMimetype, config.downloadFilename);

		this.drawing.setAttributeNS(null, 'draggable', true);
		this.connect(this.drawing, 'dragstart', this.onDragStart, true);
		this.connect(this.drawing, 'dragend', this.onDragEnd, true);

		this.addEvents('dragstart', 'dragend');
	},

	//
	// Set the data that we drag & drop
	//
	setData: function(mimetype, data) {
		if(mimetype == undefined)
			this.mimetype = 'application/era-framework';
		else
			this.mimetype = mimetype;
		this.data = data;
	},

	//
	// Set the allowed operation. Possible values are:
	// [copy|copyLink|copyMove|link|linkMove|move|all]
	//
	setAllowedMode: function(allowedMode) {
		this.allowedMode = allowedMode;
	},

	//
	// Provide an Ui.Image that will be used when
	// dragging the element
	// Supported by: Firefox, Chrome and Safari on Windows
	//
	setIcon: function(icon) {
		this.icon = icon;
	},

	//
	// Provide an URL to download the associated file (if any)
	// if the element is dropped on the desktop
	// Supported by: Chrome only
	//
	setDownloadUrl: function(url, mimetype, filename) {
		// TODO: if url is relative, make it absolute

		this.downloadUrl = url;
		// extract the fileName if not given
		if(filename == undefined) {
			// TODO
		}
		// guess the mimetype if not given
		if(mimetype == undefined) {
			// TODO
		}
	 	this.downloadMimetype = mimetype;
		this.downloadFilename = filename;
	},

	//
	// Private
	//

	onDragStart: function(event) {
		event.stopPropagation();
		event.dataTransfer.effectAllowed = this.allowedMode;

		// if the element if downloadable to the destkop,
		// try to provide the link
		if(this.downloadUrl != undefined) {
			try {
				event.dataTransfer.setData('DownloadURL', this.downloadMimetype+':'+this.downloadFilename+':'+this.downloadUrl);
			} catch(e) {}
		}

		// use Text as data because it is the only thing
		// that works cross browser. Only Firefox support different mimetypes
		event.dataTransfer.setData('Text', this.mimetype+':'+this.data);

		if(this.icon != undefined) {
			// TODO: improve this
//			console.log(this.icon.drawing.childNodes[0]);

			if(event.dataTransfer.setDragImage != undefined)
				event.dataTransfer.setDragImage(this.icon.drawing.childNodes[0], 0, 0);
		}
		this.fireEvent('dragstart', this);
		return false;
	},

	onDragEnd: function(event) {
		event.stopPropagation();
		// dropEffect give the operation done: [none|copy|link|move]
		this.fireEvent('dragend', this, event.dataTransfer.dropEffect);
	},
}, {
});
