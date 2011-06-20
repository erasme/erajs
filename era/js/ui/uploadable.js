//
// Define the Uploadable class.
//
Ui.LBox.extend('Ui.Uploadable', {
	isDown: false,
	content: undefined,
	input: undefined,

	constructor: function(config) {
		this.getDrawing().style.cursor = 'pointer';

		this.setFocusable(true);
		this.setRole('button');

		this.addEvents('file', 'down', 'up');

		if(navigator.isOpera)
			this.input = new Ui.UploadableWrapper();
		else
			this.input = new Ui.UploadableFileWrapper();
		this.append(this.input);
		this.connect(this.input, 'file', this.onFile);

		// handle mouse
		this.connect(this.getDrawing(), 'mousedown', this.onMouseDown);

		// handle touches
		this.connect(this.getDrawing(), 'touchstart', this.onTouchStart);
		this.connect(this.getDrawing(), 'touchmove', this.onTouchMove);
		this.connect(this.getDrawing(), 'touchend', this.onTouchEnd);

		// handle keyboard
		this.connect(this.getDrawing(), 'keydown', this.onKeyDown);
		this.connect(this.getDrawing(), 'keyup', this.onKeyUp);
	},

	setContent: function(content) {
		if(this.content != content) {
			if(this.content != undefined)
				this.remove(this.content);
			if(content != undefined) {
				if(navigator.isOpera)
					this.prepend(content);
				else
					this.append(content);
			}
			this.content = content;
		}
	},

	getFilePostUploader: function() {
		return this.input.getFilePostUploader();
	},


	//
	// Private
	//

	onMouseDown: function(event) {
		if((event.button != 0) || this.getIsDisabled())
			return;

		event.preventDefault();
		event.stopPropagation();

		this.mouseStartX = event.screenX;
		this.mouseStartY = event.screenY;

		if('attachEvent' in this.getDrawing()) {
			this.connect(this.getDrawing(), 'mousemove', this.onMouseMove, true);
			this.connect(this.getDrawing(), 'mouseup', this.onMouseUp, true);
		}
		else {
			this.connect(window, 'mousemove', this.onMouseMove, true);
			this.connect(window, 'mouseup', this.onMouseUp, true);
		}

		this.onDown();
	},

	onMouseMove: function(event) {
		var deltaX = event.screenX - this.mouseStartX;
		var deltaY = event.screenY - this.mouseStartY;
		var delta = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

		event.preventDefault();
		event.stopPropagation();

		// if the user move to much, release the touch event
		if(delta > 10) {
			this.onUp();

			if('createEvent' in document) {
				this.disconnect(this.getDrawing(), 'mousedown', this.onMouseDown);

				var mouseDownEvent = document.createEvent('MouseEvents');
				mouseDownEvent.initMouseEvent('mousedown', true, true, window, 1, event.screenX, event.screenY,
					event.clientX, event.clientY,
					event.ctrlKey, event.altKey, event.shiftKey,
					event.metaKey, 0, event.target);
				event.target.dispatchEvent(mouseDownEvent);

				this.connect(this.getDrawing(), 'mousedown', this.onMouseDown);
			}
		}
	},

	getIsDown: function() {
		return this.isDown;
	},

	onMouseUp: function(event) {
		if(!this.isDown)
			return;

		event.preventDefault();
		event.stopPropagation();
		if(event.button == 0) {
			this.onUp();
			this.onPress();
			this.focus();
		}
	},

	onTouchStart: function(event) {
		if(this.getIsDisabled())
			return;
		if(this.isDown) {
			this.onUp();
			return;
		}
		if(event.targetTouches.length != 1)
			return;

		event.preventDefault();
		event.stopPropagation();

		this.touchStartX = event.targetTouches[0].screenX;
		this.touchStartY = event.targetTouches[0].screenY;
		this.onDown();
	},

	onTouchMove: function(event) {
		if(!this.isDown)
			return;
		
		var deltaX = event.targetTouches[0].screenX - this.touchStartX;
		var deltaY = event.targetTouches[0].screenY - this.touchStartY;
		var delta = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

		// if the user move to much, release the touch event
		if(delta > 10) {
			this.onUp();

			this.disconnect(this.getDrawing(), 'touchstart', this.onTouchStart);

			var touchStartEvent = document.createEvent('TouchEvent');
			touchStartEvent.initTouchEvent('touchstart', true, true, window, 0, 0, 0, 0, 0,
				event.ctrlKey, event.altKey, event.shiftKey,
				event.metaKey, event.touches,
				event.targetTouches, event.changedTouches, event.scale, event.rotation);
			event.target.dispatchEvent(touchStartEvent);

			this.connect(this.getDrawing(), 'touchstart', this.onTouchStart);
		}

		event.preventDefault();
		event.stopPropagation();
	},
	
	onTouchEnd: function(event) {
		if(!this.isDown)
			return;

		event.preventDefault();
		event.stopPropagation();
		this.onUp();
		this.onPress();
		this.focus();
	},

	onKeyDown: function(event) {
		var key = event.which;
		if((key == 13) && !this.getIsDisabled()) {
			event.preventDefault();
			event.stopPropagation();
			this.onDown();
		}
	},

	onKeyUp: function(event) {
		var key = event.which;
		if((key == 13) && !this.getIsDisabled()) {
			event.preventDefault();
			event.stopPropagation();
			this.onUp();
			this.onPress();
		}
	},

	onDown: function() {
		this.isDown = true;
		this.focus();
		this.fireEvent('down', this);
	},

	onUp: function() {
		if('attachEvent' in this.getDrawing()) {
			this.disconnect(this.getDrawing(), 'mousemove', this.onMouseMove);
			this.disconnect(this.getDrawing(), 'mouseup', this.onMouseUp);
		}
		else {
			this.disconnect(window, 'mousemove', this.onMouseMove);
			this.disconnect(window, 'mouseup', this.onMouseUp);
		}
 		this.isDown = false;
		this.fireEvent('up', this);
	},

	onPress: function() {
		if(!navigator.isOpera)
			this.input.select();
	},

	onFile: function(fileWrapper, file) {
		this.fireEvent('file', this, file);
	}
});

