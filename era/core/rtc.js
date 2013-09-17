
if('mozRTCPeerConnection' in window)
	RTCPeerConnection = mozRTCPeerConnection;
else if('webkitRTCPeerConnection' in window)
	RTCPeerConnection = webkitRTCPeerConnection;

// The RTCSessionDescription object.
if('mozRTCSessionDescription' in window)
	RTCSessionDescription = mozRTCSessionDescription;
else if('webkitRTCSessionDescription' in window)
	RTCSessionDescription = webkitRTCSessionDescription;

// The RTCIceCandidate object.
if('mozRTCIceCandidate' in window)
	RTCIceCandidate = mozRTCIceCandidate;
else if('webkitRTCIceCandidate' in window)
	RTCIceCandidate = webkitRTCIceCandidate;

navigator.supportWebRTC = (('RTCPeerConnection' in window) && (RTCPeerConnection !== undefined));
