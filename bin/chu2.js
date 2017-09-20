/**
 * @fileoverview チュウニズムSTARのデータ抜出すマン
 *     window.POSTURL にアドレスが入っていればそこに送りつける｡
 *     localStorageにデータを保存して､
 *     前回読込時以降のプレイ履歴が全てあれば差分のみ読込む｡
 * @author panda (twitter:_panda)
 * @version 0.1
 */
{

let p = {};
p.isNull = v=>v==null;
p.isFunction = func=>typeof func === 'function';

p._getCash = k=>localStorage.getItem('uni_'+k);
p.isCash = k=>!p.isNull(p._getCash(k));
p.getCash = (k,v)=>p.isCash(k)?JSON.parse(p._getCash(k)):v;
p.setCash = (k,v)=>localStorage.setItem('uni_'+k,JSON.stringify(v));

p.parseFloat = v=>parseFloat(String(v).replace(/[^\d\.]/g,''));
p.parseInt = v=>parseInt(String(v).replace(/[^\d]/g,''),10);

p.parseResultIcon = imgParent=>{
    let rslt = {
        clear:false,
        fcaj:0,
        chain:0,
    }

    $(imgParent).find('img').each((idx,img)=>{
        let word = img.src.match(reg.pngLastWord)[1];
        
        if(word == "clear"){
            rslt.clear = true;
        }else if(word.length < 3){
            rslt.rank = parseInt(word,10);
        }else if(word == 'alljustice'){
            rslt.fcaj = 2;
        }else if(word == 'fullcombo'){
            rslt.fcaj = 1;
        }else if(word.indexOf('fullchain') > -1){
            rslt.chain = (word.indexOf('2') > -1)?1:2;
        }
    });
    return rslt;
};

/**
 * @param {Element} img
 * @return {number} 0-4
 */
p.parseDifIdByImg = img=>difIdList[img.src.match(reg.pngLastWord)[1]];

p.toHalfWidth = v=>
v.replace(/[！-～]/g,tmpStr=>String.fromCharCode(tmpStr.charCodeAt(0) - 0xFEE0))
.replace(/”/g,"\"").replace(/’/g,"'").replace(/‘/g,"`")
.replace(/￥/g,"\\").replace(/　/g," ").replace(/〜/g,"~");

p.getKey = (list,val)=>{
    let key;
    $.each(list,(_key,_val)=>val==_val&&(key=_key));
    return key;
};

let setTimeoutAsync = delay=>new Promise(resolve=>setTimeout(resolve, delay));

let ajaxChainClass = class {
    constructor(){
        this.interval = 100;
        this.clear();
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
     * @param {object} param 
     * @param {Function} call 
     * @param {Function} compCall 
     * @return {Promise}
     */
    sendOnce(url,param,call,compCall){
        return this.add(url,param,call).send(compCall);
    }
    /**
     * @param {string} url 
     * @param {object} param 
     * @param {Function} call 
     * @return {this}
     */
    add(url,param,call){
        this.cue.push({'url':url,'param':param,'call':call});
        return this;
    }
};

let viewClass = class {
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

let reg = {pngLastWord:/_([^_]+)\.png$/};

let difIdList = {
    'basic':0,
    'advanced':1,
    'expert':2,
    'expart':2,
    'master':3,
    'worldsend':4
};

let difList = {
    0:'basic',
    1:'advanced',
    2:'expert',
    3:'master',
    4:'worldsend'
};

let difList_s = {
    0:'BAS',
    1:'ADV',
    2:'EXP',
    3:'MAS',
    4:'WE'
};

let genreList = {
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

let fcajList = {
    0:'',
    1:'FC',
    2:'AJ',
};

let rankList = {
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

let chainList = {
    0:'',
    1:'FullChain2',
    2:'FullChain',
};

let USERINFO_URL = '/mobile/UserInfoDetail.html';
let MUSICLIST_URL = '/mobile/MusicGenre.html';
let MUSICDETAIL_URL = MUSICLIST_URL;
let WEMUSICLIST_URL = '/mobile/WorldsEndMusic.html';
let WEMUSICDETAIL_URL = WEMUSICLIST_URL;
let PLAYLOGLIST_URL = '/mobile/Playlog.html';
let PLAYLOGDETAIL_URL = PLAYLOGLIST_URL;
let FRIENDSEARCH_URL = '/mobile/FriendSearch.html';

let MUSICLIST_EXPERT_PARAM = {music_genre:'music_genre',genre:'99',level:'expert'};
let MUSICDETAIL_PARAM = id=>Object({music_detail:'music_detail',musicId:id});
let PLAYLOGDETAIL_PARAM = idx=>Object({pageMove:'pageMove',nextPage:'PlaylogDetail',args:idx});

/**
 * @param {String} html
 * @return {Object} 
 */
let scrape_userInfo = html=>{
    let $html = $(html);
    let $player = $html.find('.box_player > form');
    let rateStr = $player.find('.player_rating').text().split('/');
    let vegasStr = $player.find('.user_data_playpoint').text().split('（');

    return {
        honer:$player.find('.player_honor_text').text(),
        /* 輪廻転生はどう表示されるのか... */
        lv:p.parseInt($player.find('.player_lv').text()),
        name:p.toHalfWidth($player.find('.player_name2 > span').text()),
        rate:p.parseFloat(rateStr[0]),
        rateMax:p.parseFloat(rateStr[1]),
        imgURL:$player.find('.character_image_box_full > img').get(0).src,
        vegas:p.parseInt(vegasStr[0]),
        vegasMax:p.parseInt(vegasStr[1]),
        comment:$player.find('.player_data_comment').text(),
        riyouken:p.parseInt($player.find('.home_player_riyouken').text()),
    };
};

/**
 * @param {String} html
 * @return {Object} 
 */
let scrape_friendSearch = html=>{
    let $html = $(html);
    let d = $html.find('.box02 > .text_c').text();
    //フレンドコード以外は･･･まっええやろ
    return {friendCode:d.split('：')[1].trim()};
};

/**
 * @param {String} html
 * @return {Object} 
 */
let scrape_musicList = html=>{
    return $(html).find('#music_detail > DIV > DIV.box05').toArray().reduce((arr,v)=>{
        let $genreList = $(v);
        let genreId = p.parseInt(p.getKey(genreList,$genreList.find('.genre').text()));

        return $genreList.find('.musiclist_box').toArray().reduce((_arr,_v)=>{
            let $el = $(_v);
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
 * @param {String} html
 * @return {Object} 
 */
let scrape_WEMusicList = html=>{
    let $weList = $(html).find('#music_detail > .musiclist_box > .musiclist_worldsend_title_block');
    return $weList.toArray().map(v=>{
        let $we = $(v);
        let title = $we.find('.musiclist_worldsend_title').get(0);
        return {
            id:p.parseInt(title.onclick),
            title:$(title).text(),
            icon:p.parseInt($we.find('.musiclist_worldsend_icon > img').get(0).src),
            star:p.parseInt($we.find('.musiclist_worldsend_star > img').get(0).src),
        };
    });
};

let scrape_playLogList = html=>{
    let $html = $(html);
    return $html.find('.box01 > .mt_10 > FORM > .frame02').toArray().map(v=>{
        let $frame02 = $(v);
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
 * @param {String} html
 * @param {number} musicId 
 * @param {number} genreId 
 * @return {Object}
 */
let scrape_musicDetail = (html,musicId,genreId)=>{
    let $html = $(html);
    let $jacket = $($html.find('.frame02').get(0));

    let musicDetail = {
        dif:{},
        id:musicId,
        genre:genreId,
        title:$jacket.find('.play_musicdata_title').text(),
        artist:$jacket.find('.play_musicdata_artist').text(),
        imgURL:$jacket.find('.play_jacket_img > IMG').get(0).src
    };

    return $html.find('.music_box').toArray().reduce((detail,v)=>{
        let $dif = $(v);
        let $box02 = $dif.find('.box02 > *');
        let difId = p.parseDifIdByImg($dif.find('.musicdata_detail_difficulty > IMG').get(0));

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
 * @param {String} html
 * @param {number} id musicId
 * @return {Object}
 */
let scrape_WEMusicDetail = (html,id)=>{
    let $html = $(html);
    let $frame02 = $html.find('#music_detail > .frame02');

    let musicDetail = {
        id:id,
        dif:{},
        imgURL:$frame02.find('.play_jacket_img > IMG').get(0).src,
        icon:p.parseInt($frame02.find('.musicdetail_worldsend_icon > img').get(0).src),
        star:p.parseInt($frame02.find('.musiclist_worldsend_star2 > img').get(0).src),
        title:$frame02.find('.play_musicdata_worldsend_title').text().trim(),
        artist:$frame02.find('.play_musicdata_artist').text().trim()
    };;

    let $music_box = $html.find('#music_detail > DIV > .music_box');
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

scrape_playLogDetail = html=>{
    let $html = $(html);

    //DIV.frame01 > DIV.frame01_inside > FROM > DIV.bix01 > DIV.frame02 >
    // DIV.play_jacket_side > DIV.jacket_area > DIV.play_data_task > IMG (src)
};
//----------------------------//

//全読込
let fullRead = (ajax,view,d)=>{
    ajax.clear();
    d.musicList.forEach(v=>{
        ajax.add(MUSICDETAIL_URL,MUSICDETAIL_PARAM(v.id),html=>{
            view.info(`[${('00'+v.id).slice(-3)}] ${v.title}`);
            return scrape_musicDetail(html,v.id,v.genre);
        });
    });
    ajax.send(v=>d.musicDetailList=v)
    .then(()=>{
        ajax.clear();
        d.WEMusicList.forEach(v=>{
            ajax.add(WEMUSICDETAIL_URL,MUSICDETAIL_PARAM(v.id),html=>{
                view.info(`[${v.id}] ${v.title}`);
                return scrape_WEMusicDetail(html,v.id);
            });
        });
        return ajax.send(v=>d.WEMusicDetailList=v);
    })
    .then(()=>cashAndExport(d,view));
};

//差分読込
let differencialRead = (ajax,view,d)=>{
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

    let newPlayMusicList_NM = newPlayTitle_NM.map(
        title=>d.musicList.find(v=>v.title == title)
    );
    let newPlayMusicList_WE = newPlayTitle_WE.map(
        title=>d.WEMusicList.find(v=>v.title == title)
    );

    let newPlayCount = newPlayMusicList_NM.length+newPlayMusicList_WE.length;
    view.info(newPlayCount==0?'更新なし':`${newPlayCount}曲更新`);

    newPlayMusicList_NM.forEach(v=>{
        ajax.add(MUSICDETAIL_URL,MUSICDETAIL_PARAM(v.id),html=>{
            view.info(`[${('00'+v.id).slice(-3)}] ${v.title}`);
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
            ajax.add(WEMUSICDETAIL_URL,MUSICDETAIL_PARAM(v.id),html=>{
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
    .then(()=>cashAndExport(d,v));
};

let cashAndExport = (v,view)=>{
    v.opt.date = Date.now();
    view.info('Complete!!');
    p.setCash(v.friendSearch.friendCode,v);
    
    if(p.isNull(window.POSTURL)){
        export_window(v);
    }else{
        export_post(v,window.POSTURL);
    }
}

/**
 * POSTで送りつける
 * @param {object} v 
 */
let export_post = (v,url)=>{
    $('<FORM />',{action:url,method:'post',target:'_blank'})
    .append($('<INPUT />', {type:'hidden',name:'data',value:JSON.stringify(v)}))
    .appendTo(document.body)
    .submit().remove();
};

/**
 * 新しいタブに表示
 * @param {object} v 
 */
let export_window = v=>{
    console.log(v);
    window.open('about:blank').document.body.innerHTML = `
    <pre><code>
        ${JSON.stringify(v,null,'    ')}
    </code></pre>
    `;
};

//----------------------------//
let d = {
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
let ajax = new ajaxChainClass();
let view = new viewClass();
view.clear();

void ajax.add(USERINFO_URL,null,v=>{
    let userInfo = scrape_userInfo(v);
    view.info(`ユーザー名：${userInfo.name}`);
    return userInfo;
})
.add(FRIENDSEARCH_URL,null,v=>{
    let friendSearch = scrape_friendSearch(v);
    view.info(`フレンドコード：${friendSearch.friendCode}`);
    return friendSearch;
})
.add(MUSICLIST_URL,MUSICLIST_EXPERT_PARAM,v=>{
    let musicList = scrape_musicList(v);
    view.info(`通常曲数：${musicList.length}曲`);
    return musicList;
})
.add(WEMUSICLIST_URL,null,v=>{
    let WEMusicList = scrape_WEMusicList(v);
    view.info(`WE曲数：${WEMusicList.length}曲`)
    return WEMusicList;
})
.add(PLAYLOGLIST_URL,null,scrape_playLogList)
.send(([userInfo,friendSearch,musicList,WEMusicList,playLogList])=>{
    //view.info(`ユーザー名：${userInfo.name}`);
    //view.info(`フレンドコード：${friendSearch.friendCode}`);
    //view.info(`通常曲数：${musicList.length}曲`);
    //view.info(`WE曲数：${WEMusicList.length}曲`)
    let lastLogDate = playLogList[0].date;
    let fastLogDate = playLogList[playLogList.length - 1].date;
    view.info(`プレイ履歴：${fastLogDate.slice(5)} ～ ${lastLogDate.slice(5)}`);

    let cash = p.getCash(friendSearch.friendCode);
    let allReadMode = true; 
    if(p.isNull(cash)){
        view.info('キャッシュ：なし');
    }else{
        /** @type {Date} */
        let cashDate = new Date(cash.opt.date);
        view.info('キャッシュ：あり [' 
            + (cashDate.getMonth()+1) + '/' 
            + cashDate.getDay() + ' '
            + cashDate.getHours() + ':'
            + cashDate.getMinutes()
            + ']'
        );

        if(Date.parse(fastLogDate) < cashDate.getTime()){
            allReadMode = false;
        }
    }

    view.info(`${allReadMode?'全':'差分'}読込モード`);
    
    let d = {
        userInfo:userInfo,
        friendSearch:friendSearch,
        playLogList:playLogList,
        musicList:musicList,
        WEMusicList:WEMusicList,
    };

    if(allReadMode){
        d.opt = {date:null,ver:1}
        fullRead(ajax,view,d);
    }else{
        differencialRead(ajax,view,Object.assign(cash,d));
    }
});

}