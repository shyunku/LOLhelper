const key = "RGAPI-25304fcd-9e78-465d-b5de-b3cd94c57abc";
let championData = undefined;
let spellData = undefined;
let perkData = undefined;
let detailPerkData = undefined;
let itemImageData = undefined;

let championKeyDict = {};
let spellKeyDict = {};
let perkKeyDict = {};
let detailPerkKeyDict = {};
let latestDataDragonVer = "";

const maxHistoryItemCall = 9;

$(document).ready(function(){
    const puuid = "0Fpa02zuqg6zIg1Gi-RDSZlYWzgv3fx1uJOQr6045clKUS1jJYiydLc-AWxBnQW5TqSCYFVN1-iKTw";

    $.ajax({
        url: "http://ddragon.leagueoflegends.com/cdn/9.24.2/data/ko_KR/item.json",
        type: "GET",
        dataType: "json",
        success: function(res){
            itemImageData = res.data;
            $.ajax({
                url: "http://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/perks.json",
                type: "GET",
                dataType: "json",
                success: function(res){
                    for(let i=0;i<res.length;i++){
                        let val = res[i];
                        detailPerkKeyDict[val.id] = val;
                    }
                    $.ajax({
                        url: "http://ddragon.leagueoflegends.com/cdn/9.24.2/data/en_US/runesReforged.json",
                        type: "GET",
                        dataType: "json",
                        success: function(res){
                            for(let i=0;i<res.length;i++){
                                let val = res[i];
                                perkKeyDict[val.id] = val;
                            }
                            $.ajax({
                                url: "http://ddragon.leagueoflegends.com/cdn/9.24.2/data/en_US/summoner.json",
                                type: "GET",
                                dataType: "json",
                                success: function(res){
                                    spellData = res.data;
                                    for(let key in spellData){
                                        let value = spellData[key];
                                        spellKeyDict[value.key] = value.id;
                                    }
    $.ajax({
        url: "http://ddragon.leagueoflegends.com/cdn/9.24.2/data/ko_KR/champion.json",
        type: "GET",
        dataType: "json",
        success: function(res){
            championData = res.data;
            for(let key in championData){
                let value = championData[key];
                championKeyDict[value.key] = value.id;
            }
            $.ajax({
                url: "https://ddragon.leagueoflegends.com/api/versions.json",
                type: "GET",
                dataType: "json",
                success: function(res){
                    latestDataDragonVer = res[0];
                    console.log("DataDragon lastest version : "+latestDataDragonVer);
                    getSummonerInfo("puuid", puuid);
                },
            });
        }
    });
                                }
                            });
                        }
                    });
                }
            });
        }
    });

    

    const searcherInput = $('#search_summoner_input');
    $('#search_summoner_btn').on("click", function(){
        getSummonerInfo("name", searcherInput.val());
    });

    searcherInput.on("keydown", function(e){
        if(e.key == "Enter") getSummonerInfo("name", searcherInput.val());
    });
});

function getSummonerInfo(method, data){
    let AfterURL = "https://kr.api.riotgames.com/lol/summoner/v4/summoners/";
    switch(method){
        case "name":
            AfterURL += "by-name/"+data;
            break;
        case "puuid":
            AfterURL += "by-puuid/"+data;
            break;
        default:
            return;
    }

    $.ajax({
        url: AfterURL,
        type: "GET",
        dataType: "json",
        data: {
            "api_key": key,
        },
        success: function(res){
            // console.log("Success to get Summoner's Data");
            loadSummonerGeneralInfo(res);
            getSummonerLeagueInfoBySummonerID(res.id)
            getSummonerRecentGameHistoryBySummonerAccountID(res);
            getCurrentMatchBySummonerID(res.id);
            console.log(res);
        },
        error: function(req, stat, err){
            console.log(err);
            if(err == "Not Found") alert("존재하지 않는 소환사");
            else if(err == "Forbidden") alert("API_KEY 만료됨");
        },
    });
}

