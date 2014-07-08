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
		this.addEvents('dragover', 'drop', 'dropfile', 'dragenter', 'dragleave');

		this.allowedMimetypes = [];

		//this.connect(this.drawing, 'dragenter', this.onDragEnter);
		//this.connect(this.drawing, 'dragleave', this.onDragLeave);
		this.connect(this.drawing, 'dragover', this.onDragOver);
		this.connect(this.drawing, 'drop', this.onDrop);
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
		if(typeof(mimetype) === 'function')
			mimetype = Ui.Draggable.localmimetype+'-'+mimetype.prototype.classType;
		this.allowedMimetypes.push(mimetype);
		if((typeof(mimetype) === 'string') && mimetype.toLowerCase() == 'files')
			this.allowFiles = true;
	},

	/**#@+
	 * @private
	 */

	dragMimetype: function(event) {
		var found;
		if(event.dataTransfer.types !== undefined) {
			for(var i = 0; (found === undefined) && (i < event.dataTransfer.types.length); i++) {
				var type = event.dataTransfer.types[i];
				for(var i2 = 0; (found === undefined) && (i2 < this.allowedMimetypes.length); i2++) {
					if(type.toLowerCase() === this.allowedMimetypes[i2].toLowerCase())
						found = this.allowedMimetypes[i2];
				}
			}
		}
		return found;
	},

	dragMergedMimetype: function(data) {
		for(var type in data) {
			for(var i2 = 0; (i2 < this.allowedMimetypes.length); i2++) {
				if(type.toLowerCase() === this.allowedMimetypes[i2].toLowerCase())
					return type;
			}
		}
		return undefined;
	},

	onDragEnter: function(event) {
		var mimetype = this.dragMimetype(event);
		//console.log('onDragEnter mimetype: '+mimetype+', target: '+event.target);
		if(mimetype !== undefined) {
			event.stopPropagation();
			this.fireEvent('dragenter', this, mimetype);
			return false;
		}
	},

	onDragLeave: function(event) {
		var mimetype = this.dragMimetype(event);
		//console.log('onDragLeave mimetype: '+mimetype+', target: '+event.target);
		if(mimetype !== undefined) {
			event.stopPropagation();
			this.fireEvent('dragleave', this, mimetype);
			return false;
		}
	},

	onDragOver: function(event) {
		//console.log(this+'.onDragOver effectAllowed: '+event.dataTransfer.effectAllowed+', mimetype: '+this.dragMimetype(event));
		if((event.dataTransfer !== undefined) && (!(!navigator.supportDrag || navigator.supportMimetypeDrag) || (this.dragMimetype(event) !== undefined))) {
			// accept the drag over
			var effectAllowed = 'all';
			if(event.dataTransfer.effectAllowed !== undefined)
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
			
			event.dataTransfer.dropEffect = dropEffect;
			event.preventDefault();
			if(!navigator.supportDrag || navigator.supportMimetypeDrag)
				event.stopPropagation();

			var point = this.pointFromWindow({ x: event.clientX, y: event.clientY });
			this.fireEvent('dragover', this, point.x, point.y);
			return false;
		}
	},

	onDrop: function(event) {
		var i; var pos; var mimetype; var data;
		var dropPoint = this.pointFromWindow({ x: event.clientX, y: event.clientY });

		// handle files
		if((event.dataTransfer.files !== undefined) && (event.dataTransfer.files.length > 0)) {
			if(this.allowFiles) {
				// accept the drop
				event.preventDefault();
				event.stopPropagation();
				for(i = 0; i < event.dataTransfer.files.length; i++)
					this.fireEvent('dropfile', this, new Core.File({ fileApi: event.dataTransfer.files[i] }), dropPoint.x, dropPoint.y, event.dataTransfer.effectAllowed);
			}
		}
		else {
			if(!navigator.supportDrag || navigator.supportMimetypeDrag) {
				mimetype = this.dragMimetype(event);
				if(mimetype !== undefined) {
					data = event.dataTransfer.getData(mimetype);
					// if this is a local drag and drop, get the local object
					if(mimetype.indexOf(Ui.Draggable.localmimetype) === 0)
						data = Ui.Draggable.getLocalData(data);
					// accept the drop
					event.preventDefault();
					event.stopPropagation();
					this.fireEvent('drop', this, mimetype, data, dropPoint.x, dropPoint.y, event.dataTransfer.effectAllowed);
				}
			}
			else {
				// emulate with Text data
				var mergedData = event.dataTransfer.getData('Text');
				data = {};
				var tmp = mergedData.split(';');
				for(i = 0; i < tmp.length; i++) {
					pos = tmp[i].indexOf(':');
					if(pos !== -1)
						data[tmp[i].substring(0, pos)] = tmp[i].substring(pos+1);
				}
				mimetype = this.dragMergedMimetype(data);
				if(mimetype !== undefined) {
					// accept the drop
					event.preventDefault();
					event.stopPropagation();
					data = data[mimetype];
					// if this is a local drag and drop, get the local object
					if(mimetype.indexOf(Ui.Draggable.localmimetype) === 0)
						data = Ui.Draggable.getLocalData(data);
					this.fireEvent('drop', this, mimetype, data, dropPoint.x, dropPoint.y, event.dataTransfer.effectAllowed);
				}
			}
		}
		return false;
	}
	/**#@-*/
});
