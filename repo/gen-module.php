<?php
header("Content-Type: application/json");

$versions = array();
if ($handle = opendir( $_GET['module'] . "/" )) {
    while (false !== ($raw = readdir($handle))) {
        $entry = $_GET['module'] . '/' . $raw;
        if ($raw != "." && $raw != ".." && is_dir($entry)) {
            $versions[$raw] = $entry;
        }
    }
    closedir($handle);
}

echo json_encode($versions);
