Ui.LBox.extend('Ui.DropBox', 
/**@lends Ui.DropBox#*/
{
	/**
	 * Fires when a draggable object is drop
	 * @name Ui.DropBox#drop
	 * @event
	 * @param {Ui.DropBox} dropbox The dropbox itself
	 * @param {string} mimetype The dropped object mimetype
	 * @param {string) data The dropped object linked data (can be a JSON object stringify)
	 * @param {number} posX The dropped object x position
	 * @param {number} posY The dropped object y position
	 */
	/**
	 * Fires when a file is drop from the desktop
	 * @name Ui.DropBox#dropfile
	 * @event
	 * @param {Ui.DropBox} dropbox the dropbox itself
	 * @param {Core.File} file The dropped file
	 */

	allowedMimetypes: undefined,
	allowFiles: false,
	allowedMode: 'all',

	/**
	 * @constructs
	 * @class
	 * @extends Ui.LBox
	 */
	constructor: function(config) {
		this.addEvents('dragover', 'drop', 'dropfile');

		this.allowedMimetypes = [];

		this.connect(this.drawing, 'dragenter', this.onDragEnter);
		this.connect(this.drawing, 'dragover', this.onDragOver);
		this.connect(this.drawing, 'drop', this.onDrop);
		this.connect(this.drawing, 'localdragenter', this.onDragEnter);
		this.connect(this.drawing, 'localdragover', this.onDragOver);
		this.connect(this.drawing, 'localdrop', this.onDrop);
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
	},

	/**#@+
	 * @private
	 */

	dragMimetype: function(event) {
		var found = undefined;
		if(event.dataTransfer.types != undefined) {
			for(var i = 0; (found === undefined) && (i < event.dataTransfer.types.length); i++) {
				var type = event.dataTransfer.types[i].toLowerCase();
				for(var i2 = 0; (found === undefined) && (i2 < this.allowedMimetypes.length); i2++) {
					if(type == this.allowedMimetypes[i2].toLowerCase())
						found = this.allowedMimetypes[i2];
				}
			}
		}
		return found;
	},


	onDragEnter: function(event) {
//		console.log('onDragEnter allowText: '+this.allowText+', allowFiles: '+this.allowFiles);
		if(this.dragMimetype(event) !== undefined) {
			// accept the drag
			event.preventDefault();
			event.stopPropagation();
			return false;
		}
	},

	onDragOver: function(event) {
//		console.log(this+'.onDragOver effectAllowed: '+event.dataTransfer.effectAllowed+', mimetype: '+this.dragMimetype(event));
		if((event.dataTransfer !== undefined) && (this.dragMimetype(event) !== undefined)) {
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

//			console.log('effectAllowed: '+effectAllowed+', dropEffect: '+dropEffect);

			event.dataTransfer.dropEffect = dropEffect;
			event.preventDefault();
			event.stopPropagation();

			var point = this.pointFromWindow({ x: event.clientX, y: event.clientY });
			this.fireEvent('dragover', this, point.x, point.y);
			return false;
		}
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
			var mimetype = this.dragMimetype(event);
			if(mimetype !== undefined) {
				var data = event.dataTransfer.getData(mimetype);
				// accept the drop
				event.preventDefault();
				event.stopPropagation();
				this.fireEvent('drop', this, mimetype, data, dropPoint.x, dropPoint.y);
			}
/*
			// handle "text encoded" mimetypes
			var data = event.dataTransfer.getData('Text');
//			console.log('onDrop data Text: '+data);

			if(data != undefined) {
				var tmp = data.split(':');
				if(tmp.length == 4) {
					var mimetype = tmp[0];
					var x = new Number(tmp[1]);
					var y = new Number(tmp[2]);
					var data = tmp[3];

					for(var i = 0; i < this.allowedMimetypes.length; i++) {
						if(this.allowedMimetypes[i] == mimetype) {
//							console.log('found allowed mimetype: '+mimetype);
							// accept the drop
							event.preventDefault();
							event.stopPropagation();
							this.fireEvent('drop', this, mimetype, data, dropPoint.x, dropPoint.y, x, y);
							return;
						}
					}
//					console.log('allowed mimetype NOT FOUND');
				}

//				var pos = data.indexOf(':');
//				if(pos != -1) {
//					var mimetype = data.substring(0, pos);
//					var data = data.substring(pos+1);
//
//					for(var i = 0; i < this.allowedMimetypes.length; i++) {
//						if(this.allowedMimetypes[i] == mimetype) {
//							console.log('found allowed mimetype: '+mimetype);
//							// accept the drop
//							event.preventDefault();
//							event.stopPropagation();
//							this.fireEvent('drop', this, mimetype, data, dropPoint.x, dropPoint.y);
//							return;
//						}
//					}
//					console.log('allowed mimetype NOT FOUND');
//				}
			}*/
		}
		return false;
	}
	/**#@-*/
});
