Ui.Pressable.extend('Ui.Uploadable', 
/**@lends Ui.Uploadable#*/
{
	content: undefined,
	input: undefined,

	/**
	 * @constructs
	 * @class
	 * @extends Ui.LBox
	 */
	constructor: function(config) {
		this.getDrawing().style.cursor = 'pointer';

		this.setFocusable(true);
		this.setRole('button');

		this.addEvents('file');

//		if(navigator.isOpera || navigator.isFirefox3 || navigator.isIE7 || navigator.isIE8) {
//			this.input = new Ui.UploadableWrapper();
//			console.log('UploadableWrapper');
//		}
		if(navigator.iOs)
			this.input = new Ui.UploadableWrapper();
		else
			this.input = new Ui.UploadableFileWrapper();
		this.append(this.input);
		this.connect(this.input, 'file', this.onFile);

		this.connect(this, 'press', this.onPress);
	},

	setDirectoryMode: function(active) {
		this.input.setDirectoryMode(active);
	},

	/**#@+
	 * @private
	 */

	onPress: function() {
		if(Ui.UploadableFileWrapper.hasInstance(this.input)) {
			// delay the task because of the iOS thread problem
			new Core.DelayedTask({ delay: 0, scope: this, callback: this.onPressDelayed });
		}
	},
	
	onPressDelayed: function() {
		this.input.select();
	},

	onFile: function(fileWrapper, file) {
		this.fireEvent('file', this, file);
	}
	/**#@-*/
}, {
	setContent: function(content) {
		content = Ui.Element.create(content);
		if(this.content != content) {
			if(this.content != undefined)
				this.remove(this.content);
			if(content != undefined) {
				if(Ui.UploadableWrapper.hasInstance(this.input))
					this.prepend(content);
				else
					this.append(content);
			}
			this.content = content;
		}
	}
});

Ui.Element.extend('Ui.UploadableFileWrapper', 
/**@lends Ui.UploadableFileWrapper#*/
{
	formDrawing: undefined,
	inputDrawing: undefined,
	iframeDrawing: undefined,
	directoryMode: false,

	/**
	 * @constructs
	 * @class
	 * @extends Ui.Element
	 */
	constructor: function(config) {
		this.setOpacity(0);
		this.setClipToBounds(true);
		this.addEvents('file');
	},

	select: function() {
		this.inputDrawing.click();
	},

	setDirectoryMode: function(active) {
		this.directoryMode = active;
		if(this.inputDrawing != undefined) {
			if(this.directoryMode)
				this.inputDrawing.setAttribute('webkitdirectory', '');
			else
				this.inputDrawing.removeAttribute('webkitdirectory');
		}
	},

	/**#@+
	 * @private
	 */
	createInput: function() {
		this.formDrawing = document.createElement('form');
		this.formDrawing.method = 'POST';
		this.formDrawing.enctype = 'multipart/form-data';
		// needed for IE < 9
		this.formDrawing.encoding = 'multipart/form-data';
		this.formDrawing.style.position = 'absolute';
		this.formDrawing.style.zIndex = 1;

		this.inputDrawing = document.createElement('input');
		this.inputDrawing.type = 'file';
		this.inputDrawing.setAttribute('name', 'file');
		if(this.directoryMode)
			this.inputDrawing.setAttribute('webkitdirectory', '');
		this.inputDrawing.style.position = 'absolute';
		this.inputDrawing.style.zIndex = 1;

		this.connect(this.inputDrawing, 'change', this.onChange);
		this.formDrawing.appendChild(this.inputDrawing);

		if(navigator.supportFileAPI) {
			while(this.getDrawing().childNodes.length > 0)
				this.getDrawing().removeChild(this.getDrawing().childNodes[0]);
			this.getDrawing().appendChild(this.formDrawing);
			this.arrangeCore(this.getLayoutX(), this.getLayoutY(), this.getLayoutWidth(), this.getLayoutHeight());
		}
		else {
			// create an iframe now for the async POST
			// needed because browser like IE9 don't support
			// unloading the input file from the DOM (else it is cleared)
			this.iframeDrawing = document.createElement('iframe');
			this.iframeDrawing.style.position = 'absolute';
			this.iframeDrawing.style.top = '0px';
			this.iframeDrawing.style.left = '0px';
			this.iframeDrawing.style.width = '0px';
			this.iframeDrawing.style.height = '0px';
			this.iframeDrawing.style.clip = 'rect(0px 0px 0px 0px)';

			document.body.appendChild(this.iframeDrawing);
			this.iframeDrawing.contentWindow.document.write("<!DOCTYPE html><html><body></body></html>");
			this.iframeDrawing.contentWindow.document.body.appendChild(this.formDrawing);
		}
	},

	onChange: function(event) {
		event.preventDefault();
		event.stopPropagation();

		if(navigator.supportFileAPI) {
			for(var i = 0; i < this.inputDrawing.files.length; i++)
				this.fireEvent('file', this, new Core.File({ fileApi: this.inputDrawing.files[i] }));
		}
		else {
			this.disconnect(this.inputDrawing, 'change', this.onChange);
			var file = new Core.File({ iframe: this.iframeDrawing, form: this.formDrawing, fileInput: this.inputDrawing });			
			this.createInput();
			this.fireEvent('file', this, file);
		}
	}

	/**#@-*/
}, 
/**@lends Ui.UploadableFileWrapper#*/
{
	onLoad: function() {
		Ui.UploadableFileWrapper.base.onLoad.call(this);
		this.createInput();
	},

	onUnload: function() {
		this.disconnect(this.inputDrawing, 'change', this.onChange);
        if(this.iframeDrawing != undefined)
			document.body.removeChild(this.iframeDrawing);
		Ui.UploadableFileWrapper.base.onUnload.call(this);
	},
	
	arrangeCore: function(x, y, w, h) {
		if(x === undefined)
			x = 0;
		if(y === undefined)
			y = 0;
		if(w === undefined)
			w = 0;
		if(h === undefined)
			h = 0;
		Ui.UploadableFileWrapper.base.arrangeCore.call(this, x, y, w, h);
		if(this.formDrawing != undefined) {
			this.formDrawing.style.top = Math.round(x)+'px';
			this.formDrawing.style.left = Math.round(y)+'px';
			this.formDrawing.style.width = Math.round(w)+'px';
			this.formDrawing.style.height = Math.round(h)+'px';
		}
		if(this.inputDrawing != undefined) {
			this.inputDrawing.style.top = Math.round(x)+'px';
			this.inputDrawing.style.left = Math.round(y)+'px';
			this.inputDrawing.style.width = Math.round(w)+'px';
			this.inputDrawing.style.height = Math.round(h)+'px';
		}
	}
});

