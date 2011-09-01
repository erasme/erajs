Core.Object.extend('Core.FilePostUploader', 
/**@lends Core.FilePostUploader#*/
{
	file: undefined,
	destination: undefined,
	service: undefined,
	reader: undefined,
	request: undefined,
	binaryString: false,
	responseText: undefined,
	fileReader: undefined,
	boundary: undefined,

	/**
	*	@constructs
	*	@class
	*	@extends Core.Object
	*/
	constructor: function(config) {
		this.addEvents('progress', 'complete', 'error');

		if(config.file != undefined)
			this.file = config.file;
		if(config.service != undefined)
			this.setService(config.service);
		if(config.destination != undefined)
			this.setDestination(config.destination);
	},

	getFile: function() {
		return this.file;
	},

	setService: function(service) {
		this.service = service;
	},

	setDestination: function(destination) {
		this.destination = destination;
	},

	send: function() {
		if(this.file.fileApi != undefined) {
			if(navigator.supportFormData) {
				var formData = new FormData();
				if(this.destination == undefined)
					this.destination = this.file.getFileName();
				formData.append("destination", this.destination);
				formData.append("file", this.file.fileApi);
	
				this.request = new XMLHttpRequest();
				if('upload' in this.request)
					this.connect(this.request.upload, 'progress', this.onUpdateProgress);
				this.request.open("POST", this.service);
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
				this.request.open("POST", this.service);

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
	},

	getResponseText: function() {
		return this.responseText;
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
			else
				this.fireEvent('error', this, this.request.status);
			this.request = undefined;
		}
	},

	onUpdateProgress: function(event) {
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

