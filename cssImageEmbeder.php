<?php

header('Content-Type: text/css');

ob_start("ob_gzhandler");

#var_dump($_SERVER['DOCUMENT_ROOT'] . $_SERVER['REQUEST_URI']);

$files = array($_SERVER['DOCUMENT_ROOT'] . $_SERVER['REQUEST_URI']);

#phpinfo();

function createDataUrls($a) {
	$fName = $GLOBALS['baseDir'] . '/' . $a[1];
	
	if(!file_exists($fName)) return $a[0];
	
	$data = base64_encode(join(file($fName)));
	
	return 'url(data:image/' . preg_replace("/.*\\.(.*)/", "\\1", $a[1]) . ';base64,' . $data . ')';
}

foreach($files as $file) {
	$GLOBALS['baseDir'] = dirname($file);
	echo preg_replace_callback("/url\\(([^\\)]+)\\)/", 'createDataUrls', join('', file($file)));
}

?>