Ui.Element.extend('Ui.UploadableWrapper', 
/**@lends Ui.UploadableWrapper#*/
{
	formDrawing: undefined,
	inputDrawing: undefined,
	directoryMode: false,

	/**
	 * @constructs
	 * @class
	 * @extends Ui.Element
	 */
	constructor: function(config) {
		this.setClipToBounds(true);
		this.setOpacity(0);
		this.addEvents('file');
	},

	setDirectoryMode: function(active) {
	},

	/**#@+
	 * @private
	 */
	createInput: function() {

		this.formDrawing = document.createElement('form');
		this.formDrawing.method = 'POST';
		this.formDrawing.enctype = 'multipart/form-data';
		this.formDrawing.encoding = 'multipart/form-data';
		this.formDrawing.style.display = 'block';
		this.formDrawing.style.position = 'absolute';
		this.formDrawing.style.left = '0px';
		this.formDrawing.style.top = '0px';
		this.formDrawing.style.width = this.getLayoutWidth()+'px';
		this.formDrawing.style.height = this.getLayoutHeight()+'px';
		
		this.inputDrawing = document.createElement('input');
		this.inputDrawing.type = 'file';
		this.inputDrawing.name = 'file';
		this.inputDrawing.style.fontSize = '200px';
		this.inputDrawing.style.display = 'block';
		this.inputDrawing.style.cursor = 'pointer';
		this.inputDrawing.style.position = 'absolute';
		this.inputDrawing.style.left = '0px';
		this.inputDrawing.style.top = '0px';
		this.inputDrawing.style.width = this.getLayoutWidth()+'px';
		this.inputDrawing.style.height = this.getLayoutHeight()+'px';
		if(navigator.isIE7 || navigator.isIE8)
			this.inputDrawing.style.filter = 'progid:DXImageTransform.Microsoft.Alpha(Opacity=0)';
		this.formDrawing.appendChild(this.inputDrawing);

		this.connect(this.inputDrawing, 'change', this.onChange);
		
		if(navigator.isWebkit)
			this.inputDrawing.style.webkitUserSelect = 'none';
		this.connect(this.inputDrawing, 'touchstart', function(event) {
			event.dontPreventDefault = true;
		});
		this.connect(this.inputDrawing, 'touchend', function(event) {
			event.dontPreventDefault = true;
		});
		
		return this.formDrawing;
	},

	onChange: function(event) {
		if(!navigator.isOpera && navigator.supportFileAPI) {
			for(var i = 0; i < this.inputDrawing.files.length; i++)
				this.fireEvent('file', this, new Core.File({ fileApi: this.inputDrawing.files[i] }));
		}
		else {
			this.getDrawing().removeChild(this.formDrawing);

			var iframeDrawing = document.createElement('iframe');
			iframeDrawing.style.position = 'absolute';
			iframeDrawing.style.top = '0px';
			iframeDrawing.style.left = '0px';
			iframeDrawing.style.width = '0px';
			iframeDrawing.style.height = '0px';
			iframeDrawing.style.clip = 'rect(0px 0px 0px 0px)';

			document.body.appendChild(iframeDrawing);
			iframeDrawing.contentWindow.document.write("<!DOCTYPE html><html><body></body></html>");
			iframeDrawing.contentWindow.document.body.appendChild(this.formDrawing);

			this.disconnect(this.inputDrawing, 'change', this.onChange);
			this.fireEvent('file', this, new Core.File({ iframe: iframeDrawing, form: this.formDrawing, fileInput: this.inputDrawing }));

			this.getDrawing().appendChild(this.createInput());
		}
	}
	/**#@-*/
}, 
/**@lends Ui.UploadableWrapper#*/
{
	render: function() {
		return this.createInput();
	},

	arrangeCore: function(width, height) {
		this.formDrawing.style.width = Math.round(width)+'px';
		this.formDrawing.style.height = Math.round(height)+'px';
		this.inputDrawing.style.width = Math.round(width)+'px';
		this.inputDrawing.style.height = Math.round(height)+'px';
	}
});

navigator.supportFormData = true;
try {
	new FormData();
}
catch(err) {
	navigator.supportFormData = false;
}

Ui.Uploadable.testInput = document.createElement('input');
navigator.supportFileAPI = 'files' in Ui.Uploadable.testInput;
navigator.supportUploadDirectory = 'webkitdirectory' in Ui.Uploadable.testInput;
delete(Ui.Uploadable.testInput);

