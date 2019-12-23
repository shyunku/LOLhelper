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

const itemCall = 6;

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
            console.log("Success to get Summoner's Data");
            loadSummonerGeneralInfo(res);
            getSummonerLeagueInfoBySummonerID(res.id)
            getSummonerRecentGameHistoryBySummonerAccountID(res);
            console.log(res);
        },
        error: function(req, stat, err){
            console.log(err);
            if(err == "Not Found") alert("없는 소환사입니다.");
            else if(err == "Forbidden") alert("API_KEY 만료됨.");
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
            "endIndex": itemCall-1,
        },
        success: function(res){
            console.log("Success to get Summoner's Match Data List");
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
            console.log("Success to get Summoner's League Data");
            loadSummonerLeagueInfo(res);
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
    // gameHistoryItemBundle.remove();

    for(let i=0;i<matchList.length;i++){
        let matchItemInfo = matchList[i];
        $.ajax({
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
                console.log(curUserInfo.stats);
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
                }
                gameHistoryListContainer.append(`
                <div class="game-history-item ${isWinType}-type ${MapType}">
                    <div class="item-wrapper">
                        <div class="item-detail-1">
                            <span class="map-type">${MapLabel}</span>
                            <span class="win-or-lose">${isWinLabel}</span>
                        </div>
                        <div class="item-detail-2">
                            <div class="upper-div">
                                <div class="main-champion-illust-wrapper" id="main_champion_illust_${i}">
                                    <div class="last-champion-level">${curUserInfo.stats.champLevel}</div>
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
                        <div class="item-detail-3">
                            <div class="KDA-wrapper">
                                <div class="KDA-score">${refineKDA(KDA)}</div>
                                <div class="KDA">
                                    <span class="kill">${curUserInfo.stats.kills}</span>
                                    <span class="slash">/</span>
                                    <span class="death">${curUserInfo.stats.deaths}</span>
                                    <span class="slash">/</span>
                                    <span class="assist">${curUserInfo.stats.assists}</span>
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
                                <span>- G</span>
                            </div>
                        </div>
                    </div>
                </div>
                `);
                let champion_img_url = getLatestDataDragonURL()+"/img/champion/"+curChampionInfo.id+".png";
                let perk_url = "https://ddragon.leagueoflegends.com/cdn/img/"+".png";
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
                
                let itemList = [];
                // console.log(curUserInfo.stats['item0']);
                for(let j=0; j<=5; j++) {
                    let itemItem = curUserInfo.stats['item'+j];
                    let itemInfo = itemImageData[itemItem];
                    if(itemItem != 0)
                        itemList.push(itemInfo);
                }
                let sorted = sortItemListWithPrice(itemList);
                console.log("개수: "+sorted.length);
                for(let j=0; j<sorted.length; j++) {
                    let itemImageName = sorted[j].image.full;
                    let itemURL = getLatestDataDragonURL()+"/img/item/"+itemImageName;
                    $('#item_item_img_'+i+'_'+j).css("background-image", `url(${itemURL})`);
                }

                //장신구는 따로 설정
                let decoItemCode = curUserInfo.stats['item6'];
                let decoItemURL = getLatestDataDragonURL()+"/img/item/"+itemImageData[decoItemCode].image.full;
                $('#item_item_img_'+i+'_deco').css("background-image", `url(${decoItemURL})`);
            },
            error: function(req, stat, err){
                console.log(err);
            },
        });
    }
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

function itemPriceComparator(a, b){
    let ag = a.gold.total;
    let bg = b.gold.total;
    return bg - ag;
}

function sortItemListWithPrice(list){
    console.log(list);
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