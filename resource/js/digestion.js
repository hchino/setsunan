var message_timer_shelter=[];
var message_timer_hq=[];
var video = [];
var log_file_shelter = "resource/log_data/鎮火ロスト_避難所.csv";
var log_file_hq = "resource/log_data/鎮火ロスト_本部.csv";
$(function() {

	$.ajax({
		beforeSend : function(xhr) {
			xhr.overrideMimeType("text/plain; charset=shift_jis");
		},
		url: log_file_shelter,
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
						insert_contents += '<div id="message_shelter_' + csvList[i][0] + '" onclick="' + 'video_controll(' + "'" + "log_change" +"'" + ',this.id)"><span>' + hms + "<br>" + csvList[i][1] + '「' + csvList[i][2] + "」";
					} else if (csvList[i][2] != "") {
						insert_contents += '<div id="message_shelter_' + csvList[i][0] + '" onclick="' + 'video_controll(' + "'" + "log_change" +"'" + ',this.id)"><span>' + hms + "<br> ？「" + csvList[i][2] + "」";
					} else {
						insert_contents += '<div id="message_shelter_' + csvList[i][0] + '" onclick="' + 'video_controll(' + "'" + "log_change" +"'" + ',this.id)"><span>' + hms + "〜 " + csvList[i][1] + " 〜";
					}
					message_timer_shelter.push(csvList[i][0]);
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
			$('#shelter_talk').append(insert_contents);
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
		}
	});

//videoの数
	for (var i = 0; i < 3; i++){
		var video_id = "video" + i;
		video[i] = videojs(video_id);
		if (i != 0) {
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
		$("#tag_dialog").dialog();
	});
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
		if (now.match(/shelter/)) {
			now = now.replace(/message_shelter_/g,'');
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
	for (var i = 0;i<message_timer_shelter.length; i++){
    	var href = "message_shelter_" + message_timer_shelter[i];
    	if (message_timer_shelter[i] < now && message_timer_shelter[i+1] > now){
      		document.getElementById(href).style.backgroundColor = '#CCCCCC';
    	}
    	else {
      		document.getElementById(href).style.backgroundColor = '#fff0f0';
    	}
  	}

	for (var i = 0;i<message_timer_hq.length; i++){
    	var href = "message_hq_" + message_timer_hq[i];
    	if (message_timer_hq[i] < now && message_timer_hq[i+1] > now){
      		document.getElementById(href).style.backgroundColor = '#CCCCCC';
    	}
    	else {
      		document.getElementById(href).style.backgroundColor = '#fff0f0';
    	}
  	}
}

function scroll() {
	var timer = parseInt((video[0]).currentTime());
	var speed = 400;
	var message_id_hq = "message_hq_" + timer;
	var message_id_shelter = "message_shelter_" + timer;
	var hms = timer_count(timer);
	document.getElementById("value").innerText = hms;
	document.getElementById("range").value = timer;

	while (!(document.getElementById(message_id_hq))) {
		timer = timer - 1;
		message_id_hq = "message_hq_" + timer;
		if (timer < 1) {
			break;
		}
	}
	timer = parseInt((video[0]).currentTime());
	while (!(document.getElementById(message_id_shelter))) {
		timer = timer - 1;
		message_id_shelter = "message_shelter_" + timer;
		if (timer < 1) {
			break;
		}
	}

	if (timer > 1) {
		//console.log(timer);
		$('#shelter_talk').animate({scrollTop:$("#" + message_id_shelter).position().top + $('#shelter_talk').scrollTop()}, speed, 'swing');
		$('#hq_talk').animate({scrollTop:$("#" + message_id_hq).position().top + $('#hq_talk').scrollTop()}, speed, 'swing');

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
      var color = '#fshelter07a'
      //var color = document.getElementById("camera_3").style.color 
      break;
  }
  return color;
}