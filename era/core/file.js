Core.Object.extend('Core.File', 
/**@lends Core.File#*/
{
	iframe: undefined,
	form: undefined,
	fileInput: undefined,

	fileApi: undefined,

	/**
	*	@constructs
	*	@class
	*	@extends Core.Object
	*/
	constructor: function(config) {
		if(config.form !== undefined) {
			this.form = config.form;
			delete(config.form);
		}
		if(config.iframe !== undefined) {
			this.iframe = config.iframe;
			delete(config.iframe);
		}
		if(config.fileInput !== undefined) {
			this.fileInput = config.fileInput;
			delete(config.fileInput);
		}
		if(config.fileApi !== undefined) {
			this.fileApi = config.fileApi;
			delete(config.fileApi);
		}
	},

	/**
	 * @description Return the short name of the file
	 */
	getFileName: function() {
		if(this.fileApi !== undefined)
			return (this.fileApi.fileName !== undefined)?this.fileApi.fileName:this.fileApi.name;
		else
			return (this.fileInput.fileName !== undefined)?this.fileInput.fileName:this.fileInput.name;
	},

	/**
	 * @description Return the relative path of the file
	 * when we do directory upload
	 */	
	getRelativePath: function() {
		var res;
		if(this.fileApi !== undefined) {
			if('relativePath' in this.fileApi)
				res = this.fileApi.relativePath;
			else if('webkitRelativePath' in this.fileApi)
				res = this.fileApi.webkitRelativePath;
			else if('mozRelativePath' in this.fileApi)
				res = this.fileApi.mozRelativePath;
		}
		if(res === '')
			res = undefined;
		return res;
	},

	/**
	 * @description Return MIME type of the file
	 */
	getMimetype: function() {
		if((this.fileApi !== undefined) && ('type' in this.fileApi))
			return this.fileApi.type;
		else
			return 'application/octet-stream';
	}
});