Ui.Element.extend('Ui.UploadableFileWrapper', {
	formDrawing: undefined,
	inputDrawing: undefined,
	iframeDrawing: undefined,

	constructor: function(config) {
		this.setVerticalAlign('top');
		this.setHorizontalAlign('left');
		this.setClipToBounds(true);
		this.addEvents('file');
	},

	select: function() {
		this.inputDrawing.click();
	},

	getFilePostUploader: function() {
		this.disconnect(this.inputDrawing, 'change', this.onChange);
		var form = this.formDrawing;
		var iframe = this.iframeDrawing;
		this.createInput();
		return new Ui.FilePostUploader({ form: form, iframe: iframe });
	},

	//
	// Private
	//
	createInput: function() {
		this.iframeDrawing = document.createElement('iframe');
		this.iframeDrawing.style.position = 'absolute';
		this.iframeDrawing.style.top = '0px';
		this.iframeDrawing.style.left = '0px';
		this.iframeDrawing.style.width = '0px';
		this.iframeDrawing.style.height = '0px';
		this.iframeDrawing.style.clip = 'rect(0px 0px 0px 0px)';

		document.body.appendChild(this.iframeDrawing);

		this.iframeDrawing.contentWindow.document.write("<!DOCTYPE html><html><body></body></html>");

		this.formDrawing = document.createElement('form');
		this.formDrawing.method = 'POST';
		this.formDrawing.enctype = 'multipart/form-data';
		this.formDrawing.style.display = 'block';
		this.formDrawing.style.position = 'absolute';
		this.formDrawing.style.left = '0px';
		this.formDrawing.style.top = '0px';
		this.formDrawing.style.width = '0px';
		this.formDrawing.style.height = '0px';

		this.iframeDrawing.contentWindow.document.body.appendChild(this.formDrawing);

		this.inputDrawing = document.createElement('input');
		this.inputDrawing.type = 'file';
		this.inputDrawing.name = 'file';
		this.inputDrawing.style.display = 'block';
		this.inputDrawing.style.position = 'absolute';
		this.inputDrawing.style.left = '0px';
		this.inputDrawing.style.top = '0px';
		this.inputDrawing.style.width = '0px';
		this.inputDrawing.style.height = '0px';
		this.formDrawing.appendChild(this.inputDrawing);

		this.connect(this.inputDrawing, 'change', this.onChange);
	},

	onChange: function(event) {
		event.preventDefault();
		event.stopPropagation();

		if('files' in this.inputDrawing) {
			for(var i = 0; i < this.inputDrawing.files.length; i++)
				this.fireEvent('file', this, new Core.File({ fileApi: this.inputDrawing.files[i] }));
		}
		else {
			this.disconnect(this.inputDrawing, 'change', this.onChange);
			this.fireEvent('file', this, new Core.File({ iframe: this.iframeDrawing, form: this.formDrawing, fileInput: this.inputDrawing }));
			this.createInput();
		}

//		Core.Object.dump(this.inputDrawing);
//		Core.Object.dump(this.getDrawing().files);
//		this.fireEvent('file', this, this.inputDrawing.files);
	}
}, {
	onLoad: function() {
		Ui.UploadableFileWrapper.base.onLoad.call(this);
		this.createInput();
	},

	onUnload: function() {
		this.disconnect(this.inputDrawing, 'change', this.onChange);
		document.body.removeChild(this.iframeDrawing);
		Ui.UploadableFileWrapper.base.onUnload.call(this);
	}
});

