var message_timer_fa=[];
var message_timer_hq=[];
var video = [];
var log_file_fa = "resource/log_data/軽度喘息対応_救護所.csv";
var log_file_hq = "resource/log_data/軽度喘息対応_本部.csv";
var question_flag_1 = true;
var question_flag_2 = true;
var question_flag_3 = true;
var change_flag = true;
var word_flag = true;


$(function() {

	$.ajax({
		beforeSend : function(xhr) {
			xhr.overrideMimeType("text/plain; charset=shift_jis");
		},
		url: log_file_fa,
		success: function(data) {
			var talk_counter = 0;
			var message_counter = 0;
			var insert_contents = '';
			var csvList = $.csv.toArrays(data);
			for (var i = 1; i < csvList.length; i++) {
				var hms = timer_count(csvList[i][0]);
				if (csvList[i][0] != "") {
					if (i != 1) {
						insert_contents += "</span><div>--------------------------------------------</div></div>";
					}
					if (csvList[i][1] != "" && csvList[i][2] != "")	{
						insert_contents += '<div id="message_fa_' + csvList[i][0] + '" onclick="' + 'video_controll(' + "'" + "log_change" +"'" + ',this.id)"><span>' + hms + "<br>" + csvList[i][1] + '「' + csvList[i][2] + "」";
					} else if (csvList[i][2] != "") {
						insert_contents += '<div id="message_fa_' + csvList[i][0] + '" onclick="' + 'video_controll(' + "'" + "log_change" +"'" + ',this.id)"><span>' + hms + "<br> ？「" + csvList[i][2] + "」";
					} else {
						insert_contents += '<div id="message_fa_' + csvList[i][0] + '" onclick="' + 'video_controll(' + "'" + "log_change" +"'" + ',this.id)"><span>' + hms + "〜 " + csvList[i][1] + " 〜";
					}
					message_timer_fa.push(csvList[i][0]);
				} else {
					if (csvList[i][1] != "" && csvList[i][2] != "")	{
						insert_contents += "<div>" + csvList[i][1] + '「' + csvList[i][2] + "」</div>";
					} else if (csvList[i][2] != "") {
						insert_contents += "<div> ？「" + csvList[i][2] + "」</div>";
					} else {
						insert_contents += "<div>error</div>";
					}
				}
			}
			$('#fa_talk').append(insert_contents);
			$('#fa_talk_switch').append(insert_contents);
		}
	});

	$.ajax({
		beforeSend : function(xhr) {
			xhr.overrideMimeType("text/plain; charset=shift_jis");
		},
		url: log_file_hq,
		success: function(data) {
			var talk_counter = 0;
			var message_counter = 0;
			var insert_contents = '';
			var csvList = $.csv.toArrays(data);
			for (var i = 1; i < csvList.length; i++) {
				var hms = timer_count(csvList[i][0]);
				if (csvList[i][0] != "") {
					if (i != 1) {
						insert_contents += "</span><div>--------------------------------------------</div></div>";
					}
					if (csvList[i][1] != "" && csvList[i][2] != "")	{
						insert_contents += '<div id="message_hq_' + csvList[i][0] + '" onclick="' + 'video_controll(' + "'" + "log_change" +"'" + ',this.id)"><span>' + hms + "<br>" + csvList[i][1] + '「' + csvList[i][2] + "」";
					} else if (csvList[i][2] != "") {
						insert_contents += '<div id="message_hq_' + csvList[i][0] + '" onclick="' + 'video_controll(' + "'" + "log_change" +"'" + ',this.id)"><span>' + hms + "<br> ？「" + csvList[i][2] + "」";
					} else {
						insert_contents += '<div id="message_hq_' + csvList[i][0] + '" onclick="' + 'video_controll(' + "'" + "log_change" +"'" + ',this.id)"><span>' + hms + "〜 " + csvList[i][1] + " 〜";
					}
					message_timer_hq.push(csvList[i][0]);
				} else {
					if (csvList[i][1] != "" && csvList[i][2] != "")	{
						insert_contents += "<div>" + csvList[i][1] + '「' + csvList[i][2] + "」</div>";
					} else if (csvList[i][2] != "") {
						insert_contents += "<div> ？「" + csvList[i][2] + "」</div>";
					} else {
						insert_contents += "<div>error</div>";
					}
				}
			}
			$('#hq_talk').append(insert_contents);
			$('#hq_talk_switch').append(insert_contents);
		}
	});

//videoの数
	for (var i = 0; i < 6; i++){
		var video_id = "video" + i;
		video[i] = videojs(video_id);
		if (i != 3) {
			video[i].volume(0);
		}
	}

	var range_element = document.getElementById("range");
	range_element.addEventListener('input',rangeValue(range_element,(document.getElementById("value"))));

	interval_set = setInterval(scroll, 500);
	messageColor = setInterval(switch_messageColor, 100);
	clearInterval(interval_set);
	$("#createTag").on("click", function() {
		var dialog = document.getElementById('tag_dialog');
		$("#tag_dialog").dialog({ width: 1000, height: 1000 });
	});
});

