_EXPORT = (d,{m,p})=>{
    console.log(this);
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

    const shortDifName = {
        0:'BAS',
        1:'ADV',
        2:'EXP',
        3:'MAS',
        4:'WE',
    }

    const TAG = {
        DIV:'<DIV />',
        SELECT:'<SELECT />',
    }

    const chartClass = class {
        constructor(d){
            this.aggData = this.aggregate(d);

        }
        aggregate(d){
            const getInitData = ()=>{
                return {
                    musicCount:0,
                    score:0,
                    nonPlay:0,
                    playCount:0,
                    playCountArr:[],
                    lastPlayDateArr:[],
                    rankArr:[],
                    fcajArr:[],
                    clearArr:[],
                    chainArr:[],
                };
            };
            const difIdArr = [0,1,2,3];
            const aggData = {
                all:{},
                genre:{},
                dif:{},
            };

            
            difIdArr.forEach(difId=>{
                const genre = {};
                aggData.dif[difId] = {genre:genre}
                m.genreIdSort.forEach(genreId=>{
                    genre[genreId] = getInitData();
                });
            });

            //-----------------------------------------------------------------------------
            d.musicDetailList.forEach(musicDetail=>{
                const genreId = musicDetail.genre;
                difIdArr.forEach(difId=>{
                    const musicDetailDif = musicDetail.dif[difId];
                    const aggDataDifGenre = aggData.dif[difId].genre[genreId];
                    aggDataDifGenre.musicCount++;

                    if(p.isNull(musicDetailDif)){
                        aggDataDifGenre.nonPlay++;
                    }else{
                        aggDataDifGenre.score += musicDetailDif.score;

                        aggDataDifGenre.playCount += musicDetailDif.playCount;
                        aggDataDifGenre.playCountArr.push(musicDetailDif.playCount);

                        const [lastPlayDate,] = musicDetailDif.date.split(' ');
                        aggDataDifGenre.lastPlayDateArr.push(lastPlayDate);

                        aggDataDifGenre.rankArr.push(musicDetailDif.rank);
                        aggDataDifGenre.fcajArr.push(musicDetailDif.fcaj);
                        aggDataDifGenre.clearArr.push(musicDetailDif.clear);
                        aggDataDifGenre.chainArr.push(musicDetailDif.chain);
                    }
                });
            });

            const WeDifId = 4;
            const aggDataWE = d.WEMusicDetailList.reduce((r,musicDetail)=>{
                const musicDetailDif = musicDetail.dif[WeDifId];
                r.musicCount++;
                if(p.isNull(musicDetailDif)){
                    r.nonPlay++;
                }else{
                    r.score += musicDetailDif.score;

                    r.playCount += musicDetailDif.playCount;
                    r.playCountArr.push(musicDetailDif.playCount);

                    const [lastPlayDate,] = musicDetailDif.date.split(' ');
                    r.lastPlayDateArr.push(lastPlayDate);

                    r.rankArr.push(musicDetailDif.rank);
                    r.fcajArr.push(musicDetailDif.fcaj);
                    r.clearArr.push(musicDetailDif.clear);
                    r.chainArr.push(musicDetailDif.chain);
                }
                return r;
            },getInitData());
            aggData.dif[WeDifId] = {genre:{99:aggDataWE}};
            
            //------------------------------------------------------------------------------
            difIdArr.forEach(difId=>{
                const aggDataDif = aggData.dif[difId];
                const allGenre = m.genreIdSort.reduce((r,genreId)=>{
                    const aggDataDifGenre = aggDataDif.genre[genreId];
                    r.musicCount += aggDataDifGenre.musicCount;
                    r.nonPlay += aggDataDifGenre.nonPlay;

                    r.score += aggDataDifGenre.score;

                    r.playCount += aggDataDifGenre.playCount;
                    r.playCountArr = [...r.playCountArr,...aggDataDifGenre.playCountArr];

                    r.lastPlayDateArr = [...r.lastPlayDateArr,...aggDataDifGenre.lastPlayDateArr];

                    r.rankArr = [...r.rankArr,...aggDataDifGenre.rankArr];
                    r.fcajArr = [...r.fcajArr,...aggDataDifGenre.fcajArr];
                    r.clearArr = [...r.clearArr,...aggDataDifGenre.clearArr];
                    r.chainArr = [...r.chainArr,...aggDataDifGenre.chainArr];

                    aggDataDifGenre.lastPlayDateCount = p.countBy(aggDataDifGenre.lastPlayDateArr);

                    aggDataDifGenre.rankCount = p.countBy(aggDataDifGenre.rankArr);
                    aggDataDifGenre.fcajCount = p.countBy(aggDataDifGenre.fcajArr);
                    aggDataDifGenre.clearCount = p.countBy(aggDataDifGenre.clearArr);
                    aggDataDifGenre.chainCount = p.countBy(aggDataDifGenre.chainArr);

                    return r;
                },getInitData());
                aggDataDif.genre[99] = allGenre;
            },);

            //----------------------------------------------------------------
            const aggALL = [0,1,2,3,4].reduce((r,difId)=>{
                const aggDataDifAllGenre = aggData.dif[difId].genre[99];
                r.lastPlayDateArr = [...r.lastPlayDateArr,...aggDataDifAllGenre.lastPlayDateArr];

                aggDataDifAllGenre.lastPlayDateCount = p.countBy(aggDataDifAllGenre.lastPlayDateArr);

                aggDataDifAllGenre.rankCount = p.countBy(aggDataDifAllGenre.rankArr);
                aggDataDifAllGenre.fcajCount = p.countBy(aggDataDifAllGenre.fcajArr);
                aggDataDifAllGenre.clearCount = p.countBy(aggDataDifAllGenre.clearArr);
                aggDataDifAllGenre.chainCount = p.countBy(aggDataDifAllGenre.chainArr);
                return r;
            },{lastPlayDateArr:[]});
            aggALL.lastPlayDateCount = p.countBy(aggALL.lastPlayDateArr);
            aggData.all = aggALL;

            console.log(aggData);
            return aggData;
        }
        _getLastPlayData(){
            return Object.keys(this.aggData.all.lastPlayDateCount).reduce((r,k)=>{
                r.push([new Date(k),this.aggData.all.lastPlayDateCount[k]]);
                return r;
            },[]);
        }
        setLastPlayCalendar(el){
            var dataTable = new google.visualization.DataTable();
            dataTable.addColumn({ type: 'date', id: 'Date' });
            dataTable.addColumn({ type: 'number', id: 'playCount' });
            dataTable.addRows(this._getLastPlayData());

            var chart = new google.visualization.Calendar(el);
            var options = {
                title: '最終プレイ日',
                height: 230,
                calendar:{
                    cellSize:7,
                    yearLabel:{color:'black'},
                    dayOfWeekLabel:{color:'black'},
                    monthLabel:{color:'black'},
                },
                noDataPattern:{
                    backgroundColor:'#F2F2B0',
                    color:'#F8E58C'
                  }
         
            };
            chart.draw(dataTable,options);
        }
        _getDifPlayData(){
            return Object.keys(this.aggData.dif).reduce((r,difId)=>{
                r.push([shortDifName[difId],this.aggData.dif[difId].genre[99].playCount]);
                return r;
            },[]);
        }
        setDifPlayRatio(el){
            const data = google.visualization.arrayToDataTable(
                [['難易度','プレイ回数'],...this._getDifPlayData()]
            );
            const options = {
                title: '難易度別プレイ率',
                width:'100%',
                height:400,
                slices:{
                    0:{color:'#02d507'},
                    1:{color:'#ff8c00'},
                    2:{color:'#ff005a'},
                    3:{color:'#aa5fff'},
                    4:{color:'black'},
                },
                sliceVisibilityThreshold:0,
                legend:{
                    position: 'top',
                    alignment:'center',
                }
            };
            var chart = new google.visualization.PieChart(el);
            chart.draw(data,options);
        }
        _getScoreAvgData(dif){
            return m.genreIdSort.reduce((dataArray,genreId)=>{
                const genreObj = this.aggData.dif[dif].genre[genreId];
                if(genreObj.musicCount == 0) return dataArray;
                dataArray.push([
                    shortGenreName[genreId],
                    Math.floor(genreObj.score/genreObj.musicCount),
                    Math.floor(genreObj.score/(genreObj.musicCount - genreObj.nonPlay)),
                ]);
                return dataArray;
            },[]);
        }
        setScoreAvg(dif,el){
            const data = google.visualization.arrayToDataTable(
                [["Genre","全平均","プレイ済平均"],...this._getScoreAvgData(dif)]
            );
            const view = new google.visualization.DataView(data);
            view.setColumns([
                0,
                1,
                {calc:"stringify",sourceColumn:1,type:"string",role:"annotation"},
                2,
                {calc:"stringify",sourceColumn:2,type:"string",role:"annotation"},
            ]);

            const options = {
                title:`スコア平均(${shortDifName[dif]})`,
                width:'100%',
                height:500,
                hAxis:{
                    format: 'decimal',
                    minValue: 0,
                    maxValue: 1010000,
                    ticks:[0,1010000],
                    baselineColor:'none',
                },
                vAxis:{textPosition:'out'},
                legend:{
                    position:'top',
                }
            };
            var chart = new google.visualization.BarChart(el);
            chart.draw(view, options);
        }
        _getPercentBarData(dif,targetName,targetIdArr){
            return m.genreIdSort.reduce((r,genreId)=>{
                const aggGenre = this.aggData.dif[dif].genre[genreId];
                
                const row = targetIdArr.reduce((r,chainId)=>{
                    r.push(p.isNull(aggGenre[targetName][chainId])?0:aggGenre[targetName][chainId]);
                    return r;
                },[]);
                r.push([shortGenreName[genreId],...row,aggGenre.nonPlay]);
                return r;
            },[]);
        }
        _setPercentBar(dif,el,title,data){
            const dataTable = google.visualization.arrayToDataTable(data);
        
            const options = {
                  title:`${title}(${shortDifName[dif]})`,
                width:'100%',
                height:400,
                legend:{position:'top',maxLines:3},
                bar: { groupWidth:'75%'},
                isStacked:'percent',
              };
              var chart = new google.visualization.BarChart(el);
              chart.draw(dataTable, options);
        }
        setClearRatio(dif,el){
            this._setPercentBar(
                dif,el,
                'クリア率',
                [
                    ['ジャンル','クリア','未クリア','未プレイ'],
                    ...this._getPercentBarData(dif,'clearCount',['true','false'])
                ]
            );
        }
        setFcajRatio(dif,el){
            this._setPercentBar(
                dif,el,
                'FC･AJ率',
                [
                    ['ジャンル','AJ','FC','未FC','未プレイ'],
                    ...this._getPercentBarData(dif,'fcajCount',[2,1,0])
                ]
            );
        }
        setRankRatio(dif,el){
            this._setPercentBar(
                dif,el,
                'ランク率',
                [
                    ['ジャンル',...Object.values(m.rankList).reverse(),'未プレイ'],
                    ...this._getPercentBarData(dif,'rankCount',Object.keys(m.rankList).reverse())
                ]
            );
        }
        setChainRatio(dif,el){
            this._setPercentBar(
                dif,el,
                'フルチェ率',
                [
                    ['ジャンル','Chain','Chain2','未Chain','未プレイ'],
                    ...this._getPercentBarData(dif,'chainCount',[2,1,0])
                ]
            );
        }
        setDifChart(dif,el){
            const $el = $(el);
            const $scoreAvg = $(TAG.DIV);
            const $clearRatio = $(TAG.DIV);
            const $fcajRatio = $(TAG.DIV);
            const $rankRatio = $(TAG.DIV);
            const $chainRatio = $(TAG.DIV);

            $el.append(
                $scoreAvg,
                $clearRatio,
                $fcajRatio,
                $rankRatio,
                $chainRatio,
            );
            this.setScoreAvg(dif,$scoreAvg.get(0));
            this.setClearRatio(dif,$clearRatio.get(0));
            this.setFcajRatio(dif,$fcajRatio.get(0));
            this.setRankRatio(dif,$rankRatio.get(0));
            this.setChainRatio(dif,$chainRatio.get(0));
        }
    };

    const viewClass = class {
        constructor(){
            this.chart = new chartClass(d);
            this.$frame01 = $('.frame01');
            this.$select = null;
            this.$content = null;
        }
        $appendNest(...args){
            return args.reduceRight((r,val)=>val.append(r));
        }
        clear(){
            //this.aggData = this.aggregate();
            const $select = this.$select = $(TAG.SELECT,{class:'narrow01 w420'});
            const $frame01_inside = $(TAG.DIV,{class:'frame01_inside w450'});

            Object.keys(m.difList).forEach(idx=>{
                if(idx==4) return;
                $select.append(
                    $(`<OPTION value="${idx}">${m.difList[idx].toUpperCase()}</OPTION>`,
                    {class:'narrow01 w420 option'})
                );
            });
            
            const $df = $(new DocumentFragment());
            const $content = this.$content = $(TAG.DIV);
            const $contentAllDif = $(TAG.DIV);
            $df.append(
                $contentAllDif,
                $('HR',{class:"line_dot_black w420"}),
                $(TAG.DIV,{class:'mt_20 mb_20'}).append($select),
                $content
            )
            
            this.$appendNest(
                this.$frame01.empty(),
                $frame01_inside,
                $df
            );

            $select.change(e=>this.changeDifView(this.$select.val()));

            this.setAllDifChart($contentAllDif);
        }
        setAllDifChart($el){
            const $playRaito = $(TAG.DIV);
            $el.append($playRaito);
            this.chart.setDifPlayRatio($playRaito.get(0));

            const $lastPlayCalendar = $(TAG.DIV,{style:"background-color:white;"});
            $el.append($lastPlayCalendar);
            this.chart.setLastPlayCalendar($lastPlayCalendar.get(0));
        }
        changeDif(dif){
            this.$select.val(String(dif));
            this.changeDifView(dif);
        }
        changeDifView(dif){
            this.$content.empty();

            const $avgInfo = $(TAG.DIV/*,{class:'block_information'}*/);
            
            $(TAG.DIV,{class:'box01 w420'})
              .append($(TAG.DIV,{class:'box01_title text_b',text:m.difList[dif].toUpperCase()}))
              .append($avgInfo)
              .appendTo(this.$content);
            
              this.chart.setDifChart(dif,$avgInfo.get(0));

            /*
            DIV.block_information
                DIV.block_information_date
                    SPAN.block_information_icon > IMG
                DIV.block_information_title > A
            */
        }
    }

    $.getScript('//www.gstatic.com/charts/loader.js')
    .then(()=>{
        google.charts.load('current', {'packages':['corechart','calendar']});
        google.charts.setOnLoadCallback(()=>{
            const view = new viewClass();
            view.clear();
            view.changeDif(m.difIdList.expart);
        });
    });
};