
Ui.Fixed.extend('JQueryUI.DatePicker', {
	jqueryDrawing: undefined,

	constructor: function(config) {
		this.addEvents('select');

		this.jqueryDrawing.eraElement = this;
		$(this.jqueryDrawing).datepicker({
			onChangeMonthYear: function(year, month, inst) {
				this.eraElement.invalidateMeasure();
			},
			onSelect: function(dateText, inst) {
				this.eraElement.fireEvent('select', this.eraElement, dateText);
			}
		});
		this.connect(this, 'load', this.updateSize);
		this.connect(this, 'resize', this.updateSize);
		this.connect(this, 'visible', this.updateSize);
	},

	updateSize: function() {
		$(this.jqueryDrawing).datepicker("refresh");
		if(($(this.jqueryDrawing).width() > this.getLayoutWidth()) || ($(this.jqueryDrawing).height() > this.getLayoutHeight()))
			this.invalidateMeasure();
	}
}, {
	render: function() {
		this.jqueryDrawing = document.createElement('div');
		this.jqueryDrawing.style.display = 'block';
		this.jqueryDrawing.style.position = 'absolute';
		this.jqueryDrawing.style.left = '0px';
		this.jqueryDrawing.style.top = '0px';
		return this.jqueryDrawing;
	},

	measureCore: function(width, height) {
		this.jqueryDrawing.style.width = '';
		$(this.jqueryDrawing).datepicker("refresh");
		return { width: Math.max($(this.jqueryDrawing).width(), width), height: Math.max($(this.jqueryDrawing).height(), height) };
	}
}, {
	constructor: function() {
		document.write("<script src='http://ajax.googleapis.com/ajax/libs/jquery/1.6.2/jquery.min.js'></script>");
		document.write("<script src='https://ajax.googleapis.com/ajax/libs/jqueryui/1.8.14/jquery-ui.min.js'></script>");
		document.write("<link type='text/css' href='http://ajax.googleapis.com/ajax/libs/jqueryui/1.7/themes/smoothness/jquery-ui.css' rel='stylesheet'/>");
		document.write("<style>#ui-datepicker-div { display: none }</style>");
	}
});

