Ui.LinkButton.extend('Ui.DownloadButton', 
/** @lends Ui.DownloadButton# */
{
    /**
     * @constructs
	 * @class A DownloadButton is a button that allow to download a file when clicked.
     * @extends Ui.LinkButton
     * @param {String} [config.text] Button's text
     * @param {String} [config.icon] Icon name
     * @param {String} [config.orientation] 'vertical' or 'horizontal'
	 * @param {mixed} [config] see {@link Ui.LinkButton} constructor for more options.
     */ 
	constructor: function(config) {
		this.addEvents('download');
		this.connect(this, 'link', this.onLinkPress);
	},
	
	onLinkPress: function() {
		this.fireEvent('download', this);
	}
}, {}, {
	style: {
			background: '#a4f4a4'
	}
});

