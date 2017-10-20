_EXPORT = (d,{m,p})=>{
    const shortGenreName = {
        99:'ALL',
        0:'ポプアニ',
        2:'niconico',
        3:'東方',
        6:'VARIETY',
        1:'GAME',
        7:'イロドリ',
        8:'言ノ葉',
        5:'ORIGINAL',
    };

    const viewClass = class {
        constructor(){
            this.$frame01 = $('.frame01');
            this.$select = null;
            this.$content = null;

            this.TAG = {
                DIV:'<DIV />',
                SELECT:'<SELECT />',
            }
        }
        $appendNest(...args){
            return args.reduceRight((r,val)=>val.append(r));
        }
        clear(){
            const $select = this.$select = $(this.TAG.SELECT,{class:'narrow01 w420'});
            const $content = this.$content = $(this.TAG.DIV);
            const $frame01_inside = $(this.TAG.DIV,{class:'frame01_inside w450'});

            Object.keys(m.difList).forEach(idx=>{
                if(idx==4) return;
                $select.append(
                    $(`<OPTION value="${idx}">${m.difList[idx]}</OPTION>`,
                    {class:'narrow01 w420 option'})
                );
            });
            
            this.$appendNest(
                this.$frame01.empty(),
                $frame01_inside,
                $(this.TAG.DIV,{class:'mt_20 mb_20'}),
                $select
            );
            $frame01_inside.append($content);

            $select.change(e=>this.changeDifView(this.$select.val()));
        }
        changeDif(dif){
            this.$select.val(String(dif));
            this.changeDifView(dif);
        }
        changeDifView(dif){
            this.$content.empty();

            const $avgInfo = $(this.TAG.DIV/*,{class:'block_information'}*/);
            $(this.TAG.DIV,{class:'box01 w420'})
              .append($(this.TAG.DIV,{class:'box01_title text_b',text:'平均'}))
              .append($avgInfo)
              .appendTo(this.$content);
            
              this.setScoreAvgChart(dif,$avgInfo.get(0));
            
            /*
            DIV.block_information
                DIV.block_information_date
                    SPAN.block_information_icon > IMG
                DIV.block_information_title > A
            */
        }
        aggregate(){
            const difIdArr = [0,1,2,3];
            const aggData = {
                all:{},
                genre:{},
                dif:{},
            };

            
            Object.keys(m.difList).forEach(difId=>{
                const genre = {};
                aggData.dif[difId] = {genre:genre}
                m.genreIdSort.forEach(genreId=>{
                    genre[genreId]={musicCount:0,score:0,nonPlay:0,playCountArr:[]};
                });
            });

            d.musicDetailList.forEach(musicDetail=>{
                const genreId = musicDetail.genre;
                difIdArr.forEach(difId=>{
                    const musicDetailDif = musicDetail.dif[difId];
                    const aggDataDifGenre = aggData.dif[difId][genreId];
                    aggDataDifGenre.musicCount++;

                    if(p.isNull(musicDetailDif)){
                        aggDataDifGenre.nonPlay++;
                    }else{
                        aggDataDifGenre.score += musicDetailDif.score;
                        aggDataDifGenre.playCountArr.push(musicDetailDif.playCount);
                    }
                });
            });

            d.WEMusicDetailList.forEach(musicDetail=>{
                
            });
        }
        setScoreAvgChart(dif,el){
            const genreCount = {99:0};
            const genreScore = {99:0};
            const genreNonplay = {99:0};
            d.musicDetailList.forEach(musicDetail=>{
                const genreId = musicDetail.genre;
                if(p.isNull(genreCount[genreId])){
                    genreCount[genreId] = 0;
                    genreScore[genreId] = 0;
                    genreNonplay[genreId] = 0;
                }

                genreCount[genreId]++;
                genreCount[99]++;
                if(p.isNull(musicDetail.dif[dif])){
                    genreNonplay[genreId]++;
                    genreNonplay[99]++;
                }else{
                    genreScore[genreId] += musicDetail.dif[dif].score;
                    genreScore[99] += musicDetail.dif[dif].score;
                }
            });

            const dataArray = m.genreIdSort.reduce((dataArray,genreId)=>{
                if(p.isNull(genreCount[genreId])) return dataArray;
                const score = genreScore[genreId];
                dataArray.push([
                    shortGenreName[genreId],
                    Math.floor(score/genreCount[genreId]),
                    Math.floor(score/(genreCount[genreId] - genreNonplay[genreId])),
                ]);
                return dataArray;
            },[["Genre", "全平均","プレイ済平均" ]]);

            const data = google.visualization.arrayToDataTable(dataArray);
            const view = new google.visualization.DataView(data);
            view.setColumns([
                0,
                1,
                {calc:"stringify",sourceColumn:1,type:"string",role:"annotation"},
                2,
                {calc:"stringify",sourceColumn:2,type:"string",role:"annotation"},
            ]);

            const options = {
                title: 'スコア平均',
                width:'100%',
                height:500,
                hAxis: {
                    format: 'decimal',
                    minValue: 0,
                    maxValue: 1010000,
                    ticks:[0,1010000],
                    baselineColor: 'none',
                },
                vAxis:{
                    textPosition: 'out',
                },
                legend:{
                    position: 'top',
                    alignment:'center',
                },
                annotations:{
                    //style:'line',
                }
            };
            var chart = new google.visualization.BarChart(el);
            chart.draw(view, options);
        }
    }

    $.getScript('//www.gstatic.com/charts/loader.js')
    .then(()=>{
        google.charts.load('current', {'packages':['corechart']});
        google.charts.setOnLoadCallback(()=>{
            const view = new viewClass();
            view.clear();
            view.changeDif(m.difIdList.expart);
        });
    });
};