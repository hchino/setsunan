var message_timer_fa=[];	//faエリアのログ情報
var message_timer_hq=[];	//hqエリアのログ情報
var video = [];				//videojsの情報
var video_frame = [];		//video入れてる枠(dev)の情報
var log_file_fa = "resource/log_data/軽度喘息対応_救護所.csv";
var log_file_hq = "resource/log_data/軽度喘息対応_本部.csv";
//これやばい
var question_flag_1 = true;
var question_flag_2 = true;
var question_flag_3 = true;

var change_flag = true;		//時間経過による動画遷移フラグ
var word_flag = true;		//字幕 on/off
var camera_switch = true;	//2エリアカメラのスイッチ

var area_name_1 = "fa";
var area_name_2 = "hq";

$(function() {
	//csv読み込み
	$.ajax({
		beforeSend : function(xhr) {
			xhr.overrideMimeType("text/plain; charset=shift_jis");
		},
		url: log_file_fa,
		success: function(data) {
			var csvList = $.csv.toArrays(data);
			var insert_contents = csv_List(csvList,"fa");
			$('#fa_talk').append(insert_contents);
		}
	});
	//csv読み込み
	$.ajax({
		beforeSend : function(xhr) {
			xhr.overrideMimeType("text/plain; charset=shift_jis");
		},
		url: log_file_hq,
		success: function(data) {
			var csvList = $.csv.toArrays(data);
			var insert_contents = csv_List(csvList,"hq");
			$('#hq_talk').append(insert_contents);
		}
	});

	//videojs情報の格納
	for (var i = 0; i < 6; i++){
		var video_id = "video" + i;
		video[i] = videojs(video_id);
		if (i != 0) {
			video[i].volume(0);
		}
		if (i < 4) {
			var tmp_video = "main_video_frame_" + (i+1);
			video_frame[i] = document.getElementById(tmp_video);
		}
	}

	//再生バー
	var range_element = document.getElementById("range");
	range_element.addEventListener('input',rangeValue(range_element,(document.getElementById("value"))));	//動かされたらrangeValueを発火
	interval_set = setInterval(scroll, 500);	//定期実行関数
	messageColor = setInterval(switch_messageColor, 500);	//定期実行関数
	clearInterval(interval_set);	//一回切っておかないとなんかバグる(要検証)
});

//再生バー変更時に時間変更するやつ
function rangeValue(elem, realtime) {
	return function(evt){
		var hms = timer_count(elem.value);	//現在の再生時間を変換(秒→時間:分:秒)
		realtime.innerHTML = hms;			//反映
		video_controll("pause", elem.value);	//操作中は動画停止する
	}
}

//csv内容をコメントリストに
function csv_List(csvList, area_name) {
	var talk_counter = 0;		//会話数(ひと纏り)
	var message_counter = 0;	//発話数(1発話、csvの行数と同じになるはず。空行がなければ)
	var insert_contents = '';	//フロント(html)に表示する内容を格納
	//csvの内容をフロントで表示できる形式に
	for (var i = 1; i < csvList.length; i++) {	//1行目にはエリアが書いてあるので2行目から
		var hms = timer_count(csvList[i][0]);	//時間形式変化(秒→時間:分:秒)
		if (csvList[i][0] != "") {	//1列目が空白かどうか
			if (i != 1) {			//一番最初はいらんやろっていう
				insert_contents += "</span><div>--------------------------------------------</div></div>";
			}

			//共通内容、id,class,onclick関数
			insert_contents += '<div id="message_' + area_name + '_' + csvList[i][0] + '" onclick="' + 'video_controll(' + "'" + "log_change" +"'" + ',this.id)"><span>' + hms;
			
			if (csvList[i][1] != "" && csvList[i][2] != "")	{	//2列(発話者),3列(発話内容)ともにある時
				insert_contents += "<br>" + csvList[i][1] + '「' + csvList[i][2] + "」";
			} else if (csvList[i][2] != "") {					//3列(発話内容)のみある時
				insert_contents += "<br> ？「" + csvList[i][2] + "」";
			} else {											//データ形式上ここに入ることはないはず
				insert_contents += "〜 " + csvList[i][1] + " 〜";
			}

			//エリア識別
			if (area_name == area_name_1) {
				message_timer_fa.push(csvList[i][0]);
			} else if (area_name == area_name_2) {
				message_timer_hq.push(csvList[i][0]);
			}

		} else {
			if (csvList[i][1] != "" && csvList[i][2] != "")	{	//2列(発話者),3列(発話内容)ともにある時
				insert_contents += "<div>" + csvList[i][1] + '「' + csvList[i][2] + "」</div>";
			} else if (csvList[i][2] != "") {					//3列(発話内容)のみある時
				insert_contents += "<div> ？「" + csvList[i][2] + "」</div>";
			} else {											//データ形式上ここに入ることはないはず
				insert_contents += "<div>error</div>";
			}
		}
	}
	return insert_contents;
}

