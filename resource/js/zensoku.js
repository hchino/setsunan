var message_timer_fa=[];	//faエリアのログ情報
var message_timer_hq=[];	//hqエリアのログ情報
var video = [];				//videojsの情報
var video_frame = [];		//video入れてる枠(dev)の情報
var log_file_fa = "resource/log_data/軽度喘息対応_救護所.csv";	//faエリアのcsvファイルパス
var log_file_hq = "resource/log_data/軽度喘息対応_本部.csv";	//hqエリアのcsvファイルパス

//これやばい。質問1,2,3それぞれの出題状況をフラグ管理する変数
var question_flag_1 = true;
var question_flag_2 = true;
var question_flag_3 = true;

var change_flag = true;		//時間経過による動画遷移フラグ
var word_flag = true;		//字幕 on/off
var camera_switch = true;	//2エリアカメラのスイッチ

//気休めの変数。将来的にはここのエリア名(faとかhq)を変えるとビデオや字幕がそれぞれのエリアに適したものになるようにしたい
//現在は変数を決めてるだけでここを変えてもビデオや字幕は変わらない。
var area_name_1 = "fa";
var area_name_2 = "hq";

$(function() {
	//csv読み込み
	$.ajax({	//ajax(Asynchronous Javascript and XML)通信。非同期通信ともいう。分からないなら調べるか聞いてくれ
		beforeSend : function(xhr) {	//csvを読み込む前の処理。読み込むcsvファイルの文字コードとかを指定
			xhr.overrideMimeType("text/plain; charset=shift_jis");
		},
		url: log_file_fa	//csvファイルのパス
	}).done(function(data) {	//.done()で通信成功時の処理。今回は指定したパスにきちんとcsvファイルがあれば実行される。
		var csvList = $.csv.toArrays(data);				//csvファイルの内容を丸々csvListという変数(配列)に格納
		var insert_contents = csv_List(csvList,"fa");	//csv_Listという関数の呼び出し。csv_Listは79行目
		$('#fa_talk').append(insert_contents);			//htmlファイル(asthma.html)のid="fa_talk"要素(asthma.htmlの108行目)にinsert_contents変数の内容を追加する
	});
	//ちなみに失敗時の処理は.fail()で、成功だろうが失敗だろうが実行する場合は.always()

	//csv読み込み。やってることは上のやつと一緒
	$.ajax({
		beforeSend : function(xhr) {
			xhr.overrideMimeType("text/plain; charset=shift_jis");
		},
		url: log_file_hq
	}).done(function(data) {
		var csvList = $.csv.toArrays(data);
		var insert_contents = csv_List(csvList,"hq");
		$('#hq_talk').append(insert_contents);
	});

	//videojs情報の格納
	for (var i = 0; i < 6; i++){	//asthma.html内のidがvideo＋数字のものをカウント。今回は数字で6って打ってるけどビデオの数でここの数字は変わる
		var video_id = "video" + i;	//ここでid要素を指定
		video[i] = videojs(video_id);	//video[]にそれぞれのビデオ情報を格納
		if (i != 0) {					//idがvideo0以外のものは音量をオフ
			video[i].volume(0);
		}
		if (i < 4) {	//サブビデオ(画面右側の2個)の情報だけ別で格納
			var tmp_video = "main_video_frame_" + (i+1);
			video_frame[i] = document.getElementById(tmp_video);
		}
	}

	//再生バー
	var range_element = document.getElementById("range");	//再生バーの情報をrange_elementに
	range_element.addEventListener('input',rangeValue(range_element,(document.getElementById("value"))));	//動かされたらrangeValue関数を発火。rangeValueは70行目
	interval_set = setInterval(scroll, 500);	//定期実行関数。scrollという関数を500msごとに実行する。268行目
	messageColor = setInterval(switch_messageColor, 500);	//定期実行関数。switch_messageColorという関数を500msごとに実行する。291行目
	clearInterval(interval_set);	//intervalset変数(64行目)で定期実行しているものを停止させる。なんか一回切っておかないとバグる(要検証)
});

//再生バー変更時に時間変更する
function rangeValue(elem, realtime) {
	return function(evt){
		var hms = timer_count(elem.value);	//現在の再生時間を変換(秒→時間:分:秒)
		realtime.innerHTML = hms;			//反映
		video_controll("pause", elem.value);	//操作中は動画停止する
	}
}

//csv内容をコメントリストに。csvのフォーマットは1列目が時間,2列目が発話者,3列目が内容,となっているのでその形式に合わせて処理する。
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
	return insert_contents;	//insert_contentsを返す。31行目 and 44行目
}

//問題作成ボタン。html側でclass="question"の要素をクリックした時に発火する関数
$(".question").on("click", function() {
	create_question(this.id);	//クリックされた要素が持つidをcreate_question関数へ。128行目
})

