
Ui.Pressable.extend('Ui.Combo', 
/** @lends Ui.Combo# */
{
	field: undefined,
	data: undefined,
	position: -1,
	dialog: undefined,
	graphic: undefined,
	current: undefined,
	placeHolder: undefined,
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

		this.graphic = new Ui.ButtonGraphic();
		this.append(this.graphic);

		var content = new Ui.HBox({ spacing: 4 });
//		this.graphic.setContent(content);
		this.append(content);
	
		this.transitionbox = new Ui.TransitionBox({ duration: 0.25 });
		content.append(this.transitionbox, true);

		this.placeHolder = new Ui.Label({ horizontalAlign: 'left', margin: 11, marginRight: 0 });
		this.transitionbox.append(this.placeHolder);
		this.transitionbox.setCurrent(this.placeHolder);

		this.sep = new Ui.Rectangle({ margin: 1, width: 1, fill: '#aaaaaa' });
		content.append(this.sep);

		var vbox = new Ui.VBox({ verticalAlign: 'center', marginRight: 5 });
		content.append(vbox);

		vbox.append(new Ui.Icon({ icon: 'arrowtop', width: 10, height: 10, fill: '#aaaaaa' }));
		vbox.append(new Ui.Icon({ icon: 'arrowbottom', width: 10, height: 10, fill: '#aaaaaa' }));

		this.dialog = new Ui.ComboDialog();
		this.connect(this.dialog, 'item', this.onItemPress);

		this.connect(this, 'press', this.onPress);

		this.connect(this, 'down', this.onComboDown);
		this.connect(this, 'up', this.onComboUp);
		this.connect(this, 'focus', this.onComboFocus);
		this.connect(this, 'blur', this.onComboBlur);
	},

	setPlaceHolder: function(placeHolder) {
		this.placeHolder.setText(placeHolder);
	},

	setField: function(field) {
		this.field = field;
		if(this.data != undefined)
			this.setData(this.data);
	},

	setData: function(data) {
		this.data = data;
		if(this.field === undefined)
			return;
		for(var i = 0; i < data.length; i++) {
			this.dialog.appendItem(new Ui.Label({ text: data[i][this.field], horizontalAlign: 'left' }));
			this.transitionbox.append(new Ui.Label({ text: data[i][this.field], horizontalAlign: 'left', margin: 11, marginRight: 0 }));
		}
	},
	
	/**Read only*/
	getData: function(){
		return this.data;
	},

	open: function() {
		this.dialog.show(this);
	},

	close: function() {
		this.dialog.hide(this);
	},

	getPosition: function() {
		return this.position;
	},

	setCurrentAt: function(position) {
		if(position == -1) {
			this.position = -1;
			this.current = undefined;
			this.transitionbox.setCurrentAt(0);
			this.fireEvent('change', this, this.current, this.position);
		}
		else if((position >= 0) && (position < this.data.length)) {
			this.transitionbox.setCurrentAt(position + 1);
			this.current =  this.data[position];
			this.position = position;
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

	onPress: function() {
		this.open();
	},

	onItemPress: function(dialog, item, position) {
		this.setCurrentAt(position);
	},
		
	onComboDown: function() {
		this.graphic.setIsDown(true);
	},
	
	onComboUp: function() {
		this.graphic.setIsDown(false);
	},
	
	onComboFocus: function() {
		this.graphic.setHasFocus(true);
	},
	
	onComboBlur: function() {
		this.graphic.setHasFocus(false);
	}
}, 
/** @lends Ui.Combo# */
{
	onDisable: function() {
		this.transitionbox.setOpacity(0.2);
	},
	
	onEnable: function() {
		this.transitionbox.setOpacity(1);
	}
});

Ui.Popup.extend('Ui.ComboDialog', {
	scroll: undefined,
	list: undefined,

	constructor: function(config) {
		this.addEvents('item');

		this.setExpandable(true);
		this.setAutoHide(true);

		this.scroll = new Ui.ScrollingArea({ scrollHorizontal: true });
		this.list = new Ui.VBox();
		this.scroll.setContent(this.list);

		this.setContent(this.scroll);
	},

	appendItem: function(item) {
		var comboitem = new Ui.ComboItem();
		comboitem.setContent(item);
		this.connect(comboitem, 'press', this.onItemPress);
		this.list.append(comboitem);
		return comboitem;
	},
	
	onItemPress: function(comboitem) {
		var item = comboitem.getContent();
		var position = -1;
		for(var i = 0; i < this.list.getChildren().length; i++) {
			if(this.list.getChildren()[i] == comboitem) {
				position = i;
				break;
			}
		}
		this.fireEvent('item', this, item, position);
		this.hide();
	}
});


Ui.MouseOverable.extend('Ui.ComboItem', {
	background: undefined,
	pressable: undefined,

	constructor: function() {
		this.addEvents('press');

		this.background = new Ui.Rectangle({ fill: '#cecece', opacity: 0 });
		this.append(this.background);

		this.pressable = new Ui.Pressable({ padding: 10, paddingLeft: 10, paddingRight: 10 });
		this.append(this.pressable);
		this.connect(this.pressable, 'press', this.onPressablePress);

		this.connect(this, 'enter', this.onEnter);
		this.connect(this, 'leave', this.onLeave);
		this.connect(this.pressable, 'down', this.onDown);
		this.connect(this.pressable, 'up', this.onUp);
	},

	getContent: function() {
		return this.pressable.getChildren()[0];
	},

	onEnter: function() {
		this.background.setOpacity(0.6);
	},

	onLeave: function() {
		this.background.setOpacity(0);
	},

	onDown: function() {
		this.background.setOpacity(1);
	},

	onUp: function() {
		this.background.setOpacity(0);
	},
	
	onPressablePress: function() {
		this.fireEvent('press', this);
	}
}, {
	setContent: function(content) {
		this.pressable.setContent(Ui.Element.create(content));
	}
});



