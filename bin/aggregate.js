_EXPORT = (d,{m,p})=>{
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

            const $avgInfo = $(this.TAG.DIV,{class:'block_information'});
            $avgInfo.append($(this.TAG.DIV,{text:'平均 (未プレイ除外平均)'}));
            m.genreIdSort.forEach(genreId=>{
                if(p.isNull(genreCount[genreId])) return;
                const score = genreScore[genreId];
                $avgInfo.append($(this.TAG.DIV,{text:m.genreList[genreId]}));

                if(score === 0){
                    $avgInfo.append($(this.TAG.DIV,{text:`0 (0)`}));
                }else{
                    $avgInfo.append($(this.TAG.DIV,{
                        text:`  ${Math.floor(score/genreCount[genreId]).toLocaleString('ja')} (${Math.floor(score/(genreCount[genreId] - genreNonplay[genreId])).toLocaleString('ja')})`
                    }));
                }
                
            });

            const $box1 = $(this.TAG.DIV,{class:'box01 w420'})
              .append($(this.TAG.DIV,{class:'box01_title text_b',text:'平均'}))
              .append($avgInfo)
              .appendTo(this.$content);

            /*
            DIV.block_information
                DIV.block_information_date
                    SPAN.block_information_icon > IMG
                DIV.block_information_title > A
            */
        }
    }

    const view = new viewClass();
    view.clear();
    view.changeDif(m.difIdList.expart);
};
