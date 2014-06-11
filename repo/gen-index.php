<?php
// Very simple index generator written in PHP
// I know people hate PHP, but this works reasonably well

header("Content-Type: application/json");

$entries = array();
if ($handle = opendir('.')) {
	while (false !== ($entry = readdir($handle))) {
    	if ($entry != "." && $entry != ".." && is_dir($entry)) {
    	       $entries[$entry] = $entry;
    	}
	}
	closedir($handle);
}

echo json_encode($entries);
