Ui.Element.extend('Ui.Audio', 
/**@lends Ui.Audio#*/
{
	src: undefined,
	oggSrc: undefined,
	mp3Src: undefined,
	wavSrc: undefined,
	loaddone: false,
	audioDrawing: undefined,
	canplaythrough: false,
	// possible values [initial|playing|paused|buffering|error]
	state: 'initial',

	/**
	*	@constructs
	*	@class
	*	@extends Ui.Element
	*/
	constructor: function(config) {
		this.addEvents('ready', 'ended', 'timeupdate', 'bufferingupdate', 'statechange', 'error');
		this.connect(this, 'unload', this.onAudioUnload);
		if((config.oggSrc != undefined) || (config.mp3Src != undefined) || (config.wavSrc != undefined)) {
			if((config.oggSrc != undefined) && (Ui.Audio.supportOgg))
				this.setSrc(config.oggSrc);
			else if((config.aacSrc != undefined) && (Ui.Audio.supportAac))
				this.setSrc(config.aacSrc);
			else if((config.mp3Src != undefined) && (Ui.Audio.supportMp3))
				this.setSrc(config.mp3Src);
			else if((config.wavSrc != undefined) && (Ui.Audio.supportWav))
				this.setSrc(config.wavSrc);
			delete(config.oggSrc);
			delete(config.aacSrc);
			delete(config.mp3Src);
			delete(config.wavSrc);
		}
	},

	/**
	* Set the file URL for the current audio element
	*/
	setSrc: function(src) {
		this.canplaythrough = false;
		this.state = 'initial';
		this.src = src;
		this.audioDrawing.setAttribute('src', src);
		try {
			this.audioDrawing.load();
		} catch(e) {}
	},

	/**
	* Play the audio element. If the element is already playing
	* stop it and restart from the begining.
	*/
	play: function() {
		this.state = 'playing';
		this.fireEvent('statechange', this, this.state);
		if(this.canplaythrough)
			this.audioDrawing.play();
		else
			this.audioDrawing.load();
	},

	/**
	* Pause the audio element. If the element is not
	* currently playing, do nothing.
	*/
	pause: function() {
		this.state = 'paused';
		this.fireEvent('statechange', this, this.state);
		if(this.canplaythrough)
			this.audioDrawing.pause();
		else
			this.audioDrawing.load();
	},

	/**
	* Stop the sound if playing.
	*/
	stop: function() {
		this.audioDrawing.pause();
		this.onEnded();
	},

	/**
	* Set the audio volume between 0 and 1
	*/
	setVolume: function(volume) {
		this.audioDrawing.volume = volume;
	},

	/**
	* Get the audio volume between 0 and 1
	*/
	getVolume: function() {
		return this.audioDrawing.volume;
	},

	/**
	* @return the duration in seconds of the audio file
	* or undefined if unknown. This value is only known
	* after the ready event.
	*/
	getDuration: function() {
		return this.audioDrawing.duration;
	},

	/**
	 * Seek the current position of the audio file.
	 */
	setCurrentTime: function(time) {
		this.audioDrawing.currentTime = time;
	},

	/**
	 * Return the current position in seconds.
	 * This value is only known after the ready event.
	 */
	getCurrentTime: function() {
		if(this.audioDrawing.currentTime == undefined)
			return 0;
		else
			return this.audioDrawing.currentTime;
	},

	/**
	 * Return the current state of the media
	 */
	getState: function() {
		return this.state;
	},

	/**
	 * Return true if the audio is ready to play
	 * and infos like duration, currentTime... are
	 * known
	 */
	getIsReady: function() {
		return this.canplaythrough;
	},

	/**#@+
	* @private
	*/
	onReady: function() {
		this.canplaythrough = true;
		if(this.state == 'playing')
			this.audioDrawing.play();
		else if(this.state == 'paused')
			this.audioDrawing.pause();
		this.fireEvent('ready');
	},

	onTimeUpdate: function() {
		this.fireEvent('timeupdate', this, this.audioDrawing.currentTime);
		this.checkBuffering();
	},

	onEnded: function() {
		this.state = 'initial';
		this.audioDrawing.currentTime = 0;
		this.fireEvent('ended', this);
		this.fireEvent('statechange', this, this.state);
	},

	onProgress: function() {
		this.checkBuffering();
	},

	getCurrentBufferSize: function() {
		var buffered = this.audioDrawing.buffered;
		var timebuffer = 0;
		var time = this.audioDrawing.currentTime;
		if(time == undefined)
			time = 0;
		var lastEnd = undefined;
		for(var i = 0; i < buffered.length; i++) {
			var start = buffered.start(i);
			var end = buffered.end(i);
			if(lastEnd == undefined) {
				if((start <= time) && (end >= time)) {
					timebuffer = end - time;
					lastEnd = end;
				}
			}
			else {
				if((lastEnd >= (start-0.01)) && (lastEnd <= end)) {
					timebuffer += (end - lastEnd);
					lastEnd = end;
				}
			}
		}
		return timebuffer;
	},

	checkBuffering: function() {
		var timebuffer = this.getCurrentBufferSize();
		var time = this.audioDrawing.currentTime;
		var duration = this.audioDrawing.duration;

		if(this.state == 'buffering') {
			// if we have 5s in the buffer or if the browser already decided
			// to stop buffering or if we are at the end
			if((timebuffer >= 5) || (this.audioDrawing.networkState == 1) || (time + timebuffer >= duration)) {
				this.state = 'playing';
				this.audioDrawing.play();
				this.fireEvent('statechange', this, this.state);
			}
		}
		else if(this.state == 'playing') {
			// if remains less than 100ms in the buffer, pause
			// to let enought time for the buffer to grow
			if((timebuffer <= 0.1) && (time + timebuffer < duration)) {
				this.state = 'buffering';
				this.audioDrawing.pause();
				this.fireEvent('statechange', this, this.state);
			}
		}
		this.fireEvent('bufferingupdate', this, timebuffer);
	},

	onError: function() {
		this.state = 'error';
		this.fireEvent('error', this, this.audioDrawing.error.code);
		this.fireEvent('statechange', this, this.state);
	},

	onWaiting: function() {
		if(!this.canplaythrough)
			this.audioDrawing.load();
	},

	onAudioUnload: function() {
		if(this.canplaythrough)
			this.pause();
	}
	/**#@-*/
}, 
/**@lends Ui.Audio#*/
{
	verticalAlign: 'top',
	horizontalAlign: 'left',

	renderDrawing: function() {
		var drawing;
		if(Ui.Audio.htmlAudio) {
			this.audioDrawing = document.createElement('audio');
			this.audioDrawing.style.display = 'none';
			this.connect(this.audioDrawing, 'canplaythrough', this.onReady);
			this.connect(this.audioDrawing, 'ended', this.onEnded);
			this.connect(this.audioDrawing, 'timeupdate', this.onTimeUpdate);
			this.connect(this.audioDrawing, 'error', this.onError);
			this.connect(this.audioDrawing, 'progress', this.onProgress);
			this.connect(this.audioDrawing, 'waiting', this.onWaiting);
			this.audioDrawing.setAttribute('preload', 'auto');
			this.audioDrawing.load();
			drawing = this.audioDrawing;
		}
		else {
			drawing = Ui.Audio.base.renderDrawing.apply(this, arguments);
		}
		return drawing;
	}
});

// detect what audio system is supported
Ui.Audio.htmlAudio = false;
Ui.Audio.flashAudio = false;
Ui.Audio.supportOgg = false;
Ui.Audio.supportMp3 = false;
Ui.Audio.supportWav = false;
Ui.Audio.supportAac = false;

// check for HTMLAudioElement
Ui.Audio.audioTest = document.createElement('audio');
if(Ui.Audio.audioTest.play != undefined) {
	Ui.Audio.htmlAudio = true;
	Ui.Audio.supportWav = !!Ui.Audio.audioTest.canPlayType && "" != Ui.Audio.audioTest.canPlayType('audio/wav');
	Ui.Audio.supportMp3 = !!Ui.Audio.audioTest.canPlayType && "" != Ui.Audio.audioTest.canPlayType('audio/mpeg');
	Ui.Audio.supportOgg = !!Ui.Audio.audioTest.canPlayType && "" != Ui.Audio.audioTest.canPlayType('audio/ogg; codecs="vorbis"');
	Ui.Audio.supportAac = !!Ui.Audio.audioTest.canPlayType && "" != Ui.Audio.audioTest.canPlayType('audio/mp4; codecs="mp4a.40.2"');
}
Ui.Audio.audioTest = undefined;