//問題作成処理
function create_question(question_number){
	video_controll('pause',false);	//再生中のビデオを止める。video_controll関数は216行目
	var dialog_id = 'tag_dialog_' + question_number.split('_')[1];	//問題番号。喘息は1-3のどれか
	var dialog = document.getElementById(dialog_id);	//問題番号のダイアログ情報を格納
	$("#" + dialog_id).dialog({ width: 500, height: 300 });	//サイズ指定してダイアログを開く
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
	switch_video(camera_switch,word_flag,this.id);	//実際にビデオを変更するのはswitch_video関数(166行目)。
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
	if (status){	//statusは現在どちらのエリアがメインかを格納している
		var camera_number = 0;
	} else {
		var camera_number = 1;
	}
	switch(button) {	//buttonは押されたボタンがどちらか(字幕変換[subtitle]or動画変換[change])
		case 'subtitle':
			if (word){	//wordは現在の字幕のon/offを格納してる
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
	//選択されたcamera_numberのカメラだけ表示して他を非表示&音量0に
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

//時間合わせ。秒から 時間:分:秒 への変換
function timer_count(now_time) {
  var hh = parseInt(now_time / 3600); 
  var mm = ( '00' + parseInt((now_time - (hh*3600))/60)).slice(-2);
  var ss = ( '00' + parseInt(now_time - (hh*3600) - (mm*60))).slice(-2);
  timer = hh + ":" + mm + ":" + ss;
  return timer;
}

//ビデオの処理(再生停止とか)
function video_controll(command, now) {	//commandはplay(動画再生),pause(動画停止),log_change(字幕からの動画時間変更)のどれかが格納されていて、nowは現在の再生時間もしくは字幕のid
	Interval_change("clear");	//ビデオ変更時の読み込みと関数の定期実行が重なると挙動がおかしくなるので一度定期実行を切る
	if (command == 'log_change') {	//commandがlog_changeの場合。つまり字幕リストをクリックされた時の処理。字幕リストの場合nowにはidがあるのでこれを再生時間に変換する
		if (now.match(/hq/)) {		
			now = now.replace(/message_hq_/g,'');
		}
		if (now.match(/fa/)) {
			now = now.replace(/message_fa_/g,'');
		}
		var elem = document.getElementById("range");
		var hms = timer_count(now);
		var value = document.getElementById("value");
		value.innerHTML = hms;	//valueにhmsの時刻を格納
	}
	if (now == false) {	//停止ボタンが押された際は現在の再生時間をnowへ格納
		now = document.getElementById("range").value;
	} else {
		document.getElementById("range").value = now;
	}
	for (var i=0; i<video.length; i++) {	//実際にビデオを操作する部分。停止なら全ビデオの停止、再生なら時刻nowで全ビデオを再生
		video[i].currentTime(now);
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
	if (command == 'log_change' || command == 'pause') {	//停止操作の場合は定期実行を止める
		Interval_change("clear");
	} else {	//停止以外なら、止めていた定期実行関数を再開
		Interval_change("start");
	}
}

//定期実行関数のオンオフ。
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

//会話リストの背景変更(定期実行)。現在話されている内容を色付け
var switch_messageColor = function(){
	change_message_color(message_timer_fa, "fa");
	change_message_color(message_timer_hq, "hq");
}

//会話リストの背景変更実行部分
function change_message_color(time_data, area) {	//time_dataには各エリアの会話時刻がリストで格納されてる
	var now = video[0].currentTime();
	for (var i = 0; i < time_data.length; i++) {	//会話時刻のリストと再生時間を比べて一番近い部分の会話を見つける
		var href = "message_" + area + "_" + time_data[i];
		var element = document.getElementById(href);
    	if (now != 0){
	    	if (time_data[i] <= now && time_data[i+1] > now){	//該当部分の色付け
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
	var timer = parseInt((video[0]).currentTime());	//現在の再生時間
	var speed = 400;	//自動スクロール速度
	var message_id_hq = "message_hq_" + timer;
	var message_id_fa = "message_fa_" + timer;
	var hms = timer_count(timer);	//時刻変換
	document.getElementById("value").innerText = hms;
	document.getElementById("range").value = timer;
	//以下再生時間(timer)が特定の時間の場合に発火する処理。
	if (timer == 140 && change_flag) {
		switch_video(camera_switch,word_flag,"change");	//画面の自動切り替え
		change_flag = false;
	}
	if (timer == 196 && question_flag_1) {
		create_question('question_1');	//問題1の表示
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

	//現在時刻と会話リストの時刻を比べて現在の時刻に行われている会話を見つける
	while (!(document.getElementsByClassName(message_id_hq))) {
		timer = timer - 1;
		message_id_hq = "message_hq_" + timer;	//見つけた会話を保持
		if (timer < 1) {
			break;
		}
	}

	//もう一回同じことする。2エリア分するので
	timer = parseInt((video[0]).currentTime());
	while (!(document.getElementsByClassName(message_id_fa))) {
		timer = timer - 1;
		message_id_fa = "message_fa_" + timer;
		if (timer < 1) {
			break;
		}
	}

	//見つけた会話の部分まで会話リストを自動スクロールする
	if (timer > 1) {
                var fa = document.getElementById("fa_talk");
                var fa_message = document.getElementById(message_id_fa);
                var hq = document.getElementById("hq_talk");
                var hq_message = document.getElementById(message_id_hq);
                $('#fa_talk').animate({scrollTop:($("#" + message_id_fa).position()).top - (fa.getBoundingClientRect().height)/2 + (fa_message.getBoundingClientRect().height)/2 + $('#fa_talk').scrollTop()}, speed, 'swing');
                $('#hq_talk').animate({scrollTop:($("#" + message_id_hq).position()).top - (hq.getBoundingClientRect().height)/2 + (hq_message.getBoundingClientRect().height)/2 + $('#hq_talk').scrollTop()}, speed, 'swing');
	} else {
		return false;
	}
}
