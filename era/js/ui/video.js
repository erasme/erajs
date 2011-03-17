
Ui.Element.extend('Ui.Video', {
	src: undefined,
	oggSrc: undefined,
	mp3Src: undefined,
	webmSrc: undefined,
	loaddone: false,
	videoDrawing: undefined,
	playing: false,
	paused: false,

	constructor: function(config) {
		if((config.oggSrc != undefined) || (config.mp4Src != undefined) || (config.webmSrc != undefined)) {
			if((config.oggSrc != undefined) && (Ui.Video.supportOgg))
				this.setSrc(config.oggSrc);
			else if((config.mp4Src != undefined) && (Ui.Video.supportMp4))
				this.setSrc(config.mp4Src);
			else if((config.webmSrc != undefined) && (Ui.Video.supportWebm))
				this.setSrc(config.webmSrc);
		}
		else if(config.src != undefined)
			this.setSrc(config.src);

		if(config.volume != undefined)
			this.setVolume(config.volume);

		this.addEvents('ready', 'ended', 'timeupdate');
	},

	//
	// Set the file URL for the current video element
	//
	setSrc: function(src) {
		this.loaddone = false;
		this.src = src;

		if(Ui.Video.htmlVideo)
			this.videoDrawing.setAttributeNS(null, 'src', src);
	},

	//
	// Play the video element. If the element is already playing
	// stop it and restart from the begining.
	//
	play: function() {
		if(Ui.Video.htmlVideo) {
			try {
				this.videoDrawing.pause();
				this.videoDrawing.currentTime = 0;
			} catch(e) {}
			this.videoDrawing.play();
		}
		this.playing = true;
		this.paused = false;
	},

	//
	// Pause the video element. If the element is not
	// currently playing, do nothing.
	//
	pause: function() {
		if(!this.playing || this.paused)
			return;
		this.paused = true;
		if(Ui.Video.htmlVideo)
			this.videoDrawing.pause();
	},

	//
	// Stop the video if playing.
	//
	stop: function() {
		if(!this.playing)
			return;
		if(!this.paused) {
			if(Ui.Video.htmlVideo) {
				this.videoDrawing.pause();
				this.videoDrawing.currentTime = 0;
			}
		}
		this.onEnded();
	},

	//
	// Resume the videl element if in paused else
	// do nothing.
	//
	resume: function() {
		if(!this.playing || !this.paused)
			return;
		this.paused = false;
		if(Ui.Video.htmlVideo)
			this.videoDrawing.play();
	},

	//
	// Set the audio volume between 0 and 1
	//
	setVolume: function(volume) {
		if(Ui.Video.htmlVideo)
			this.videoDrawing.volume = volume;
	},

	//
	// Get the audio volume between 0 and 1
	//
	getVolume: function() {
		if(Ui.Video.htmlVideo)
			return this.videoDrawing.volume;
		return 1;
	},

	//
	// Return the duration in seconds of the video file
	// or undefined if unknown. This value is only known
	// after the ready event.
	//
	getDuration: function() {
		return this.videoDrawing.duration;
	},

	//
	// Private
	//

	onReady: function() {
		this.fireEvent('ready');
	},

	onTimeupdate: function() {
		this.fireEvent('timeupdate', this.videoDrawing.currentTime);
	},

	onEnded: function() {
		this.playing = false;
		this.fireEvent('ended');
	},
}, {
	render: function() {
		var drawing;
		if(Ui.Video.htmlVideo) {
			this.videoDrawing = document.createElementNS(htmlNS, 'video');
			this.connect(this.videoDrawing, 'canplaythrough', this.onReady);
			this.connect(this.videoDrawing, 'ended', this.onEnded);
			this.connect(this.videoDrawing, 'timeupdate', this.onTimeupdate);
			this.videoDrawing.setAttributeNS(null, 'preload', 'auto');
			this.videoDrawing.load();
			this.videoDrawing.style.setProperty('position', 'absolute', null);
			this.videoDrawing.style.setProperty('left', '0px', null);
			this.videoDrawing.style.setProperty('top', '0px', null);
			drawing = this.videoDrawing;
		}
		return drawing;
	},

	arrangeCore: function(width, height) {
		if(Ui.Video.htmlVideo) {
			this.videoDrawing.setAttributeNS(null, 'width', width);
			this.videoDrawing.setAttributeNS(null, 'height', height);
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
	},
});

// detect what video system is supported
Ui.Video.htmlVideo = false;
Ui.Video.flashVideo = false;
Ui.Video.supportOgg = false;
Ui.Video.supportMp4 = false;
Ui.Video.supportWebm = false;

// check for HTMLVideoElement
Ui.Video.videoTest = document.createElementNS(htmlNS, 'video');
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