//問題作成ボタン
$(".question").on("click", function() {
	create_question(this.id);
})

//問題作成処理
function create_question(question_number){
	video_controll('pause',false);
	var dialog_id = 'tag_dialog_' + question_number.split('_')[1];
	var dialog = document.getElementById(dialog_id);
	$("#" + dialog_id).dialog({ width: 500, height: 300 });	//サイズ指定して開く
}

//問題閉じるボタン
$(".ok_button").on("click", function() {
	close_question(this.id);
});

//問題閉じる処理
function close_question(question_num) {
	var dialog = "#tag_dialog_" + question_num.split('_')[2];
	$(dialog).dialog("close");
	video_controll('play',false);
}

//メインビデオ変更ボタン押された時(字幕変更と動画変更)
$(".change_movie").on("click", function() {
	switch_video(camera_switch,word_flag,this.id);
	if (this.id == "subtitle") {	//字幕変換後のフラグ管理
		if (word_flag) {
			word_flag = false;
		} else {
			word_flag = true;
		}
	} else if (this.id == "change") {	//動画変換後のフラグ管理
		if (camera_switch) {
			camera_switch = false;
		} else {
			camera_switch = true;
		}
	}
});

//メインビデオの変更
function switch_video(status,word,button){	
	//camera_numberは
	// 0 : エリア1字幕あり
	// 1 : エリア2字幕あり
	// 2 : エリア1字幕なし
	// 3 : エリア2字幕なし
	if (status){
		var camera_number = 0;
	} else {
		var camera_number = 1;
	}
	switch(button) {
		case 'subtitle':
			if (word){
				camera_number += 2;
			}
			break;
		case 'change':
			if (status){
				camera_number += 1;
			} else {
				camera_number -= 1;
			}
			if (!word){
				camera_number += 2;
			}
			break;
	}
	//選択されたcamera_numberのカメラだけ表示する
	for (var i = 0; i < 4; i++) {
		if (i == camera_number) {
			video[i].volume(1);
			video_frame[i].style.display = "block";
		} else {
			video[i].volume(0);
			video_frame[i].style.display = "none";
		}
	}
}

//時間合わせ
function timer_count(now_time) {
  var hh = parseInt(now_time / 3600); 
  var mm = ( '00' + parseInt((now_time - (hh*3600))/60)).slice(-2);
  var ss = ( '00' + parseInt(now_time - (hh*3600) - (mm*60))).slice(-2);
  timer = hh + ":" + mm + ":" + ss;
  return timer;
}

//ビデオの処理(再生停止とか)
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
		Interval_change("start");
	}
}

//サブビデオをメインに
// function play_movie(id) {
//   current = video[0].currentTime();
//   if (id.match(/html5_api/)){
//   } else {
//   	video_id = id.replace(/video/g, '');
//     video[0].src(video[video_id].src());
//     for (var i = 0;i < video.length; i++) {
//       video[i].currentTime(current);
//       video[i].pause();
//     }
//     setTimeout(() => {
//       video[0].currentTime(current);
//       video[0].pause();
//     }, 100);
//     Interval_change("clear");
//   }
// }

//定期実行関数のオンオフ
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

//会話リストの背景変更(定期実行)
var switch_messageColor = function(){
	change_message_color(message_timer_fa, "fa");
	change_message_color(message_timer_hq, "hq");
}

//会話リストの背景変更実行部分
function change_message_color(time_data, area) {
	var now = video[0].currentTime();
	for (var i = 0; i < time_data.length; i++) {
		var href = "message_" + area + "_" + time_data[i];
		var element = document.getElementById(href);
    	if (now != 0){
	    	if (time_data[i] <= now && time_data[i+1] > now){
	    		element.style.backgroundColor = '#CCCCCC';
	    	}
	    	else {
				element.style.backgroundColor = '#fff0f0';
	    	}
	    }
  	}
}