function switch_video(status,word){	
	var video_a = document.getElementById('main_video_frame');
	var video_b = document.getElementById('main_video_frame_2');
	var video_c = document.getElementById('main_video_frame_3');
	var video_d = document.getElementById('main_video_frame_4');
	if (status == "block" && word) {
		video[0].volume(0);
		video[3].volume(0);
		video[4].volume(1);
		video[5].volume(0);
		video_a.style.display = "none";
		video_b.style.display = "none";
		video_c.style.display = "block";
		video_d.style.display = "none";	
	} else if (status == "none" && word) {
		video[0].volume(0);
		video[3].volume(0);
		video[4].volume(0);
		video[5].volume(1);
		video_a.style.display = "none";
		video_b.style.display = "none";
		video_c.style.display = "none";
		video_d.style.display = "block";
	} else if (status == "block" && !word) {
		video[0].volume(1);
		video[3].volume(0);
		video[4].volume(0);
		video[5].volume(0);
		video_a.style.display = "block";
		video_b.style.display = "none";
		video_c.style.display = "none";
		video_d.style.display = "none";
	} else if (status == "none" && !word && video_c.style.display == "block") {
		video[0].volume(1);
		video[3].volume(0);
		video[4].volume(0);
		video[5].volume(0);
		video_a.style.display = "block";
		video_b.style.display = "none";
		video_c.style.display = "none";
		video_d.style.display = "none";
	} else if (status == "none" && !word) {
		video[0].volume(0);
		video[3].volume(1);
		video[4].volume(0);
		video[5].volume(0);
		video_a.style.display = "none";
		video_b.style.display = "block";
		video_c.style.display = "none";
		video_d.style.display = "none";
	}
}

function time_switch_video(status,word) {
	var video_a = document.getElementById('main_video_frame');
	var video_b = document.getElementById('main_video_frame_2');
	var video_c = document.getElementById('main_video_frame_3');
	var video_d = document.getElementById('main_video_frame_4');
	if (status == "block" && word) {
		video[0].volume(0);
		video[3].volume(1);
		video[4].volume(0);
		video[5].volume(0);
		video_a.style.display = "none";
		video_b.style.display = "block";
		video_c.style.display = "none";
		video_d.style.display = "none";	
	} else if (status == "none" && word) {
		video[0].volume(1);
		video[3].volume(0);
		video[4].volume(0);
		video[5].volume(0);
		video_a.style.display = "block";
		video_b.style.display = "none";
		video_c.style.display = "none";
		video_d.style.display = "none";
	} else if (status == "block" && !word) {
		video[0].volume(0);
		video[3].volume(0);
		video[4].volume(0);
		video[5].volume(1);
		video_a.style.display = "none";
		video_b.style.display = "none";
		video_c.style.display = "none";
		video_d.style.display = "block";
	} else if (status == "none" && !word) {
		video[0].volume(0);
		video[3].volume(0);
		video[4].volume(1);
		video[5].volume(0);
		video_a.style.display = "none";
		video_b.style.display = "none";
		video_c.style.display = "block";
		video_d.style.display = "none";
	}
}