function getSummonerRecentGameHistoryBySummonerAccountID(userInfo){
    $.ajax({
        url: "https://kr.api.riotgames.com/lol/match/v4/matchlists/by-account/"+userInfo.accountId,
        type: "GET",
        dataType: "json",
        data: {
            "api_key": key,
            "beginIndex": 0,
            "endIndex": maxHistoryItemCall,
        },
        success: function(res){
            // console.log("Success to get Summoner's Match Data List");
            loadSummonerMatchHistory(userInfo, res);
        },
        error: function(req, stat, err){
            console.log(err);
        },
    });
}

function getSummonerLeagueInfoBySummonerID(id){
    $.ajax({
        url: "https://kr.api.riotgames.com/lol/league/v4/entries/by-summoner/"+id,
        type: "GET",
        dataType: "json",
        data: {
            "api_key": key,
        },
        success: function(res){
            // console.log("Success to get Summoner's League Data");
            loadSummonerLeagueInfo(res);
        },
        error: function(req, stat, err){
            console.log(err);
            if(err == "Service Unavailable") alert('현재 API 서버 사용 불가능함');
        },
    });
}

function getCurrentMatchBySummonerID(id){
    $.ajax({
        url: "https://kr.api.riotgames.com/lol/spectator/v4/active-games/by-summoner/"+id,
        type: "GET",
        dataType: "json",
        data: {
            "api_key": key,
        },
        success: function(res){
            console.log(res);
            $('#current_game_info_tab').css("box-shadow", "0 0 8px rgb(9, 255, 9)");
        },
        error: function(req, stat, err){
            console.log(err);
        },
    });
}