//会話リストの自動スクロール(定期実行)
function scroll() {
	var timer = parseInt((video[0]).currentTime());
	var speed = 400;
	var message_id_hq = "message_hq_" + timer;
	var message_id_fa = "message_fa_" + timer;
	var hms = timer_count(timer);
	document.getElementById("value").innerText = hms;
	document.getElementById("range").value = timer;
	if (timer == 140 && change_flag) {
		// time_switch_video((document.getElementById('main_video_frame')).style.display, word_flag);
		switch_video(camera_switch,word_flag,"change");
		change_flag = false;
	}
	if (timer == 196 && question_flag_1) {
		create_question('question_1');
		question_flag_1 = false;
	} else if (timer != 196) {
		question_flag_1 = true;
	}
	if (timer == 285 && question_flag_2) {
		create_question('question_2');
		question_flag_2 = false;
	} else if (timer != 285) {
		question_flag_2 = true;
	}
	if (timer == 459 && question_flag_3) {
		create_question('question_3');
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
		// $('#fa_talk').animate({scrollTop:$("#" + message_id_fa).position().top + $('#fa_talk').scrollTop()}, speed, 'swing');
		// $('#hq_talk').animate({scrollTop:$("#" + message_id_hq).position().top + $('#hq_talk').scrollTop()}, speed, 'swing');
		// $('#infobox').animate({scrollTop:$("#" + message_id).position().top + $('#infobox').scrollTop() - 22 - 300}, speed, 'swing');
	} else {
		return false;
	}
}

//id="ok"を押された時の処理。最初の基本情報入力欄のokボタンのこと
$("#ok").on("click", function() {
	user_name = document.getElementById("user_name").value;		//名前入力欄の情報を格納
	user_number = document.getElementById("user_number").value;	//学籍番号欄の情報を格納
	//以下エラー処理。未入力の場合にエラー分を表示
	if (user_name == '') {
        (document.getElementById("name_error")).style.display = "block";	//エラー分を表示
        return
    }
    if (user_number == '') {
        (document.getElementById("name_error")).style.display = "none";
        (document.getElementById("number_error")).style.display = "block";
        return
    }

    var now = new Date();	//現在時刻の格納
    //clockに 年/月/日 時：分：秒：ミリ秒 の形式に変換
    var clock = now.getFullYear() + "/" + (now.getMonth()+1) + "/" + now.getDate() + " " + ('00' + now.getHours()).slice(-2) + ":" + ('00' + now.getMinutes()).slice(-2) + ":" + ('00' + now.getSeconds()).slice(-2) + "." + ('000' + now.getMilliseconds()).slice(-3);

    var parameter = "name:" + user_name + "\t" + "number:" + user_number + "\n" + clock;	//名前 学籍番号 現在時刻 の形式でサーバに送信

    createLog(parameter);	//サーバ側でログを作成
	$('.data_modal').fadeOut();	//基本情報入力欄を閉じる
});

//サーバ側にデータ保存。今回はDBは使っておらずテキスト記録のみ
function createLog(input_parameter) {
	var send_user_name = encodeURIComponent(user_name);			//名前を送信形式に
	var send_user_number = encodeURIComponent(user_number);		//学籍番号を送信形式に
	var send_parameter = encodeURIComponent(input_parameter);	//パラメータを送信形式に
	var httpobj = createHttpRequest();							//リクエストの作成
    httpobj.open("POST","resource/php/upload.php");				//phpに対してPOST
    httpobj.setRequestHeader('Content-Type','application/x-www-form-urlencoded; charset=UTF-8');	//データ形式や文字コードの指定
    httpobj.send("user_name=" + send_user_name + "&class_name=" + send_user_number + "&parameter=" + send_parameter);	//送信データの格納
}

//リクエスト作成関数
function createHttpRequest(){
  try{
      return new XMLHttpRequest();
    }catch(e){}
    try{
      return new ActiveXObject('MSXML2.XMLHTTP.6.0');
    }catch(e){}
    try{
      return new ActiveXObject('MSXML2.XMLHTTP.3.0');
    }catch(e){}
    try{
      return new ActiveXObject('MSXML2.XMLHTTP');
    }catch(e){}
    return null;
}
