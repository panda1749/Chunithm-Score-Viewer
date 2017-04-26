/** jQuery
 * @typedef {{
 *  each:(function(number,Element):JDATA),
 *  attr:(function((string|Object),(string|number|function(number,string)|null)):JDATA),
 *  addClass:(function((string|function(string,function(number,string)))):JDATA),
 *  append:(function(...(string|number|Element|Array|JDATA|function(number,string))):JDATA),
 *  empty:(function():JDATA),
 *  click:(function(function(Event)):JDATA),
 *  find:(function(string):JDATA),
 *  clone:(function(boolean):JDATA),
 *  css:(function(Object):JDATA),
 *}}
 */
var JDATA;

/**
 * @typedef {{
 *  fullChain:number,
 *  isAllJustice:boolean,
 *  isFullCombo:boolean,
 *  isSuccess:boolean,
 *  level:null,
 *  musicId:null,
 *  playCount:null,
 *  scoreMax:number,
 *  scoreRank:number,
 *  updateDate:null,
 *}}
 */
var SCOREDATA;

/**
 * @typedef {{
 *  sort:number,
 *  max:number,
 *  min:number,
 *  dif:number,
 *}}
 */
var LOADDATA_CONF;

/**
 * @typedef {{
 *  name:string,
 *  music:Object
 *}}
 */
var USERMUSICDATA;

/**
 * @typedef {{
 *  friendLength:number,
 *  myData:USERMUSICDATA,
 *  friendsData:Array.<USERMUSICDATA>,
 *  conf:LOADDATA_CONF,
 *  musicNameMap:Object,
 *  genreMap:Object,
 *}}
 */
var LOADDATA;

/**
 * @typedef {{
 *  musicList:Array.<Object>,
 *  friendList:Array.<string>,
 *  friendMusicList:Array<Object>,
 *  conf:LOADDATA_CONF,
 *}}
 */
var ALSDATA;

/**
 * @const
 * @type {boolean}
 */
var ENABLE_DEBUG = true;

