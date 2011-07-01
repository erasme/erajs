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
		if((config.oggSrc != undefined) || (config.mp3Src != undefined) || (config.wavSrc != undefined)) {
			if((config.oggSrc != undefined) && (Ui.Audio.supportOgg))
				this.setSrc(config.oggSrc);
			else if((config.mp3Src != undefined) && (Ui.Audio.supportMp3))
				this.setSrc(config.mp3Src);
			else if((config.wavSrc != undefined) && (Ui.Audio.supportWav))
				this.setSrc(config.wavSrc);
		}
		else if(config.src != undefined)
			this.setSrc(config.src);

		if(config.volume != undefined)
			this.setVolume(config.volume);

		this.addEvents('ready', 'ended', 'timeupdate');
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
			try {
				this.audioDrawing.pause();
				this.audioDrawing.currentTime = 0;
			} catch(e) {}
			this.audioDrawing.play();
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
		if(!this.paused)
			this.audioDrawing.pause();
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

	/**#@+
	* @private
	*/
	onReady: function() {
		this.fireEvent('ready');
	},

	onTimeupdate: function() {
		this.fireEvent('timeupdate', this.audioDrawing.currentTime);
	},

	onEnded: function() {
		this.playing = false;
		this.fireEvent('ended');
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


