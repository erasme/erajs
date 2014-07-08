Core.Object.extend('Core.RemoteDebug', 
/**@lends Core.RemoteDebug#*/
{
	host: undefined,
	port: undefined,
	socket: undefined,
	socketAlive: false,
	retryTask: undefined,
	nativeConsole: undefined,
	buffer: undefined,

	/**
	*	@constructs
	*	@class
	*	@extends Core.Object
	*/
	constructor: function(config) {
		Core.RemoteDebug.current = this;

		this.host = config.host;
		delete(config.host);
		this.port = config.port;
		delete(config.port);

		this.buffer = [];
		this.nativeConsole = window.console;
		window.console = {
			log: Core.RemoteDebug.onConsoleLog,
			error: Core.RemoteDebug.onConsoleError,
			warn: Core.RemoteDebug.onConsoleWarn
		};
		window.onerror = Core.RemoteDebug.onError;
		this.startSocket();
	},

	startSocket: function() {
		this.socket = new Core.Socket({ service: '/', host: this.host, port: this.port });
		this.connect(this.socket, 'open', this.onSocketOpen);
		this.connect(this.socket, 'error', this.onSocketError);
		this.connect(this.socket, 'close', this.onSocketClose);
	},

	onSocketOpen: function() {
		this.socketAlive = true;
		while(this.buffer.length > 0) {
			this.socket.send(this.buffer.shift());
		}
	},

	onSocketError: function() {
		this.socketAlive = false;
		this.socket.close();
	},

	onSocketClose: function() {
		this.socketAlive = false;
		this.disconnect(this.socket, 'error', this.oSocketError);
		this.disconnect(this.socket, 'close', this.onSocketClose);
		this.socket = undefined;
		this.retryTask = new Core.DelayedTask({ delay: 5, scope: this, callback: this.startSocket });
	},

	onConsoleLog: function(message) {
		if(this.socketAlive)
			this.socket.send(JSON.stringify({ type: 'log', message: message }));
		else
			this.buffer.push(JSON.stringify({ type: 'log', message: message }));
	},

	onConsoleError: function(message) {
		if(this.socketAlive)
			this.socket.send(JSON.stringify({ type: 'error', message: message }));
		else
			this.buffer.push(JSON.stringify({ type: 'error', message: message }));
	},

	onConsoleWarn: function(message) {
		if(this.socketAlive)
			this.socket.send(JSON.stringify({ type: 'warn', message: message }));
		else
			this.buffer.push(JSON.stringify({ type: 'warn', message: message }));
	},

	onError: function(message, url, line) {
		if(this.socketAlive)
			this.socket.send(JSON.stringify({ type: 'warn', message: message, url: url, line: line }));
		else
			this.buffer.push(JSON.stringify({ type: 'warn', message: message, url: url, line: line }));
	}
}, {}, {
	current: undefined,

	onConsoleLog: function(message) {
		Core.RemoteDebug.current.onConsoleLog.call(Core.RemoteDebug.current, message);
	},

	onConsoleError: function(message) {
		Core.RemoteDebug.current.onConsoleError.call(Core.RemoteDebug.current, message);
	},

	onConsoleWarn: function(message) {
		Core.RemoteDebug.current.onConsoleWarn.call(Core.RemoteDebug.current, message);
	},

	onError: function(message, url, line) {
		Core.RemoteDebug.current.onError.call(Core.RemoteDebug.current, message, url, line);
	}	
});