function loadSummonerMatchHistory(userInfo, info){
    let matchList = info.matches;
    const gameHistoryListContainer = $('#game_history_list_container');
    const gameHistoryItemBundle = $('.game-history-item');

    //Point
    gameHistoryItemBundle.remove();

    let nativeHistoryItemBundle = [];
    let loadHistoryItemCallback = [];
    let participantInfoBundle = [];
    nativeHistoryItemBundle.length = matchList.length;
    participantInfoBundle.length = matchList.length;

    
    for(let i=0;i<matchList.length;i++){
        let matchItemInfo = matchList[i];
        let request = $.ajax({
            url: "https://kr.api.riotgames.com/lol/match/v4/matches/"+matchItemInfo.gameId,
            type: "GET",
            dataType: "json",
            data: {
                "api_key": key,
            },
            success: function(res){
                let userIndex = getUserIndexFromMatchInfo(userInfo, res.participantIdentities);
                if(userIndex === -1){
                    alert("citical Error!");
                    return;
                }
                const curUserInfo = res.participants[userIndex];
                let isWin = curUserInfo.stats.win;
                let isWinLabel = isWin?"승리":"패배";
                let isWinType = isWin?"win":"lose";
                let MapType = "";
                let MapLabel = "";
                let curChampionInfo = getChampionInfoFromKey(curUserInfo.championId);
                let KDA = (curUserInfo.stats.kills + curUserInfo.stats.assists)/curUserInfo.stats.deaths;
                let curUserStat = curUserInfo.stats;
                // console.log(curUserStat);
                // console.log(matchItemInfo);
                // console.log("Queue ID: "+res.queueId);
                switch(res.queueId){
                    case 450:
                        MapType = "howling-abyss";
                        MapLabel = "무작위 총력전";
                        break;
                    case 420:
                        MapLabel = "솔로 랭크";
                        MapType = "summoners-rift";
                        break;
                    case 430:
                        MapLabel = "일반";
                        MapType = "summoners-rift";
                        break;
                    case 440:
                        MapLabel = "자유 랭크";
                        MapType = "summoners-rift";
                        break;
                    case 830:
                        MapLabel = "입문 봇전";
                        MapType = "summoners-rift";
                        break;
                    case 840:
                        MapLabel = "초보 봇전";
                        MapType = "summoners-rift";
                        break;
                    case 850:
                        MapLabel = "중급 봇전";
                        MapType = "summoners-rift";
                        break;
                }
                let lastSecondContainer = MapLabel==="무작위 총력전"?`
                <div class="cc-wrapper">
                    <span>CC</span>
                    <span>${curUserStat.totalTimeCrowdControlDealt}s</span>
                </div>
                `:`
                <div class="ward-wrapper">
                    <span>Ward</span>
                    <span class="normal-ward-num">${curUserStat.sightWardsBoughtInGame}</span><span
                    >/</span><span class="pink-ward-num">${curUserStat.visionWardsBoughtInGame}</span>
                </div>
                `
                let timeGap = new Date() - matchItemInfo.timestamp;
                let historyHTMLdocSegment = (`
                <div class="game-history-item ${isWinType}-type ${MapType}">
                    <div class="item-wrapper">
                        <div class="item-detail-1">
                            <span class="map-type">${MapLabel}</span>
                            <span class="win-or-lose">${isWinLabel}</span>
                            <span class="timelapse">${elapsedTimeFormatter(timeGap)}</span>
                        </div>
                        <div class="item-detail-2">
                            <div class="champ-wrapper">
                                <div class="upper-div">
                                    <div class="main-champion-illust-wrapper" id="main_champion_illust_${i}">
                                        <div class="last-champion-level">${curUserStat.champLevel}</div>
                                    </div>
                                </div>
                                <div class="spell-wrapper">
                                    <div class="mid-container">
                                        <div class="spell-img" id="spell_img_${i}_1"></div>
                                        <div class="spell-img" id="spell_img_${i}_2"></div>
                                    </div>
                                </div>
                                <div class="spell-wrapper">
                                    <div class="mid-container">
                                        <div class="rune-img" id="rune_img_${i}_1"></div>
                                        <div class="rune-img" id="rune_img_${i}_2"></div>
                                    </div>                                
                                </div>
                                <div class="champion-name">
                                    <span>${curChampionInfo.name}</span>
                                </div>
                            </div>
                        </div>
                        <div class="item-detail-3">
                            <div class="KDA-wrapper">
                                <div class="KDA-score" id="KDA_score_${i}">${refineKDA(KDA)}</div>
                                <div class="KDA">
                                    <span class="kill">${curUserStat.kills}</span>
                                    <span class="slash">/</span>
                                    <span class="death">${curUserStat.deaths}</span>
                                    <span class="slash">/</span>
                                    <span class="assist">${curUserStat.assists}</span>
                                </div>
                            </div>
                        </div>
                        <div class="item-detail-4">
                        <div class="item-wrapper">
                            <div class="item-item" id="item_item_img_${i}_0"></div>
                            <div class="item-item" id="item_item_img_${i}_1"></div>
                            <div class="item-item" id="item_item_img_${i}_2"></div>
                            <div class="item-item" id="item_item_img_${i}_deco"></div>
                            <div class="item-item" id="item_item_img_${i}_3"></div>
                            <div class="item-item" id="item_item_img_${i}_4"></div>
                            <div class="item-item" id="item_item_img_${i}_5"></div>
                            <!-- <div class="item-item"></div> -->
                        </div>
                        </div>
                        <div class="item-detail-5">
                            <div class="gold-wrapper">
                                <span>${numberWithCommas(curUserStat.goldEarned)} G</span>
                            </div>
                        ${lastSecondContainer}
                            <div class="cs-wrapper">
                                <span>CS</span>
                                <span class="total-cs">${curUserStat.totalMinionsKilled}</span><span 
                                class="average-cs">(8.5)</span>
                            </div>
                        </div>
                    </div>
                </div>
                `);

                nativeHistoryItemBundle[i] = {
                    segment: historyHTMLdocSegment,
                    curChampInfo: getChampionInfoFromKey(curUserInfo.championId),
                    curUserInfo: curUserInfo,
                    userKDA: KDA,
                };

                participantInfoBundle[i] = {
                    participantIdentities: res.participantIdentities,
                    participants: res.participants,
                }
            },
            error: function(req, stat, err){
                console.log(err);
                // if(err == "Too Many Requests") alert('요청이 너무 빠릅니다!');
            },
        });

        loadHistoryItemCallback.push(request);
    }

    $.when.apply(null, loadHistoryItemCallback).done(function(){
        for(let i=0;i<matchList.length;i++){
            nativeInfoSegment = nativeHistoryItemBundle[i];

            gameHistoryListContainer.append(nativeInfoSegment.segment);
            let curChampionInfo = nativeInfoSegment.curChampInfo;
            let curUserInfo = nativeInfoSegment.curUserInfo;
            let curUserKDA = nativeInfoSegment.userKDA;

            let champion_img_url = getLatestDataDragonURL()+"/img/champion/"+curChampionInfo.id+".png";
            let spell1_url_def = getLatestDataDragonURL()+"/img/spell/"+getSpellInfoFromKey(curUserInfo.spell1Id).id+".png";
            let spell2_url_def = getLatestDataDragonURL()+"/img/spell/"+getSpellInfoFromKey(curUserInfo.spell2Id).id+".png";
            let perk1_info = getDetailPerkInfoFromKey(curUserInfo.stats.perk0);
            let perk2_info = getPerkInfoFromKey(curUserInfo.stats.perkSubStyle);

            let perk1_url_def = "https://ddragon.leagueoflegends.com/cdn/img/"+getRightPathOfDetailPerkImage(perk1_info.iconPath);
            let perk2_url_def = "https://ddragon.leagueoflegends.com/cdn/img/"+perk2_info.icon;
            $('#main_champion_illust_'+i).css("background-image", `url(${champion_img_url})`);
            $('#spell_img_'+i+"_1").css("background-image", `url(${spell1_url_def})`);
            $('#spell_img_'+i+"_2").css("background-image", `url(${spell2_url_def})`);

            const rune1 = $('#rune_img_'+i+"_1");
            const rune2 = $('#rune_img_'+i+"_2");
            rune1.css("background-image", `url(${perk1_url_def})`);
            rune1.css("background-size", "100%");
            rune2.css("background-image", `url(${perk2_url_def})`);
            rune2.css("background-size", "80%");
            $('.rune-img').css("background-color", "#111");
            
            $('#KDA_score_'+i).css("background-color", getColorFromKDA(curUserKDA));

            let itemList = [];
            for(let j=0; j<=5; j++) {
                let itemItem = curUserInfo.stats['item'+j];
                let itemInfo = itemImageData[itemItem];
                if(itemItem != 0)
                    itemList.push(itemInfo);
            }
            let sorted = sortItemListWithPrice(itemList);
            for(let j=0; j<sorted.length; j++) {
                let itemImageName = sorted[j].image.full;
                let itemURL = getLatestDataDragonURL()+"/img/item/"+itemImageName;
                $('#item_item_img_'+i+'_'+j).css("background-image", `url(${itemURL})`);
            }

            //장신구는 따로 설정
            let decoItemCode = curUserInfo.stats['item6'];
            if(decoItemCode != 0){
                let decoItemURL = getLatestDataDragonURL()+"/img/item/"+itemImageData[decoItemCode].image.full;
                $('#item_item_img_'+i+'_deco').css("background-image", `url(${decoItemURL})`);
            }
        }

        const winRateInfo = getWinRateInfo(matchList, userInfo , participantInfoBundle);
        let winRate = winRateInfo.winRate;
        let winNum = winRateInfo.winNum;
        let loseNum = winRateInfo.loseNum;

        const winRatePieChartElem = $('#win_rate_pie_chart');
        const winRatePercentageText = $('#win_rate_chart_percentage');
        const winNumText = $('#user_win_num');
        const loseNumText = $('#user_lose_num');
        let winRatePieChart = new Chart(winRatePieChartElem, {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [winRate, 100-winRate],
                    backgroundColor: [
                        'rgb(0, 214, 230)',
                        'rgb(250, 40, 40)',
                    ],
                    borderWidth: 0,
                }],
            },
            options: {
                maintainAspectRatio: false,
                cutoutPercentage: 75,
                animation: {
                    easing: 'easeInOutCirc',
                }
            }
        });

        $({
            curPercentValue: 0,
            winNumValue: 0,
            loseNumValue: 0,
        }).animate({
            curPercentValue: parseInt(winRate),
            winNumValue: winNum,
            loseNumValue: loseNum,
        }, {
            duration: 800,
            easing: 'swing',
            step: function(){
                winRatePercentageText.text(Math.ceil(this.curPercentValue)+"%");
                winNumText.text(Math.ceil(this.winNumValue)+"W");
                loseNumText.text(Math.ceil(this.loseNumValue)+"L");
            },
        });
    });
}

