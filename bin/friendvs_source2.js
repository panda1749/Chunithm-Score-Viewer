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
 *  each:(function((Array|Object),function(number,?)):?),
 * }}
 */
var J;

/**
 * @typedef {{
 *  characterFileName:string,
 *  characterLevel:number,
 *  genreList:Array.<number>,
 *  genreMap:Array.<number>,
 *  length:number,
 *  musicNameMap:Object,
 *  userId:number,
 *  userMusicList:Array.<SCOREDATA>,
 *  userName:string,
 *}}
 */
var GETUSERMUSICAPIDATA;

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
 *  group:number,
 *  max:number,
 *  min:number,
 *  dif:number,
 *}}
 */
var LOADDATA_CONF;

/**
 * @typedef {{
 *  myData:(GETUSERMUSICAPIDATA|null),
 *  friendsData:Array.<GETUSERMUSICAPIDATA>,
 *  conf:!LOADDATA_CONF,
 *}}
 */
var LOADDATA;

/**
 *  @typedef {{
 *  score:number,
 *  combo:number,
 *  chain:number,
 *  rank:number,
 *  sa:number,
 *}}
 */
var ALSSCORE;

/**
 * @typedef {{
 *  name:string,
 *  genre:number,
 *  myScore:ALSSCORE,
 *  friendScore:!Object,
 *  vs:Object,
 *}}
 */
var ALSMUSICDATA;

/**
 * @typedef {{
 *  musicList:Object,
 *  groupList:Object,
 *  friendList:Array.<string>,
 *  conf:LOADDATA_CONF,
 *  musicNameMap:Object,
 *  genreMap:Object,
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
 * @param {J} $$
 */
function($,$$){

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

/**
 * @param {number} num
 * @return {string}
 */
var separate = function(num){
    return String(num).replace( /(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
};


var $$each = /** @type (function((Array|Object),function(number,?)):?)*/($$['each']);

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

/** responseProperty
 * @enum {string}
 */
var resPro = {
    userId:'userId',
    musicId:'musicId',
    friendCode:'friendCode',
    friendName:'friendName',
    userFriendlistList:'userFriendlistList',
    isFavorite:'isFavorite',
    musicNameMap:'musicNameMap',
    genreMap:'genreMap',
    userMusicList:'userMusicList',
    isAllJustice:'isAllJustice',
    isFullCombo:'isFullCombo',
    scoreMax:'scoreMax',
    fullChain:'fullChain',
    scoreRank:'scoreRank',
    userName:'userName',
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
    param = $['extend'](true,{},param);
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
            if(res[resPro.userId] != null){
                window['setCookie'](resPro.userId,res[resPro.userId]);
            }
            func(res);
        }
	});
};

/** 読込画面
 * @return {void}
 */
