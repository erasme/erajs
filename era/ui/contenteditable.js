
Ui.Element.extend('Ui.ContentEditable', {
	html: undefined,
	anchorNode: null,
	anchorOffset: 0,
	
	constructor: function(config) {
		this.addEvents('anchorchange');

		this.setSelectable(true);
		this.setFocusable(true);
		this.getDrawing().setAttribute('contenteditable', 'true');
		this.connect(this.getDrawing(), 'keyup', this.onKeyUp);

//		this.connect(this.getDrawing(), 'touchend', this.onTouchEndCapture, true);
	},

	getHtml: function() {
		return this.getDrawing().innerHTML;
	},

	setHtml: function(html) {
		this.getDrawing().innerHTML = html;
		this.html = this.getDrawing().innerHTML;
		this.invalidateMeasure();
	},

	getTextContent: function(el) {
		var text = '';		
		if(el.nodeType === 3)
			text += el.textContent;
		else if((el.nodeType === 1) && (el.nodeName == "BR"))
			text += '\n';
		if('childNodes' in el) {
			for(var i = 0; i < el.childNodes.length; i++)
				text += this.getTextContent(el.childNodes[i]);
		}
		return text;
	},

	getText: function() {
		return ('innerText' in this.getDrawing())?this.getDrawing().innerText:this.getTextContent(this.getDrawing());
	},

	onKeyUp: function(event) {
		this.testAnchorChange();
	},

	onSubtreeModified: function(event) {
		this.testAnchorChange();
		this.html = this.getDrawing().innerHTML;
		this.invalidateMeasure();
	},

	onKeyPress: function(event) {
		if(this.getDrawing().innerHTML !== this.html) {
			this.html = this.getDrawing().innerHTML;
			this.invalidateMeasure();
		}
	},

	onTouchEndCapture: function() {
		new Core.DelayedTask({ delay: 0, scope: this, callback: this.testAnchorChange });
	},

	testAnchorChange: function() {
		if((window.getSelection().anchorNode != this.anchorNode) ||
			(window.getSelection().anchorOffset != this.anchorOffset)) {
			this.anchorNode = window.getSelection().anchorNode;
			this.anchorOffset = window.getSelection().anchorOffset;
//			console.log('anchor changed (offset: '+this.anchorOffset+')');
			this.fireEvent('anchorchange', this);
		}
	}

}, {
	renderDrawing: function() {
		var drawing = document.createElement('div');
		drawing.style.display = 'block';
		drawing.style.position = 'absolute';
		drawing.style.left = '0px';
		drawing.style.top = '0px';
		this.connect(drawing, 'DOMSubtreeModified', this.onSubtreeModified);
		this.connect(drawing, 'keypress', this.onKeyPress);
		return drawing;
	},

	measureCore: function(width, height) {
		var div = document.createElement('div');
		div.style.display = 'block';
		div.style.visibility = 'hidden';
		div.style.position = 'absolute';
		div.style.left = '0px';
		div.style.top = '0px';
		div.style.fontSize = this.getStyleProperty('fontSize')+'px';
		div.style.fontFamily = this.getStyleProperty('fontFamily');
		div.style.fontWeight = this.getStyleProperty('fontWeight');
		
		if(this.getWidth() != undefined)
			div.style.width = this.getWidth()+'px';
		div.innerHTML = this.getDrawing().innerHTML;
		document.body.appendChild(div);
		var needWidth = div.clientWidth;
		var needHeight = div.clientHeight;
		document.body.removeChild(div);

		return { width: needWidth, height: needHeight };
	},

	onDisable: function() {
		Ui.ContentEditable.base.onDisable.call(this);
		this.getDrawing().blur();
		this.getDrawing().style.cursor = 'default';
	},

	onEnable: function() {
		Ui.ContentEditable.base.onEnable.call(this);
		this.getDrawing().style.cursor = 'auto';
	},

	onStyleChange: function() {
		var color = Ui.Color.create(this.getStyleProperty('color'));
		this.getDrawing().style.fontSize = this.getStyleProperty('fontSize')+'px';
		this.getDrawing().style.fontFamily = this.getStyleProperty('fontFamily');
		this.getDrawing().style.fontWeight = this.getStyleProperty('fontWeight');
		if(navigator.supportRgba)
			this.getDrawing().style.color = color.getCssRgba();
		else
			this.getDrawing().style.color = color.getCssHtml();
		this.invalidateMeasure();
	}
}, {
	style: {
		color: new Ui.Color({ r: 0, g: 0, b: 0 }),
		fontSize: 18,
		fontFamily: 'Sans-serif',
		fontWeight: 'normal'
	}
});

