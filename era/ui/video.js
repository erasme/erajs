Ui.Element.extend('Ui.Video', 
/**@lends Ui.Video#*/
{
	src: undefined,
	poster: undefined,
	oggSrc: undefined,
	mp4Src: undefined,
	webmSrc: undefined,
	loaddone: false,
	videoDrawing: undefined,
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
		this.connect(this, 'unload', this.onVideoUnload);
		if((config.oggSrc != undefined) || (config.mp4Src != undefined) || (config.webmSrc != undefined)) {
			if((config.oggSrc != undefined) && (Ui.Video.supportOgg))
				this.setSrc(config.oggSrc);
			else if((config.mp4Src != undefined) && (Ui.Video.supportMp4))
				this.setSrc(config.mp4Src);
			else if((config.webmSrc != undefined) && (Ui.Video.supportWebm))
				this.setSrc(config.webmSrc);
			delete(config.oggSrc);
			delete(config.mp4Src);
			delete(config.webmSrc);
		}
	},

	/**
	* Set the file URL for the current video element
	*/
	setSrc: function(src) {
		this.canplaythrough = false;
		this.state = 'initial';
		this.src = src;
		this.videoDrawing.setAttribute('src', src);
		try {
			this.videoDrawing.load();
		} catch(e) {}
	},
	
	/**
	* Set the file URL for the current video poster (preview)
	*/
	setPoster: function(src) {
		this.poster = src;
		this.videoDrawing.setAttribute('poster', src);
	},

	/**
	* Play the video element. If the element is already playing
	* stop it and restart from the begining.
	*/
	play: function() {
		this.state = 'playing';
		this.fireEvent('statechange', this, this.state);
		if(this.canplaythrough)
			this.videoDrawing.play();
		else
			this.videoDrawing.load();
	},

	/**
	* Pause the video element. If the element is not
	* currently playing, do nothing.
	*/
	pause: function() {
		this.state = 'paused';
		this.fireEvent('statechange', this, this.state);
		if(this.canplaythrough)
			this.videoDrawing.pause();
		else
			this.videoDrawing.load();
	},

	/**
	* Stop the sound if playing.
	*/
	stop: function() {
		this.videoDrawing.pause();
		this.onEnded();
	},

	/**
	* Set the video volume between 0 and 1
	*/
	setVolume: function(volume) {
		this.videoDrawing.volume = volume;
	},

	/**
	* Get the video volume between 0 and 1
	*/
	getVolume: function() {
		return this.videoDrawing.volume;
	},

	/**
	* @return the duration in seconds of the video file
	* or undefined if unknown. This value is only known
	* after the ready event.
	*/
	getDuration: function() {
		return this.videoDrawing.duration;
	},

	/**
	 * Seek the current position of the video file.
	 */
	setCurrentTime: function(time) {
		this.videoDrawing.currentTime = time;
	},

	/**
	 * Return the current position in seconds.
	 * This value is only known after the ready event.
	 */
	getCurrentTime: function() {
		if(this.videoDrawing.currentTime == undefined)
			return 0;
		else
			return this.videoDrawing.currentTime;
	},

	/**
	 * Return the current state of the media
	 */
	getState: function() {
		return this.state;
	},

	/**
	 * Return true if the video is ready to play
	 * and infos like duration, currentTime... are
	 * known
	 */
	getIsReady: function() {
		return this.canplaythrough;
	},

	/**
	 * Return the natural width of the image as defined
	 * in the image file. Return undefined if the image is
	 * not ready
	 */
	getNaturalWidth: function() {
		return this.naturalWidth;
	},

	/**
	 * Return the natural height of the image as defined
	 * in the image file. Return undefined if the image is
	 * not ready
	 */
	getNaturalHeight: function() {
		return this.naturalHeight;
	},

	/**#@+
	* @private
	*/
	onReady: function() {
		this.canplaythrough = true;
		this.naturalWidth = this.videoDrawing.videoWidth;
		this.naturalHeight = this.videoDrawing.videoHeight;
		if(this.state == 'playing')
			this.videoDrawing.play();
		else if(this.state == 'paused')
			this.videoDrawing.pause();
		this.fireEvent('ready');
	},

	onTimeUpdate: function() {
		this.fireEvent('timeupdate', this, this.videoDrawing.currentTime);
		this.checkBuffering();
	},

	onEnded: function() {
		this.videoDrawing.pause();
		this.state = 'initial';
		this.videoDrawing.currentTime = 0;
		this.fireEvent('ended', this);
		this.fireEvent('statechange', this, this.state);
	},

	onProgress: function() {
		this.checkBuffering();
	},

	getCurrentBufferSize: function() {
		var buffered = this.videoDrawing.buffered;
		var timebuffer = 0;
		var time = this.videoDrawing.currentTime;
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
		var time = this.videoDrawing.currentTime;
		var duration = this.videoDrawing.duration;

		if(this.state == 'buffering') {
			// if we have 5s in the buffer or if the browser already decided
			// to stop buffering or if we are at the end
			if((timebuffer >= 5) || (this.videoDrawing.networkState == 1) || (time + timebuffer >= duration)) {
				this.state = 'playing';
				this.videoDrawing.play();
				this.fireEvent('statechange', this, this.state);
			}
		}
		else if(this.state == 'playing') {
			// if remains less than 100ms in the buffer, pause
			// to let enought time for the buffer to grow
			if((timebuffer <= 0.1) && (time + timebuffer < duration)) {
				this.state = 'buffering';
				this.videoDrawing.pause();
				this.fireEvent('statechange', this, this.state);
			}
		}
		this.fireEvent('bufferingupdate', this, timebuffer);
	},

	onError: function() {
		this.state = 'error';
		this.fireEvent('error', this, this.videoDrawing.error.code);
		this.fireEvent('statechange', this, this.state);
	},

	onWaiting: function() {
		if(!this.canplaythrough)
			this.videoDrawing.load();
	},

	onVideoUnload: function() {
		if(this.canplaythrough)
			this.pause();
	}
	/**#@-*/
}, 
/**@lends Ui.Video#*/
{
	renderDrawing: function() {
		if(Ui.Video.htmlVideo) {
			this.videoDrawing = document.createElement('video');
			this.connect(this.videoDrawing, 'canplaythrough', this.onReady);
			this.connect(this.videoDrawing, 'ended', this.onEnded);
			this.connect(this.videoDrawing, 'timeupdate', this.onTimeUpdate);
			this.connect(this.videoDrawing, 'error', this.onError);
			this.connect(this.videoDrawing, 'progress', this.onProgress);
			this.connect(this.videoDrawing, 'waiting', this.onWaiting);
			this.videoDrawing.setAttribute('preload', 'auto');
			this.videoDrawing.load();
			this.videoDrawing.style.position = 'absolute';
			this.videoDrawing.style.left = '0px';
			this.videoDrawing.style.top = '0px';
		}
		return this.videoDrawing;
	},


	arrangeCore: function(width, height) {
		if(Ui.Video.htmlVideo) {
			this.videoDrawing.setAttribute('width', width);
			this.videoDrawing.setAttribute('height', height);
		}
	}
});

// detect what video system is supported
Ui.Video.htmlVideo = false;
Ui.Video.flashVideo = false;
Ui.Video.supportOgg = false;
Ui.Video.supportMp4 = false;
Ui.Video.supportWebm = false;

// check for HTMLVideoElement
Ui.Video.videoTest = document.createElement('video');
if(Ui.Video.videoTest.play != undefined) {
	Ui.Video.htmlVideo = true;
	Ui.Video.supportMp4 = !!Ui.Video.videoTest.canPlayType && "" != Ui.Video.videoTest.canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"');
	Ui.Video.supportOgg = !!Ui.Video.videoTest.canPlayType && "" != Ui.Video.videoTest.canPlayType('video/ogg; codecs="theora, vorbis"');
	Ui.Video.supportWebm = !!Ui.Video.videoTest.canPlayType && "" != Ui.Video.videoTest.canPlayType('video/webm; codecs="vp8, vorbis"');
}
Ui.Video.videoTest = undefined;

