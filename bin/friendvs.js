(function(){

// 全角→半角に変換する
function toHalfWidth(strVal){
  // 半角変換
  var halfVal = strVal.replace(/[！-～]/g,
    function( tmpStr ) {
      // 文字コードをシフト
      return String.fromCharCode( tmpStr.charCodeAt(0) - 0xFEE0 );
    }
  );
 
  // 文字コードシフトで対応できない文字の変換
  return halfVal.replace(/”/g, "\"")
    .replace(/’/g, "'")
    .replace(/‘/g, "`")
    .replace(/￥/g, "\\")
    .replace(/　/g, " ")
    .replace(/〜/g, "~");
}

var clr = function(){
	var frame = $('.frame01_inside');//.css("word-break","keep-all");
	return frame.empty()
	.append('<h2 id="page_title">フレンドVS</h2>')
	.append('<hr class="line_dot_black w420" />')
	.append('<div class="box02 w420 mb_20" />');
};

var send = function(apiName,param,func,thisObj){
	param = param||{};
	func = func||function(){};
	thisObj = thisObj||this;
	func = func.bind(thisObj);
	
	param.userId = parseInt(getCookie()["userId"]);
	$.ajax({
		type: "post",
		url: REQUEST_URL + apiName,
		data: JSON.stringify(param),
		dataType: "json",
		scriptCharset: "UTF-8",
		success: func
	});
};

var friendList = function(){
	var box02 = $(".box02:first");
	var form = $('<form onsubmit="return false"></form>');
	
	var readbtnFunc = function(e){
		var sort = $(e.target).attr("data-sorttype");
		var friendCode = [];
		form.find(":checkbox").each(function(){
			//this:checkbox
			if(this.checked){
				friendCode.push(this.name);
			}
		});
		load(sort,friendCode);
	};
	var btn = $('<input type="button" value="読込" onclick="" data-sorttype="1" />')
	.click(readbtnFunc);
	
	box02.append(form)
	.append(btn);
	
	var UserFriendNameApiFunc = function(data){
		//data:{userId:int, friendCode:int, friendName:String}
		//this:form
		this.append('<div><input type="checkbox" name="' + data.friendCode + '" />' + toHalfWidth(data.friendName) + '</div>');
	};
	
	var FriendlistApiFunc = function(data){
		//this:form
		var friends = data.userFriendlistList.filter(function(elem,index,array){
	        return elem.isFavorite === true;
		});
		
		friends = friends.map(function(elem){
			return elem.friendCode;
		}); 
		
		friends.forEach(function(friendCode){
			//this:form
			send("GetUserFriendNameApi",{friendCode:parseInt(friendCode)},UserFriendNameApiFunc,this);
			},this)
	}

	send("GetUserFriendlistApi",{state: 3},FriendlistApiFunc,form);
};

var load = function(sort,friendCodes){
	//sort:int , friendCodes:Array<int>
	if(friendCodes.length === 0) return void 0; 
	
	var getscore = function(){
		
	};
	
	var d = {
		sort:sort,
		friendLength:friendCodes.length,
		myData:{},
		friendsData:[]
	};
	
	send("GetUserMusicApi",{level:19902,isStatus:true},function(data){
		//Object.keys(data.musicNameMap).forEach(function(key){});
		//this:d
		this.musicNameMap = data.musicNameMap;
		this.genreMap = data.genreMap;
		
		this.myData = userMusicCnv(data);
	},d);
	
	friendCodes.forEach(function(friendCode){
		send("GetUserMusicApi",{level:19902,isStatus:true,friendCode:friendCode},function(data){
			//this:d
			this.friendsData.push(userMusicCnv(data));
			if(this.friendLength == this.friendsData.length){
				vs(this);
			}
		},d);
	},d);
	
	var userMusicCnv = function(data){
		var userMusic = [];
		data.userMusicList.forEach(function(music){
			this[music.musicId] = music;
		},userMusic);
		return {name:toHalfWidth(data.userName),music:userMusic};
	};
}

var vs = function(data){
	// 正規表現でセパレート
	var separate = function(num){
	    return String(num).replace( /(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
	};
	
	var getRsltBlock = function(left,center,right,leftType,centerType,rightType){
		var getInfoBlock = function(info,type){
			var infoblock = $('<div class="vs_list_infoblock" />');
			if(type == 0){
				infoblock.append('<div id="vsMyScore" class="play_musicdata_highscore">'+ info +'</div>');
			}else{
				infoblock.append(info);
			}
			return infoblock;
		};
		var resultblock = $('<div class="vs_list_result_block" />');
		
		if(left != null){
			resultblock.append(getInfoBlock(left,leftType));
		}
		
		if(center != null){
			var type = {0:'vs_list_count_blue',1:'vs_list_count_red',2:''};
			var ctr = $('<div class="vs_list_result"><div class="'+ type[centerType] +'">'+ center +'</div></div>');
			resultblock.append(ctr);
		}
		
		if(right != null){
			resultblock.append(getInfoBlock(right,rightType));
		}
		
		return resultblock;
	};
	
	/* */
	var frame = clr();
	var vsresult = $('<div id="userFriendGenreVs_result">');
	var box01 = $('<div class="box01 w420"><div id="DifficulityName" class="box01_title title_expart"><span>EXPERT</span></div></div>');
	
	frame.append(vsresult);
	vsresult.append(box01);
	
	var rslt = [];
	for(var i = 0; i <= data.friendLength; i++){
		rslt[i] = [];
	}
	
	for (var key in data.musicNameMap){
		var winCount = 0;
		var dom = $('<div id="FriendVS" class="w388 musiclist_expart">');
		dom.append('<div id="vsMusicTitle" class="block_underline text_b"><div>'+ data.musicNameMap[key] +'</div></div>');
		
		var val = data.myData.music[key];
		var resultblock = null;
		var myscore = 0;
		if(val != null){
			resultblock = getRsltBlock(' ',' ',separate(val.scoreMax),1,2,0);
			myscore = val.scoreMax;
		}else{
			resultblock = getRsltBlock(' ',' ',separate(0),1,2,0);
		}
		
		dom.append(resultblock);
		data.friendsData.forEach(function(friend){
			var val = friend.music[key];
			var resultblock = null;
			var friendscore = val == null?0:val.scoreMax;
			var sa = myscore - friendscore;
			if(sa >= 0) winCount++;
			resultblock = getRsltBlock(friend.name, (sa>=0?'+':'')+separate(sa),separate(friendscore),0,sa>=0?0:1,0);
			
			dom.append(resultblock);
		});
		
		rslt[winCount].push(dom);
	}
	
	for (var key in rslt){
		if(rslt[key].length == 0){
			continue;
		}
		var box05 = $('<div class="box05 w400"><div id="GenreName">'+ key +' WIN</div>');
		
		rslt[key].forEach(function(dom){
			box05.append(dom);
		});
		
		box01.append(box05);
	}
};

clr();
friendList();

})()