function loadSummonerGeneralInfo(info){
    $('#current_summoner_profile_icon_img').attr("src", getLatestDataDragonURL()+"/img/profileicon/"+info.profileIconId+".png");
    $('#current_summoner_name').text(info.name);
    $('#current_summoner_level').text(info.summonerLevel);
}

function loadSummonerLeagueInfo(info){
    const tierInfoWrapper = $('#tier_info_detail_wrapper');
    $('#tier_info_detail_wrapper .small-info-box').remove();

    for(let i=0;i<info.length;i++){
        let tier_info = getConvertedLeagueTier(info[i].tier);
        let tier_rank = tier_info.name+" "+info[i].rank;
        let converted_type = getConvertedLeagueType(info[i].queueType);
        let new_rank_label = converted_type+" | "+tier_rank;
        tierInfoWrapper.append(`<div class="small-info-box" id="info_box_${converted_type}">${new_rank_label}</div>`);
        
        let box = $('#info_box_'+converted_type);
        
        if(tier_info.level > 5){
            box.css("border", "1px");
            box.css("border-style", "solid");
            box.css("border-image", `linear-gradient( 150deg, ${tier_info.color}, ${tier_info.color2})`);
            box.css("border-image-slice", "1");
        }
        else{
            box.css("border", `1px solid ${tier_info.color}`);
        }
    }
}

