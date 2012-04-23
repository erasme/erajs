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
		this.lastValid = ((date.getDate() < 10)?'0':'')+date.getDate()+'/'+((date.getMonth() < 9)?'0':'')+(date.getMonth()+1)+'/'+date.getFullYear();
		this.selectedDate = date;
		this.setValue(this.lastValid);
		this.isValid = true;
		//@temp Don't if I need to put this event here or in Ui.Entry.setValue()
		this.fireEvent('change', this, this.getValue());
	},

	onDatePickerButtonPress: function() {
		var splitDate = this.getValue().match(/^(\d{1,2})\/(\d{1,2})\/(\d{1,4})$/);
		if(splitDate != null) {
			this.selectedDate = new Date();
			this.selectedDate.setFullYear(new Number(splitDate[3]), new Number(splitDate[2]) - 1, new Number(splitDate[1]));
		}
		this.popup = new Ui.Popup();
		if(this.selectedDate != undefined)
			this.calendar = new Ui.MonthCalendar({ selectedDate: this.selectedDate, date: this.selectedDate });
		else
			this.calendar = new Ui.MonthCalendar();
		if(this.dayFilter != undefined)
			this.calendar.setDayFilter(this.dayFilter);
		if(this.dateFilter != undefined)
			this.calendar.setDateFilter(this.dateFilter);
		this.popup.setContent(this.calendar);
		this.connect(this.calendar, 'dayselect', this.onDaySelect);

		this.popup.show(this);
	},

	onDatePickerChange: function() {
		this.isValid = false;
		this.selectedDate = undefined;
		var dateStr = this.getValue();
		if(dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{1,4})$/)) {
			var splitDate = this.getValue().match(/^(\d{1,2})\/(\d{1,2})\/(\d{1,4})$/);
			var date = new Date();
			date.setFullYear(new Number(splitDate[3]), new Number(splitDate[2]) - 1, new Number(splitDate[1]));
			var newStr = ((date.getDate() < 10)?'0':'')+date.getDate()+'/'+((date.getMonth() < 9)?'0':'')+(date.getMonth()+1)+'/'+date.getFullYear();			
			if((new Number(splitDate[3]) != date.getFullYear()) || (new Number(splitDate[2]) - 1 != date.getMonth()) || (new Number(splitDate[1]) != date.getDate())) {
				this.lastValid = newStr;
				this.setValue(this.lastValid);
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
			this.setValue(this.lastValid);
	},

	onDaySelect: function(monthcalendar, date) {
		this.setSelectedDate(date);
		this.popup.hide();
		this.popup = undefined;
	}
});

