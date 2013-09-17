

if(!('getUserMedia' in navigator)) {
	if('webkitGetUserMedia' in navigator)
		navigator.getUserMedia = navigator.webkitGetUserMedia.bind(navigator);
	else if('mozGetUserMedia' in navigator)
		navigator.getUserMedia = navigator.mozGetUserMedia.bind(navigator);
	else
		navigator.getUserMedia = undefined;
}

navigator.supportUserMedia = (navigator.getUserMedia !== undefined);
