const key = "RGAPI-f47e6f81-b29b-4fd1-9851-ffdc4fa050d5";
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

const maxHistoryItemCall = 7;

$(document).ready(function(){
    const puuid = "0Fpa02zuqg6zIg1Gi-RDSZlYWzgv3fx1uJOQr6045clKUS1jJYiydLc-AWxBnQW5TqSCYFVN1-iKTw";

    let loadInitialDataRequestCallback = [];
    let getItemJsonRequest = $.ajax({
        url: "http://ddragon.leagueoflegends.com/cdn/9.24.2/data/ko_KR/item.json",
        type: "GET",
        dataType: "json",
        success: function(res){
            itemImageData = res.data;
        }
    });
    let getPerkJsonRequest = $.ajax({
        url: "http://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/perks.json",
        type: "GET",
        dataType: "json",
        success: function(res){
            for(let i=0;i<res.length;i++){
                let val = res[i];
                detailPerkKeyDict[val.id] = val;
            }
        }
    });
    let getRuneJsonRequest = $.ajax({
        url: "http://ddragon.leagueoflegends.com/cdn/9.24.2/data/en_US/runesReforged.json",
        type: "GET",
        dataType: "json",
        success: function(res){
            for(let i=0;i<res.length;i++){
                let val = res[i];
                perkKeyDict[val.id] = val;
            }
        }
    });
    let getSummonerSpellJsonRequest = $.ajax({
        url: "http://ddragon.leagueoflegends.com/cdn/9.24.2/data/en_US/summoner.json",
        type: "GET",
        dataType: "json",
        success: function(res){
            spellData = res.data;
            for(let key in spellData){
                let value = spellData[key];
                spellKeyDict[value.key] = value.id;
            }
        }
    });
    let getChampionJsonRequest = $.ajax({
        url: "http://ddragon.leagueoflegends.com/cdn/9.24.2/data/ko_KR/champion.json",
        type: "GET",
        dataType: "json",
        success: function(res){
            championData = res.data;
            for(let key in championData){
                let value = championData[key];
                championKeyDict[value.key] = value.id;
            }
        }
    });
    let getLatestDataDragonVersionRequest = $.ajax({
        url: "https://ddragon.leagueoflegends.com/api/versions.json",
        type: "GET",
        dataType: "json",
        success: function(res){
            latestDataDragonVer = res[0];
        },
    });
    loadInitialDataRequestCallback.push(getItemJsonRequest);
    loadInitialDataRequestCallback.push(getPerkJsonRequest);
    loadInitialDataRequestCallback.push(getRuneJsonRequest);
    loadInitialDataRequestCallback.push(getSummonerSpellJsonRequest);
    loadInitialDataRequestCallback.push(getChampionJsonRequest);
    loadInitialDataRequestCallback.push(getLatestDataDragonVersionRequest);

    //Load
    $.when.apply(null, loadInitialDataRequestCallback).done(function(){
        getSummonerInfo("puuid", puuid);
    });

    const searcherInput = $('#search_summoner_input');
    $('#search_summoner_btn').on("click", function(){
        getSummonerInfo("name", searcherInput.val());
    });

    searcherInput.on("keydown", function(e){
        if(e.key == "Enter") getSummonerInfo("name", searcherInput.val());
    });

    let totalItemWrapper = $('#game_history_item_wrapper');
    let innerItem = $('#game_history_item');
    let rolledTab = $('#game_history_item_desc');

    let rolledTabHeight = rolledTab.outerHeight();
    let originalTotalWrapperHeight = totalItemWrapper.height();
    let strechedTotalWrapperHeight = originalTotalWrapperHeight + rolledTabHeight;
    let rolledTopOffset = -rolledTabHeight;
    rolledTab.css("top", (originalTotalWrapperHeight)+"px");
    rolledTab.css("z-index", "9950");

    // 디버깅용 탭 상세 펼치기
    let animationStyle = 'easeOutCirc';
    let animationDelay = 800;

    innerItem.on("click", function(){
        let isFolded = totalItemWrapper.hasClass('folded');
        if(isFolded){
            rolledTab.css("display", "inline-block");
            totalItemWrapper.animate({
                height: strechedTotalWrapperHeight
            }, animationDelay, animationStyle, function(){
                totalItemWrapper.removeClass('folded');
                totalItemWrapper.addClass('unfolded');
            });
        }
        else {
            totalItemWrapper.animate({
                height: originalTotalWrapperHeight
            }, animationDelay, animationStyle, function(){
                rolledTab.css("display", "none");
                totalItemWrapper.removeClass('unfolded');
                totalItemWrapper.addClass('folded');
            });
        }
    });

    //Content Containers
    const recentGameInfoContent = $('#recent_game_info_container');
    const masteryInfo = $('#mastery_info_container');
    const currentGameInfo = $('#current_game_info_container');
    const mainInfoContainers = $('.main-info-tab');

    //Selector Tab
    const recentGameHistoryInfoTab = $('#recent_game_history_info_tab');
    const currentGameInfoTab = $('#current_game_info_tab');
    const masteryInfoTab = $('#mastery_info_tab');
    const InfoTabBundle = $('.info-tab');

    animationDelay = 800;
    animationStyle = "easeOutQuint";

    recentGameHistoryInfoTab.on("click", function(){
        recentGameInfoContent.animate({
            left: 0,
        }, animationDelay, animationStyle);
        masteryInfo.animate({
            left: '100%',
        }, animationDelay, animationStyle);
        currentGameInfo.animate({
            left: '200%',
        }, animationDelay, animationStyle);

        InfoTabBundle.css("background-color", "#444");
        $(this).css("background-color", "#222");
    });
    masteryInfoTab.on("click", function(){
        recentGameInfoContent.animate({
            left: '-100%',
        }, animationDelay, animationStyle);
        masteryInfo.animate({
            left: 0,
        }, animationDelay, animationStyle);
        currentGameInfo.animate({
            left: '100%',
        }, animationDelay, animationStyle);

        InfoTabBundle.css("background-color", "#444");
        $(this).css("background-color", "#222");
    });
    currentGameInfoTab.on("click", function(){
        recentGameInfoContent.animate({
            left: '-200%',
        }, animationDelay, animationStyle);
        masteryInfo.animate({
            left: '-100%',
        }, animationDelay, animationStyle);
        currentGameInfo.animate({
            left: 0,
        }, animationDelay, animationStyle);

        InfoTabBundle.css("background-color", "#444");
        $(this).css("background-color", "#222");
    });

    //Point
    currentGameInfoTab.click();
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
            getSummonerMasteryInfoBySummonerID(res.id);
            console.log(res);
        },
        error: function(req, stat, err){
            console.log(err);
            if(err == "Not Found") alert("존재하지 않는 소환사");
            else if(err == "Forbidden") alert("API_KEY 만료됨");
        },
    });
}

