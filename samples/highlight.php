<?php

$file = $_GET['file'];

if(!isset($file) || !file_exists($file.".highlight"))
	exit();

echo "<pre>";
echo file_get_contents($file.".highlight");
echo "</pre>";

?>
