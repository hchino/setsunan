<?php
	header('Content-Type: text/html; charset=UTF-8');
	$user_name=$_POST['user_name'];
	$user_number=$_POST['user_number'];
	$parameter=$_POST['parameter'];

	$today = date("Ymd");
	mkdir("./../answer_data/".$today,0777);
	$fh=fopen('./../answer_data/'.$today.'/'.$user_name.'.csv',"a");
	fwrite($fh,$parameter."\n");

	fclose($fh);
?>