//user func

function getWinRateInfo(matchList, userInfo, partyInfoBundle){
    let winSum = 0;
    for(let i=0;i<matchList.length;i++){
        let partyInfo = partyInfoBundle[i];
        let userIndex = getUserIndexFromMatchInfo(userInfo, partyInfo.participantIdentities);
        const curUserInfo = partyInfo.participants[userIndex];
        let isWin = curUserInfo.stats.win;
        if(isWin) winSum+=1;
    }
    let winRate = winSum*100/matchList.length;
    return {
        winRate: winRate,
        winNum: winSum,
        loseNum: matchList.length - winSum,
    };
}

function getColorFromKDA(kda){
    if(kda<1.5) return "rgba(161, 0, 0, 0.941)";
    if(kda<3) return "rgba(115, 140, 0, 0.941)";
    if(kda<4.5) return "rgba(0, 138, 120, 0.941)";
    if(kda<10) return "rgba(9, 124, 255, 0.941)";
    return "rgba(145, 86, 255, 0.941)";
}

function refineCS(cs){
    return cs.toFixed(3);
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function elapsedTimeFormatter(ctime){
    let stime = parseInt(ctime/1000);
    const year = parseInt(86400*(365.25));
    const month = parseInt(86400*30.4375);
    const day = 86400;
    const hour = 3600;
    const min = 60;

    if(stime >= year) return parseInt(stime/year) + "년 전";
    if(stime >= month) return parseInt(stime/month) + "달 전";
    if(stime >= day) return parseInt(stime/day) + "일 전";
    if(stime >= hour) return parseInt(stime/hour) + "시간 전";
    return parseInt(stime/min) + "분 전";
}

function ccTimeFormatter(cc){
    let mt = parseInt(cc / 60);
    let st = parseInt(cc % 60);
    return String(mt) + ":"+String(st);
}

function itemPriceComparator(a, b){
    let ag = a.gold.total;
    let bg = b.gold.total;
    return bg - ag;
}

function sortItemListWithPrice(list){
    list.sort(itemPriceComparator);
    return list;
}

function getRightPathOfDetailPerkImage(original){
    let slash_index = getPosition(original, "/", 4);
    let remain = original.substring(slash_index+1);
    return remain;
}

function getPosition(string, subString, index) {
    return string.split(subString, index).join(subString).length;
 }

function refineKDA(kda){
    switch(kda){
        case Infinity: return "∞";
    }
    if(isNaN(kda)) return "-";
    
    return kda.toFixed(2);
}

function getDetailPerkInfoFromKey(keyIn){
    return detailPerkKeyDict[keyIn];
}

function getPerkInfoFromKey(keyIn){
    return perkKeyDict[keyIn];
}

function getSpellInfoFromKey(keyIn){
    let keyword = spellKeyDict[keyIn];
    return spellData[keyword];
}

function getChampionInfoFromKey(keyIn){
    let keyword = championKeyDict[keyIn];
    let refined = keyword.replace(" ","");
    return championData[championKeyDict[keyIn]];
}

function getUserIndexFromMatchInfo(userInfo, participants){
    for(let i=0;i<participants.length;i++){
        if(participants[i].player.accountId == userInfo.accountId){
            return i;
        }
    }
    return -1;
}

function getConvertedLeagueType(type){
    switch(type){
        case "RANKED_FLEX_SR": return "Flex";
        case "RANKED_SOLO_5x5": return "Solo";
        default: return type;
    }
}

function getConvertedLeagueTier(tier){
    switch(tier){
        case "IRON": return {
            name: "아이언",
            level: 0,
            color: "#999",
        };
        case "BRONZE": return {
            name: "브론즈",
            level: 1,
            color: "#F99",
        };
        case "SILVER": return {
            name: "실버",
            level: 2,
            color: "#CCC",
        };
        case "GOLD": return {
            name: "골드",
            level: 3,
            color: "#BB8",
        };
        case "PLATINUM": return {
            name: "플레티넘",
            level: 4,
            color: "#7BB",
        };
        case "DIAMOND": return {
            name: "다이아몬드",
            level: 5,
            color: "#67D",
        };
        case "MASTER": return {
            name: "마스터",
            level: 6,
            color: "#B7D",
            color2: "#AAA"
        };
        case "GRANDMASTER": return {
            name: "그랜드마스터",
            level: 7,
            color: "#F44",
            color2: "#777",
        };
        case "CHALLENGER": return {
            name: "챌린저",
            level: 8,
            color: "#69F",
            color2: "#DE8",
        };
        default: return tier;
    }
}

function getLevelFromLeagueTier(tier){
    switch(tier){
        case "IRON": return 0;
        case "BRONZE": return "브론즈";
        case "SILVER": return "실버";
        case "GOLD": return "골드";
        case "PLATINUM": return "플레티넘";
        case "DIAMOND": return "다이아몬드";
        case "MASTER": return "마스터";
        case "GRANDMASTER": return "그랜드마스터";
        case "CHALLENGER": return "챌린저";
        default: return tier;
    }
}

function getLatestDataDragonURL(){
    return "http://ddragon.leagueoflegends.com/cdn/"+latestDataDragonVer;
}