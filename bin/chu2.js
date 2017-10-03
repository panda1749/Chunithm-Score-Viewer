/**
 * @fileoverview チュウニズムSTARのデータ抜出すマン
 *     window._EXPORT が関数ならデータを渡す､URLならPOST､
 *     どちらでもなければ画面に表示する｡
 *     データをキャシュして､前回読込時以降のプレイ履歴が全てあれば差分のみ読込む｡
 * @author panda (twitter:_panda)
 * @version 0.2
 */
'use strict';
{
const p = {
    isNull:v=>v==null,
    isFunction:func=>typeof func === 'function',

    /** @private */
    _getCash:k=>localStorage.getItem('uni_'+k),
    isCash:k=>!p.isNull(p._getCash(k)),
    getCash:(k,v = null)=>p.isCash(k)?JSON.parse(p._getCash(k)):v,
    setCash:(k,v)=>localStorage.setItem('uni_'+k,JSON.stringify(v)),

    parseFloat:v=>parseFloat(String(v).replace(/[^\d\.]/g,'')),
    parseInt:v=>parseInt(String(v).replace(/[^\d]/g,''),10),

    parseResultIcon:imgParent=>{
        return $(imgParent).find('img').toArray().reduce((rslt,img)=>{
            let [,word] = img.src.match(reg.pngLastWord);
            
            if(word == "clear"){
                rslt.clear = true;
            }else if(word.length < 3){
                rslt.rank = p.parseInt(word);
            }else if(word == 'alljustice'){
                rslt.fcaj = 2;
            }else if(word == 'fullcombo'){
                rslt.fcaj = 1;
            }else if(word.includes('fullchain')){
                rslt.chain = word.includes('2')?1:2;
            }
            return rslt;
        },{clear:false,fcaj:0,chain:0,});
    },
    /**
     * @param {Element} img
     * @return {Number} 0-4
     */
    parseDifIdByImg:img=>difIdList[img.src.match(reg.pngLastWord)[1]],
    /** 全角を半角に
     * @param {string} v
     * @return {string}
     */
    toHalfWidth:v=>
      v.replace(/[！-～]/g,tmpStr=>String.fromCharCode(tmpStr.charCodeAt(0) - 0xFEE0))
      .replace(/”/g,"\"").replace(/’/g,"'").replace(/‘/g,"`")
      .replace(/￥/g,"\\").replace(/　/g," ").replace(/〜/g,"~"),
    /** 頭に0付ける
     * @return {string}
     */
    zeroFill:(v,len)=>String(v).padStart(len,'0'),
    /** Date->MM/dd hh:mm
     * @param {Date} date
     * @return {string}
     */
    dateFormat:date=>`${p.zeroFill(date.getMonth()+1,2)}/${p.zeroFill(date.getDate(),2)}`+
      ` ${p.zeroFill(date.getHours(),2)}:${p.zeroFill(date.getMinutes(),2)}`,
    /**
     * @param {Array|Object} list
     * @param {*} val
     * @return {string}
     */
    getKey:(list,val)=>Object.keys(list).find(k=>list[k]==val),
};

const setTimeoutAsync = delay=>new Promise(resolve=>setTimeout(resolve, delay));

const ajaxChainClass = class ajaxChainClass{
    constructor(){
        this.interval = 100;
        this.cue = [];
    }
    clear(){
        this.cue = [];
    }
    /**
     * @param {Function} call 
     * @return {Promise}
     */
    send(call){
        let promise = Promise.resolve();
        let reslt = [];
        this.cue.forEach(val=>{
            promise = promise.then(()=>$.ajax({url:val.url,method:'POST',data:val.param}))
              .then(v=>reslt.push(p.isFunction(val.call)?val.call(v):v))
              .then(v=>setTimeoutAsync(this.interval));
        });
        if(p.isFunction(call)) promise.then(()=>call(reslt));
        this.clear();
        return promise;
    }
    /**
     * @param {string} url 
     * @param {Object} param 
     * @param {Function} call 
     * @param {Function} compCall 
     * @return {Promise}
     */
    sendOnce(url,param,call,compCall){
        return this.add(url,param,call).send(compCall);
    }
    /**
     * @param {string} url 
     * @param {Object} param 
     * @param {Function} call 
     * @return {ajaxChainClass}
     */
    add(url,param,call){
        this.cue.push({'url':url,'param':param,'call':call});
        return this;
    }
};

const viewClass = class {
    constructor(){
        this.frame01 = $('.frame01');
    }
    clear(){
        this.frame01.empty();
        this.frame01.css('text-align','left');
        this.frame01.css('white-space','nowrap');
    }
    info(str){
        this.frame01.prepend($(`<DIV>${str}</DIV>`));
    }
}

const reg = {pngLastWord:/_([^_]+)\.png$/};

const difIdList = {
    'basic':0,
    'advanced':1,
    'expert':2,
    'expart':2,
    'master':3,
    'worldsend':4
};

const difList = {
    0:'basic',
    1:'advanced',
    2:'expert',
    3:'master',
    4:'worldsend'
};

const genreList = {
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

const fcajList = {
    0:'',
    1:'FC',
    2:'AJ',
};

const rankList = {
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

const chainList = {
    0:'',
    1:'FullChain2',
    2:'FullChain',
};

const USERINFO_URL = '/mobile/UserInfoDetail.html';
const MUSICLIST_URL = '/mobile/MusicGenre.html';
const MUSICDETAIL_URL = MUSICLIST_URL;
const WEMUSICLIST_URL = '/mobile/WorldsEndMusic.html';
const WEMUSICDETAIL_URL = WEMUSICLIST_URL;
const PLAYLOGLIST_URL = '/mobile/Playlog.html';
const PLAYLOGDETAIL_URL = PLAYLOGLIST_URL;
const FRIENDSEARCH_URL = '/mobile/FriendSearch.html';

const param = {
    musicList:dif=>Object({music_genre:'music_genre',genre:'99',level:difList[dif]}),
    musicDetail:id=>Object({music_detail:'music_detail',musicId:id}),
    PlayLogDetail:idx=>Object({pageMove:'pageMove',nextPage:'PlaylogDetail',args:idx})
}

/**
 * @param {string} html
 * @return {Object} 
 */
const scrape_userInfo = html=>{
    const $html = $(html);
    const $player = $html.find('.box_player > form');
    const [rateStr,rateMaxStr] = $player.find('.player_rating').text().split('/');
    const [vegasStr,vegasMaxStr] = $player.find('.user_data_playpoint').text().split('（');

    return {
        honer:$player.find('.player_honor_text').text(),
        /* 輪廻転生はどう表示されるのか... */
        lv:p.parseInt($player.find('.player_lv').text()),
        name:p.toHalfWidth($player.find('.player_name2 > span').text()),
        rate:p.parseFloat(rateStr),
        rateMax:p.parseFloat(rateMaxStr),
        imgURL:$player.find('.character_image_box_full > img').get(0).src,
        vegas:p.parseInt(vegasStr),
        vegasMax:p.parseInt(vegasMaxStr),
        playCount:p.parseInt($player.find('.user_data_play').text()),
        comment:$player.find('.player_data_comment').text(),
        riyouken:p.parseInt($player.find('.home_player_riyouken').text()),
    };
};

/** friendCode以外は･･･まぁええやろ
 * @param {string} html
 * @return {Object} 
 */
const scrape_friendSearch = html=>
  Object({friendCode:$(html).find('.box02 > .text_c').text().split('：')[1].trim()});

/**
 * @param {string} html
 * @return {Object} 
 */
const scrape_musicList = html=>{
    return $(html).find('#music_detail > DIV > DIV.box05').toArray().reduce((arr,v)=>{
        const $genreList = $(v);
        const genreId = p.parseInt(p.getKey(genreList,$genreList.find('.genre').text()));

        return $genreList.find('.musiclist_box').toArray().reduce((_arr,_v)=>{
            const $el = $(_v);
            _arr.push({
                genre:genreId,
                id:p.parseInt($el.find('.music_title').get(0).onclick),
                title:$el.find('.music_title').text()
            });
            return _arr;
        },arr);
    },[]);
};

/**
 * @param {string} html
 * @return {Object} 
 */
const scrape_WEMusicList = html=>{
    const $weList = $(html).find('#music_detail > .musiclist_box > .musiclist_worldsend_title_block');
    return $weList.toArray().map(v=>{
        const $we = $(v);
        const title = $we.find('.musiclist_worldsend_title').get(0);
        return {
            id:p.parseInt(title.onclick),
            title:$(title).text(),
            icon:p.parseInt($we.find('.musiclist_worldsend_icon > img').get(0).src),
            star:p.parseInt($we.find('.musiclist_worldsend_star > img').get(0).src),
        };
    });
};

const scrape_playLogList = html=>{
    const $html = $(html);
    return $html.find('.box01 > .mt_10 > FORM > .frame02').toArray().map(v=>{
        const $frame02 = $(v);
        return Object.assign(
            {
                date:$frame02.find('.play_datalist_date').text(),
                imgURL:$frame02.find('.play_jacket_img > IMG').get(0).src,
                track:p.parseInt($frame02.find('.play_track_text').text()),
                dif:p.parseDifIdByImg($frame02.find('.play_track_result > IMG').get(0)),
                title:$frame02.find('.play_musicdata_title').text(),
                score:p.parseInt($frame02.find('.play_musicdata_score_text').text()),
                id:p.parseInt($frame02.find('.btn_see_detail > A').get(0).onclick),
                task:!($frame02.find('.play_data_task').length == 0)//課題曲
            },
            p.parseResultIcon($frame02.find('.play_musicdata_icon > IMG'))
        );
    });
};

/**
 * @param {string} html
 * @param {Number} musicId 
 * @param {Number} genreId 
 * @return {Object}
 */
const scrape_musicDetail = (html,musicId,genreId)=>{
    const $html = $(html);
    const $jacket = $($html.find('.frame02').get(0));

    let musicDetail = {
        dif:{},
        id:musicId,
        genre:genreId,
        title:$jacket.find('.play_musicdata_title').text(),
        artist:$jacket.find('.play_musicdata_artist').text(),
        imgURL:$jacket.find('.play_jacket_img > IMG').get(0).src
    };

    return $html.find('.music_box').toArray().reduce((detail,v)=>{
        const $dif = $(v);
        const $box02 = $dif.find('.box02 > *');
        const difId = p.parseDifIdByImg($dif.find('.musicdata_detail_difficulty > IMG').get(0));

        detail.dif[difId] = Object.assign(
            {
                dif:difId,
                date:$dif.find('.musicdata_detail_date').text(),
                score:p.parseInt($($box02.get(0)).find('.text_b').text()),
                playCount:p.parseInt($($box02.get(1)).find('span:last').text())
            },
            p.parseResultIcon($box02.get(2))
        );
        return detail;
    },musicDetail);
};

/**
 * @param {string} html
 * @param {Number} id musicId
 * @return {Object}
 */
const scrape_WEMusicDetail = (html,id)=>{
    const $html = $(html);
    const $frame02 = $html.find('#music_detail > .frame02');

    let musicDetail = {
        id:id,
        dif:{},
        imgURL:$frame02.find('.play_jacket_img > IMG').get(0).src,
        icon:p.parseInt($frame02.find('.musicdetail_worldsend_icon > img').get(0).src),
        star:p.parseInt($frame02.find('.musiclist_worldsend_star2 > img').get(0).src),
        title:$frame02.find('.play_musicdata_worldsend_title').text().trim(),
        artist:$frame02.find('.play_musicdata_artist').text().trim()
    };;

    const $music_box = $html.find('#music_detail > DIV > .music_box');
    if($music_box.length != 0){
        musicDetail.dif[4] = Object.assign(
            {
                dif:4,
                date:$music_box.find('.musicdata_detail_date').text(),
                score:p.parseInt($music_box.find('.ptb_5 > .text_b').text()),
                playCount:p.parseInt($music_box.find('.ptb_5 > DIV > SPAN:last').text()),
            },
            p.parseResultIcon($music_box.find('.play_musicdata_icon'))
        );
    }
    return musicDetail;
};

const scrape_playLogDetail = html=>{
    const $html = $(html);

    //DIV.frame01 > DIV.frame01_inside > FROM > DIV.bix01 > DIV.frame02 >
    // DIV.play_jacket_side > DIV.jacket_area > DIV.play_data_task > IMG (src)
};
//----------------------------//

//全読込
const fullRead = (ajax,view,d)=>{
    ajax.clear();
    d.musicList.forEach(v=>{
        ajax.add(MUSICDETAIL_URL,param.musicDetail(v.id),html=>{
            view.info(`[${p.zeroFill(v.id,4)}] ${v.title}`);
            return scrape_musicDetail(html,v.id,v.genre);
        });
    });
    ajax.send(v=>d.musicDetailList=v)
    .then(()=>{
        ajax.clear();
        d.WEMusicList.forEach(v=>{
            ajax.add(WEMUSICDETAIL_URL,param.musicDetail(v.id),html=>{
                view.info(`[${v.id}] ${v.title}`);
                return scrape_WEMusicDetail(html,v.id);
            });
        });
        return ajax.send(v=>d.WEMusicDetailList=v);
    })
    .then(()=>cashAndExport(ajax,view,d));
};

//差分読込
const differencialRead = (ajax,view,d)=>{
    ajax.clear();

    let newPlayTitle_NM = [];
    let newPlayTitle_WE = [];
    d.playLogList.forEach(v=>{
        if((new Date(v.date)).getTime() < d.opt.date) return void 0;
        //前回の読込以降のログ
        (v.dif == 4?newPlayTitle_WE:newPlayTitle_NM).push(v.title);
    });

    //重複排除
    newPlayTitle_NM = Array.from(new Set(newPlayTitle_NM));
    newPlayTitle_WE = Array.from(new Set(newPlayTitle_WE));

    const newPlayMusicList_NM = newPlayTitle_NM.map(
        title=>d.musicList.find(v=>v.title == title));
    const newPlayMusicList_WE = newPlayTitle_WE.map(
        title=>d.WEMusicList.find(v=>v.title == title));

    let newPlayCount = newPlayMusicList_NM.length+newPlayMusicList_WE.length;
    view.info(newPlayCount==0?'更新なし':`${newPlayCount}曲更新`);

    newPlayMusicList_NM.forEach(v=>{
        ajax.add(MUSICDETAIL_URL,param.musicDetail(v.id),html=>{
            view.info(`[${p.zeroFill(v.id,4)}] ${v.title}`);
            return scrape_musicDetail(html,v.id,v.genre);
        });
    });
    ajax.send(r=>{
        r.forEach(v=>{
            let musicDetail = d.musicDetailList.find(m=>m.id == v.id);
            if(p.isNull(musicDetail)){
                d.musicDetailList.push(v);
            }else{
                Object.assign(musicDetail,v);
            }
        });
    })
    .then(()=>{
        ajax.clear();
        newPlayMusicList_WE.forEach(v=>{
            ajax.add(WEMUSICDETAIL_URL,param.musicDetail(v.id),html=>{
                view.info(`[${v.id}] ${v.title}`);
                return scrape_WEMusicDetail(html,v.id);
            });
        });
        return ajax.send(r=>{
            r.forEach(v=>{
                let musicDetail = d.WEMusicDetailList.find(m=>m.id == v.id);
                if(p.isNull(musicDetail)){
                    d.WEMusicDetailList.push(v);
                }else{
                    Object.assign(musicDetail,v);
                }
            });
        });
    })
    .then(()=>cashAndExport(ajax,view,d));
};

const cashAndExport = (ajax,view,d)=>{
    d.opt.date = Date.now();
    view.info('Complete!!');
    p.setCash(d.friendSearch.friendCode,d);
    console.log('orgData',d);

    if(p.isFunction(window._EXPORT)){
        window._EXPORT(d);
    }else if(String(window._EXPORT).search(/^(https?:)?\/\//) != -1){
        const url = String(window._EXPORT);
        if(url.includes('//chuniviewer.net/updatescore')){
            check_chuniviwer_version(ajax).then(
                ()=>export_chuniviwer(d),
                ver=>view.info(`ChuniViwerが更新されています｡ ${CHUNIVWER_VERSION} -> ${ver}`)
            );
        }else{
            export_post(d,url);
        }
    }else{
        export_window(d);
    }
}

/**
 * POSTで送りつける
 * @param {Object} d
 * @param {string} url
 * @param {string=} name
 */
const export_post = (d,url,name = 'data')=>{
    console.log('exportData',d);
    $('<FORM />',{action:url,method:'post',target:'_blank'})
    .append($('<INPUT />', {type:'hidden',name:name,value:JSON.stringify(d)}))
    .appendTo(document.body)
    .submit()
    .remove();
};

/**
 * 新しいタブに表示
 * @param {Object} d
 */
const export_window = d=>{
    console.log(d);
    window.open('about:blank').document.body.innerHTML = `
    <pre><code>
        ${JSON.stringify(d,null,'    ')}
    </code></pre>
    `;
};

//ChuniViwer------------------------------------------>
const CHUNIVIWER_UPLOAD_URL = '//chuniviewer.net/updatescore';
const CHUNIVIWER_VERCHECK_URL = '//chuniviewer.net/GetScriptVersion.php';
const CHUNIVWER_VERSION = 120;

const check_chuniviwer_version = ajax=>
    new Promise((resolve,reject)=>
        ajax.sendOnce(CHUNIVIWER_VERCHECK_URL,null,v=>
            (v.version == CHUNIVWER_VERSION?resolve:reject)(v.version)
        )
    )
;

/**
 * ChuniViwerにアップロード
 * @param {Object} d
 */
const export_chuniviwer = d=>{
    let userInfo = {
        highestRating:d.userInfo.rateMax*100,
        level:String(d.userInfo.lv),
        playCount:String(d.userInfo.playCount),
        playerRating:d.userInfo.rate*100,
        point:d.userInfo.vegas,
        reincarnationNum:0,//
        totalPoint:d.userInfo.vegasMax,
        trophyName:d.userInfo.honer,
        userName:d.userInfo.name,
    };

    let musicDetail = d.musicDetailList.map(detail=>Object({
        music_id:String(detail.id),
        scoreData:Object.keys(detail.dif).reduce((r,k)=>{
            let v = detail.dif[k];
            r[v.dif] = {
                alljustice:v.fcaj==2,
                difficulty:v.dif,
                fullchain:v.chain,
                fullcombo:v.fcaj==1,
                playcount:v.playCount,
                rank:String(v.rank),
                score:String(v.score),
                success:v.clear,
                updateDate:v.date,
            };
            return r;
        },{0:{},1:{},2:{},3:{}})
    }));
    
    export_post({musicDetail,playerInfo:{userInfo}},CHUNIVIWER_UPLOAD_URL,'scoredata');
};

//ChuniViwer<------------------------------------------

//----------------------------//
void {
    userInfo:null,
    friendSearch:null,

    musicList:null,
    WEMusicList:null,
    playLogList:null,

    musicDetailList:null,
    WEMusicDetailList:null,
    playLogDetailList:null,
    opt:{
        date:null,
        ver:1,
    }
};
//----------------------------//
const ajax = new ajaxChainClass();
const view = new viewClass();
view.clear();

void ajax.add(USERINFO_URL,null,v=>{
    const userInfo = scrape_userInfo(v);
    view.info(`ユーザー名：${userInfo.name}`);
    return userInfo;
})
.add(FRIENDSEARCH_URL,null,v=>{
    const friendSearch = scrape_friendSearch(v);
    view.info(`フレンドコード：${friendSearch.friendCode}`);
    return friendSearch;
})
.add(MUSICLIST_URL,param.musicList(2),v=>{
    const musicList = scrape_musicList(v);
    view.info(`通常曲数：${musicList.length}曲`);
    return musicList;
})
.add(WEMUSICLIST_URL,null,v=>{
    const WEMusicList = scrape_WEMusicList(v);
    view.info(`WE曲数：${WEMusicList.length}曲`)
    return WEMusicList;
})
.add(PLAYLOGLIST_URL,null,scrape_playLogList)
.send(([userInfo,friendSearch,musicList,WEMusicList,playLogList])=>{
    //view.info(`ユーザー名：${userInfo.name}`);
    //view.info(`フレンドコード：${friendSearch.friendCode}`);
    //view.info(`通常曲数：${musicList.length}曲`);
    //view.info(`WE曲数：${WEMusicList.length}曲`)
    const lastLogDate = playLogList[0].date;
    const fastLogDate = playLogList[playLogList.length - 1].date;
    view.info(`プレイ履歴：${fastLogDate.slice(5)} ～ ${lastLogDate.slice(5)}`);

    let cash = p.getCash(friendSearch.friendCode);
    let allReadMode = true; 
    if(p.isNull(cash)){
        view.info('キャッシュ：なし');
    }else{
        /** @type {Date} */
        const cashDate = new Date(cash.opt.date);
        view.info(`キャッシュ：あり [${p.dateFormat(cashDate)}]`);

        if(Date.parse(fastLogDate) < cashDate.getTime()){
            allReadMode = false;
        }
    }

    view.info(`${allReadMode?'全':'差分'}読込モード`);
    
    let d = {
        userInfo,
        friendSearch,
        playLogList,
        musicList,
        WEMusicList,
    };

    if(allReadMode){
        d.opt = {date:null,ver:1}
        fullRead(ajax,view,d);
    }else{
        differencialRead(ajax,view,Object.assign(cash,d));
    }
});

}