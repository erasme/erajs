
Core.Object.extend('Ui.SvgParser', {
	path: undefined,
	pos: 0,
	cmd: undefined,
	current: undefined,
	value: false,
	end: false,

	constructor: function(config) {	
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
			var dotseen = false;
			var eseen = false;
			this.current = '';
			var c = this.path[this.pos];

			var isCmd = (c !== 'e') && ((c >= 'a') && (c <= 'z')) || ((c >= 'A') && (c <= 'Z'));
			if(isCmd) {
				this.current = this.path[this.pos++];
				this.cmd = this.current;
				this.value = false;
			}
			else {
				while((this.pos < this.path.length) && (((this.path[this.pos] >= '0') && (this.path[this.pos] <= '9')) ||
				       ((this.path[this.pos] === '-') && ((this.current.length == 0) || (this.current[this.current.length-1] === 'e'))) ||
				       (!eseen && (this.path[this.pos] === 'e')) || (!dotseen && (this.path[this.pos] === '.')))) {
					if(this.path[this.pos] === '.')
						dotseen = true;
					if(this.path[this.pos] === 'e')
						eseen = true;
					this.current += this.path[this.pos++];
				}
				this.value = true;
				if(this.current[0] === '.')
					this.current = '0'+this.current;
				if((this.current[0] === '-') && (this.current[1] === '.'))
					this.current = '-0'+this.current.substring(1);
				this.current = parseFloat(this.current);
				if(isNaN(this.current))
					throw('bad number');
			}
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

