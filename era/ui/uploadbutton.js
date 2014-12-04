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
//		if(navigator.iOs)
//			this.append(this.input);
//		else
			this.prepend(this.input);

		this.connect(this.input, 'file', this.onFile);
		this.connect(this, 'press', this.onUploadButtonPress);

		this.getDropBox().addType('files', 'copy');
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
