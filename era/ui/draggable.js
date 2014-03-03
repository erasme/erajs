Ui.Pressable.extend('Ui.Draggable', 
{
	/**
	 * Fires when object start to be dragged
	 * @name Ui.Draggable#dragstart
	 * @event
	 * @param {Ui.Draggable} draggable The draggable itself
	 */
	/**
	 * Fires when object stop to be dragged
	 * @name Ui.Draggable#dragend
	 * @event
	 * @param {Ui.Draggable} draggable The draggable itself
	 * @param {string} dropEffect Give the operation done: [none|copy|link|move]
	 */

	icon: undefined,
	downloadUrl: undefined,
	downloadMimetype: undefined,
	downloadFilename: undefined,
	allowedMode: 'copyMove',
	mimetype: undefined,
	data: undefined,
	dragDelta: undefined,
	localkey: undefined,

	/**
	 * @constructs
	 * @class
	 * @extends Ui.LBox
	 */
	constructor: function(config) {
		this.addEvents('dragstart', 'dragend');

		this.connect(this.getDrawing(), 'dragstart', this.onDragStart, true);
		this.connect(this.getDrawing(), 'dragend', this.onDragEnd, true);

		// default data is the draggable object itself
		this.setData(this);
	},

	/**
	 * Set the mimetype of the data
	 */
	setMimetype: function(mimetype) {
		this.mimetype = mimetype;
	},

	getMimetype: function() {
		return this.mimetype;
	},

	/**
	 * Set the data that we drag & drop
	 */
	setData: function(data) {
		this.data = data;
		// handle a default mimetype for object
		if((this.mimetype === undefined) && (typeof(this.data) === 'object')) {
			if(Core.Object.hasInstance(this.data))
				this.mimetype = Ui.Draggable.localmimetype+'-'+this.data.classType.toLowerCase();
			else
				this.mimetype = Ui.Draggable.localmimetype;
		}
		// allow native drag & drop
		this.getDrawing().setAttribute('draggable', true);
	},

	/**
	 * Set the allowed operation. Possible values are:
	 * [copy|copyLink|copyMove|link|linkMove|move|all]
	 */
	setAllowedMode: function(allowedMode) {
		this.allowedMode = allowedMode;
	},

	/**
	 * Provide an Ui.Image that will be used when
	 * dragging the element
	 * Supported by: Firefox, Chrome and Safari on Windows
	 */
	setIcon: function(icon) {
		this.icon = icon;
	},

	/**
	 * Provide an URL to download the associated file (if any)
	 * if the element is dropped on the desktop
	 * Supported by: Chrome only
	 */
	setDownloadUrl: function(url, mimetype, filename) {
		// TODO: if url is relative, make it absolute
		var uri = new Core.Uri({ uri: url });
		this.downloadUrl = uri.toString();
		// extract the fileName if not given
		//if(filename === undefined) {
			// TODO
		//}
		// guess the mimetype if not given
		//if(mimetype === undefined) {
			// TODO
		//}
	 	this.downloadMimetype = mimetype;
		this.downloadFilename = filename;
	},

	getDragDelta: function() {
		return this.dragDelta;
	},

	/**#@+
	 * @private
	 */

	onDragStart: function(event) {
		if(this.lock || this.getIsDisabled())
			return;
		
		this.dragDelta = this.pointFromWindow({ x: event.clientX, y: event.clientY });

		event.stopPropagation();
		event.dataTransfer.effectAllowed = this.allowedMode;

		// if the element if downloadable to the destkop,
		// try to provide the link
		if(this.downloadUrl !== undefined) {
			try {
				event.dataTransfer.setData('DownloadURL', this.downloadMimetype+':'+this.downloadFilename+':'+this.downloadUrl);
			} catch(e) {}
		}

		// use Text as data because it is the only thing
		// that works cross browser. Only Firefox support different mimetypes
		//event.dataTransfer.setData('Text', this.mimetype+':'+this.dragDelta.x+':'+this.dragDelta.y+':'+this.data);

		var mergedData = '';
		if(typeof(this.data) === 'object') {
			this.localkey = Ui.Draggable.addLocalData(this.data);
			if(Core.Object.hasInstance(this.data)) {
				// handle class heritage for Core.Object
				var current = this.data;
				while((current !== undefined) && (current !== null)) {
					if(!navigator.supportDrag || navigator.supportMimetypeDrag)
						event.dataTransfer.setData(Ui.Draggable.localmimetype+'-'+current.classType.toLowerCase(), this.localkey);
					else 
						mergedData += Ui.Draggable.localmimetype+'-'+current.classType.toLowerCase()+':'+this.localkey+';';
					current = current.__baseclass__;
				}
			}
			else {
				if(!navigator.supportDrag || navigator.supportMimetypeDrag)
					event.dataTransfer.setData(Ui.Draggable.localmimetype, this.localkey);
				else
					mergedData += Ui.Draggable.localmimetype+':'+this.localkey+';';
			}
		}
		else {
			if(!navigator.supportDrag || navigator.supportMimetypeDrag)
				event.dataTransfer.setData(this.mimetype, this.data);
			else
				mergedData += this.mimetype+':'+data+';';
		}
		if(!(!navigator.supportDrag || navigator.supportMimetypeDrag))
			event.dataTransfer.setData('Text', mergedData);
		
		this.fireEvent('dragstart', this);

		if(this.icon !== undefined) {
			// TODO: improve this
			if(event.dataTransfer.setDragImage !== undefined)
				event.dataTransfer.setDragImage(this.icon.drawing.childNodes[0], 0, 0);
		}
		return false;
	},

	onDragEnd: function(event) {
		event.stopPropagation();
		// dropEffect give the operation done: [none|copy|link|move]
		this.fireEvent('dragend', this, event.dataTransfer.dropEffect);

		if(this.localkey !== undefined) {
			Ui.Draggable.removeLocalData(this.localkey);
			this.localkey = undefined;
		}
	}

}, {}, {
	localmimetype: undefined,
	localdata: undefined,

	constructor: function() {
		Ui.Draggable.localdata = {};
		var mimetype = 'application/x-erajs-local-';
		var characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        for(var i = 0; i < 16; i++)
			mimetype += characters.charAt(Math.floor(Math.random()*characters.length));
		Ui.Draggable.localmimetype = mimetype;
	},

	addLocalData: function(data) {
		var key = '';
		var characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        for(var i = 0; i < 16; i++)
			key += characters.charAt(Math.floor(Math.random()*characters.length));
		Ui.Draggable.localdata[key] = data;
		return key;
	},

	getLocalData: function(key) {
		return Ui.Draggable.localdata[key];
	},

	removeLocalData: function(key) {
		delete(Ui.Draggable.localdata[key]);
	}
});

