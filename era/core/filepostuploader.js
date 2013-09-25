Core.Object.extend('Core.FilePostUploader', 
/**@lends Core.FilePostUploader#*/
{
	/**
	 * Fires when each time upload progress, usefull to create a upload progress bar
	 * @name Core.FilePostUploader#progress
	 * @event
	 * @param {Core.FilePostUploader} uploader The uploader itself
	 * @param {number} loaded Amount of bytes loaded
	 * @param {number} total Total amount of bytes to load
	 */
	/**
	 * Fires when upload request got status == 200
	 * @name Core.FilePostUploader#complete
	 * @event
	 * @param {Core.FilePostUploader} uploader The uploader itself
	 */
	/**
	 * Fires when upload request got status != 200 or when there is a error while reading the file
	 * @name Core.FilePostUploader#complete
	 * @event
	 * @param {Core.FilePostUploader} uploader The uploader itself
	 */

	file: undefined,
	service: undefined,
	reader: undefined,
	request: undefined,
	binaryString: false,
	responseText: undefined,
	fileReader: undefined,
	boundary: undefined,
	method: 'POST',
	fields: undefined,

	loadedOctets: undefined,
	totalOctets: undefined,

	/**
	*	@constructs
	*	@class Helper to allow file uploading with progress report and which
	* use the best technic (FileApi, FormData, input tag) depending on the browser capabilities.
	*	@extends Core.Object
	*/
	constructor: function(config) {
		this.addEvents('progress', 'complete', 'error');
		this.fields = {};
	},

	setMethod: function(method) {
		this.method = method;
	},

	getFile: function() {
		return this.file;
	},

	setFile: function(file) {
		this.file = file;
	},

	setService: function(service) {
		this.service = service;
	},

	setField: function(name, value) {
		this.fields[name] = value;
	},

	setDestination: function(destination) {
		this.setField('destination', destination);
	},

	/**Send the file*/
	send: function() {
		/**#nocode+ Avoid Jsdoc warnings...*/
		if(this.file.fileApi != undefined) {
			if(navigator.supportFormData) {
				var formData = new FormData();
				if(this.destination == undefined)
					this.destination = this.file.getFileName();
				for(var field in this.fields) {
					formData.append(field, this.fields[field]);
				}
				formData.append("file", this.file.fileApi);
	
				this.request = new XMLHttpRequest();
				if('upload' in this.request)
					this.connect(this.request.upload, 'progress', this.onUpdateProgress);
				this.request.open(this.method, this.service);
				this.request.send(formData);
	
				var wrapper = function() {
					return arguments.callee.callback.apply(arguments.callee.scope, arguments);
				}
				wrapper.scope = this;
				wrapper.callback = this.onStateChange;
				this.request.onreadystatechange = wrapper;
			}
			else {
				this.fileReader = new FileReader();
				this.request = new XMLHttpRequest();
				if('upload' in this.request)
					this.connect(this.request.upload, 'progress', this.onUpdateProgress);
				this.request.open(this.method, this.service);

				this.boundary = '----';
                var characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
                for(var i = 0; i < 16; i++)
					this.boundary += characters[Math.floor(Math.random()*characters.length)];
				this.boundary += '----';

				this.request.setRequestHeader("Content-Type", "multipart/form-data, boundary="+this.boundary);
				this.request.setRequestHeader("Content-Length", this.file.fileApi.size);

				var wrapper = function() {
					return arguments.callee.callback.apply(arguments.callee.scope, arguments);
				}
				wrapper.scope = this;
				wrapper.callback = this.onStateChange;
				this.request.onreadystatechange = wrapper;
				
				var readerWrapper = function() {
					return arguments.callee.callback.apply(arguments.callee.scope, arguments);
				}
				readerWrapper.scope = this;
				readerWrapper.callback = this.onFileReaderLoad;
				this.fileReader.onload = readerWrapper;

				var readerErrorWrapper = function() {
					return arguments.callee.callback.apply(arguments.callee.scope, arguments);
				}
				readerErrorWrapper.scope = this;
				readerErrorWrapper.callback = this.onFileReaderError;
				this.fileReader.onerror = readerErrorWrapper;

				this.fileReader.readAsBinaryString(this.file.fileApi);
			}
		}
		else {
			this.file.form.action = this.service;

			for(var field in this.fields) {
				var fieldDrawing = document.createElement('input');
				fieldDrawing.type = 'hidden';
				fieldDrawing.setAttribute('name', field);
				destDrawing.setAttribute('value', this.fields[field]);
				this.file.form.insertBefore(fieldDrawing, this.file.form.firstChild);
			}
			this.connect(this.file.iframe, 'load', this.onIFrameLoad);
			var errorCount = 0;
			var done = false;
			while(!done && (errorCount < 5)) {
				try {
					this.file.form.submit();
					done = true;
				}
				catch(e) {
					errorCount++;
				}
			}
		}
	/**#nocode-*/
	},

	abort: function() {
		if(this.request != undefined)
			this.request.abort();
	},

	getResponseText: function() {
		return this.responseText;
	},

	getResponseJSON: function() {
		var res;
		try {
			res = JSON.parse(this.getResponseText());
		}
		catch(err) {
			res = undefined;
		}
		return res;
	},

	/**#@+
	* @private
	*/
	onStateChange: function(event) {
		if(this.request.readyState == 4) {
			if(this.request.status == 200) {
				this.responseText = this.request.responseText;
				this.fireEvent('complete', this);
			}
			else {
				this.responseText = this.request.responseText;
				this.fireEvent('error', this, this.request.status);
			}
			this.request = undefined;
		}
	},

	getTotal: function() {
		return this.totalOctets;
	},

	getLoaded: function() {
		return this.loadedOctets;
	},

	onUpdateProgress: function(event) {
		this.loadedOctets = event.loaded;
		this.totalOctets = event.total;
		this.fireEvent('progress', this, event.loaded, event.total);
	},

	onFileReaderError: function(event) {
		this.request.abort();
		this.request = undefined;
		this.fireEvent('error', this);
		this.fileReader = undefined;
	},

	onFileReaderLoad: function(event) {
		var body = '--'+this.boundary+'\r\n';
		body += "Content-Disposition: form-data; name='file'; filename='"+this.file.fileApi.name+"'\r\n";
		body += 'Content-Type: '+this.file.fileApi.type+'\r\n\r\n';
		body += event.target.result+'\r\n';
		body += '--'+this.boundary+'--';
		this.request.sendAsBinary(body);

		this.fileReader = undefined;
	},

	onIFrameLoad: function(event) {
		this.responseText = event.target.contentWindow.document.body.innerText;
		document.body.removeChild(this.file.iframe);
		this.fireEvent('complete', this);
	}
	/**#@-*/
});

