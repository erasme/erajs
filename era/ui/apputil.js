Core.Object.extend('Ui.AppUtil', 
{},
{},
{
	/**{Ui.App} Reference to the current application instance*/
	current: undefined,

	getWindowIFrame: function(currentWindow) {
		if(currentWindow === undefined)
			currentWindow = window;
		var iframe = undefined;
		if(currentWindow.parent != currentWindow) {
			try {
				var frames = currentWindow.parent.document.getElementsByTagName("IFRAME");
				for(var i = 0; i < frames.length; i++) {
					if(frames[i].contentWindow === currentWindow) {
						iframe = frames[i];
						break;
					}
				}
			} catch(e) {}
		}
		return iframe;
	},

	getRootWindow: function() {
		var rootWindow = window;
		while(rootWindow.parent != rootWindow)
			rootWindow = rootWindow.parent;
		return rootWindow;
	}	
});
