
Core.Object.extend('Core.File', {
	iframe: undefined,
	form: undefined,
	fileInput: undefined,

	fileApi: undefined,

	constructor: function(config) {
		if(config.form != undefined)
			this.form = config.form;
		if(config.iframe != undefined)
			this.iframe = config.iframe;
		if(config.fileInput != undefined)
			this.fileInput = config.fileInput;
		if(config.fileApi != undefined)
			this.fileApi = config.fileApi;
	},

	getFileName: function() {
		if(this.fileApi != undefined)
			return (this.fileApi.fileName != undefined)?this.fileApi.fileName:this.fileApi.name;
		else
			return (this.fileInput.fileName != undefined)?this.fileInput.fileName:this.fileInput.name;
	},

	getMimetype: function() {
	},

	getFilePostUploader: function() {
	}
});

