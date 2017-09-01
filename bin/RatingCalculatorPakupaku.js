(function(){
    var genreURL = '/mobile/MusicGenre.html';

    if(location.pathname != genreURL){
        history.pushState(null,'Rating Calculator(パクパク)',genreURL);
    }
    //master全ジャンル開いているかの確認面倒なので毎回読込む
    $.ajax({
        url:genreURL,
        method:'POST',
        data:{
            music_genre:'music_genre',
            genre:'99',//全ジャンル
            level:'master',
        },
    }).then(function(html){
        $('.frame01').replaceWith($(html).find('.frame01'));
        $.getScript('//mharuna.net/let.js');
    });
})()