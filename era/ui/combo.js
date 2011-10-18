
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

		var content = new Ui.HBox({ margin: 5, spacing: 4 });
		this.graphic.setContent(content);
	
		this.transitionbox = new Ui.TransitionBox({ duration: 0.25 });
		content.append(this.transitionbox);

		this.placeHolder = new Ui.Label({ horizontalAlign: 'left' });
		this.transitionbox.append(this.placeHolder);
		this.transitionbox.setCurrent(this.placeHolder);

		content.append(new Ui.Rectangle({ margin: 2, width: 1, fill: 'black' }));

		var vbox = new Ui.VBox();
		content.append(vbox);

		vbox.append(Ui.Icon.create('arrowtop', 10, 10, 'black'));
		vbox.append(Ui.Icon.create('arrowbottom', 10, 10, 'black'));

		this.dialog = new Ui.ComboDialog();
		this.connect(this.dialog, 'item', this.onItemPress);

		this.connect(this, 'press', this.onPress);

		this.connect(this, 'down', function() { this.graphic.setIsDown(true); });
		this.connect(this, 'up', function() { this.graphic.setIsDown(false); });
		this.connect(this, 'focus', function() { this.graphic.setColor(this.getStyleProperty('focusColor')); });
		this.connect(this, 'blur', function() { this.graphic.setColor(this.getStyleProperty('color')); });
	},

	setPlaceHolder: function(placeHolder) {
		this.placeHolder.setText(placeHolder);
	},

	setField: function(field) {
		this.field = field;
	},

	setData: function(data) {
		this.data = data;
		for(var i = 0; i < data.length; i++) {
			this.dialog.appendItem(new Ui.Label({ text: data[i][this.field], horizontalAlign: 'left' }));
			this.transitionbox.append(new Ui.Label({ text: data[i][this.field], horizontalAlign: 'left' }));
		}
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

	setCurrent: function(current) {
		if(current == undefined)
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
	}
}, 
/** @lends Ui.Combo# */
{
	onStyleChange: function() {
		this.graphic.setRadius(this.getStyleProperty('radius'));
		this.graphic.setSpacing(this.getStyleProperty('spacing'));
		if(this.getHasFocus())
			this.graphic.setColor(this.getStyleProperty('focusColor'));
		else
			this.graphic.setColor(this.getStyleProperty('color'));
	},

	onDisable: function() {
		Ui.Combo.base.onDisable.call(this);
		this.graphic.setIsEnable(false);
	},

	onEnable: function() {
		Ui.Combo.base.onEnable.call(this);
		this.graphic.setIsEnable(true);
	}
}, 
/** @lends Ui.Combo */
{
	style: {
		color: new Ui.Color({ r: 0.31, g: 0.66, b: 1 }),
		focusColor: Ui.Color.create('#f6caa2'),
		radius: 4,
		spacing: 3
	}
});

Ui.Popup.extend('Ui.ComboDialog', {
	scroll: undefined,
	list: undefined,

	constructor: function(config) {
		this.addEvents('item');

		this.setExpandable(true);
		this.setAutoHide(true);

		this.scroll = new Ui.ScrollingArea({ margin: 0, scrollHorizontal: true });
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

		this.background = new Ui.Rectangle({ fill: new Ui.Color.create('#1c8ef2'), opacity: 0, radius: 4 });
		this.append(this.background);

		this.pressable = new Ui.Pressable({ padding: 5, paddingLeft: 10, paddingRight: 10 });
		this.append(this.pressable);
		this.connect(this.pressable, 'press', function() {
			this.fireEvent('press', this);
		});

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
	}
}, {
	setContent: function(content) {
		this.pressable.setContent(Core.Object.create(content, this));
	}
});