var friendList = function(){
    var box02 = $divCreate([classList.box02,classList.w420,classList.mb_20]);
	$append($('.' + classList.frame01_inside),box02);
	var form = $('<form onsubmit="return false" />');

    //dif選択--------------------------------
    var classHead = classList.btn_;
    var difbtnList = {};
    var difblock = $divCreate(classList.difficulty_btn_block);
    var dif = 2;
    var difbtnClick = function(e){
        var $target = $(e.target);
        difList.forEach(function(val,key){
            //クラス名をdifList[key]かdifList[key]_onに切替
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

    //スコア差-------------------------------------
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
        load(
            friendCode,
            {
                sort:sort,
                max:maxScore,
                min:minScore,
                dif:dif,
                group:1,
            }
        );
	};
	var btn = $('<input type="button" value="読込" onclick="" data-sorttype="1" />')
	.click(readbtnFunc);

    $append(box02,form,btn);

    /**
     * @param {{userId:number,friendCode:number,friendName:string}} friendNamData
     */
	var UserFriendNameApiFunc = function(friendNamData){
		//this:form
        var check = join('<input type="checkbox" name="',friendNamData[resPro.friendCode],'" />');
        var name = toHalfWidth(friendNamData[resPro.friendName]);
        var friend = $append($divCreate(),check,name);
        $append(this,friend);
	};

    /**
     * @param {{userFriendlistList:Array}} friendlistData
     */
	var FriendlistApiFunc = function(friendlistData){
		//this:form
		var friends = friendlistData[resPro.userFriendlistList].filter(function(elem,index,array){
	        return elem[resPro.isFavorite] === true;
		});

		friends = friends.map(function(elem){
			return elem[resPro.friendCode];
		});

        var apiDeferreds = [];
		friends.forEach(function(friendCode){
			//this:form
            var param = {};
            param[resPro.friendCode] = parseInt(friendCode,10);
			var deferred = send(
                "GetUserFriendNameApi",
                param,
                UserFriendNameApiFunc,
                this
            );
            apiDeferreds.push(deferred);
        },this);
        var allApiDeferred = $['when'].apply(this,apiDeferreds);
        return allApiDeferred;
	};

	var Deferred = send("GetUserFriendlistApi",{'state': 3},FriendlistApiFunc,form);
};

/**
 * @param {Array.<number>} friendCodes
 * @param {LOADDATA_CONF} conf
 */
var load = function(friendCodes,conf){
    ENABLE_DEBUG&&console.log(arguments);
	if(friendCodes.length === 0) return void 0;

    if(conf.dif === null) conf.dif = 2;

    /** type {LOADDATA} */
	var loadData = {
		myData:null,
		friendsData:[],
        conf:conf,
	};
    var param = {"level":parseInt(19900,10) + parseInt(conf.dif,10),"isStatus":true};
	send(
        "GetUserMusicApi",
        param,
        /** @this {LOADDATA} */function(/** @type {GETUSERMUSICAPIDATA} */res){
		this.myData = res;
	   },
       loadData
   );

    var apiDeferreds = [];
	friendCodes.forEach(/** @this {LOADDATA} */function(friendCode){
        param[resPro.friendCode] = friendCode;
		var deferred = send(
            "GetUserMusicApi",
            param,
            /** @this {LOADDATA} */function(/** @type {GETUSERMUSICAPIDATA} */userMusicData){
			         this.friendsData.push(userMusicData);
		    },
            loadData
        );
        apiDeferreds.push(deferred);
	},loadData);
    var allApiDeferred = $['when'].apply(this,apiDeferreds);
    allApiDeferred.done(function(){
        purser(loadData);
    });
};

/**
 * @param {LOADDATA} loadData
 */
var purser = function(loadData){
    ENABLE_DEBUG&&console.log(loadData);

    var alsData = /** @type {ALSDATA} */ ({
        musicList:{},
        friendList:[],
        groupList:[],
        conf:loadData.conf,
    });

    $$each(loadData.myData[resPro.musicNameMap],function(key,musicName){
        alsData.musicList[key] = /** @type {ALSMUSICDATA} */({
            name:musicName,
            genre:loadData.myData[resPro.genreMap][key],
            myScore:/** @type {ALSSCORE} */({
                score:0,
                combo:0,
                chain:0,
                rank:0,
            }),
            friendScore:{},
            vs:{win:0,lose:0,draw:0,sa:0},
        });
    });

    $$each(loadData.myData[resPro.userMusicList],function(key,/** @type {SCOREDATA} */val){
        var combo = val[resPro.isAllJustice]?2:(val[resPro.isFullCombo]?1:0);
        var score =
        alsData.musicList[val[resPro.musicId]].myScore = /** @type {ALSSCORE} */({
            score:val[resPro.scoreMax],
            combo:combo,
            chain:val[resPro.fullChain],
            rank:val[resPro.scoreRank],
        });
    });

    $$each(loadData.friendsData,function(f_key,/** @type {GETUSERMUSICAPIDATA} */val){
        alsData.friendList[f_key] = toHalfWidth(val[resPro.userName]);
        $$each(val[resPro.userMusicList],function(s_key,/** @type {SCOREDATA} */val2){
            var music = alsData.musicList[val2[resPro.musicId]];
            var vs = music.vs;
            var combo = val2[resPro.isAllJustice]?2:(val2[resPro.isFullCombo]?1:0);
            var score =
            music.friendScore[f_key] = /** @type {ALSSCORE} */({
                score:val2[resPro.scoreMax],
                combo:combo,
                chain:val2[resPro.fullChain],
                rank:val2[resPro.scoreRank],
            });
            var sa = music.myScore.score - score.score;
            score.sa = sa;
            vs.sa = vs.sa + sa;
            if(sa >= 0){
                vs.win++;
            }else if(sa < 0){
                vs.lose++;
            }else{
                vs.draw++;
            }
        });
    });
    filter(alsData);
};

/**
 * @param {ALSDATA} alsData
 */
var filter = function(alsData){
    var max = alsData.conf.max;
    var min = alsData.conf.min;

    $$each(alsData.musicList,function(musicId,/** @type {ALSMUSICDATA} */music){
        $$each(music.friendScore,function(f_key,/** @type {ALSSCORE} */score){
            if(score.sa > max || score.sa < min){
                delete music.friendScore[f_key];
            }
        });
        if(Object.keys(music.friendScore).length === 0){
            delete alsData.musicList[musicId];
        }
    });
    group(alsData);
};

/**
 * @param {ALSDATA} alsData
 */
var group = function(alsData){
    var groupList = {};

    var setGroup =function(key,name){
        groupList[key] = {
            name:name,
            items:[],
        };
    };

    var setGroupItem = function(key,item){
        groupList[key].items.push(item);
    };

    switch (alsData.conf.group) {
        case 1://WIN数
            for(var i = 0;i < alsData.friendList.length +1;i++){
                setGroup(i,i+' WIN');
            }

            $$each(alsData.musicList,function(musicId,/** @type {ALSMUSICDATA} */music){
                setGroupItem(music.vs.win,music);
            });
            break;
    }

    $$each(groupList,function(key,/** @type {{name:string,items:Array}} */data){
        if(data.items.length !== 0){
            alsData.groupList.push(data);
        }
    });

    sort(alsData);
};

/**
 * @param {ALSDATA} alsData
 */
var sort = function(alsData){
    render(alsData);
};

/**
 * @param {ALSDATA} alsData
 */
var render = function(alsData){
    /**
     * @param {number} num
     * @return {string}
     */
    var ajfctoStr = function(num){
        if(num === 1) return 'FC ';
        if(num === 2) return 'AJ ';
        return '   ';
    };
    var dif = alsData.conf.dif;
    var $frame = clr();
    var $vsresult = $divCreate(null,'userFriendGenreVs_result');
    var difName = ['BASIC','ADVANCED','EXPERT','MASTER'];
    var $box01 = $divCreate([classList.box01,classList.w420],null,
        $divCreate([classList.box01_title,classList.title_ + difList[dif]],'DifficulityName',difName[dif])
    );

    $$each(alsData.groupList,function(key,group){
        var $box05 = $divCreate([classList.box05,classList.w400],null,$divCreate(null,'GenreName',group.name));
        $$each(group.items,function(key,/** @type {ALSMUSICDATA} */item){
            var $item = $divCreate([classList.w388,classList.musiclist_+difList[dif]],'FriendVS');
            $append($item,
                $divCreate(
                    [classList.block_underline,classList.text_b],
                    'vsMusicTitle',
                    $append($divCreate(),item.name)
                )
            );
            var myScore = item.myScore;
            var $resultblock = $getRsltBlock(
                $getInfoBlock(' ',1),
                $getInfoBlock(ajfctoStr(myScore.combo) + separate(myScore.score),0),
                ' ',3
            );
            $append($item,$resultblock);

            $$each(item.friendScore,function(key,/** @type {ALSSCORE}*/ Fscore){
                var $resultblock = $getRsltBlock(
                    $getInfoBlock(alsData.friendList[key],0),
                    $getInfoBlock(ajfctoStr(Fscore.combo) + separate(Fscore.score),0),
                    (Fscore.sa>=0?'+':'')+separate(Fscore.sa),Fscore.sa>=0?0:1
                );
                $append($item,$resultblock);
            });
            $append($box05,$item);
        });

        $append($box01,$box05);
    });
    $append($frame,$append($vsresult,$box01));
    ENABLE_DEBUG&&console.log(alsData);
};

clr();
friendList();
})($,$);