function create_question(question_number){
	video_controll('pause',false);
	var dialog_id = 'tag_dialog_' + question_number;
	var dialog = document.getElementById(dialog_id);
	$("#" + dialog_id).dialog({ width: 500, height: 300 });
}

$("#ok_button_1").on("click", function() {
	$("#tag_dialog_1").dialog("close");
	video_controll('play',false);
});
$("#ok_button_2").on("click", function() {
	$("#tag_dialog_2").dialog("close");
	video_controll('play',false);
});
$("#ok_button_3").on("click", function() {
	$("#tag_dialog_3").dialog("close");
	video_controll('play',false);
});

$("#change_word").on("click", function() {
	switch_video(document.getElementById('main_video_frame').style.display,word_flag);
	if (word_flag) {
		word_flag = false;
	} else {
		word_flag = true;
	}
});


$("#change_movie").on("click", function() {
	time_switch_video((document.getElementById('main_video_frame')).style.display, word_flag);
});

// $("#start").on("click", function() {
// 	var a = document.getElementById('main_video_frame');
// 	var b = document.getElementById('main_video_frame_2');
// 	a.style.display = "none";
// 	b.style.display = "block";
// });

// $("#stop").on("click", function() {
// 	var a = document.getElementById('main_video_frame');
// 	var b = document.getElementById('main_video_frame_2');
// 	a.style.display = "block";
// 	b.style.display = "none";
// });

$("#question_1").on("click", function() {
	create_question("1");
});

$("#question_2").on("click", function() {
	create_question("2");
});

$("#question_3").on("click", function() {
	create_question("3");
});

function timer_count(now_time) {
  var hh = parseInt(now_time / 3600); 
  var mm = ( '00' + parseInt((now_time - (hh*3600))/60)).slice(-2);
  var ss = ( '00' + parseInt(now_time - (hh*3600) - (mm*60))).slice(-2);
  timer = hh + ":" + mm + ":" + ss;
  return timer;
}

function video_controll(command, now) {
	Interval_change("clear");
	if (command == 'log_change') {
		if (now.match(/hq/)) {
			now = now.replace(/message_hq_/g,'');
		}
		if (now.match(/fa/)) {
			now = now.replace(/message_fa_/g,'');
		}
		var elem = document.getElementById("range");
		var hms = timer_count(now);
		var value = document.getElementById("value");
		value.innerHTML = hms;
	}
	if (now == false) {
		now = document.getElementById("range").value;
	} else {
		document.getElementById("range").value = now;
	}
	for (var i=0; i<video.length; i++) {
		video[i].currentTime(now)
		;
		switch (command) {
			case 'play':
				video[i].playbackRate(1.0);
				video[i].play();
				break;
			case 'log_change':
			case 'pause':
				video[i].pause();
				break;
		}
	}
	if (command == 'log_change' || command == 'pause') {
		Interval_change("clear");
	} else {
		console.log("aaaaaa");
		Interval_change("start");
	}
}

function Interval_change (state) {
	switch (state) {
		case 'start':
			interval_set = setInterval(scroll, 500);
			break;
		case 'clear':
			clearInterval(interval_set);
			break;
	}
}

var switch_messageColor = function(){
	var now = video[0].currentTime();
	for (var i = 0;i<message_timer_fa.length; i++){
    	var href = "message_fa_" + message_timer_fa[i];
    	var element = document.getElementById(href);

    	if (message_timer_fa[i] < now && message_timer_fa[i+1] > now){
    		element.style.backgroundColor = '#CCCCCC';
    		// console.log(element);
    		// for (j=0; j<element.length; j++){
    		// 	element[j].style.backgroundColor = '#CCCCCC';
    		// }
    	}
    	else {
   //  		for (j=0; j<element.length; j++){
   //  			element[j].style.backgroundColor = '#fff0f0';
			// }
			element.style.backgroundColor = '#fff0f0';
    	}
  	}

	for (var i = 0;i<message_timer_hq.length; i++){
    	var href = "message_hq_" + message_timer_hq[i];
    	var element = document.getElementById(href);
    	if (message_timer_hq[i] < now && message_timer_hq[i+1] > now){
    		// for (j=0; j<element.length; j++){
    		// 	element[j].style.backgroundColor = '#CCCCCC';
    		// }
    		element.style.backgroundColor = '#CCCCCC';
    	}
    	else {
   //  		for (j=0; j<element.length; j++){
   //  			element[j].style.backgroundColor = '#fff0f0';
			// }
			element.style.backgroundColor = '#fff0f0';
    	}
  	}
}

