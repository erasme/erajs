Ui.Element.extend('Ui.Audio', 
/**@lends Ui.Audio#*/
{
	src: undefined,
	oggSrc: undefined,
	mp3Src: undefined,
	wavSrc: undefined,
	loaddone: false,
	audioDrawing: undefined,
	playing: false,
	paused: false,

	/**
	*	@constructs
	*	@class
	*	@extends Ui.Element
	*/
	constructor: function(config) {
		this.addEvents('ready', 'ended', 'timeupdate');
		this.connect(this, 'unload', this.onAudioUnload);
		if((config.oggSrc != undefined) || (config.mp3Src != undefined) || (config.wavSrc != undefined)) {
			if((config.oggSrc != undefined) && (Ui.Audio.supportOgg))
				this.setSrc(config.oggSrc);
			else if((config.mp3Src != undefined) && (Ui.Audio.supportMp3))
				this.setSrc(config.mp3Src);
			else if((config.wavSrc != undefined) && (Ui.Audio.supportWav))
				this.setSrc(config.wavSrc);
			delete(config.oggSrc);
			delete(config.mp3Src);
			delete(config.wavSrc);
		}
	},

	/**
	* Set the file URL for the current audio element
	*/
	setSrc: function(src) {
		this.loaddone = false;
		this.src = src;
		if(Ui.Audio.htmlAudio)
			this.audioDrawing.setAttribute('src', src);
	},

	/**
	* Play the audio element. If the element is already playing
	* stop it and restart from the begining.
	*/
	play: function() {
		if(Ui.Audio.htmlAudio) {
			if(!this.canplaythrough) {
				try {
					this.audioDrawing.load();
				} catch(e) {}				
			}
			else {
				try {
					this.audioDrawing.play();
				} catch(e) {}
			}
		}
		this.playing = true;
		this.paused = false;
	},

	/**
	* Pause the audio element. If the element is not
	* currently playing, do nothing.
	*/
	pause: function() {
		if(!this.playing || this.paused)
			return;
		this.paused = true;
		if(Ui.Audio.htmlAudio)
			this.audioDrawing.pause();
	},

	/**
	* Stop the sound if playing.
	*/
	stop: function() {
		if(!this.playing)
			return;
		if(!this.paused) {
			this.paused = false;
			this.audioDrawing.pause();
		}
		this.playing = false;
		if(Ui.Audio.htmlAudio)
			this.audioDrawing.currentTime = 0;
		this.onEnded();
	},

	/**
	* Resume the audio element if in paused else
	* do nothing.
	*/
	resume: function() {
		if(!this.playing || !this.paused)
			return;
		this.paused = false;
		if(Ui.Audio.htmlAudio)
			this.audioDrawing.play();
	},

	/**
	* Set the audio volume between 0 and 1
	*/
	setVolume: function(volume) {
		if(Ui.Audio.htmlAudio)
			this.audioDrawing.volume = volume;
	},

	/**
	* Get the audio volume between 0 and 1
	*/
	getVolume: function() {
		if(Ui.Audio.htmlAudio)
			return this.audioDrawing.volume;
		return 1;
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
		return this.audioDrawing.currentTime;
	},

	/**#@+
	* @private
	*/
	onReady: function() {
		this.fireEvent('ready');
		this.canplaythrough = true;
		if(this.playing && !this.paused)
			this.audioDrawing.play();
	},

	onTimeupdate: function() {
		this.checkBuffering();
		this.fireEvent('timeupdate', this.audioDrawing.currentTime);
	},

	onEnded: function() {
		this.playing = false;
		this.paused = false;
		this.fireEvent('ended');
	},

	onWaiting: function() {
		if(this.playing && !this.paused)
			this.audioDrawing.pause();
	},

	getCurrentBufferSize: function() {
		var buffered = this.audioDrawing.buffered;
		var timebuffer = 0;
		var time = this.audioDrawing.currentTime;
		for(var i = 0; i < buffered.length; i++) {
			var start = buffered.start(i);
			var end = buffered.end(i);
			if((start <= time) && (end >= time)) {
				timebuffer = end - time;
				break;
			}
		}
		return timebuffer;
	},

	checkBuffering: function() {
		if(this.playing && !this.paused) {
			var timebuffer = this.getCurrentBufferSize();
			var time = this.audioDrawing.currentTime;
			var duration = this.audioDrawing.duration;
			if(time >= duration)
				return;
			if(this.audioDrawing.paused) {
				if((timebuffer > 5) || (time + timebuffer >= duration))
					this.audioDrawing.play();
			}
			else {
				if((timebuffer < 1) && (time + timebuffer < duration))
					this.audioDrawing.pause();
			}
		}
	},

	onAudioUnload: function() {
		this.playing = false;
		this.paused = false;
		this.audioDrawing.pause();
	}
	/**#@-*/
}, 
/**@lends Ui.Audio#*/
{
	verticalAlign: 'top',
	horizontalAlign: 'left',

	render: function() {
		var drawing;
		if(Ui.Audio.htmlAudio) {
			this.audioDrawing = document.createElement('audio');
			this.audioDrawing.style.display = 'none';
			this.connect(this.audioDrawing, 'canplaythrough', this.onReady);
			this.connect(this.audioDrawing, 'ended', this.onEnded);
			this.connect(this.audioDrawing, 'timeupdate', this.onTimeupdate);
			this.connect(this.audioDrawing, 'progress', this.checkBuffering);
			this.connect(this.audioDrawing, 'waiting', this.onWaiting);
			this.audioDrawing.setAttribute('preload', 'auto');
			this.audioDrawing.load();
			drawing = this.audioDrawing;
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

// check for HTMLAudioElement
Ui.Audio.audioTest = document.createElement('audio');
if(Ui.Audio.audioTest.play != undefined) {
	Ui.Audio.htmlAudio = true;
	Ui.Audio.supportWav = !!Ui.Audio.audioTest.canPlayType && "" != Ui.Audio.audioTest.canPlayType('audio/wav');
	Ui.Audio.supportMp3 = !!Ui.Audio.audioTest.canPlayType && "" != Ui.Audio.audioTest.canPlayType('audio/mpeg');
	Ui.Audio.supportOgg = !!Ui.Audio.audioTest.canPlayType && "" != Ui.Audio.audioTest.canPlayType('audio/ogg; codecs="vorbis"');
}
// TODO: flash support
//		Ui.Audio.flashAudio = true;
Ui.Audio.audioTest = undefined;


