
Ui.Element.extend('Ui.Entry', {
	text: '',
	entryDrawing: undefined,
	cursorDrawing: undefined,
	cursorPos: 0,
	selectStart: undefined,
	textOffset: 6,

	constructor: function(config) {
		if(config.text != undefined)
			this.setText(config.text);
		if(config.fontSize != undefined)
			this.setFontSize(config.fontSize);
		if(config.fontFamily != undefined)
			this.setFontFamily(config.fontFamily);
		if(config.fontWeight != undefined)
			this.setFontWeight(config.fontWeight);

		this.setFocusable(true);
		this.setRole('textbox');

		this.connect(this, 'focus', this.onFocus);
		this.connect(this, 'blur', this.onBlur);

		this.connect(this, 'mousedown', this.onMouseDown);
		this.connect(this, 'keypress', this.onKeyPress);
		this.connect(this, 'keydown', this.onKeyDown);
	},

	getText: function() {
		return this.text;
	},

	setText: function(text) {
		if(this.text != text) {
			this.text = text;
			if(this.cursorPos > text.length)
				this.cursorPos = text.length;
			this.invalidateMeasure();
			this.invalidateRender();
		}
	},

	setFontSize: function(fontSize) {
		this.setStyleProperty('font-size', fontSize+'px');
		this.invalidateRender();
		this.invalidateMeasure();
	},

	getFontSize: function() {
		return new Number(this.getComputedStyleProperty('font-size').replace(/px$/, ''));
	},

	setFontFamily: function(fontFamily) {
		this.setStyleProperty('font-family', fontFamily);
		this.invalidateRender();
		this.invalidateMeasure();
	},

	getFontFamily: function() {
		return this.getComputedStyleProperty('font-family');
	},

	setFontWeight: function(fontWeight) {
		this.setStyleProperty('font-weight', fontWeight);
		this.invalidateRender();
		this.invalidateMeasure();
	},

	getFontWeight: function() {
		return this.getComputedStyleProperty('font-weight');
	},

	//
	// Private
	//

	onMouseDown: function(mouse, button) {
		if(button != 0)
			return;

		var pos = mouse.getPosition(this);
		console.log('onMouseDown '+pos.x+','+pos.y);

		this.selectStart = undefined;

		mouse.capture(this);
		this.connect(this, 'mousemove', this.onMouseMove);
		this.connect(this, 'mouseup', this.onMouseUp);

		// search for the position in the text
		if(this.text.length != 0) {
			var point = Ui.App.current.svgRoot.createSVGPoint();
			point.x = pos.x;
			point.y = pos.y;
//			point.dump();
			var charPos = this.textDrawing.getCharNumAtPosition(point);
			console.log('over: '+charPos);
			if(charPos == -1) {

				console.log('over: '+charPos+', pos.x: '+pos.x+', 0 start: '+this.textDrawing.getStartPositionOfChar(0).x);

				if(pos.x <= this.textDrawing.getStartPositionOfChar(0).x)
					this.cursorPos = 0;
				else
					this.cursorPos = this.text.length;
			}
			else {
				var start = this.textDrawing.getStartPositionOfChar(charPos).x;
				var end = this.textDrawing.getEndPositionOfChar(charPos).x;
				if(pos.x < (start + end)/2)
					this.cursorPos = charPos;
				else
					this.cursorPos = charPos+1;
			}
			console.log('cursorPos: '+this.cursorPos);
		}
		this.focus();
		this.invalidateArrange();
	},

	onMouseMove: function(mouse) {
		console.log('onMouseMove');
		var cursorPos;
		var pos = mouse.getPosition(this);
		if(this.text.length != 0) {
			var point = Ui.App.current.svgRoot.createSVGPoint();
			point.x = pos.x;
			point.y = pos.y;
			var charPos = this.textDrawing.getCharNumAtPosition(point);
			console.log('over: '+charPos);
			if(charPos == -1) {
				console.log('over: '+charPos+', pos.x: '+pos.x+', 0 start: '+this.textDrawing.getStartPositionOfChar(0).x);
				if(pos.x <= this.textDrawing.getStartPositionOfChar(0).x)
					cursorPos = 0;
				else
					cursorPos = this.text.length;
			}
			else {
				var start = this.textDrawing.getStartPositionOfChar(charPos).x;
				var end = this.textDrawing.getEndPositionOfChar(charPos).x;
				if(pos.x < (start + end)/2)
					cursorPos = charPos;
				else
					cursorPos = charPos+1;
			}
			console.log('cursorPos: '+cursorPos);
		}

		if(cursorPos != this.cursorPos) {
			if(this.selectStart == undefined) {
				this.selectStart = this.cursorPos;
				this.stopBlink();
			}
			this.cursorPos = cursorPos;
			this.invalidateArrange();
		}
	},

	onMouseUp: function(mouse, button) {
		if(button != 0)
			return;
		console.log('onMouseUp');
		this.disconnect(this, 'mousemove');
		this.disconnect(this, 'mouseup');
		mouse.release();
	},

	onKeyPress: function(keyboard, character) {
		console.log('onKeyPress: '+character+' pos: '+this.cursorPos+' length: '+this.text.length);

		this.deleteSelection();

		// convert space to unsecable char
		if(character == ' ')
			character = String.fromCharCode(160);

		var text = this.text;
		if(this.cursorPos == text.length) {
			text += character;
			console.log('insert last: '+character+', str: '+this.text);
		}
		else {
			var beforestr = text.slice(0,this.cursorPos);
			var afterstr = text.slice(this.cursorPos);

			console.log('before: '+beforestr+', after: '+afterstr);

			text = beforestr + character + afterstr;
		}
		this.setText(text);
		this.cursorPos++;
	},

	onKeyDown: function(keyboard, key) {
		console.log('onKeyDown: '+key);
		// arrow left
		if(key == 37) {
			if(keyboard.getShiftKey()) {
				if(this.selectStart == undefined) {
					this.selectStart = this.cursorPos;
					this.stopBlink();
				}
			}
			else {
				this.selectStart = undefined;
				this.startBlink();
			}

			if(this.cursorPos >= 1) {
				this.cursorPos--;
				this.invalidateArrange();
			}
		}
		// arrow right
		else if(key == 39) {
			if(keyboard.getShiftKey()) {
				if(this.selectStart == undefined) {
					this.selectStart = this.cursorPos;
					this.stopBlink();
				}
			}
			else {
				this.selectStart = undefined;
				this.startBlink();
			}

			if(this.cursorPos < this.text.length) {
				this.cursorPos++;
				this.invalidateArrange();
			}
		}
		// backspace
		else if(key == 8) {
			if(this.selectStart != undefined)
				this.deleteSelection();
			else {
				if(this.cursorPos >= 1) {
					var beforestr = this.text.slice(0,this.cursorPos-1);
					var afterstr = this.text.slice(this.cursorPos);
					this.cursorPos--;
					this.invalidateArrange();
					this.setText(beforestr + afterstr);
				}
			}
		}
		// delete
		else if(key == 46) {
			if(this.selectStart != undefined)
				this.deleteSelection();
			else {
				if(this.cursorPos < this.text.length) {
					var beforestr = this.text.slice(0,this.cursorPos);
					var afterstr = this.text.slice(this.cursorPos+1);
					this.cursorPos;
					this.invalidateArrange();
					this.setText(beforestr + afterstr);
				}
			}
		}
		// home
		else if(key == 36) {
			if(keyboard.getShiftKey()) {
				if(this.selectStart == undefined) {
					this.selectStart = this.cursorPos;
					this.stopBlink();
				}
			}
			else {
				this.selectStart = undefined;
				this.startBlink();
			}
			this.cursorPos = 0;
			this.invalidateArrange();
		}
		// end line
		else if(key == 35) {
			if(keyboard.getShiftKey()) {
				if(this.selectStart == undefined) {
					this.selectStart = this.cursorPos;
					this.stopBlink();
				}
			}
			else {
				this.selectStart = undefined;
				this.startBlink();
			}
			this.cursorPos = this.text.length;
			this.invalidateArrange();
		}
	},

	onFocus: function() {
		this.cursorDrawing.setAttributeNS(null, 'visibility', 'visible');
		this.startBlink();
	},

	onBlur: function() {
		this.stopBlink();
		this.cursorDrawing.setAttributeNS(null, 'visibility', 'hidden');
	},

	startBlink: function() {
		if(this.cursorClock == undefined) {
			var timeline = new Anim.Timeline({ duration: 1.0, target: this.cursorDrawing, repeat: 'forever',
				callback: function(clock, progress) {
					var opacity = (progress > 0.5)?1:0;
					this.setAttributeNS(null, 'opacity', opacity);
				}
			});
			this.cursorClock = timeline.begin();
		}
	},

	stopBlink: function() {
		if(this.cursorClock != undefined) {
			this.cursorClock.stop();
			this.cursorClock = undefined;
		}
	},

	deleteSelection: function() {
		if(this.selectStart != undefined) {
			var start;
			var end;
			if(this.selectStart < this.cursorPos) {
				start = this.selectStart;
				end = this.cursorPos;
			}
			else {
				start = this.cursorPos;
				end = this.selectStart;
			}
			var beforestr = this.text.slice(0,start);
			var afterstr = this.text.slice(end);
			this.cursorPos = start;
			this.selectStart = undefined;
			this.invalidateArrange();
			this.startBlink();
			this.setText(beforestr + afterstr);
		}
	},

}, {
	render: function() {
		this.entryDrawing = document.createElementNS(svgNS, 'g');

		var clipPath = document.createElementNS(svgNS, 'clipPath');
		var clipPathId = Core.Util.generateId();
		clipPath.setAttributeNS(null, 'id', clipPathId);
		this.entryDrawing.appendChild(clipPath);

		this.clipDrawing = document.createElementNS(svgNS, 'rect');
		this.clipDrawing.setAttributeNS(null, 'rx', 4);
		this.clipDrawing.setAttributeNS(null, 'ry', 4);
		clipPath.appendChild(this.clipDrawing);

		this.background1Drawing = document.createElementNS(svgNS, 'rect');
		this.background1Drawing.setAttributeNS(null, 'class', 'ui-entry-bg1');
		this.background1Drawing.setAttributeNS(null, 'rx', 8);
		this.background1Drawing.setAttributeNS(null, 'ry', 8);
		this.entryDrawing.appendChild(this.background1Drawing);

		this.background2Drawing = document.createElementNS(svgNS, 'rect');
		this.background2Drawing.setAttributeNS(null, 'class', 'ui-entry-bg2');
		this.background2Drawing.setAttributeNS(null, 'rx', 5);
		this.background2Drawing.setAttributeNS(null, 'ry', 5);
		this.entryDrawing.appendChild(this.background2Drawing);

		this.background3Drawing = document.createElementNS(svgNS, 'rect');
		this.background3Drawing.setAttributeNS(null, 'class', 'ui-entry-bg3');
		this.background3Drawing.setAttributeNS(null, 'rx', 4);
		this.background3Drawing.setAttributeNS(null, 'ry', 4);
		this.entryDrawing.appendChild(this.background3Drawing);

		this.cursorDrawing = document.createElementNS(svgNS, 'rect');
		this.cursorDrawing.setAttributeNS(null, 'class', 'ui-entry-cursor');
		this.cursorDrawing.setAttributeNS(null, 'clip-path', 'url(#'+clipPathId+')');
		this.cursorDrawing.setAttributeNS(null, 'width', 1);
		this.cursorDrawing.setAttributeNS(null, 'visibility', 'hidden');
		this.entryDrawing.appendChild(this.cursorDrawing);

		this.textDrawing = document.createElementNS(svgNS, 'text');
		if(navigator.isWebkit)
			this.textDrawing.style.webkitUserSelect = 'none';
		this.textDrawing.style.pointerEvents = 'none';
		this.textDrawing.setAttributeNS(null, 'clip-path', 'url(#'+clipPathId+')');
		this.entryDrawing.appendChild(this.textDrawing);

		return this.entryDrawing;
	},

	measureCore: function(width, height, force) {
		return { width: 8, height: 8 + (this.getFontSize() * 4 / 3) };
	},

	arrangeCore: function(width, height) {
//		console.log('entry.arrangeCore');

		this.background1Drawing.setAttributeNS(null, 'x', 1);
		this.background1Drawing.setAttributeNS(null, 'y', 1);
		this.background1Drawing.setAttributeNS(null, 'width', width-2);
		this.background1Drawing.setAttributeNS(null, 'height', height-2);

		this.background2Drawing.setAttributeNS(null, 'x', 3);
		this.background2Drawing.setAttributeNS(null, 'y', 3);
		this.background2Drawing.setAttributeNS(null, 'width', width-6);
		this.background2Drawing.setAttributeNS(null, 'height', height-6);

		this.background3Drawing.setAttributeNS(null, 'x', 4);
		this.background3Drawing.setAttributeNS(null, 'y', 4);
		this.background3Drawing.setAttributeNS(null, 'width', width-8);
		this.background3Drawing.setAttributeNS(null, 'height', height-8);

		this.clipDrawing.setAttributeNS(null, 'x', 4);
		this.clipDrawing.setAttributeNS(null, 'y', 4);
		this.clipDrawing.setAttributeNS(null, 'width', width-8);
		this.clipDrawing.setAttributeNS(null, 'height', height-8);

		var cursorOffset = 6;
		if(this.text != '') {
				if(this.cursorPos >= this.text.length)
					cursorOffset = this.textDrawing.getEndPositionOfChar(this.text.length-1).x;
				else
					cursorOffset = this.textDrawing.getStartPositionOfChar(this.cursorPos).x;
			console.log('cursor pos: '+this.cursorPos+', ofs: '+cursorOffset);
		}

		if(cursorOffset > width - 6) {
			this.textOffset += (width - 6) - cursorOffset;
			cursorOffset = width - 6;
			console.log('too long, activate textOffset: '+this.textOffset);
		}
		else if(cursorOffset < 6) {
			this.textOffset += 6 - cursorOffset;
			cursorOffset = 6;
			console.log('too small, activate textOffset: '+this.textOffset+', pos: '+this.cursorPos);
		}

		var fontSize = this.getFontSize();
		this.textDrawing.setAttributeNS(null, 'y', fontSize + (height - (fontSize * 4 / 3)) / 2);
		this.textDrawing.setAttributeNS(null, 'x', this.textOffset);

		var cursorHeight = fontSize;
		this.cursorDrawing.setAttributeNS(null, 'y', (height - cursorHeight)/2);
		this.cursorDrawing.setAttributeNS(null, 'height', cursorHeight);
		if(this.selectStart == undefined) {
			this.cursorDrawing.setAttributeNS(null, 'x', cursorOffset);
			this.cursorDrawing.setAttributeNS(null, 'width', 1);
		}
		else {
			startOffset = 6;
			if(this.selectStart >= this.text.length)
				startOffset = this.textDrawing.getEndPositionOfChar(this.text.length-1).x;
			else
				startOffset = this.textDrawing.getStartPositionOfChar(this.selectStart).x;
			if(startOffset < cursorOffset) {
				this.cursorDrawing.setAttributeNS(null, 'x', startOffset);
				this.cursorDrawing.setAttributeNS(null, 'width', cursorOffset - startOffset);
			}
			else {
				this.cursorDrawing.setAttributeNS(null, 'x', cursorOffset);
				this.cursorDrawing.setAttributeNS(null, 'width', startOffset - cursorOffset);
			}
		}
	},

	updateRenderCore: function() {
		this.textDrawing.setAttributeNS(null, 'font-family', this.getFontFamily());
		this.textDrawing.setAttributeNS(null, 'font-weight', this.getFontWeight());
		this.textDrawing.setAttributeNS(null, 'font-size', this.getFontSize());
		this.textDrawing.textContent = this.text;
	},
});
