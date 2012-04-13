Ui.Element.extend('Ui.Video', 
/**@lends Ui.Video#*/
{
	src: undefined,
	oggSrc: undefined,
	mp3Src: undefined,
	webmSrc: undefined,
	loaddone: false,
	videoDrawing: undefined,
	playing: false,
	paused: false,
	naturalWidth: undefined,
	naturalHeight: undefined,
	canplaythrough: false,

	/**
	 * @constructs
	 * @class
	 * @extends Ui.Element
	 */
	constructor: function(config) {
		this.addEvents('ready', 'ended', 'timeupdate');
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
		this.loaddone = false;
		this.src = src;
		if(Ui.Video.htmlVideo)
			this.videoDrawing.setAttribute('src', src);
	},

	/**
	 * Play the video element. If the element is already playing
	 * stop it and restart from the begining.
	 */
	play: function() {
		if(Ui.Video.htmlVideo) {
			if(!this.canplaythrough) {
				try {
					this.videoDrawing.load();
				} catch(e) {}				
			}
			else {
				try {
					this.videoDrawing.play();

//					this.videoDrawing.pause();
//					this.videoDrawing.currentTime = 0;
	//				this.videoDrawing.load();
				} catch(e) {}
//			this.videoDrawing.play();
			}
		}
		this.playing = true;
		this.paused = false;
	},

	/**
	 * Pause the video element. If the element is not
	 * currently playing, do nothing.
	 */
	pause: function() {
		if(!this.playing || this.paused)
			return;
		this.paused = true;
		if(Ui.Video.htmlVideo)
			this.videoDrawing.pause();
	},

	/**
	 * Stop the video if playing.
	 */
	stop: function() {
		if(!this.playing)
			return;
		if(!this.paused) {
			this.paused = false;
			this.videoDrawing.pause();
		}
		this.playing = false;
		if(Ui.Video.htmlVideo)
			this.videoDrawing.currentTime = 0;
		this.onEnded();
	},

	/**
	 * Resume the videl element if in paused else
	 * do nothing.
	 */
	resume: function() {
		if(!this.playing || !this.paused)
			return;
		this.paused = false;
		if(Ui.Video.htmlVideo)
			this.videoDrawing.play();
	},

	/**
	 * Set the audio volume between 0 and 1
	 */
	setVolume: function(volume) {
		if(Ui.Video.htmlVideo)
			this.videoDrawing.volume = volume;
	},

	/**
	 * Get the audio volume between 0 and 1
	 */
	getVolume: function() {
		if(Ui.Video.htmlVideo)
			return this.videoDrawing.volume;
		return 1;
	},

	/**
	 * Return the duration in seconds of the video file
	 * or undefined if unknown. This value is only known
	 * after the ready event.
	 */
	getDuration: function() {
		return this.videoDrawing.duration;
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

	//
	// Private
	//

	onReady: function() {
		this.naturalWidth = this.videoDrawing.videoWidth;
		this.naturalHeight = this.videoDrawing.videoHeight;
		this.fireEvent('ready');
		this.canplaythrough = true;
		if(this.playing && !this.paused)
			this.videoDrawing.play();
	},

	onTimeupdate: function() {
		this.checkBuffering();
		this.fireEvent('timeupdate', this.videoDrawing.currentTime);
	},

	onEnded: function() {
		this.playing = false;
		this.paused = false;
		this.fireEvent('ended');
	},

	onWaiting: function() {
		if(this.playing && !this.paused)
			this.videoDrawing.pause();
	},

	getCurrentBufferSize: function() {
		var buffered = this.videoDrawing.buffered;
		var timebuffer = 0;
		var time = this.videoDrawing.currentTime;
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
			var time = this.videoDrawing.currentTime;
			var duration = this.videoDrawing.duration;
			if(time >= duration)
				return;
			if(this.videoDrawing.paused) {
				if((timebuffer > 5) || (time + timebuffer >= duration))
					this.videoDrawing.play();
			}
			else {
				if((timebuffer < 1) && (time + timebuffer < duration))
					this.videoDrawing.pause();
			}
		}
	},

	onVideoUnload: function() {
		this.playing = false;
		this.paused = false;
		this.videoDrawing.pause();
	}
}, 
/**@lends Ui.Video#*/
{
	render: function() {
		var drawing;
		if(Ui.Video.htmlVideo) {
			this.videoDrawing = document.createElement('video');
			this.connect(this.videoDrawing, 'canplaythrough', this.onReady);
			this.connect(this.videoDrawing, 'ended', this.onEnded);
			this.connect(this.videoDrawing, 'timeupdate', this.onTimeupdate);
			this.connect(this.videoDrawing, 'progress', this.checkBuffering);
			this.connect(this.videoDrawing, 'waiting', this.onWaiting);
			this.videoDrawing.setAttribute('preload', 'auto');
			this.videoDrawing.load();
			this.videoDrawing.style.position = 'absolute';
			this.videoDrawing.style.left = '0px';
			this.videoDrawing.style.top = '0px';
			drawing = this.videoDrawing;
		}
		return drawing;
	},

	arrangeCore: function(width, height) {
		if(Ui.Video.htmlVideo) {
			this.videoDrawing.setAttribute('width', width);
			this.videoDrawing.setAttribute('height', height);
			// correct webkit bug
//			if(navigator.isWebkit) {
//				var matrix = this.foreignObject.getScreenCTM();
//				this.videoDrawing.style.webkitTransform = 'matrix('+matrix.a.toFixed(4)+','+matrix.b.toFixed(4)+','+matrix.c.toFixed(4)+','+matrix.d.toFixed(4)+','+matrix.e.toFixed(4)+','+matrix.f.toFixed(4)+')';
//				this.videoDrawing.style.webkitTransformOrigin = '0px 0px';
//			}
			// correct IE that handle nothing
//			if(navigator.isIE) {
//				var matrix = this.foreignObject.getScreenCTM();
//				this.videoDrawing.style.left = matrix.e+'px';
//				this.videoDrawing.style.top = matrix.f+'px';
//			}
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
// TODO: flash support
//		Ui.Video.flashVideo = true;
Ui.Video.videoTest = undefined;

//console.log('Video rendering HTML: '+Ui.Video.htmlVideo+', Flash: '+Ui.Video.flashVideo);
//console.log('Video format OGG: '+Ui.Video.supportOgg+', MP4: '+Ui.Video.supportMp4+', WebM: '+Ui.Video.supportWebm);
