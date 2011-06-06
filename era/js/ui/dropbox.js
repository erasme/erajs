//
// Define the DropBox class.
//
Ui.LBox.extend('Ui.DropBox', {
	allowedMimetypes: undefined,
	allowFiles: false,
	allowText: false,

	constructor: function(config) {
		this.allowedMimetypes = [];

		this.connect(this.drawing, 'dragenter', this.onDragEnter);
		this.connect(this.drawing, 'dragover', this.onDragOver);
		this.connect(this.drawing, 'drop', this.onDrop);

		this.addEvents('drop', 'dropfiles');
	},

	//
	// Add a mimetype allowed to be dropped on the current
	// dropbox.
	// If the special type 'Files' is provided, the dropbox
	// will accept files dragged from the desktop.
	//
	addMimetype: function(mimetype) {
		this.allowedMimetypes.push(mimetype);
		if(mimetype.toLowerCase() == 'files')
			this.allowFiles = true;
		else
			this.allowText = true;
	},

	//
	// Private
	//

	onDragEnter: function(event) {
//		console.log('onDragEnter allowText: '+this.allowText+', allowFiles: '+this.allowFiles);

		if(event.dataTransfer.types != undefined) {
//			console.log('onDragEnter: '+event.dataTransfer.types);
			var foundFiles = false;
			var foundText = false;
			for(var i = 0; i < event.dataTransfer.types.length; i++) {
				var type = event.dataTransfer.types[i].toLowerCase();
//				console.log('text type: '+type);
				if((type == 'text') || (type == 'text/plain'))
					foundText = true;
				else if(type.toLowerCase() == 'files')
					foundFiles = true;
			}
//			console.log('text type found ? '+foundText);
//			console.log('files type found ? '+foundFiles);
			if(!(foundFiles && this.allowFiles) && !(foundText && this.allowText))
				return;
		}
		// accept the drag
		event.preventDefault();
		event.stopPropagation();

		return false;
	},

	onDragOver: function(event) {
//		console.log('onDragOver effectAllowed: '+event.dataTransfer.effectAllowed);

		if(event.dataTransfer == undefined)
			return;

		if(event.dataTransfer.types != undefined) {
//			console.log('onDragOver: '+event.dataTransfer.types);
			var foundFiles = false;
			var foundText = false;
			for(var i = 0; i < event.dataTransfer.types.length; i++) {
				var type = event.dataTransfer.types[i].toLowerCase();
				if((type == 'text') || (type == 'text/plain'))
					foundText = true;
				else if(type.toLowerCase() == 'files')
					foundFiles = true;
			}
//			console.log('text type found ? '+foundText);
//			console.log('files type found ? '+foundFiles);
			if(!(foundFiles && this.allowFiles) && !(foundText && this.allowText))
				return;
		}
		// accept the drag over
		var effectAllowed = 'all';
		if(event.dataTransfer.effectAllowed != undefined)
			effectAllowed = event.dataTransfer.effectAllowed;

		var dropEffect = 'copy';
		if((effectAllowed == 'copy') || (effectAllowed == 'copyLink') || (effectAllowed == 'copyMove') || (effectAllowed == 'all'))
			dropEffect = 'copy';
		else if((effectAllowed == 'linkMove') || (effectAllowed == 'move'))
			dropEffect = 'move';
		else if(effectAllowed == 'link')
			dropEffect = 'link';

		event.dataTransfer.dropEffect = dropEffect;

		event.preventDefault();
		event.stopPropagation();
		return false;
	},

	onDrop: function(event) {
		// accept the drop
		event.preventDefault();
		event.stopPropagation();
//		console.log('onDrop');

//		console.log('drop Files: '+((event.dataTransfer.files == undefined)?0:event.dataTransfer.files.length));

		if((event.dataTransfer.files != undefined) && (event.dataTransfer.files.length > 0)) {
//			console.log('drop files');
			this.fireEvent('dropfiles', this, event.dataTransfer.files);
		}
		else {
			var data = event.dataTransfer.getData('Text');
			if(data != undefined) {
				var pos = data.indexOf(':');
				if(pos != -1) {
					var mimetype = data.substring(0, pos);
					var data = data.substring(pos+1);
					this.fireEvent('drop', this, mimetype, data);
				}
			}
		}

//		event.dump();

//		event.dataTransfer.dropEffect = 'copy';
//		event.dataTransfer.dump();

//		var data = event.dataTransfer.getData('text/plain');
//		if(data != undefined)
//			console.log('drop text/plain: '+data);
/*
		try {
		data = event.dataTransfer.getData('Text');
		if(data != undefined)
			console.log('drop Text: '+data);
		} catch(e) {}

		try {
		data = event.dataTransfer.getData('Image');
		if(data != undefined)
			console.log('drop Image: '+data);
		} catch(e) {}

		try {
		data = event.dataTransfer.getData('URL');
		if(data != undefined)
			console.log('drop URL: '+data);
		} catch(e) {}

		try {
		data = event.dataTransfer.getData('File');
		if(data != undefined)
			console.log('drop File: '+data);
		} catch(e) {}


		try {
		data = event.dataTransfer.getData('application/era');
		if(data != undefined)
			console.log('drop application/era: '+data);
		} catch(e) {}

*/

//		data = event.dataTransfer.getData('url');
//		if(data != undefined)
//			console.log('drop url: '+data);
		return false;
	}
}, {
});
