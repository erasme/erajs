<?php

$file = $_GET['file'];

if(!isset($file))
	exit();

//$cmd = "ex '$file' -c 'set nobackup' -c 'TOhtml' -c 'wq! /dev/stdout' -c 'q!'";
$cmd = "screen -D -m ex '$file' -c 'colorscheme daniel' -c 'let g:html_no_progress = 1' -c 'let g:html_use_css = 0' -c 'TOhtml' -c 'wq! /tmp/syntax' -c 'q!'";

//  white nuvola vexorian vylight tolerable osx_like daniel

system($cmd);

$handle = fopen("/tmp/syntax", 'r');

do {
	$line = fgets($handle);
	if(strpos($line, "<body") === 0)
		break;
} while($line);

do {
	$line = fgets($handle);
	if(strpos($line, "</body") === 0)
		break;
	echo $line;
} while($line);

fclose($handle);

?>
