Ui.LBox.extend('Ui.DropBox', 
/**@lends Ui.DropBox#*/
{
	allowedMimetypes: undefined,
	allowFiles: false,
	allowText: false,
	allowedMode: 'all',

	/**
	* @constructs
	* @class
	* @extends Ui.LBox
	*/
	constructor: function(config) {
		this.allowedMimetypes = [];

		this.connect(this.drawing, 'dragenter', this.onDragEnter);
		this.connect(this.drawing, 'dragover', this.onDragOver);
		this.connect(this.drawing, 'drop', this.onDrop);

		this.addEvents('drop', 'dropfile');
	},

	/**
	 * Set the allowed operation. Possible values are:
	 * [copy|copyLink|copyMove|link|linkMove|move|all]
	 */
	setAllowedMode: function(allowedMode) {
		this.allowedMode = allowedMode;
	},

	/**
	 * Add a mimetype allowed to be dropped on the current
	 * dropbox.
	 * If the special type 'Files' is provided, the dropbox
	 * will accept files dragged from the desktop.
	 */
	addMimetype: function(mimetype) {
		this.allowedMimetypes.push(mimetype);
		if(mimetype.toLowerCase() == 'files')
			this.allowFiles = true;
		else
			this.allowText = true;
	},

	/**#@+
	 * @private
	 */

	onDragEnter: function(event) {
//		console.log('onDragEnter allowText: '+this.allowText+', allowFiles: '+this.allowFiles);
		if(event.dataTransfer.types != undefined) {
//			console.log('onDragEnter: '+event.dataTransfer.types);
//			for(var i = 0; i < event.dataTransfer.types.length; i++)
//				console.log('detail: '+event.dataTransfer.types[i]);
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

		if(event.dataTransfer === undefined)
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
		if(effectAllowed == 'uninitialized')
			effectAllowed = 'all';

		var dropEffect = 'copy';
		if(((this.allowedMode == 'all') || (this.allowedMode == 'copy') ||  (this.allowedMode == 'copyLink') || (this.allowedMode == 'copyMove')) &&
		   ((effectAllowed == 'copy') || (effectAllowed == 'copyLink') || (effectAllowed == 'copyMove') || (effectAllowed == 'all')))
			dropEffect = 'copy';
		else if(((this.allowedMode == 'all') || (this.allowedMode == 'copyMove') ||  (this.allowedMode == 'linkMove') || (this.allowedMode == 'move')) &&
				((effectAllowed == 'all') || (effectAllowed == 'copyMove') || (effectAllowed == 'linkMove') || (effectAllowed == 'move')))
			dropEffect = 'move';
		else if(((this.allowedMode == 'all') || (this.allowedMode == 'copyLink') ||  (this.allowedMode == 'link') || (this.allowedMode == 'linkMove')) &&
				((effectAllowed == 'all') || (effectAllowed == 'copyLink') || (effectAllowed == 'link') || (effectAllowed == 'linkMove')))
			dropEffect = 'link';
		else
			dropEffect = 'none';

//		console.log('effectAllowed: '+effectAllowed+', dropEffect: '+dropEffect);

		event.dataTransfer.dropEffect = dropEffect;

		event.preventDefault();
		event.stopPropagation();
		return false;
	},

	onDrop: function(event) {
//		console.log('onDrop '+event.clientX+','+event.clientY);
		
		var dropPoint = this.pointFromWindow({ x: event.clientX, y: event.clientY });

//		console.log('drop Files: '+((event.dataTransfer.files === undefined)?0:event.dataTransfer.files.length));

		if((event.dataTransfer.files != undefined) && (event.dataTransfer.files.length > 0)) {
			// accept the drop
			event.preventDefault();
			event.stopPropagation();

//			console.log('drop files');
			for(var i = 0; i < event.dataTransfer.files.length; i++)
				this.fireEvent('dropfile', this, new Core.File({ fileApi: event.dataTransfer.files[i] }));
		}
		else {
			// look for native types
			if('types' in event.dataTransfer) {
				for(var i = 0; i < event.dataTransfer.types.length; i++) {
					var mimetype = event.dataTransfer.types[i];
					for(var i2 = 0; i2 < this.allowedMimetypes.length; i2++) {
						if(this.allowedMimetypes[i2] == mimetype) {
							var data = event.dataTransfer.getData(mimetype);
							// accept the drop
							event.preventDefault();
							event.stopPropagation();
							this.fireEvent('drop', this, mimetype, data, dropPoint.x, dropPoint.y);
							return;
						}
					}
				}
			}

			// handle "text encoded" mimetypes
			var data = event.dataTransfer.getData('Text');
//			console.log('onDrop data Text: '+data);

			if(data != undefined) {
				var pos = data.indexOf(':');
				if(pos != -1) {
					var mimetype = data.substring(0, pos);
					var data = data.substring(pos+1);

					for(var i = 0; i < this.allowedMimetypes.length; i++) {
						if(this.allowedMimetypes[i] == mimetype) {
//							console.log('found allowed mimetype: '+mimetype);
							// accept the drop
							event.preventDefault();
							event.stopPropagation();
							this.fireEvent('drop', this, mimetype, data, dropPoint.x, dropPoint.y);
							return;
						}
					}
//					console.log('allowed mimetype NOT FOUND');
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
	/**#@-*/
}, 
/**@lends Ui.DropBox#*/
{
});
