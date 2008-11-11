<?php

define('dbDateFormat', 'Y-m-d H:i:s');

$extensions = array(
    '*.css' => './style',
    '*.html' => './',
    '*.js' => './js'
);

$js = array();

foreach ($extensions as $extension => $dir) {
	
	$cmd = 'find ' . $dir . ' -name "' . $extension . '"';
	
	$f = `$cmd`;
	
	$files = preg_split("/\\n/", $f);
	
	foreach ($files as $file) {
		if($file == '') continue;		
		$js[] = "'" . preg_replace("/^\\.\\/+/", "", $file) . "':'" . date(dbDateFormat, filemtime($file)) . "'";
	}
}

echo 'dbfs.prototype.mtimes={' . join(',', $js) . '};';

?>