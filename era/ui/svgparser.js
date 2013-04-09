
Core.Object.extend('Ui.SvgParser', {
	path: undefined,
	pos: 0,
	cmd: undefined,
	current: undefined,
	value: false,
	end: false,

	constructor: function(config) {
		if(navigator.isIE7)
			this.path = config.path.split('');
		else
			this.path = config.path;
		delete config.path;
	},

	isEnd: function() {
		return this.end;
	},

	next: function() {
		this.end = this.pos >= this.path.length;
		if(!this.end) {
			while((this.pos < this.path.length) && ((this.path[this.pos] == ' ') || (this.path[this.pos] == ',') || (this.path[this.pos] == ';')))
				this.pos++;
			this.current = '';
			var lastIsText = undefined;
			while((this.pos < this.path.length) && (this.path[this.pos] != ' ') && (this.path[this.pos] != ',') && (this.path[this.pos] != ';')) {
				var c = this.path[this.pos];
				var isText = (c != 'e') && ((c >= 'a') && (c <= 'z')) || ((c >= 'A') && (c <= 'Z'));
				if((lastIsText === undefined) || (lastIsText == isText)) {
					lastIsText = isText;
					this.current += c;
					this.pos++;
				}
				else
					break;
			}
			var value = new Number(this.current);
			this.value = !isNaN(value);
			if(this.value)
				this.current = value;
			else
				this.cmd = this.current;
		}
	},

	setCmd: function(cmd) {
		this.cmd = cmd;
	},

	getCmd: function() {
		return this.cmd;
	},

	getCurrent: function() {
		return this.current;
	},

	isCmd: function() {
		return !this.value;
	},

	isValue: function() {
		return this.value;
	}
});

