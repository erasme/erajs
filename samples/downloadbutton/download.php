<?php

$file = "building.png";

$handle = fopen($file, 'rb');
	
$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mimetype = finfo_file($finfo, $file);
finfo_close($finfo);

// send headers
header("Content-Type: ".$mimetype);
header("Content-Disposition: attachment; filename=\"$file\"");
header("Content-Length: ".filesize($file));

// send the file content
fpassthru($handle);

?>