function scroll() {
	var timer = parseInt((video[0]).currentTime());
	var speed = 400;
	var message_id_hq = "message_hq_" + timer;
	var message_id_fa = "message_fa_" + timer;
	var hms = timer_count(timer);
	document.getElementById("value").innerText = hms;
	document.getElementById("range").value = timer;
	if (timer == 140 && change_flag) {
		// console.log((document.getElementById('main_video_frame')).style.display);
		time_switch_video((document.getElementById('main_video_frame')).style.display, word_flag);
		change_flag = false;
	}
	if (timer == 196 && question_flag_1) {
		create_question('1');
		question_flag_1 = false;
	} else if (timer != 196) {
		question_flag_1 = true;
	}
	if (timer == 285 && question_flag_2) {
		create_question('2');
		question_flag_2 = false;
	} else if (timer != 285) {
		question_flag_2 = true;
	}
	if (timer == 459 && question_flag_3) {
		create_question('3');
		question_flag_3 = false;
	} else if (timer != 459) {
		question_flag_3 = true;
	}

	while (!(document.getElementsByClassName(message_id_hq))) {
		timer = timer - 1;
		message_id_hq = "message_hq_" + timer;
		if (timer < 1) {
			break;
		}
	}
	timer = parseInt((video[0]).currentTime());
	while (!(document.getElementsByClassName(message_id_fa))) {
		timer = timer - 1;
		message_id_fa = "message_fa_" + timer;
		if (timer < 1) {
			break;
		}
	}

	if (timer > 1) {
		//console.log(timer);
		//$('#fa_talk').animate({scrollTop:$("#fa_talk>." + message_id_fa).position().top + $('#fa_talk').scrollTop()}, speed, 'swing');
		//$('#hq_talk').animate({scrollTop:$("#hq_talk>." + message_id_hq).position().top + $('#hq_talk').scrollTop()}, speed, 'swing');
		//$('#fa_talk').animate({scrollTop:$("#" + message_id_fa).position().top + $('#fa_talk').scrollTop()}, speed, 'swing');
		//$('#infobox').animate({scrollTop:$("#" + message_id).position().top + $('#infobox').scrollTop() - 22 - 300}, speed, 'swing');
	} else {
		return false;
	}
}

function play_movie(id) {
  current = video[0].currentTime();
  if (id.match(/html5_api/)){
    //console.log("特に何もないよ！！");
  } else {
  	video_id = id.replace(/video/g, '');
    video[0].src(video[video_id].src());
    for (var i = 0;i < video.length; i++) {
      video[i].currentTime(current);
      video[i].pause();
    }
    // clear_Interval();
    setTimeout(() => {
      video[0].currentTime(current);
      video[0].pause();
    }, 100);
    Interval_change("clear");
  }
}

function rangeValue(elem, realtime) {
	return function(evt){
		var hms = timer_count(elem.value);
		realtime.innerHTML = hms;
		video_controll("pause", elem.value);
	}
}

function checkcolor(color) {
  switch (color) {
    case '赤エリア':
      var color = 'red';
      break;
    case '黄エリア':
      var color = '#FFCC00';
      //var color = document.getElementById("camera_1").style.color 
      break;
    case '緑エリア':
      var color = 'green';
      break;
    //case 'トリアージ本部':
    case '現地統括本部':
      var color = '#00CC00';
      //var color = document.getElementById("camera_4").style.color 
      break;
    case '災害対策本部':
      var color = 'blue'
      break;
    case '1次トリアージエリア':
      var color = '#ffa07a'
      //var color = document.getElementById("camera_3").style.color 
      break;
  }
  return color;
}