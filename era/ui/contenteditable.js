Ui.Html.extend('Ui.ContentEditable', {
	anchorNode: null,
	anchorOffset: 0,
	
	constructor: function(config) {
		this.addEvents('anchorchange');

		this.setSelectable(true);
//		this.setFocusable(true);
		this.htmlDrawing.setAttribute('contenteditable', 'true');
//		this.getDrawing().setAttribute('contenteditable', 'true');
		this.connect(this.getDrawing(), 'keyup', this.onKeyUp);
		this.connect(this.getDrawing(), 'DOMSubtreeModified', this.onContentSubtreeModified);
	},

	onKeyUp: function(event) {
		this.testAnchorChange();
	},

	testAnchorChange: function() {
		if((window.getSelection().anchorNode != this.anchorNode) ||
			(window.getSelection().anchorOffset != this.anchorOffset)) {
			this.anchorNode = window.getSelection().anchorNode;
			this.anchorOffset = window.getSelection().anchorOffset;
			this.fireEvent('anchorchange', this);
		}
	},

	onContentSubtreeModified: function(event) {
		this.testAnchorChange();
		this.invalidateMeasure();
	}
});
	