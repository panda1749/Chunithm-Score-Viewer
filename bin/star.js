(function(){
	/**
 * @param {string} url 
 * @param {Object} data 
 * @return {Deferred}
 */
var ajax = function(url,data){
	return $.ajax({
		url:url,
		method:'POST',
		data:data,
	});
};

/** 全角英数字を半角変換
 * @param {string} strVal
 * @return {string}
 */
var toHalfWidth = function(strVal){
	var halfVal = strVal.replace(/[！-～]/g,
	  function(tmpStr) {
		return String.fromCharCode( tmpStr.charCodeAt(0) - 0xFEE0 );
	  }
	);
	return halfVal.replace(/”/g, "\"")
	  .replace(/’/g, "'")
	  .replace(/‘/g, "`")
	  .replace(/￥/g, "\\")
	  .replace(/　/g, " ")
	  .replace(/〜/g, "~");
};

var reg = {
	number:/([1-9]\d*|0)(\.\d+)/g,
	notNumber:/[^\d]/g,
	pngLastWord:/_([^_]+)\.png$/,
};

var difIdList = {
    'basic':0,
    'advanced':1,
    'expert':2,
    'expart':2,
    'master':3,
    'worldsend':4
};

var difList = {
    0:'basic',
    1:'advanced',
    2:'expert',
    3:'master',
    4:'worldsend'
};

var genreList = {
    99:'全ジャンル',
    0:'POPS & ANIME',
    2:'niconico',
    3:'東方Project',
    6:'VARIETY',
    1:'GAME',
    7:'イロドリミドリ',
    8:'言ノ葉Project',
    5:'ORIGINAL',
};

var fcajList = {
	0:'',
	1:'FC',
	2:'AJ',
};

var rankList = {
	0:'D',
	1:'C',
	2:'B',
	3:'BB',
	4:'BBB',
	5:'A',
	6:'AA',
	7:'AAA',
	8:'S',
	9:'SS',
	10:'SSS',
};

var chainList = {
	0:'',
	1:'FullChain2',
	2:'FullChain',
};

var clearView = function(){
	var frame01 = $('.frame01');
	frame01.empty();
	frame01.css('text-align','left');
	frame01.css('white-space','nowrap');
};

var log = function(type,str){
	var frame01 = $('.frame01');
	frame01.prepend($('<DIV>'+str+'</DIV>'));
};

/**
 * @param {Object|Array} list 
 * @param {*} val
 * @return {string,number}
 */
var getKey = function(list,val){
	var key;
	$.each(list,function(_key,_val){
		if(val == _val){
			key = _key;
		}
	});
	return key;
};

//userInfo --->
var ajax_userInfo = function(){
	return ajax('/mobile/UserInfoDetail.html');
};

var scrape_userInfo = function(data){
	var userInfo = {};
	var $html = $(data);

	var $player = $html.find('.box_player > form');

	userInfo.honor = $player.find('.player_honor_text').text();
	userInfo.lv = parseInt($player.find('.player_lv').text().match(/\d+/)[0],10);
	userInfo.name = toHalfWidth($player.find('.player_name2 > span').text());

	var rateStr = $player.find('.player_rating').text().split('/');
	userInfo.rate = parseInt(rateStr[0].replace(reg.notNumber,''),10);
	userInfo.rateMax = parseInt(rateStr[1].replace(reg.notNumber,''),10);

	userInfo.charcterImg = $player.find('.character_image_box_full > img').get(0).src;

	var vegasStr = $player.find('.user_data_playpoint').text().split('（');
	userInfo.vegas = parseInt(vegasStr[0].replace(reg.notNumber,''),10);
	userInfo.vegasMax = parseInt(vegasStr[1].replace(reg.notNumber,''),10);

	userInfo.comment = $player.find('.player_data_comment').text();
	userInfo.riyouken = parseInt($player.find('.home_player_riyouken').text().replace(reg.notNumber,''),10);
	
	return userInfo;
};

//<--- userInfo

//list --->
var ajax_musicList = function(){
	return ajax(
		'/mobile/MusicGenre.html',
		{
			music_genre:'music_genre',
			genre:'99',
			level:'expert',
		}
	);
};

var scrape_musicList = function(data){
	var musicUrlList = [];
	var $html = $(data);
	var $genreList_boxArr = $html.find('#music_detail > DIV > DIV.box05');
	$genreList_boxArr.each(function(idx,el){
		var $genreList = $(el);
		var genre = $genreList.find('.genre').text();
		var genreId = parseInt(getKey(genreList,genre),10);

		var $musiclist_boxArr = $genreList.find('.musiclist_box');

		$musiclist_boxArr.each(function(idx,el){
			var musicUrl = {'genre':genreId};
			var $el = $(el);
			var title = $el.find('.music_title').text();
	
			var onclick = String($el.find('.music_title').get(0).onclick);
	
			musicUrl.title = title;
			musicUrl.id = parseInt(onclick.match(/musicId_(\d+)/)[1], 10);
			musicUrlList.push(musicUrl);
		});
	});
	return musicUrlList;
};
//<--- list

//detail --->
var ajax_musicDetail = function(id){
	return ajax(
		'/mobile/MusicGenre.html',//'/mobile/MusicDetail.html',
		{
			music_detail:'music_detail',
			musicId:id,
		}
	);
};

var scrape_musicDetail = function(data,musicId,genreId){
	var musicDetail = {dif:{},id:musicId,genre:genreId};
	var $html = $(data);

	var $jacket = $($html.find('.frame02').get(0));

	musicDetail.imgUrl = $jacket.find('.play_jacket_img > img').get(0).src;
	musicDetail.title = $jacket.find('.play_musicdata_title').text();
	musicDetail.artist = $jacket.find('.play_musicdata_artist').text();

	//
	var $difList = $html.find('.music_box');

	$difList.each(function(idx,val){
		var dif = {
			clear:false,
			fcaj:0,
			chain:0,
		};
		var $dif = $(val);

		var difUrl = $dif.find('.musicdata_detail_difficulty > img').get(0).src;
		var difStr = difUrl.match(reg.pngLastWord)[1];

		dif.date = $dif.find('.musicdata_detail_date').text();

		var $box02 = $dif.find('.box02 > *');
		dif.score = parseInt($($box02.get(0)).find('.text_b').text().replace(/,/g,''),10);
		dif.playCount = parseInt($($box02.get(1)).find('span:last').text(),10);

		//icon
		var $imgList = $($box02.get(2)).find('img');
		var imgCount = $imgList.length;
		var isClear = (imgCount === 1)?false:true;

		$imgList.each(function(idx,img){
			var word = img.src.match(reg.pngLastWord)[1];
			
			if(word == "clear"){
				dif.clear = true;
			}else if(word.length < 3){
				dif.rank = parseInt(word,10);
			}else if(word == 'alljustice'){
				dif.fcaj = 2;
			}else if(word == 'fullcombo'){
				dif.fcaj = 1;
			}else if(word.indexOf('fullchain') > -1){
				if(word.indexOf('2') > -1){
					dif.chain = 1;
				}else{
					dif.chain = 2;
				}
			}
		});

		musicDetail.dif[difIdList[difStr]] = dif;
	});

	return musicDetail;
};
//<--- detail

var exportCSV = function(detailList){
	var header = ["id","title","artist","genreId","genre","difId","dif","score","clear",
		"fcajId","fcaj","rankId","rank","chainId","chain","playCount","date"/*,"img"*/];
	var lines = ['"'+header.join('","')+'"'];
	$.each(detailList,function(id,detail){
		$.each(detail.dif,function(dif,difDetail){
			var line = [
				id,
				detail.title.replace(/"/g, '""'),
				detail.artist.replace(/"/g, '""'),
				detail.genre,
				genreList[detail.genre],
				dif,
				difList[dif],
				difDetail.score,
				difDetail.clear,
				difDetail.fcaj,
				fcajList[difDetail.fcaj],
				difDetail.rank,
				rankList[difDetail.rank],
				difDetail.chain,
				chainList[difDetail.chain],
				difDetail.playCount,
				difDetail.date,
				//detail.imgUrl,
			];
			lines.push('"'+line.join('","')+'"');
		});
	});

	var bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
	var content = lines.join('\r\n');
	var blob = new Blob([ bom, content ], { "type" : "text/csv" });
	var url = window.URL.createObjectURL(blob);

	var date = new Date();
	var fileName = 
		'chuniStar_' + 
		date.getFullYear() + 
		('0'+(date.getMonth()+1)).slice(-2) + 
		('0'+date.getDate()).slice(-2) + 
		'.csv';

	log('info','Complete!');
	var a = document.createElement("a");
	a.href = url;
	a.target = '_blank';
	a.download = fileName;
	a.click();
};

var exec = function(){
	clearView();

	//var userInfo;
	//var ajaxUerInfo = ajax_userInfo();
	//ajaxUerInfo.then(function(data){
	//	userInfo = scrape_userInfo(data);
	//});

	ajax_musicList().then(function(data){
		var musicList = scrape_musicList(data);
		if(!true){//debug
			//console.log(musicList);
			musicList.splice(5);
			//console.log(musicList.concat());
		}
		var detailList = {};
	
		var breakInterval = 1;
		var breakOut = 100;
	
		var breakTime = function(_musicList){
			setTimeout(function(){
				getMusic(_musicList,1);
			},breakOut);
		};
	
		var getMusic = function(_musicList,count){
			var isLast = (_musicList.length > 1)?false:true;
			var music = _musicList.shift();
			var musicId = music.id;
			var musicGenreId = music.genre;
			ajax_musicDetail(musicId).then(function(data){
				if(!isLast){
					if(count > breakInterval){
						breakTime(_musicList);
					}else{
						getMusic(_musicList,++count);
					}
				}
				detailList[musicId] = scrape_musicDetail(data,musicId,musicGenreId);
				log('','['+('00'+musicId).slice(-3)+'] '+detailList[musicId].title);
				if(isLast){
					exportCSV(detailList);
				}
			});
		};
		getMusic(musicList,1);
	});
};

exec();
})();