Ui.Element.extend('Ui.UploadableWrapper', {
	formDrawing: undefined,
	inputDrawing: undefined,

	constructor: function(config) {
		this.setOpacity(0);
		this.addEvents('file');
	},

	getFilePostUploader: function() {
		this.disconnect(this.inputDrawing, 'change', this.onChange);
		var form = this.formDrawing;
		this.getDrawing().removeChild(this.formDrawing);

		var iframe = document.createElement('iframe');
		iframe.style.position = 'absolute';
		iframe.style.top = '0px';
		iframe.style.left = '0px';
		iframe.style.width = '0px';
		iframe.style.height = '0px';
		iframe.style.clip = 'rect(0px 0px 0px 0px)';

		document.body.appendChild(iframe);

		iframe.contentWindow.document.write("<!DOCTYPE html><html><body></body></html>");
		iframe.contentWindow.document.body.appendChild(form);

		this.getDrawing().appendChild(this.createInput());

		return new Ui.FilePostUploader({ form: form, iframe: iframe });
	},

	//
	// Private
	//
	createInput: function() {
		this.formDrawing = document.createElement('form');
		this.formDrawing.method = 'POST';
		this.formDrawing.enctype = 'multipart/form-data';
		this.formDrawing.style.display = 'block';
		this.formDrawing.style.position = 'absolute';
		this.formDrawing.style.left = '0px';
		this.formDrawing.style.top = '0px';
		this.formDrawing.style.width = this.getLayoutWidth()+'px';
		this.formDrawing.style.height = this.getLayoutHeight()+'px';

		this.inputDrawing = document.createElement('input');
		this.inputDrawing.type = 'file';
		this.inputDrawing.name = 'file';
		this.inputDrawing.style.display = 'block';
		this.inputDrawing.style.cursor = 'pointer';
		this.inputDrawing.style.position = 'absolute';
		this.inputDrawing.style.left = '0px';
		this.inputDrawing.style.top = '0px';
		this.inputDrawing.style.width = this.getLayoutWidth()+'px';
		this.inputDrawing.style.height = this.getLayoutHeight()+'px';
		this.formDrawing.appendChild(this.inputDrawing);

		this.connect(this.inputDrawing, 'change', this.onChange);

		return this.formDrawing;
	},

	onChange: function(event) {
		if('files' in this.inputDrawing) {
			for(var i = 0; i < this.inputDrawing.files.length; i++)
				this.fireEvent('file', this, new Core.File({ fileApi: this.inputDrawing.files[i] }));
		}
		else {
			this.disconnect(this.inputDrawing, 'change', this.onChange);
			this.fireEvent('file', this, new Core.File({ iframe: this.iframeDrawing, form: this.formDrawing, fileInput: this.inputDrawing }));
			this.createInput();
		}

//		this.fireEvent('file', this, this.inputDrawing.files);
	}
}, {
	render: function() {
		return this.createInput();
	},

	arrangeCore: function(width, height) {
		this.formDrawing.style.width = width+'px';
		this.formDrawing.style.height = height+'px';
		this.inputDrawing.style.width = width+'px';
		this.inputDrawing.style.height = height+'px';
	}
});

Core.Object.extend('Ui.FilePostUploader', {
	iframe: undefined,
	destination: undefined,
	service: undefined,
	form: undefined,
	inputDestination: undefined,

	constructor: function(config) {
		this.form = config.form;
		this.iframe = config.iframe;

		this.addEvents('complete');

		if(config.service != undefined)
			this.setService(config.service);
//		if(config.destination != undefined)
//			this.setDestination(config.destination);
	},

	getFileName: function() {
//		Core.Object.dump(this.inputFile);
	},

	getMimetype: function() {
	},

	setService: function(service) {
		this.service = service;
		this.form.action = this.service;
	},

	setDestination: function(destination) {
		this.destination = destination;
//		this.inputDestination.value = this.destination;
	},

	send: function() {
		this.connect(this.iframe, 'load', this.onIFrameLoad);

		var errorCount = 0;
		var done = false;
		while(!done && (errorCount < 5)) {
			try {
				this.form.submit();
				done = true;
			}
			catch(e) {
				errorCount++;
			}
		}
	},

	onIFrameLoad: function(event) {
		console.log('iframe loaded');
		document.body.removeChild(this.iframe);
		this.fireEvent('complete');
	}
});


