Ui.Button.extend('Ui.UploadButton', 
/**@lends Ui.UploadButton#*/
{
	input: undefined,

	/**
	 * @constructs
	 * @class
	 * @extends Ui.Button
	 */
	constructor: function(config) {
		this.addEvents('file');

		this.input = new Ui.UploadableFileWrapper();
		if(navigator.supportDrag)
			this.prepend(this.input);
		else
			this.append(this.input);
		this.connect(this.input, 'file', this.onFile);
		this.connect(this, 'press', this.onUploadButtonPress);

		this.getDropBox().addMimetype('files');
		this.connect(this.getDropBox(), 'dropfile', this.onFile);
	},

	setDirectoryMode: function(active) {
		this.input.setDirectoryMode(active);
	},

	onUploadButtonPress: function() {
		this.input.select();
	},

	onFile: function(fileWrapper, file) {
		this.fireEvent('file', this, file);
	}
});
