//
// Define the Slider class.
//
Ui.Element.extend('Ui.Slider', {
	isDown: false,
	value: 0,

	constructor: function(config) {
		if(config.value != undefined)
			this.value = config.value;
		this.setFocusable(true);

		// handle mouse
		this.connect(this.buttonDrawing, 'mousedown', this.onMouseDown);

		// handle touches
		this.connect(this.buttonDrawing, 'touchstart', this.onTouchStart);
		this.connect(this.buttonDrawing, 'touchmove', this.onTouchMove);
		this.connect(this.buttonDrawing, 'touchend', this.onTouchEnd);

		this.addEvents('change');
	},

	getValue: function() {
		return this.value;
	},

	setValue: function(value) {
		if(this.value != value) {
			this.value = value;
			this.updateValue();
			this.fireEvent('change', this);
		}
	},

	//
	// Private
	//

	updateValue: function() {
		this.foregroundDrawing.style.setProperty('width', ((this.layoutWidth-48)*this.value)+'px', null);
		this.buttonDrawing.style.setProperty('left', (28 - 16 + (this.layoutWidth-56)*this.value)+'px', null);
	},

	onMouseDown: function(event) {
		if(event.button == 0) {
			event.preventDefault();
			event.stopPropagation();

			this.startPos = this.pointFromPage({ x: event.pageX, y: event.pageY });
			this.startValue = this.value;
			this.connect(window, 'mousemove', this.onMouseMove, true);
			this.connect(window, 'mouseup', this.onMouseUp, true);

			this.onDown();
		}
	},

	onMouseMove: function(event) {
		event.preventDefault();
		event.stopPropagation();
		var point = this.pointFromPage({ x: event.pageX, y: event.pageY });
		var deltaX = point.x - this.startPos.x;
		deltaX /= (this.layoutWidth-48);
		var value = this.startValue + deltaX;
		if(value > 1)
			value = 1;
		else if(value < 0)
			value = 0;
		this.setValue(value);
	},

	onMouseUp: function(event) {
		event.preventDefault();
		event.stopPropagation();
		if(event.button == 0)
			this.onUp();
	},


	onTouchStart: function(event) {
		if(this.isDown) {
			this.onUp();
			return;
		}
		if(event.targetTouches.length != 1)
			return;

		event.preventDefault();
		event.stopPropagation();

		this.startPos = this.pointFromPage({ x: event.targetTouches[0].pageX, y: event.targetTouches[0].pageY });
		this.startValue = this.value;

		this.onDown();
	},

	onTouchMove: function(event) {
		if(!this.isDown)
			return;
		
		event.preventDefault();
		event.stopPropagation();

		var deltaX = event.targetTouches[0].screenX - this.touchStartX;
		var deltaY = event.targetTouches[0].screenY - this.touchStartY;

		var point = this.pointFromPage({ x: event.targetTouches[0].pageX, y: event.targetTouches[0].pageY });
		var deltaX = point.x - this.startPos.x;
		deltaX /= (this.layoutWidth-48);
		var value = this.startValue + deltaX;
		if(value > 1)
			value = 1;
		else if(value < 0)
			value = 0;
		this.setValue(value);
	},
	
	onTouchEnd: function(event) {
		if(!this.isDown)
			return;

		event.preventDefault();
		event.stopPropagation();
		this.onUp();
	},

	onDown: function() {
		this.isDown = true;
	},

	onUp: function() {
		this.isDown = false;
		this.disconnect(window, 'mousemove');
		this.disconnect(window, 'mouseup');
	},

}, {
	render: function() {
		this.sliderDrawing = document.createElementNS(htmlNS, 'div');

		this.backgroundDrawing = document.createElementNS(htmlNS, 'div');
		this.backgroundDrawing.setAttributeNS(null, 'class', 'ui-slider-bg');
		this.backgroundDrawing.style.setProperty('position', 'absolute', null);
		this.backgroundDrawing.style.setProperty('height', '16px', null);
		this.backgroundDrawing.style.setProperty('border-radius', '8px', null);
		this.sliderDrawing.appendChild(this.backgroundDrawing);

		this.foregroundDrawing = document.createElementNS(htmlNS, 'div');
		this.foregroundDrawing.setAttributeNS(null, 'class', 'ui-slider-fg');
		this.foregroundDrawing.style.setProperty('position', 'absolute', null);
		this.foregroundDrawing.style.setProperty('height', '10px', null);
		this.foregroundDrawing.style.setProperty('border-radius', '8px', null);
		this.sliderDrawing.appendChild(this.foregroundDrawing);

		this.buttonDrawing = document.createElementNS(htmlNS, 'div');
		this.buttonDrawing.setAttributeNS(null, 'class', 'ui-slider-button');
		this.buttonDrawing.style.setProperty('position', 'absolute', null);
		this.buttonDrawing.style.setProperty('width', '40px', null);
		this.buttonDrawing.style.setProperty('height', '40px', null);
		this.buttonDrawing.style.setProperty('border-radius', '20px', null);
		this.buttonDrawing.style.setProperty('cursor', 'move', null);
		this.sliderDrawing.appendChild(this.buttonDrawing);

		return this.sliderDrawing;
	},

	measureCore: function(width, height, force) {
		return { width: 100, height: 44 };
	},

	arrangeCore: function(width, height, force) {
		this.backgroundDrawing.style.setProperty('left', '20px', null);
		this.backgroundDrawing.style.setProperty('top', ((height/2)-8)+'px', null);
		this.backgroundDrawing.style.setProperty('width', (width-40)+'px', null);

		this.foregroundDrawing.style.setProperty('left', '24px', null);
		this.foregroundDrawing.style.setProperty('top', ((height/2)-5)+'px', null);

		this.buttonDrawing.style.setProperty('top', ((height/2)-20)+'px', null);

		this.updateValue();
	},
});
