

Object.extend('Core.Socket', {
	host: undefined,
	service: '/',
	port: 80,
	mode: undefined,
	websocket: undefined,	
	emuopenrequest: undefined,
	emupollrequest: undefined,
	emusendrequest: undefined,
	emuid: undefined,
	emumessages: undefined,
	lastPosition: 0,
	readSize: true,
	size: 0,
	data: '',

	constructor: function(config) {
		if(config.host != undefined)
			this.host = config.host;
		else
			this.host = document.location.hostname;
		if(config.port != undefined)
			this.port = config.port;
		else if((document.location.port != undefined) && (document.location.port != ''))
			this.port = document.location.port;
		else
			this.port = 80;
		if(config.service != undefined)
			this.service = config.service;
		if(config.mode != undefined)
			this.mode = config.mode;
		else {
			if(Core.Socket.supportWebSocket)
				this.mode = 'websocket';
			else if(Core.Socket.supportStreamSocket)
				this.mode = 'stream';
			else
				this.mode = 'poll';
		}

		if(this.mode == 'websocket') {
			this.websocket = new WebSocket('ws://'+this.host+':'+this.port+this.service);
			this.connect(this.websocket, 'open', this.onWebSocketOpen);
			this.connect(this.websocket, 'error', this.onWebSocketError);
			this.connect(this.websocket, 'message', this.onWebSocketMessage);
			this.connect(this.websocket, 'close', this.onWebSocketClose);
		}
		else if(this.mode == 'stream') {
			this.emumessages = [];
			this.emuopenrequest = new XMLHttpRequest();
			this.emuopenrequest.open('GET', 'http://'+this.host+':'+this.port+this.service+'?socket=stream&command=open', true);
			var wrapper = function() {
				var socket = arguments.callee.socket;
				socket.onEmuSocketChange.call(socket);
			}
			wrapper.socket = this;
			this.emuopenrequest.onreadystatechange = wrapper;
			this.emuopenrequest.send();
		}
		else {
			this.emumessages = [];
			this.emuopenrequest = new Core.HttpRequest({ url: 'http://'+this.host+':'+this.port+this.service+'?socket=poll&command=open' });
			this.connect(this.emuopenrequest, 'done', this.onEmuSocketOpenDone);
			this.connect(this.emuopenrequest, 'error', this.onEmuSocketOpenError);
			this.emuopenrequest.send();
		}
		this.addEvents('error', 'message', 'close', 'open');
	},

	send: function(msg) {
		if(this.websocket != undefined) {
			this.websocket.send(msg.serialize());
		}
		else {
			if(this.emusendrequest == undefined) {
				this.emusendrequest = new Core.HttpRequest({ url: 'http://'+this.host+':'+this.port+this.service+'?socket='+this.mode+'&command=send&id='+this.emuid+'&messages='+encodeURIComponent(msg.serialize().toBase64()) });
				this.connect(this.emusendrequest, 'done', this.onEmuSocketSendDone);
				this.connect(this.emusendrequest, 'error', this.onEmuSocketSendError);
				this.emusendrequest.send();
			}
			else
				this.emumessages.push(msg.serialize().toBase64());
		}
	},

	close: function() {
		if(this.websocket != undefined) {
			this.websocket.close();
		}
		else {
			if(this.emutimer != undefined) {
				this.emutimer.abort();
				this.emutimer = undefined;
			}
			if(this.emusendrequest != undefined) {
				this.emusendrequest.abort();
				this.emusendrequest = undefined;
			}
			if(this.emuopenrequest != undefined) {
				this.emuopenrequest.abort();
				this.emuopenrequest = undefined;
			}
			if(this.emupollrequest != undefined) {
				this.emupollrequest.abort();
				this.emupollrequest = undefined;
			}
		}
	},

	//
	// Private
	//
	onWebSocketOpen: function() {
		this.fireEvent('open', this);
	},

	onWebSocketError: function() {
		this.fireEvent('error', this);
	},

	onWebSocketMessage: function(msg) {		
		this.fireEvent('message', this, JSON.parse(msg.data));
	},

	onWebSocketClose: function(msg) {
		this.fireEvent('close', this);
	},

	emuSocketDataAvailable: function(data) {
		if(this.emuid == undefined) {
			this.emuid = data;
			this.fireEvent('open', this);
		}
		else {
			this.fireEvent('message', this, JSON.parse(data.fromBase64()));
		}
	},

	emuSocketUpdate: function(delta) {
		for(var i = 0; i < delta.length; i++) {
			var character = delta[i];
			if(this.readSize) {
				if(character == ':') {
					this.readSize = false;
					this.size = parseInt('0x'+this.data);
					this.data = '';
				}
				else
					this.data += character;
			}
			else {
				this.data += character;
				if(this.data.length >= this.size + 2) {
					this.emuSocketDataAvailable(this.data.substring(0, this.data.length - 2));
					this.readSize = true;
					this.data = '';
				}
			}
		}
	},

	onEmuSocketChange: function() {
		if(this.emuopenrequest.readyState == 2) {
			if(this.emuopenrequest.status != 200) {
				this.emuopenrequest.onreadystatechange = undefined;
				this.emuopenrequest.abort();
				this.emuopenrequest = undefined;
				this.fireEvent('error', this);
			}
		}
		else if(this.emuopenrequest.readyState == 3) {
			var	responseText = this.emuopenrequest.responseText;
			if(responseText.length != this.lastPosition) {
				var delta = responseText.substring(this.lastPosition);
				this.emuSocketUpdate(delta);
				this.lastPosition = responseText.length;
			}
		}
		else if(this.emuopenrequest.readyState == 4) {
			// check for the last message
			if(this.emuopenrequest.responseText.length != this.lastPosition) {
				var delta = this.emuopenrequest.responseText.substring(this.lastPosition);
				this.emuSocketUpdate(delta);
				this.lastPosition = this.emuopenrequest.responseText.length;
			}
			this.emuopenrequest.onreadystatechange = undefined;
			this.emuopenrequest = undefined;
			this.fireEvent('close', this);
		}
	},

	onEmuSocketSendDone: function() {
		var response = this.emusendrequest.getResponseJSON();
		if(response.messages != undefined) {
			for(var i = 0; i < response.messages.length; i++) {
				var msg = JSON.parse(response.messages[i].fromBase64());
				this.fireEvent('message', this, msg);
			}
		}
		if(this.emumessages.length > 0) {
			var messages = '';
			for(var i = 0; i < this.emumessages.length; i++) {
				if(messages != '')
					messages += ';';
				messages += this.emumessages[i];
			}
			this.emusendrequest = new Core.HttpRequest({ url: 'http://'+this.host+':'+this.port+this.service+'?socket='+this.mode+'&command=send&id='+this.emuid+'&messages='+encodeURIComponent(messages) });
			this.connect(this.emusendrequest, 'done', this.onEmuSocketSendDone);
			this.connect(this.emusendrequest, 'error', this.onEmuSocketSendError);
			this.emurequest.send();
			this.emumessages = [];
		}
		else {
			this.emusendrequest = undefined;
		}
	},

	onEmuSocketSendError: function() {
		this.emusendrequest = undefined;
	},

	onEmuSocketOpenDone: function() {
		var response = this.emuopenrequest.getResponseJSON();
		this.emuid = response.id;
		this.emuopenrequest = undefined;
		if(response.status != 'open')
			this.fireEvent('error', this);
		else {
			this.emutimer = new Core.Timer({ interval: 5, scope: this, callback: this.onEmuSocketTimer });
			this.fireEvent('open', this);
		}
	},

	onEmuSocketOpenError: function() {
		this.emuopenrequest = undefined;
		this.fireEvent('error', this);
	},

	onEmuSocketTimer: function() {
		if(this.emupollrequest == undefined) {
			this.emupollrequest = new Core.HttpRequest({ url: 'http://'+this.host+':'+this.port+this.service+'?socket=poll&command=poll&id='+this.emuid });
			this.connect(this.emupollrequest, 'done', this.onEmuSocketPollDone);
			this.connect(this.emupollrequest, 'error', this.onEmuSocketPollError);
			this.emupollrequest.send();
		}
	},

	onEmuSocketPollDone: function() {
		var response = this.emupollrequest.getResponseJSON();
		if(response.status != 'open') {
			this.close();
			this.fireEvent('close', this);
		}
		else {
			if(response.messages != undefined) {
				for(var i = 0; i < response.messages.length; i++) {
					var msg = JSON.parse(response.messages[i].fromBase64());
					this.fireEvent('message', this, msg);
				}
			}
		}
		this.emupollrequest = undefined;
	},

	onEmuSocketPollError: function() {
		this.emupollrequest = undefined;
		this.fireEvent('error', this);
		this.close();
	},

});


Core.Socket.supportWebSocket = "WebSocket" in window;

Core.Socket.supportStreamSocket = true;
if(navigator.isIE)
	Core.Socket.supportStreamSocket = false;


