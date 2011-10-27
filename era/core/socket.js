Core.Object.extend('Core.Socket', 
/**@lends Core.Socket#*/
{
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
	isClosed: false,
	closeSent: false,

	/**
	*	@constructs
	*	@class
	*	@extends Core.Object
	*/
	constructor: function(config) {
		if(config.host != undefined) {
			this.host = config.host;
			delete(config.host);
		}
		else
			this.host = document.location.hostname;
		if(config.port != undefined) {
			this.port = config.port;
			delete(config.port);
		}
		else if((document.location.port != undefined) && (document.location.port != ''))
			this.port = document.location.port;
		else
			this.port = 80;
		if(config.service != undefined) {
			this.service = config.service;
			delete(config.service);
		}
		if(config.mode != undefined) {
			this.mode = config.mode;
			delete(config.mode);
		}
		else {
			if(Core.Socket.supportWebSocket)
				this.mode = 'websocket';
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
			this.websocket.send(JSON.stringify(msg));
		}
		else {
			if(this.emusendrequest == undefined) {
				this.emusendrequest = new Core.HttpRequest({ url: 'http://'+this.host+':'+this.port+this.service+'?socket='+this.mode+'&command=send&id='+this.emuid+'&messages='+encodeURIComponent((JSON.stringify(msg)).toBase64()) });
				this.connect(this.emusendrequest, 'done', this.onEmuSocketSendDone);
				this.connect(this.emusendrequest, 'error', this.onEmuSocketSendError);
				this.emusendrequest.send();
			}
			else
				this.emumessages.push((JSON.stringify(msg)).toBase64());
		}
	},

	close: function() {
		if(this.websocket != undefined) {
			this.isClosed = true;
			this.websocket.close();
		}
		else {
			if(!this.isClosed) {
				this.isClosed = true;
				if(this.emuopenrequest != undefined) {
					this.emuopenrequest.abort();
					this.emuopenrequest = undefined;
				}
				else if(this.emuid != undefined) {
					if(this.emusendrequest == undefined) {
						this.closeSent = true;
						this.emusendrequest = new Core.HttpRequest({ url: 'http://'+this.host+':'+this.port+this.service+'?socket='+this.mode+'&command=close&id='+this.emuid });
						this.connect(this.emusendrequest, 'done', this.onEmuSocketSendDone);
						this.connect(this.emusendrequest, 'error', this.onEmuSocketSendError);
						this.emusendrequest.send();
					}
				}
			}
		}
	},

	/**#@+
	* @private
	*/
	onWebSocketOpen: function() {
		this.fireEvent('open', this);
	},

	onWebSocketError: function() {
		this.fireEvent('error', this);
	},

	onWebSocketMessage: function(msg) {
		if(msg.data == 'PING')
			this.websocket.send('PONG');
		else
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
			if(data != 'keepalive')
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

	onEmuSocketSendDone: function() {
		var response = this.emusendrequest.getResponseJSON();
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
			this.emusendrequest.send();
			this.emumessages = [];
		}
		else if(this.isClosed && !this.closeSent) {
			this.emusendrequest = new Core.HttpRequest({ url: 'http://'+this.host+':'+this.port+this.service+'?socket='+this.mode+'&command=close&id='+this.emuid });
			this.connect(this.emusendrequest, 'done', this.onEmuSocketSendDone);
			this.connect(this.emusendrequest, 'error', this.onEmuSocketSendError);
			this.emusendrequest.send();
		}
		else
			this.emusendrequest = undefined;
	},

	onEmuSocketSendError: function() {
		this.emusendrequest = undefined;
	},

	onEmuSocketOpenDone: function() {
		var response = this.emuopenrequest.getResponseJSON();
		this.emuopenrequest = undefined;
		if(response == undefined) {
			this.fireEvent('error', this);
			this.fireEvent('close', this);
		}
		else {
			this.emuid = response.id;
			if(response.status != 'open') {
				this.fireEvent('error', this);
				this.fireEvent('close', this);
			}
			else {
				this.fireEvent('open', this);
				this.emupollrequest = new Core.HttpRequest({ url: 'http://'+this.host+':'+this.port+this.service+'?socket=poll&command=poll&id='+this.emuid });
				this.connect(this.emupollrequest, 'done', this.onEmuSocketPollDone);
				this.connect(this.emupollrequest, 'error', this.onEmuSocketPollError);
				this.emupollrequest.send();
			}
		}
	},

	onEmuSocketOpenError: function(request, status) {
		this.emuopenrequest = undefined;
		this.fireEvent('error', this);
		this.fireEvent('close', this);
	},

	onEmuSocketPollDone: function() {
		var response = this.emupollrequest.getResponseJSON();
		if(response == undefined) {
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
			if(response.status != 'open') {
				this.close();
				this.fireEvent('close', this);
			}
			else {
				this.emupollrequest = new Core.HttpRequest({ url: 'http://'+this.host+':'+this.port+this.service+'?socket=poll&command=poll&id='+this.emuid });
				this.connect(this.emupollrequest, 'done', this.onEmuSocketPollDone);
				this.connect(this.emupollrequest, 'error', this.onEmuSocketPollError);
				this.emupollrequest.send();
			}
		}
	},

	onEmuSocketPollError: function() {
		this.emupollrequest = undefined;
		this.fireEvent('error', this);
		this.close();
	}
	/**#@-*/
});


Core.Socket.supportWebSocket = "WebSocket" in window;

