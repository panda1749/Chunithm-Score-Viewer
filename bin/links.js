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
 *  title:string,
 *  type:string,
 *  data:string|function(?),
 *  }}
 */
var ITEMDATA;

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

/**
 * @param {Array.<string>|string|null=} className
 * @param {string|null=} id
 * @param {string|number|Element|JDATA|null=} content
 * @return {JDATA}
 */
var $divCreate = $tagCreate.bind(this,'div');

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
    block_information:'block_information',
    block_information_title:'block_information_title',
    block_information_date:'block_information_date',
    block_information_icon:'block_information_icon',
    block_information_title:'block_information_title',
};

/** 画面クリア
 * @return {JDATA}
 */
var clr = function(){
	var $frame = $('.' + classList.frame01_inside)['empty']();
	return $append($frame,
        $tagCreate('h2',null,'page_title','link'),
        $tagCreate('hr',[classList.line_dot_black,classList.w420])
    );
};

/**
 * @param {Array.<ITEMDATA>} links
 */
var linkList = function(links){
    var clickEvent = function(e){
        console.log(e,links[$(e.target)['attr']('data-idx')]);
        /** @type {ITEMDATA} */
        var item = links[$(e.target)['attr']('data-idx')];

        if($['type'](item.data) === 'function'){
            item.data();
        }
    };

    var $frame = clr();
    var webMessage_result = $divCreate(null,'webMessage_result');
    var box01 = $divCreate([classList.box01,classList.w420]);
    $append(webMessage_result,box01);
    $append($frame,webMessage_result);


    links.forEach(function(val,idx,arr){
        var block_information = $divCreate(classList.block_information);

        var block_information_date = $divCreate(classList.block_information_date);
        var NewsDate = $tagCreate('span',null,'NewsDate');
        var NewsIcon = $tagCreate('span',classList.block_information_icon,'NewsIcon',
            $tagCreate('img')['attr']('src','common/images/icon_new.png'));
        $append(block_information_date,NewsDate/*,NewsIcon*/);

        var NewsTitle = $divCreate(classList.block_information_title,'NewsTitle');
        var title = $tagCreate('a',null,null,val.title)
            ['attr']({
                'href':'JavaScript:void(0);',
                'data-idx':idx,
            })
            ['click'](clickEvent);
        $append(NewsTitle,title);

        $append(block_information,block_information_date,NewsTitle);
        $append(box01,block_information);

    });
}

linkList([
    {
        title:'CHUNITHM Rate Calculator',
        data:function(e){
           var html = $tagCreate('form',null,'postjump')['attr']({'method':'post','action':'//chunical.net/chunithm.php','target':'_brunk'}).css({'display':'none'});
           var input = $tagCreate('input')['attr']({'type':'hidden','name':'userid','value':document.cookie});
           $append(html,input);
           $append($('body'),html);
           $('#postjump').submit();
           $('#postjump').remove();
        }
    },
    {
        title:'friendVS',
        data:include.bind(0,'//goo.gl/OiI2xS')
    }
]);
})($);