function getSummonerMasteryInfoBySummonerID(id){
    $.ajax({
        url: "https://kr.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-summoner/"+id,
        type: "GET",
        dataType: "json",
        data: {
            "api_key": key,
        },
        success: function(res){
            loadSummonerMasteryList(res)
        },
        error: function(req, stat, err){
            console.log(err);
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
            // console.log(res);
            $('#current_game_info_tab').css("box-shadow", "0 0 8px rgb(9, 255, 9)");
        },
        error: function(req, stat, err){
            if(err == "Not Found") console.log("게임 중이 아님");
            else console.log(err);
        },
    });
}

function loadSummonerMasteryList(masteryEntries){
    const championMasteryList = $('#champion_mastery_list');
    const championMasteryItems = $('.champion-mastery-item');
    championMasteryItems.remove();

    let masteryTotalScore = 0;
    let masteryLevelStack = [0,0,0,0,0,0,0,0];
    masteryLevelStack.length = 8;

    for(let i=0;i<masteryEntries.length;i++){
        let masteryEntry = masteryEntries[i];
        let entryLabel = "normal-mastery";
        let entryIndex = i+1;
        if(i<3) entryLabel = "highest"+entryIndex+"-mastery";
        let championInfo = getChampionInfoFromKey(masteryEntry.championId);
        let championImgPath = getLatestDataDragonURL()+"/img/champion/"+championInfo.id+".png";
        let masteryAmount = masteryEntry.championPoints;
        let masteryLevel = masteryEntry.championLevel;

        let masterySegment = `
        <div class="champion-mastery-item ${entryLabel}" id="champion_mastery_item_${i}">
            <div class="mastery-champion-img" id="mastery_champion_img_${i}"></div>
            <span class="mastery-champion-name">${championInfo.name}</span>
            <span class="champion-mastery">${numberWithCommas(masteryAmount)} 점</span>
        </div>
        `;

        championMasteryList.append(masterySegment);
        $('#mastery_champion_img_'+i).css("background-image", `url(${championImgPath})`);
        let championMasteryItemView = $('#champion_mastery_item_'+i);
        switch(masteryLevel){
            case 7:
                championMasteryItemView.css("background", "linear-gradient(to right, #009683, #111)");
                break;
            case 6:
                championMasteryItemView.css("background", "linear-gradient(to right, #b800b0, #111)");
                break;
            case 5:
                championMasteryItemView.css("background", "linear-gradient(to right, #c10, #111)");
                break;
            default:
                championMasteryItemView.css("background", "linear-gradient(to right, #6f6f6f, #111)");
                break;
        }
        
        masteryLevelStack[masteryLevel]++;
        masteryTotalScore += masteryAmount;
    }
    for(let i=7;i>=3;i--){
        let masterySegAmountView = $(`#champion_mastery${i}_total_value`);
        masterySegAmountView.text(masteryLevelStack[i]);
    }
    $('#total_mastery').text(numberWithCommas(masteryTotalScore)+" 점");
    // console.log(masteryEntries);
}

