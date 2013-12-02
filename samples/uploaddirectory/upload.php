<?php

if(isset($_FILES["file"])) {
	if(isset($_POST["destination"]))
		$destination = $_POST["destination"];
	else
		$destination = $_FILES["file"]["name"];

	// for security reason, replace destination with hard coded file name
	$destination = "uploadedfile";

	move_uploaded_file($_FILES["file"]["tmp_name"], $destination);

	header("Access-Control-Allow-Origin: *");
	header("Cache-Control: no-cache, must-revalidate");
	header("Content-Type: text/plain; charset=utf-8");
	header("Connection: Close");

	echo "{ \"status\": \"done\" }";
}
else {
	header("Access-Control-Allow-Origin: *");
	header("Cache-Control: no-cache, must-revalidate");
	header("Content-Type: text/plain; charset=utf-8");

	echo "{ \"status\": \"none\" }";
}

?>
