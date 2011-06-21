<?php

$res = '';

$dir = './';

$handle = opendir($dir);
while(($file = readdir($handle)) !== false) {
	if(($file == '.') || ($file == '..'))
		continue;
	if(filetype($dir.'/'.$file) == 'dir') {
		if($res != '')
			$res .= ', ';
		$res .= "\"$file\"";
	}
}
closedir($handle);

echo "{ \"samples\": [ $res ] }";


?>