function loadSummonerMatchHistory(userInfo, info){
    let matchList = info.matches;
    const gameHistoryListContainer = $('#game_history_list_container');
    const gameHistoryItemBundle = $('.game-history-item-wrapper');

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
                // console.log(res.participants);
                // console.log(res.participantIdentities);
                // console.log("Queue ID: "+res.queueId);

                //http://static.developer.riotgames.com/docs/lol/queues.json 참고
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
                    case 920:
                        MapLabel = "포로왕";
                        MapType = "howling-abyss";
                        break;
                    default:
                        MapLabel = "qType "+res.queueId;
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
                <div class="game-history-item-wrapper ${MapType} folded" id="game_history_item_wrapper_${i}">
                    <div class="game-history-item ${isWinType}-type" id="game_history_item_${i}">
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
                        </div>
                    </div>
                    <div class="game-history-item-description-tab" id="game_history_item_desc_${i}">
                        <div class="item-detail-menu-list-tab">
                            <div class="detail-menu-list-tab" style="grid-column: 1;">
                                <span>일반 정보</span>
                            </div>
                            <div class="detail-menu-list-tab" style="grid-column: 2;">
                                <span>딜량 확인</span>
                            </div>
                        </div>
                        <div class="item-detail-desc-content-wrapper">
                            <div class="item-detail-desc-content">
                                <div class="team-desc-label-wrapper win">
                                    <span class="team-desc-win-or-lose">승리</span>
                                    <span class="team-label">레드 팀</span>
                                </div>
                                <div class="participant-info-container win" id="participant_info_container_1_${i}">
                                </div>
                                <div class="team-desc-label-wrapper lose">
                                    <span class="team-desc-win-or-lose">패배</span>
                                    <span class="team-label">블루 팀</span>
                                </div>
                                <div class="participant-info-container lose" id="participant_info_container_2_${i}">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                `);

                let team1infoBundle = [];
                let team2infoBundle = [];

                for(let j=0; j<res.participants.length;j++){
                    let participantTeam = res.participants[j].teamId;
                    let participantIdentity = res.participantIdentities[j];
                    let participantStat = res.participants[j].stats;
                    let pKDA = (participantStat.kills + participantStat.assists)/participantStat.deaths;
                    let historyItemDescriptionSegment = `
                    <div class="participant-info">
                        <div class="participant-detail-info-1">
                            <div class="participant-champion-img" id="participant_champion_image_${i}_${j}"></div>
                        </div>
                        <div class="participant-detail-info-2">
                            <div class="participant-summoner-spell-wrapper">
                                <div class="participant-spell" id="participant_spell1_${i}_${j}"></div>
                                <div class="participant-spell" id="participant_spell2_${i}_${j}"></div>
                            </div><div class="participant-summoner-perk-wrapper">
                                <div class="participant-perk" id="participant_perk1_${i}_${j}"></div>
                                <div class="participant-perk zoom-out" id="participant_perk2_${i}_${j}"></div>
                            </div>
                        </div>
                        <div class="participant-detail-info-3">
                            <div class="participant-info-wrapper">
                                <span class="participant-username">
                                    <a href="#" onclick="findNewSummoner('${participantIdentity.player.summonerName}');">${participantIdentity.player.summonerName}</a>
                                </span>
                                <span class="participant-tier-level" id="participant_tier_level_${i}_${j}">Unknown</span>
                            </div>
                        </div>
                        <div class="participant-detail-info-4">
                            <div class="participant-kda-wrapper">
                                <span class="participant-kda-score">${refineKDA(pKDA)}</span>
                                <span class="participant-kda">
                                    <span class="kill">${participantStat.kills}</span>
                                    <span class="slash">/</span>
                                    <span class="death">${participantStat.deaths}</span>
                                    <span class="slash">/</span>
                                    <span class="assist">${participantStat.assists}</span>
                                </span>
                            </div>
                        </div>
                        <div class="participant-detail-info-5">
                            <div class="participant-cs-wrapper">
                                <span class="participant-gold">${numberWithCommas(participantStat.goldEarned)} G</span>
                                <span class="participant-cs">CS ${participantStat.totalMinionsKilled}(15.6)</span>
                            </div>
                        </div>
                        <div class="participant-detail-info-6">
                            <div class="participant-item-wrapper">
                                <div class="participant-item" id="participant_item0_${i}_${j}"></div>
                                <div class="participant-item" id="participant_item1_${i}_${j}"></div>
                                <div class="participant-item" id="participant_item2_${i}_${j}"></div>
                                <div class="participant-item" id="participant_item_deco_${i}_${j}"></div>
                                <div class="participant-item" id="participant_item3_${i}_${j}"></div>
                                <div class="participant-item" id="participant_item4_${i}_${j}"></div>
                                <div class="participant-item" id="participant_item5_${i}_${j}"></div>
                            </div>
                        </div>
                    </div>
                    `;
                    if(participantTeam == 100){
                        team1infoBundle.push(historyItemDescriptionSegment);
                    }else{
                        team2infoBundle.push(historyItemDescriptionSegment);
                    }
                }

                nativeHistoryItemBundle[i] = {
                    segment: historyHTMLdocSegment,
                    curChampInfo: getChampionInfoFromKey(curUserInfo.championId),
                    curUserInfo: curUserInfo,
                    userKDA: KDA,
                    team1infoBundle, team1infoBundle,
                    team2infoBundle, team2infoBundle,
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
            let curTeam1Info = nativeInfoSegment.team1infoBundle;
            let curTeam2Info = nativeInfoSegment.team2infoBundle;


            let participantIdentitiesInfo = participantInfoBundle[i].participantIdentities;
            let participantsInfo = participantInfoBundle[i].participants;

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

            const team1Container = $('#participant_info_container_1_'+i);
            const team2Container = $('#participant_info_container_2_'+i);

            for(let j=0;j<curTeam1Info.length;j++){
                team1Container.append(curTeam1Info[j]);
            }
            for(let j=0;j<curTeam2Info.length;j++){
                team2Container.append(curTeam2Info[j]);
            }
            //팀 유저 정보

            for(let j=0;j<participantsInfo.length;j++){
                let participantChampionImageView = $('#participant_champion_image_'+i+"_"+j);
                let participantSpell1ImageView = $('#participant_spell1_'+i+"_"+j);
                let participantSpell2ImageView = $('#participant_spell2_'+i+"_"+j);
                let participantPerk1ImageView = $('#participant_perk1_'+i+"_"+j);
                let participantPerk2ImageView = $('#participant_perk2_'+i+"_"+j);
                let participantTierView = $('#participant_tier_level_'+i+"_"+j)

                let participantInfo = participantsInfo[j];
                let participantIdentityInfo = participantIdentitiesInfo[j];
                let participantChampInfo = getChampionInfoFromKey(participantInfo.championId);
                let perk1Info = getDetailPerkInfoFromKey(participantInfo.stats.perk0);
                let perk2Info = getPerkInfoFromKey(participantInfo.stats.perkSubStyle);

                let participantChampionImgURL = getLatestDataDragonURL()+"/img/champion/"+participantChampInfo.id+".png";
                let spell1ImageURL = getLatestDataDragonURL()+"/img/spell/"+getSpellInfoFromKey(participantInfo.spell1Id).id+".png";
                let spell2ImageURL = getLatestDataDragonURL()+"/img/spell/"+getSpellInfoFromKey(participantInfo.spell2Id).id+".png";
                let perk1ImageURL = "https://ddragon.leagueoflegends.com/cdn/img/"+getRightPathOfDetailPerkImage(perk1Info.iconPath);
                let perk2ImageURL = "https://ddragon.leagueoflegends.com/cdn/img/"+perk2Info.icon;

                participantChampionImageView.css("background-image", `url(${participantChampionImgURL})`);
                participantSpell1ImageView.css("background-image", `url(${spell1ImageURL})`);
                participantSpell2ImageView.css("background-image", `url(${spell2ImageURL})`);
                participantPerk1ImageView.css("background-image", `url(${perk1ImageURL})`);
                participantPerk2ImageView.css("background-image", `url(${perk2ImageURL})`);
                participantPerk2ImageView.css("background-size", "80%");

                //전적 아이템마다 같이한 사람들 정보 로드 - request가 많으므로 Product 검사 끝나면 주석 처리 뺄 것
                // getAndLoadParticipantsLeagueInfoBySummonerID(participantTierView, participantIdentityInfo.player.summonerId);
            
                let participantItemList = [];
                for(let k=0; k<=5; k++) {
                    let pitemCode = participantInfo.stats['item'+k];
                    let pitemInfo = itemImageData[pitemCode];
                    if(pitemCode != 0)
                        participantItemList.push(pitemInfo);
                }
                let sorted = sortItemListWithPrice(participantItemList);
                for(let k=0; k<sorted.length; k++) {
                    let itemImageName = sorted[k].image.full;
                    let itemURL = getLatestDataDragonURL()+"/img/item/"+itemImageName;
                    $('#participant_item'+k+"_"+i+'_'+j).css("background-image", `url(${itemURL})`);
                }

                let pdecoItemCode = participantInfo.stats['item6'];
                if(pdecoItemCode != 0){
                    let pdecoItemURL = getLatestDataDragonURL()+"/img/item/"+itemImageData[pdecoItemCode].image.full;
                    $('#participant_item_deco'+"_"+i+'_'+j).css("background-image", `url(${pdecoItemURL})`);
                }
            }

            //상세 설명 탭 확장 애니메이션
            let totalItemWrapper = $('#game_history_item_wrapper_'+i);
            let innerItem = $('#game_history_item_'+i);
            let rolledTab = $('#game_history_item_desc_'+i);
        
            let rolledTabHeight = rolledTab.outerHeight();
            let originalTotalWrapperHeight = totalItemWrapper.height();
            let strechedTotalWrapperHeight = originalTotalWrapperHeight + rolledTabHeight;
            let rolledTopOffset = -rolledTabHeight;
            rolledTab.css("top", (originalTotalWrapperHeight)+"px");
            rolledTab.css("z-index", (9900-i)+"");
        
            const animationStyle = 'easeOutQuint';
            const animationDelay = 600;
        
            innerItem.on("click", function(){
                let isFolded = totalItemWrapper.hasClass('folded');
                if(isFolded){
                    rolledTab.css("display", "inline-block");
                    totalItemWrapper.animate({
                        height: strechedTotalWrapperHeight
                    }, animationDelay, animationStyle, function(){
                        totalItemWrapper.removeClass('folded');
                        totalItemWrapper.addClass('unfolded');
                    });
                }
                else {
                    totalItemWrapper.animate({
                        height: originalTotalWrapperHeight
                    }, animationDelay, animationStyle, function(){
                        rolledTab.css("display", "none");
                        totalItemWrapper.removeClass('unfolded');
                        totalItemWrapper.addClass('folded');
                    });
                }
            });
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

function getAndLoadParticipantsLeagueInfoBySummonerID(span, id){
    $.ajax({
        url: "https://kr.api.riotgames.com/lol/league/v4/entries/by-summoner/"+id,
        type: "GET",
        dataType: "json",
        data: {
            "api_key": key,
        },
        success: function(res){
            let candidates = [];
            for(let i=0;i<res.length;i++){
                let tier_info = getConvertedLeagueTier(res[i].tier);
                let type_info = getConvertedLeagueType(res[i].queueType);
                let label_info = tier_info.name + " " + res[i].rank;
                candidates.push({
                    tierInfo: tier_info,
                    typeInfo: type_info,
                    labelInfo: label_info,
                });
            }

            for(let i=0;i<candidates.length;i++){
                candidate = candidates[i];
                if(candidate.typeInfo.level === 3){
                    let tierInfo = candidate.tierInfo;
                    span.text(candidate.labelInfo);
                    if(tierInfo.level > 5)
                        span.css("background-image", `linear-gradient( 150deg, ${tierInfo.color}, ${tierInfo.color2})`);
                    else
                        span.css("background-color", `${tierInfo.color})`);
                    return;
                }
            }
            for(let i=0;i<candidates.length;i++){
                candidate = candidates[i];
                if(candidate.typeInfo.level === 2){
                    let tierInfo = candidate.tierInfo;
                    span.text(candidate.labelInfo);
                    if(tierInfo.level > 5)
                        span.css("background-image", `linear-gradient( 150deg, ${tierInfo.color}, ${tierInfo.color2})`);
                    else
                        span.css("background-color", `${tierInfo.color})`);
                    return;
                }
            }
            for(let i=0;i<candidates.length;i++){
                candidate = candidates[i];
                if(candidate.typeInfo.level === 1){
                    span.text(candidate.labelInfo);
                    span.css("background", "green");
                    return;
                }
            }
            $.ajax({
                url: "https://kr.api.riotgames.com/lol/summoner/v4/summoners/"+id,
                type: "GET",
                aync: false,
                dataType: "json",
                data: {
                    "api_key": key,
                },
                success: function(res){
                    span.text(res.summonerLevel+" 레벨");
                },
                error: function(req, stat, err){
                    if(err == "Not Found") console.log("존재하지 않는 소환사_id: "+id);
                    else if(err == "Forbidden") console.log("API_KEY 만료됨");
                    else{
                        console.log(err);
                        if(err == "Too Many Requests") span.text('Error-1');
                        else span.text('Error-2');
                    }
                },
            });
        },
        error: function(req, stat, err){
            
            if(err == "Service Unavailable") console.log('현재 API 서버 사용 불가능');
            else if(err == "Too Many Requests") console.log('요청이 너무 빠름');
            else console.log(err);
        },
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
        let converted_type = getConvertedLeagueType(info[i].queueType).type;
        let new_rank_label = converted_type+" | "+tier_rank;
        tierInfoWrapper.append(`<div class="small-info-box" id="info_box_${converted_type}">${new_rank_label}</div>`);
        
        let box = $('#info_box_'+converted_type);
        
        if(tier_info.level > 5){
            box.css("border", "2px");
            box.css("border-style", "solid");
            box.css("border-image", `linear-gradient( 150deg, ${tier_info.color}, ${tier_info.color2})`);
            box.css("border-image-slice", "1");
        }
        else{
            box.css("border", `2px solid ${tier_info.color}`);
        }
    }
}

//user func

function findNewSummoner(username){
    console.log(username);
    getSummonerInfo("name", username);
}

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
        case "RANKED_FLEX_SR": return {
            type: "Flex",
            level: 2,
        };
        case "RANKED_SOLO_5x5": return {
            type: "Solo",
            level: 3,
        };
        default: return {
            type: type,
            level: 1,
        };;
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
            color: "#FFD700",
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

function getLatestDataDragonURL(){
    return "http://ddragon.leagueoflegends.com/cdn/"+latestDataDragonVer;
}