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

	draggableIcon: undefined,
	downloadUrl: undefined,
	downloadMimetype: undefined,
	downloadFilename: undefined,
	allowedMode: 'copyMove',
	mimetype: undefined,
	draggableData: undefined,
	dragDelta: undefined,
	localkey: undefined,
	dataTransfer: undefined,

	/**
	 * @constructs
	 * @class
	 * @extends Ui.LBox
	 */
	constructor: function(config) {
		this.addEvents('dragstart', 'dragend');

//		if(navigator.localDrag) {
//			this.connect(this.getDrawing(), 'localdragstart', this.onDragStart, true);
//			this.connect(this.getDrawing(), 'localdragend', this.onDragEnd, true);
//		}
//		else {
//			this.connect(this, 'dragstart', this.onDragStart);
//			this.connect(this, 'dragend', this.onDragEnd);
//		}
		
		this.connect(this, 'ptrdown', this.onDraggablePointerDown);

		// default data is the draggable object itself
//		this.setData(this);
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
	setDraggableData: function(data) {
		this.draggableData = data;
		// handle a default mimetype for object
		if((this.mimetype === undefined) && (typeof(this.draggableData) === 'object')) {
			if(Core.Object.hasInstance(this.draggableData))
				this.mimetype = Ui.Draggable.localmimetype+'-'+this.draggableData.classType.toLowerCase();
			else
				this.mimetype = Ui.Draggable.localmimetype;
		}
		// allow local drag & drop
//		if(navigator.localDrag)
//			this.getDrawing().setAttribute('localdraggable', true);
		// allow native drag & drop only if not local
//		else
//			this.getDrawing().setAttribute('draggable', true);
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
	setDraggableIcon: function(icon) {
		this.draggableIcon = icon;
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

	onDraggablePointerDown: function(event) {
		if(this.lock || this.getIsDisabled() || (this.draggableData === undefined))
			return;

//		console.log('onPointerDown');
		this.dataTransfer = new Ui.DragDataTransfer({ type: 'pointer', draggable: this, x: event.clientX, y: event.clientY, delayed: true, pointer: event.pointer });
		this.dragDelta = this.pointFromWindow({ x: event.clientX, y: event.clientY });
		this.connect(this.dataTransfer, 'start', this.onDragStart);
		this.connect(this.dataTransfer, 'end', this.onDragEnd);
	},

	onDragStart: function(dataTransfer) {
//		console.log('onDragStart '+dataTransfer);

		dataTransfer.effectAllowed = this.allowedMode;

		// if the element if downloadable to the destkop,
		// try to provide the link
		if(this.downloadUrl !== undefined) {
			try {
				dataTransfer.setData('DownloadURL', this.downloadMimetype+':'+this.downloadFilename+':'+this.downloadUrl);
			} catch(e) {}
		}

		// use Text as data because it is the only thing
		// that works cross browser. Only Firefox support different mimetypes
		//event.dataTransfer.setData('Text', this.mimetype+':'+this.dragDelta.x+':'+this.dragDelta.y+':'+this.draggableData);

		var mergedData = '';
		if(typeof(this.draggableData) === 'object') {
			this.localkey = Ui.Draggable.addLocalData(this.draggableData);
			if(Core.Object.hasInstance(this.draggableData)) {
				// handle class heritage for Core.Object
				var current = this.draggableData;
				while((current !== undefined) && (current !== null)) {
					if(!navigator.supportDrag || navigator.supportMimetypeDrag)
						dataTransfer.setData(Ui.Draggable.localmimetype+'-'+current.classType.toLowerCase(), this.localkey);
					else 
						mergedData += Ui.Draggable.localmimetype+'-'+current.classType.toLowerCase()+':'+this.localkey+';';
					current = current.__baseclass__;
				}
			}
			else {
				if(!navigator.supportDrag || navigator.supportMimetypeDrag)
					dataTransfer.setData(Ui.Draggable.localmimetype, this.localkey);
				else
					mergedData += Ui.Draggable.localmimetype+':'+this.localkey+';';
			}
		}
		else {
			if(!navigator.supportDrag || navigator.supportMimetypeDrag)
				dataTransfer.setData(this.mimetype, this.draggableData);
			else
				mergedData += this.mimetype+':'+this.draggableData+';';
		}

		if(!(!navigator.supportDrag || navigator.supportMimetypeDrag))
			dataTransfer.setData('Text', mergedData);
		
		this.fireEvent('dragstart', this);

		if(this.draggableIcon !== undefined) {
			// TODO: improve this
			if(dataTransfer.setDragImage !== undefined)
				dataTransfer.setDragImage(this.draggableIcon.drawing.childNodes[0], 0, 0);
		}
		return false;
	},

	onDragEnd: function(dataTransfer) {
		// dropEffect give the operation done: [none|copy|link|move]
		this.fireEvent('dragend', this, dataTransfer.dropEffect);

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

