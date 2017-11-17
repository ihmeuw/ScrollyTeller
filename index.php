<?php
	require_once '../template/php/templater.php';
	error_reporting(E_ALL ^ E_NOTICE ^ E_WARNING);
	
	$page = new Template("../template/templates/main.tpl.php");
	$view = new Template("templates/viz.tpl.php");

	$head = <<<HTML
		<script type="text/javascript" src="dist/bundle.js"></script>
		<link type="text/css" rel="stylesheet" href="dist/bundle.css"/>
HTML;
	
	$page->title = "Opioid Crisis";
	$page->set("body", trim($view->render(false)));
	$page->set("head", $head);

	$page->render();
?>