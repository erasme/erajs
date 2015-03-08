
Ui.Button.extend('Ui.Combo', {

	field: undefined,
	data: undefined,
	position: -1,
	current: undefined,
	placeHolder: '...',
	sep: undefined,

	/**
	 * @constructs
	 * @class
	 * @extends Ui.Pressable
	 * @param {String} [config.field] Name of the data's field to display in the list
	 * @param [config.data] Object List
	 * @param [currentAt] Default selected object position
	 * @param [current] Default selected object
	 * @param [placeHolder] Text displays when no selection
	 */
	constructor: function(config) {
		this.addEvents('change');

		this.arrowtop = new Ui.Icon({ icon: 'arrowtop', width: 10, height: 10 });
		this.arrowbottom = new Ui.Icon({ icon: 'arrowbottom', width: 10, height: 10 });

		this.setMarker(new Ui.VBox({ verticalAlign: 'center',
			content: [ this.arrowtop, this.arrowbottom ], marginRight: 5 }));
	},

	setPlaceHolder: function(placeHolder) {
		this.placeHolder = placeHolder;
		if(this.position === -1)
			this.setText(this.placeHolder);
	},

	setField: function(field) {
		this.field = field;
		if(this.data !== undefined)
			this.setData(this.data);
	},

	setData: function(data) {
		this.data = data;
	},
	
	/**Read only*/
	getData: function(){
		return this.data;
	},

	getPosition: function() {
		return this.position;
	},

	setCurrentAt: function(position) {
		if(position === -1) {
			this.position = -1;
			this.current = undefined;
			this.setText(this.placeHolder);
			this.fireEvent('change', this, this.current, this.position);
		}
		else if((position >= 0) && (position < this.data.length)) {
			this.current =  this.data[position];
			this.position = position;
			this.setText(this.current[this.field]);
			this.fireEvent('change', this, this.current, this.position);
		}
	},

	getCurrent: function() {
		return this.current;
	},
	
	getValue: function() {
		return this.current;
	},

	setCurrent: function(current) {
		if(current === undefined)
			this.setCurrentAt(-1);
		var position = -1;
		for(var i = 0; i < this.data.length; i++) {
			if(this.data[i] == current) {
				position = i;
				break;
			}
		}
		if(position != -1)
			this.setCurrentAt(position);
	},
	
	onItemPress: function(popup, item, position) {
		this.setCurrentAt(position);
	}
}, {
	onPress: function() {
		var popup = new Ui.ComboPopup({ field: this.field, data: this.data });
		if(this.position !== -1)
			popup.setCurrentAt(this.position);
		this.connect(popup, 'item', this.onItemPress);
		popup.open(this, 'right');
	},

	updateColors: function() {
		Ui.Combo.base.updateColors.apply(this, arguments);
		this.arrowtop.setFill(this.getForeground());
		this.arrowbottom.setFill(this.getForeground());
	}
});

Ui.MenuPopup.extend('Ui.ComboPopup', {
	list: undefined,
	data: undefined,
	field: undefined,

	constructor: function(config) {
		this.addEvents('item');
		this.setAutoClose(true);

		this.list = new Ui.VBox();
		this.setContent(this.list);
	},

	setField: function(field) {
		this.field = field;
		if(this.data !== undefined)
			this.setData(this.data);
	},

	setData: function(data) {
		this.data = data;
		if(this.field === undefined)
			return;
		for(var i = 0; i < data.length; i++) {
			var item = new Ui.ComboItem({ text: data[i][this.field] });
			this.connect(item, 'press', this.onItemPress);
			this.list.append(item);
		}
	},

	setCurrentAt: function(pos) {
		this.list.getChildren()[pos].setIsActive(true);
	},
	
	onItemPress: function(item) {
		var position = -1;
		for(var i = 0; i < this.list.getChildren().length; i++) {
			if(this.list.getChildren()[i] == item) {
				position = i;
				break;
			}
		}
		this.fireEvent('item', this, item, position);
		this.close();
	}
});

Ui.Button.extend('Ui.ComboItem', {}, {}, {
	style: {
		borderWidth: 0
	}
});
	
