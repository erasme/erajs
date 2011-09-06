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

		$res2 = '';
		$handle2 = opendir($dir.'/'.$file);
		while(($file2 = readdir($handle2)) !== false) {
			if(($file2 == '.') || ($file2 == '..'))
				continue;
			if(filetype($dir.'/'.$file.'/'.$file2) == 'file') {
				if($res2 != '')
					$res2 .= ', ';
				$res2 .= "\"$file2\"";
			}
		}
		$res .= "{ \"dir\": \"$file\", \"sources\": [ $res2 ] }";
	}
}
closedir($handle);

header('Cache-Control: no-cache, must-revalidate');
header('Content-type: application/x-javascript');

echo "{ \"samples\": [ $res ] }";


?>
