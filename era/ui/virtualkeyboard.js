
Ui.LBox.extend('Ui.VirtualKeyboard', {
	bg: undefined,
	fold: undefined,

	constructor: function(config) {
		this.addEvents('open', 'close');

		this.fold = new Ui.Fold({ mode: 'extend', over: false, orientation: 'vertical' });
		this.setContent(this.fold);

		var gradient = new Ui.LinearGradient({ orientation: 'vertical', stops: [
			{ offset: 0, color: new Ui.Color({ r: 0.8, g: 0.8, b: 0.8 }) },
			{ offset: 0.01, color: new Ui.Color({ r: 0.5, g: 0.5, b: 0.5 }) },
			{ offset: 0.2, color: new Ui.Color({ r: 0.4, g: 0.4, b: 0.4 }) },
			{ offset: 1, color: new Ui.Color({ r: 0.2, g: 0.2, b: 0.2 }) }
		] });
		var lbox = new Ui.LBox();
		this.fold.setContent(lbox);
		this.bg = new Ui.Rectangle({ fill: gradient });
		lbox.append(this.bg);

		var vbox = new Ui.VBox({ margin: 10, spacing: 5, horizontalAlign: 'center', uniform: true, height: 200 });
		lbox.append(vbox);

		var hbox = new Ui.HBox();
		vbox.append(hbox, true);
		var line = 'AZERTYUIOP';
		for(var i = 0; i < line.length; i++) {
			var character = line.charAt(i);
			var button = new Ui.VirtualKeyboardKey({ text: character, key: character, focusable: false, width: 60 });
			this.connect(button, 'press', this.onKeyPress);
			hbox.append(button);
		}
		var button = new Ui.VirtualKeyboardKey({ text: 'backspace', width: 100 });
		hbox.append(button, true);

		hbox = new Ui.HBox({ marginLeft: 20 });
		vbox.append(hbox, true);
		line = 'QSDFGHJKLM';
		for(var i = 0; i < line.length; i++) {
			var character = line.charAt(i);
			var button = new Ui.VirtualKeyboardKey({ text: character, key: character, focusable: false, width: 60 });
			this.connect(button, 'press', this.onKeyPress);
			hbox.append(button);
		}
		var button = new Ui.VirtualKeyboardKey({ text: 'retour', width: 100 });
		hbox.append(button, true);

		hbox = new Ui.HBox();
		vbox.append(hbox, true);
		var button = new Ui.VirtualKeyboardKey({ text: 'shift', width: 60 });
		hbox.append(button, true);
		line = 'WXCVBN?!\'';
		for(var i = 0; i < line.length; i++) {
			var character = line.charAt(i);
			var button = new Ui.VirtualKeyboardKey({ text: character, key: character, focusable: false, width: 60 });
			this.connect(button, 'press', this.onKeyPress);
			hbox.append(button);
		}
		var button = new Ui.VirtualKeyboardKey({ text: 'shift', width: 60 });
		hbox.append(button, true);

		hbox = new Ui.HBox();
		vbox.append(hbox, true);
		var button = new Ui.VirtualKeyboardKey({ text: '.?123', width: 100 });
		hbox.append(button, false);
		var button = new Ui.VirtualKeyboardKey({ text: '' });
		hbox.append(button, true);
		var button = new Ui.VirtualKeyboardKey({ text: '.?123', width: 100 });
		hbox.append(button, false);
		var button = new Ui.VirtualKeyboardKey({ icon: 'arrowbottom', width: 60 });
		hbox.append(button, false);
		this.connect(button, 'press', this.close);
	},

	open: function() {
		this.fold.unfold();
		this.fireEvent('open', this);
	},

	close: function() {
		this.fold.fold();
		this.fireEvent('close', this);
	},

	onKeyPress: function(key) {
		console.log('onKeyPress '+key.getKey()+', focus: '+Ui.App.current.getFocusElement()+', code: '+key.getKey().charCodeAt(0));

		var focusElement = Ui.App.current.getFocusElement();
		if(focusElement != undefined) {
			var charCode = key.getKey().charCodeAt(0);
			var event;
			if('TextEvent' in window) {
				event = document.createEvent('TextEvent');
				event.initTextEvent('textInput', true, true, window, key.getKey(), TextEvent.DOM_INPUT_METHOD_KEYBOARD, '');
			}
			else {
				event = document.createEvent('KeyboardEvent');
				if('initKeyboardEvent' in event)
				event.initKeyboardEvent('keypress', true, true, window, 'U+0041', KeyboardEvent.DOM_KEY_LOCATION_STANDARD , '');
				else
					event.initKeyEvent('keypress', true, true, window, false, false, false, false, charCode, charCode);
			}
			focusElement.dispatchEvent(event);
		}
	}
});

Ui.Button.extend('Ui.VirtualKeyboardKey', {
	key: undefined,

	constructor: function(config) {
	},

	setKey: function(key) {
		this.key = key;
	},

	getKey: function() {
		return this.key;
	}
});

