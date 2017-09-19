/**
 * @fileoverview チュウニズムSTARのデータ抜出すマン
 * @author panda (twitter:_panda)
 * @@version 0.1
 */
(function(POST_URL){
    
    var p = {};
    p.isNull = v=>v==null;
    p.isFunction = func=>typeof func === 'function';
    
    p._getCash = k=>localStorage.getItem('uni_'+k);
    p.isCash = k=>!p.isNull(p._getCash(k));
    p.getCash = (k,v)=>p.isCash(k)?JSON.parse(p._getCash(k)):v;
    p.setCash = (k,v)=>localStorage.setItem('uni_'+k,JSON.stringify(v));
    
    p.parseFloat = v=>parseFloat(String(v).replace(/[^\d\.]/g,''));
    p.parseInt = v=>parseInt(String(v).replace(/[^\d]/g,''),10);
    
    p.parseResultIcon = imgParent=>{
        var rslt = {
            clear:false,
            fcaj:0,
            chain:0,
        }
    
        $(imgParent).find('img').each((idx,img)=>{
            var word = img.src.match(reg.pngLastWord)[1];
            
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
        var key;
        $.each(list,(_key,_val)=>{
            if(val == _val) key = _key;
        });
        return key;
    };
    
    var setTimeoutAsync = delay=>new Promise(resolve=>setTimeout(resolve, delay));
    
    var ajaxChainClass = class {
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
            var promise = Promise.resolve();
            var reslt = [];
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
    
    var viewClass = class {
        constructor(){
            this.frame01 = $('.frame01');
        }
        clear(){
            this.frame01.empty();
            this.frame01.css('text-align','left');
            this.frame01.css('white-space','nowrap');
        }
        info(str){
            this.frame01.prepend($('<DIV>'+str+'</DIV>'));
        }
    }
    
    var reg = {pngLastWord:/_([^_]+)\.png$/};
    
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
    
    var difList_s = {
        0:'BAS',
        1:'ADV',
        2:'EXP',
        3:'MAS',
        4:'WE'
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
    
    var USERINFO_URL = '/mobile/UserInfoDetail.html';
    var MUSICLIST_URL = '/mobile/MusicGenre.html';
    var MUSICDETAIL_URL = MUSICLIST_URL;
    var WEMUSICLIST_URL = '/mobile/WorldsEndMusic.html';
    var WEMUSICDETAIL_URL = WEMUSICLIST_URL;
    var PLAYLOGLIST_URL = '/mobile/Playlog.html';
    var PLAYLOGDETAIL_URL = PLAYLOGLIST_URL;
    var FRIENDSEARCH_URL = '/mobile/FriendSearch.html';
    
    var MUSICLIST_EXPERT_PARAM = {music_genre:'music_genre',genre:'99',level:'expert'};
    var MUSICDETAIL_PARAM = id=>Object({music_detail:'music_detail',musicId:id});
    var PLAYLOGDETAIL_PARAM = idx=>Object({pageMove:'pageMove',nextPage:'PlaylogDetail',args:idx});
    
    /**
     * @param {String} html
     * @return {Object} 
     */
    var scrape_userInfo = html=>{
        var $html = $(html);
        var $player = $html.find('.box_player > form');
        var rateStr = $player.find('.player_rating').text().split('/');
        var vegasStr = $player.find('.user_data_playpoint').text().split('（');
    
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
    var scrape_friendSearch = html=>{
        var $html = $(html);
        var d = $html.find('.box02 > .text_c').text();
        //フレンドコード以外は･･･まっええやろ
        return {friendCode:d.split('：')[1].trim()};
    };
    
    /**
     * @param {String} html
     * @return {Object} 
     */
    var scrape_musicList = html=>{
        return $(html).find('#music_detail > DIV > DIV.box05').toArray().reduce((arr,v)=>{
            var $genreList = $(v);
            var genreId = p.parseInt(p.getKey(genreList,$genreList.find('.genre').text()));
    
            return $genreList.find('.musiclist_box').toArray().reduce((_arr,_v)=>{
                var $el = $(_v);
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
    var scrape_WEMusicList = html=>{
        var $weList = $(html).find('#music_detail > .musiclist_box > .musiclist_worldsend_title_block');
        return $weList.toArray().map(v=>{
            var $we = $(v);
            var title = $we.find('.musiclist_worldsend_title').get(0);
            return {
                id:p.parseInt(title.onclick),
                title:$(title).text(),
                icon:p.parseInt($we.find('.musiclist_worldsend_icon > img').get(0).src),
                star:p.parseInt($we.find('.musiclist_worldsend_star > img').get(0).src),
            };
        });
    };
    
    var scrape_playLogList = html=>{
        var $html = $(html);
        return $html.find('.box01 > .mt_10 > FORM > .frame02').toArray().map(v=>{
            var $frame02 = $(v);
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
    var scrape_musicDetail = (html,musicId,genreId)=>{
        var $html = $(html);
        var $jacket = $($html.find('.frame02').get(0));
    
        var musicDetail = {
            dif:{},
            id:musicId,
            genre:genreId,
            title:$jacket.find('.play_musicdata_title').text(),
            artist:$jacket.find('.play_musicdata_artist').text(),
            imgURL:$jacket.find('.play_jacket_img > IMG').get(0).src
        };
    
        return $html.find('.music_box').toArray().reduce((detail,v)=>{
            var $dif = $(v);
            var $box02 = $dif.find('.box02 > *');
            var difId = p.parseDifIdByImg($dif.find('.musicdata_detail_difficulty > IMG').get(0));
    
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
    var scrape_WEMusicDetail = (html,id)=>{
        var $html = $(html);
        var $frame02 = $html.find('#music_detail > .frame02');
    
        var musicDetail = {
            id:id,
            dif:{},
            imgURL:$frame02.find('.play_jacket_img > IMG').get(0).src,
            icon:p.parseInt($frame02.find('.musicdetail_worldsend_icon > img').get(0).src),
            star:p.parseInt($frame02.find('.musiclist_worldsend_star2 > img').get(0).src),
            title:$frame02.find('.play_musicdata_worldsend_title').text().trim(),
            artist:$frame02.find('.play_musicdata_artist').text().trim()
        };;
    
        var $music_box = $html.find('#music_detail > DIV > .music_box');
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
        var $html = $(html);
    
        //DIV.frame01 > DIV.frame01_inside > FROM > DIV.bix01 > DIV.frame02 > DIV.play_jacket_side > DIV.jacket_area > DIV.play_data_task > IMG (src)
    };
    //----------------------------//
    
    //全読込
    var fullRead = (ajax,view,d)=>{
        ajax.clear();
        d.musicList.forEach(v=>{
            ajax.add(MUSICDETAIL_URL,MUSICDETAIL_PARAM(v.id),(html)=>{
                view.info('['+('00'+v.id).slice(-3)+'] '+v.title);
                return scrape_musicDetail(html,v.id,v.genre);
            });
        });
        ajax.send(v=>d.musicDetailList=v)
        .then(()=>{
            ajax.clear();
            d.WEMusicList.forEach(v=>{
                ajax.add(WEMUSICDETAIL_URL,MUSICDETAIL_PARAM(v.id),(html)=>{
                    view.info('['+v.id+'] '+v.title);
                    return scrape_WEMusicDetail(html,v.id);
                });
            });
            return ajax.send(v=>d.WEMusicDetailList=v);
        }).then(()=>{
            d.opt.date = Date.now();
            p.setCash(d.friendSearch.friendCode,d);
            export_window(d);
        });
    };
    
    //差分読込
    var differencialRead = (ajax,view,d)=>{
        ajax.clear();
        console.log('さぶん',d);
    
        var newPlaylog = d.playLogList.filter(
            v=>((new Date(v.date)).getTime() > d.opt.date)
        );
    
        if(newPlaylog.length == 0) view.info('前回読込時から未プレイ');
    
        var newPlaylog_WE = newPlaylog.filter(v=>v.dif == 4);
        var newPlaylog_NM = newPlaylog.filter(v=>v.dif != 4);
        
        console.log(newPlaylog);
    };
    
    var export_window = v=>{
        console.log(v);
    
        var t = window.open('about:blank');
        t.document.body.innerHTML = [
            '<pre><code>',
                JSON.stringify(v,null,'    '),
            '</code></pre>'
        ].join('\n');
    };
    
    //----------------------------//
    var data = {
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
    
    var ajax = new ajaxChainClass();
    var view = new viewClass();
    view.clear();
    
    ajax.add(USERINFO_URL,null,scrape_userInfo)
    .add(FRIENDSEARCH_URL,null,scrape_friendSearch)
    .add(PLAYLOGLIST_URL,null,scrape_playLogList)
    .add(MUSICLIST_URL,MUSICLIST_EXPERT_PARAM,scrape_musicList)
    .add(WEMUSICLIST_URL,null,scrape_WEMusicList)
    .send(([userInfo,friendSearch,playLogList,musicList,WEMusicList])=>{
        view.info('ユーザー名：' + userInfo.name);
        view.info('フレンドコード：' + friendSearch.friendCode);
        view.info('通常曲数：' + musicList.length + '曲');
        view.info('WE曲数：' + WEMusicList.length + '曲')
        var lastLogDate = playLogList[0].date;
        var fastLogDate = playLogList[playLogList.length - 1].date;
        view.info('プレイ履歴：' + fastLogDate.slice(5) + ' ～ ' + lastLogDate.slice(5));
    
        var cash = p.getCash(friendSearch.friendCode);
        var allReadMode = true; 
        if(p.isNull(cash)){
            view.info('キャッシュ：なし');
        }else{
            /** @type {Date} */
            var cashDate = new Date(cash.opt.date);
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
    
        view.info((allReadMode?'全読込':'差分読込')+'モード');
        
        var d = {
            userInfo:userInfo,
            friendSearch:friendSearch,
            playLogList:playLogList,
            musicList:musicList,
            WEMusicList:WEMusicList,
        };
    
        if(allReadMode){
            d.opt = {date:null,var:1}
            fullRead(ajax,view,d);
        }else{
            differencialRead(ajax,view,Object.assign(cash,d));
        }
    });
    return '@_panda';
    })(POST_URL);