(
/**
 * @param {function((string|Element|JDATA)):JDATA} $
 */
function($){

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

/** 文字列連結
 * @param {...string} var_args
 * @return {string}
 */
var join = function(var_args){
	return Array.prototype.slice.call(arguments, 0).join("");
};

/** tag作るよ
 * @param {string} tag
 * @param {Array.<string>|string|null=} className
 * @param {string|null=} id
 * @param {string|number|Element|JDATA|null=} content
 * @return {JDATA}
 */
var $tagCreate = function(tag,className,id,content){
	if(Array.isArray(className)) className = className.join(" ");
	return $(join('<',tag,'/>'))['attr']("id",id)['addClass'](className)
    	['append'](content);
};

/**
 * @param {Array.<string>|string|null=} className
 * @param {string|null=} id
 * @param {string|number|Element|JDATA|null=} content
 * @return {JDATA}
 */
var $divCreate = $tagCreate.bind(this,'div');

/**
 * @param {string} info
 * @param {number} type
 * @return {JDATA}
 */
var $getInfoBlock = function(info,type){
    var infoblock = $divCreate(classList.vs_list_infoblock);
    if(type === 0){
        $append(infoblock,$divCreate(classList.play_musicdata_highscore,'vsMyScore',info));
    }else{
        $append(infoblock,info);
    }
    return infoblock;
};

var $getRsltBlock = function(left,right,center,centerType){
    var resultblock = $divCreate(classList.vs_list_result_block);

    var type = {0:'vs_list_count_blue',1:'vs_list_count_red',2:null,3:null};
    var list_count = $divCreate(type[centerType],null,center);
    var ctr = $divCreate(classList.vs_list_result,null,list_count);
    if(centerType === 2){
        var color = {'color':'#999'};
        ctr['css'](color);
        left&&left['css'](color);
        right&&right['css'](color);
    }
    $append(resultblock,left,ctr,right);

    return resultblock;
};

/**
 * @param {!Element|JDATA} content
 * @param {...Element|string|JDATA} var_args
 * @return {JDATA}
 */
var $append = function(content,var_args){
    var $content = $(content);
    var childs = Array.prototype.slice.call(arguments, 1);
    childs.forEach(function(child){
        $content['append'](child);
    });
    return $content;
};

/** @enum {string} */
var classList = {
    frame01_inside:'frame01_inside',
    line_dot_black:'line_dot_black',
    block_underline:'block_underline',
    w388:'w388',
    w400:'w400',
    w420:'w420',
    box01:'box01',
    box01_title:'box01_title',
    box02:'box02',
    box05:'box05',
    mb_20:'mb_20',
    difficulty_btn_block:'difficulty_btn_block',
    difficulty_btn:'difficulty_btn',
    vs_list_infoblock:'vs_list_infoblock',
    vs_list_result_block:'vs_list_result_block',
    vs_list_result:'vs_list_result',
    play_musicdata_highscore:'play_musicdata_highscore',
    text_b:'text_b',
    btn_:'btn_',
    musiclist_:'musiclist_',
    title_:'title_',
};

/**
 * @const
 * @type {Array.<string>}
 */
var difList = ["basic","advanced","expart","master"];

/** 画面クリア
 * @return {JDATA}
 */
var clr = function(){
	var $frame = $('.' + classList.frame01_inside)['empty']();
	return $append($frame,
        $tagCreate('h2',null,'page_title','フレンドVS'),
        $tagCreate('hr',[classList.line_dot_black,classList.w420])
    );
};

/**
 * @param {!string} apiName
 * @param {Object=} param
 * @param {function(?)=} func
 * @param {Object=} thisObj
 */
var send = function(apiName,param,func,thisObj){
	param = param||{};
    ENABLE_DEBUG&&(param = $['extend']({},param));
	func = func||function(){};
	thisObj = thisObj||this;
	func = func.bind(thisObj);

	param['userId'] = parseInt(getCookie()['userId'],10);
	return $['ajax']({
		'type': "post",
		'url': REQUEST_URL + apiName,
		'data': JSON.stringify(param),
		'dataType': "json",
		'scriptCharset': "UTF-8",
		'success': function(res){
            ENABLE_DEBUG&&console.log(apiName,param,res);
            var idName = 'userId';
            if(res[idName] != null){
                window['setCookie'](idName,res[idName]);
            }
            func(res);
        }
	});
};

/**
 * @return {void}
 */
var friendList = function(){
    var box02 = $divCreate([classList.box02,classList.w420,classList.mb_20]);
	$append($('.' + classList.frame01_inside),box02);
	var form = $('<form onsubmit="return false" />');

    //dif選択
    var classHead = classList.btn_;
    var difbtnList = {};
    var difblock = $divCreate(classList.difficulty_btn_block);
    var dif = 2;
    var difbtnClick = function(e){
        var $target = $(e.target);
        difList.forEach(function(val,key){
            var difclass = classHead + difList[key];
            var has = $target['hasClass'](difclass)||$target['hasClass'](difclass + '_on');
            difbtnList[key]['toggleClass'](difclass + '_on',has);
            difbtnList[key]['toggleClass'](difclass,!has);
            if(has) dif = key;
        });
    };
    difList.forEach(function(val,key){
        var difbtn = $divCreate(classHead+difList[key])
            ['click'](difbtnClick);
        $append(difblock,$divCreate(classList.difficulty_btn,null,difbtn));
        difbtnList[key] = difbtn;
    });
    $append(form,difblock);
    /** @const */
    var MAXSCORE  = 1100000;
    /** @const */
    var MINSCORE = -1*MAXSCORE;
    var maxScore = MAXSCORE;
    var minScore = MINSCORE;
    /** @const */
    var maxScoreName = 'maxScore';
    /** @const */
    var minScoreName = 'minScore';
    var divScoreFillter = $divCreate();
    var inputChange = function(e){
        var $target = $(e.target);
        var name = $target['attr']('name');
        var value = $target['val']();
        var valueInt = parseInt(value,10);
        var isInt = !isNaN(valueInt);
        var isValid = true;
        if(name == maxScoreName){
            if(!isInt || value > MAXSCORE){
                isValid = false;
                valueInt = MAXSCORE;
            }
            maxScore = valueInt;
        }else if(name == minScoreName){
            if(!isInt || value < MINSCORE){
                isValid = false;
                valueInt = MINSCORE;
            }
            minScore = valueInt;
        }

        ENABLE_DEBUG&&console.log({
            'target':$target,
            'name':name,
            'value':value,
            'check':isInt,
            'setValue':valueInt,
        });
    };
    var inputText = $('<input type="text" size="7" maxlength="7" />')['change'](inputChange);
    var inputMin = inputText['clone'](true)['attr']('name','minScore');
    var inputMax = inputText['clone'](true)['attr']('name','maxScore');

    $append(divScoreFillter,'スコア差<br/>',inputMin,'～',inputMax);
    $append(form,divScoreFillter);

	var readbtnFunc = function(e){
		var sort = parseInt($(e.target)['attr']("data-sorttype"),10);
		var friendCode = [];
		form['find'](":checkbox")['each'](function(){
			//this:checkbox
			if(this.checked){
				friendCode.push(this.name);
			}
		});
        if(maxScore < minScore){
            var max = maxScore;
            maxScore = minScore;
            minScore = max;
        }
		load(sort,friendCode,dif,minScore,maxScore);
	};
	var btn = $('<input type="button" value="読込" onclick="" data-sorttype="1" />')
	.click(readbtnFunc);

    $append(box02,form,btn);

    /**
     * @param {{userId:number,friendCode:number,friendName:string}} friendNamData
     */
	var UserFriendNameApiFunc = function(friendNamData){
		//this:form
        //$append(this,$divCreate(null,null,'<input type="checkbox" name="' + friendNamData['friendCode'] + '" />' + toHalfWidth(friendNamData['friendName'])));
        var check = join('<input type="checkbox" name="',friendNamData['friendCode'],'" />');
        var name = toHalfWidth(friendNamData['friendName']);
        var friend = $append($divCreate(),check,name);
        $append(this,friend);
	};

    /**
     * @param {{userFriendlistList:Array}} friendlistData
     */
	var FriendlistApiFunc = function(friendlistData){
		//this:form
		var friends = friendlistData['userFriendlistList'].filter(function(elem,index,array){
	        return elem['isFavorite'] === true;
		});

		friends = friends.map(function(elem){
			return elem['friendCode'];
		});

        var apiDeferreds = [];
		friends.forEach(function(friendCode){
			//this:form
			var deferred = send(
                "GetUserFriendNameApi",
                {'friendCode':parseInt(friendCode,10)},
                UserFriendNameApiFunc,
                this
            );
            apiDeferreds.push(deferred);
        },this);
        var allApiDeferred = $['when'].apply(this,apiDeferreds);
        var allApiCompFunc = function(){
            $append(this,join(
                '<div>',
                'スコア差',
                '<br />',
                '<input type="text" size="7" maxlength="7" name="minScore" />',
                '～',
                '<input type="text" size="7" maxlength="7" name="maxScore" />',
                '</div>'
            ));
        };

        //allApiDeferred.done(allApiCompFunc.bind(this));
        return allApiDeferred;
	};

	send("GetUserFriendlistApi",{'state': 3},FriendlistApiFunc,form);
};

/**
 * @param {number} sort
 * @param {Array.<number>} friendCodes
 * @param {number} dif
 * @param {number} minScore
 * @param {number} maxScore
 */
var load = function(sort,friendCodes,dif,minScore,maxScore){
    ENABLE_DEBUG&&console.log(arguments);
	//sort:int , friendCodes:Array<int>, dif;int
	if(friendCodes.length === 0) return void 0;

    if(dif === null) dif = 2;

    /** type {LOADDATA} */
	var loadData = {
		friendLength:friendCodes.length,
		myData:{},
		friendsData:[],
        //dif:dif,
        conf:{sort:sort,max:maxScore,min:minScore,dif:dif},
        musicNameMap:[],
        genreMap:[],
	};
    var param = {"level":parseInt(19900,10) + parseInt(dif,10),"isStatus":true};
	send("GetUserMusicApi",param,/** @this {LOADDATA} */function(data){
		//Object.keys(data.musicNameMap).forEach(function(key){});
		this.musicNameMap = data['musicNameMap'];
		this.genreMap = data['genreMap'];

		this.myData = userMusicCnv(data);
	},loadData);

	friendCodes.forEach(/** @this {LOADDATA} */function(friendCode){
        param["friendCode"] = friendCode;
		send("GetUserMusicApi",param,/** @this {LOADDATA} */function(userMusicData){
			//this:loadData
			this.friendsData.push(userMusicCnv(userMusicData));
			if(this.friendLength == this.friendsData.length){
				vs(this);
			}
		},loadData);
	},loadData);

    /**
     * @param {{userMusicList:Array,userName:string}} userMusicData
     * @return {USERMUSICDATA}
     */
	var userMusicCnv = function(userMusicData){
		var userMusic = [];
		userMusicData['userMusicList'].forEach(function(music){
			this[music['musicId']] = music;
		},userMusic);
		return {name:toHalfWidth(userMusicData['userName']),music:userMusic};
	};
    /**
     * @param {{userMusicList:Array,userName:string}} userMusicData
     * @return {Array.<SCOREDATA>}
     */
    var userMusicIdSort = function(){
        var userMusic = [];
		userMusicData['userMusicList'].forEach(function(music){
			this[music['musicId']] = music;
		},userMusic);
		return {name:toHalfWidth(userMusicData['userName']),music:userMusic};
    };
};

/**
 * @param {LOADDATA} loadData
 */
var purser = function(loadData){
    /** @type {ALSDATA} */
    var alsData = {
        musicList:[],
        friendList:[],
        conf:loadData.conf,
    };
};

/**
 * @param {LOADDATA} loadData
 */
var vs = function(loadData){

	var separate = function(num){
	    return String(num).replace( /(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
	};

	var frame = clr();
    var vsresult = $divCreate(null,'userFriendGenreVs_result');
    var difName = ['BASIC','ADVANCED','EXPERT','MASTER'];
    var box01 = $divCreate([classList.box01,classList.w420],null,
        $divCreate([classList.box01_title,classList.title_ + difList[loadData.conf.dif]],'DifficulityName',difName[loadData.conf.dif])
    );

    $append(frame,$append(vsresult,box01));

    /**
     * @param {SCOREDATA} v
     * @return {string}
     */
	var ajfcstr = function(v){
		if(v.isAllJustice) return "AJ ";
		if(v.isFullCombo) return "FC ";
		return "   ";
	};

    /**
     * @return {SCOREDATA}
     */
	var dummyScore = function(){
		return {
			'fullChain':0,
			'isAllJustice':false,
			'isFullCombo':false,
			'isSuccess':false,
			'level':null,
			'musicId':null,
			'playCount':null,
			'scoreMax':0,
			'scoreRank':0,
			'updateDate':null,
		};
	};

	var rslt = [];
	for(var i = 0; i <= loadData.friendLength; i++){
		rslt[i] = [];
	}

    /** @type {number} */
    var key;
	for (key in loadData.musicNameMap){
		var winCount = 0;
        var dom = $divCreate([classList.w388,classList.musiclist_+difList[loadData.conf.dif]],'FriendVS');
        $append(dom,
            $divCreate(
                [classList.block_underline,classList.text_b],
                'vsMusicTitle',
                $append($divCreate(),
                    loadData.musicNameMap[key]
                )
            )
        );

        /** @type {SCOREDATA} */
		var val = loadData.myData.music[key];
		if(val == null) val = dummyScore();
		var myscore = val['scoreMax'];
		//var resultblock = getRsltBlock(' ',' ',ajfcstr(val) + separate(myscore),1,2,0);
        var resultblock = $getRsltBlock(
            $getInfoBlock(' ',1),
            $getInfoBlock(ajfcstr(val) + separate(myscore),0),
            ' ',3
        );

        $append(dom,resultblock);
		loadData.friendsData.forEach(function(friend){
            ENABLE_DEBUG&&console.log(friend.name,key,friend.music[key]);

            /** @type {SCOREDATA} */
			var val = friend.music[key];
			if(val == null) val = dummyScore();
			var friendscore = val['scoreMax'];
			var sa = myscore - friendscore;
			if(sa >= 0) winCount++;
            var color = sa>=0?0:1;
            if(loadData.conf.max < sa || loadData.conf.min > sa){
                color = 2;
            }
			//var resultblock = getRsltBlock(friend.name, (sa>=0?'+':'')+separate(sa),ajfcstr(val) + separate(friendscore),0,sa>=0?0:1,0);
            var resultblock = $getRsltBlock(
                $getInfoBlock(friend.name,0),
                $getInfoBlock(ajfcstr(val) + separate(friendscore),0),
                (sa>=0?'+':'')+separate(sa),color
            );
            $append(dom,resultblock);
		});

		rslt[winCount].push(dom);
	}

    rslt.forEach(function(val,key){
        if(val.length !== 0){
            var box05 = $divCreate([classList.box05,classList.w400],null,$divCreate(null,'GenreName',key +' WIN'));

    		val.forEach(function(dom){
                $append(box05,dom);
    		});
            $append(box01,box05);
		}
    });
};

clr();
friendList();
})($);
