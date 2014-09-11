Ui.TextButtonField.extend('Ui.DatePicker', 
/**@lends Ui.DatePicker#*/
{
	popup: undefined,
	calendar: undefined,
	selectedDate: undefined,
	lastValid: '',
	isValid: false,
	dayFilter: undefined,
	dateFilter: undefined,

	/**
	* @constructs
	* @class TextButtonField that open a calendar to choose a day and then display it in a DD/MM/YYYY format 
	* @extends Ui.TextButtonField
	* @param {Date} config.selectedDate Selected date (default nothing)
	*/
	constructor: function(config) {
		this.setButtonIcon('calendar');
		this.setWidthText(9);

		this.connect(this, 'buttonpress', this.onDatePickerButtonPress);
		this.connect(this, 'change', this.onDatePickerChange);
	},

	setDayFilter: function(dayFilter) {
		this.dayFilter = dayFilter;
	},

	setDateFilter: function(dateFilter) {
		this.dateFilter = dateFilter;
	},

	getIsValid: function() {
		return this.isValid;
	},
	
	getSelectedDate: function() {
		return this.selectedDate;
	},

	setSelectedDate: function(date) {
		if(date === undefined) {
			this.selectedDate = undefined;
		}
		else {
			if(typeof(date) === 'string')
				throw('STOP HERE');

			this.lastValid = ((date.getDate() < 10)?'0':'')+date.getDate()+'/'+((date.getMonth() < 9)?'0':'')+(date.getMonth()+1)+'/'+date.getFullYear();
			this.selectedDate = date;
			this.setTextValue(this.lastValid);
		}
		this.isValid = true;
		this.fireEvent('change', this, this.getValue());
	},

	onDatePickerButtonPress: function() {
		var splitDate = this.getTextValue().match(/^(\d{1,2})\/(\d{1,2})\/(\d{1,4})$/);
		if(splitDate !== null) {
			this.selectedDate = new Date();
			this.selectedDate.setFullYear(parseInt(splitDate[3]), parseInt(splitDate[2]) - 1, parseInt(splitDate[1]));
		}
		this.popup = new Ui.Popup();
		if(this.selectedDate !== undefined)
			this.calendar = new Ui.MonthCalendar({ horizontalAlign: 'center', margin: 10, selectedDate: this.selectedDate, date: this.selectedDate });
		else
			this.calendar = new Ui.MonthCalendar({ horizontalAlign: 'center', margin: 10 });
		if(this.dayFilter !== undefined)
			this.calendar.setDayFilter(this.dayFilter);
		if(this.dateFilter !== undefined)
			this.calendar.setDateFilter(this.dateFilter);
		this.popup.setContent(this.calendar);
		this.connect(this.calendar, 'dayselect', this.onDaySelect);

		this.popup.show(this);
	},

	onDatePickerChange: function() {
		this.isValid = false;
		this.selectedDate = undefined;
		var dateStr = this.getTextValue();
		if(dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{1,4})$/)) {
			var splitDate = this.getTextValue().match(/^(\d{1,2})\/(\d{1,2})\/(\d{1,4})$/);
			var date = new Date();
			date.setFullYear(parseInt(splitDate[3]), parseInt(splitDate[2]) - 1, parseInt(splitDate[1]));
			var newStr = ((date.getDate() < 10)?'0':'')+date.getDate()+'/'+((date.getMonth() < 9)?'0':'')+(date.getMonth()+1)+'/'+date.getFullYear();			
			if((parseInt(splitDate[3]) != date.getFullYear()) || (parseInt(splitDate[2]) - 1 != date.getMonth()) || (parseInt(splitDate[1]) != date.getDate())) {
				this.lastValid = newStr;
				this.setTextValue(this.lastValid);
			}
			this.selectedDate = date;
			this.isValid = true;
		}
		else if(dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{0,4})$/))
			this.lastValid = dateStr;
		else if(dateStr.match(/^(\d{1,2})\/(\d{0,2})$/))
			this.lastValid = dateStr;
		else if(dateStr.match(/^(\d{0,2})$/))
			this.lastValid = dateStr;
		else
			this.setTextValue(this.lastValid);
	},

	onDaySelect: function(monthcalendar, date) {
		this.setSelectedDate(date);
		this.popup.hide();
		this.popup = undefined;
	}
}, {
	getValue: function() {
		return this.selectedDate;
	},

	setValue: function(value) {
		this.setSelectedDate(value);
	}
});

