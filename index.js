window.addEventListener("contextmenu", e => e.preventDefault());

// PASTE YOUR API HERE
let api = "";

// START
let socket = new ReconnectingWebSocket("ws://127.0.0.1:24050/ws");
let axios = window.axios;
let user = {};

// NOW PLAYING
let mapContainer = document.getElementById("mapContainer");
let mapArtist = document.getElementById("mapName");
let mapInfo = document.getElementById("mapInfo");
let mapper = document.getElementById("mapper");
let stars = document.getElementById("stars");
let nowPlayingContainer = document.getElementById("nowPlayingContainer");
let stats = document.getElementById("stats");

// Chats
let chats = document.getElementById("chats");

const beatmaps = new Set(); // Store beatmapID;

socket.onopen = () => {
    console.log("Successfully Connected");
};

socket.onclose = event => {
    console.log("Socket Closed Connection: ", event);
    socket.send("Client Closed!");
};

socket.onerror = error => {
    console.log("Socket Error: ", error);
};

let tempUID;

let tempMapID, tempImg, tempMapArtist, tempMapTitle, tempMapDiff, tempMapper;

let tempSR, tempCS, tempAR, tempOD, tempHP;

let gameState;

let chatLen = 0;
let tempClass = 'unknown';

let hasSetup = false;

class Beatmap {
    constructor(modid, mapid, top, left, layerName) {
        this.modid = modid;
        this.mapid = mapid;
        this.top = top;
        this.left = left;
        this.layerName = layerName;
        this.user = {};
    }
    generate() {
        let main = document.getElementById("main");

        this.clicker = document.createElement("div");
        this.clicker.id = `${this.layerName}Clicker`;

        main.appendChild(this.clicker);
        let clickerObj = document.getElementById(this.clicker.id);

        this.bg = document.createElement("div");
        this.map = document.createElement("div");
        this.overlay = document.createElement("div");
        this.metadata = document.createElement("div");
        this.difficulty = document.createElement("div");
        this.stats = document.createElement("div");
        this.mods = document.createElement("div");
        this.pickedStatus = document.createElement("div");

        this.bg.id = this.layerName;
        this.map.id = `${this.layerName}BG`;
        this.overlay.id = `${this.layerName}Overlay`;
        this.metadata.id = `${this.layerName}META`;
        this.difficulty.id = `${this.layerName}DIFF`;
        this.stats.id = `${this.layerName}Stats`;
        this.mods.id = `${this.layerName}Mods`;
        this.pickedStatus.id = `${this.layerName}STATUS`;

        this.metadata.style.cssText = ` position: absolute; 
                                        top: 2px; 
                                        left: 20px; 
                                        width: 460px; 
                                        color: #fff; 
                                        font-family: Exo2; 
                                        font-size: 14px; 
                                        line-height: 30px; 
                                        text-shadow: 0 2px 3px black; 
                                        user-select: none; 
                                        transition: ease-in-out 200ms; 
                                        white-space: nowrap; 
                                        overflow: hidden; 
                                        text-overflow: ellipsis;`;
        this.difficulty.style.cssText = `   position: absolute; 
                                            top: 20px; 
                                            left: 20px; 
                                            width: 460px; 
                                            color: #fff; 
                                            font-family: Exo2; 
                                            font-size: 14px; 
                                            line-height: 30px; 
                                            text-shadow: 0 2px 3px black; 
                                            user-select: none; 
                                            transition: ease-in-out 200ms; 
                                            white-space: nowrap; 
                                            overflow: hidden; 
                                            text-overflow: ellipsis;`;
        this.map.style.cssText = `  position: absolute; 
                                    top: 0px; 
                                    left: 0px; 
                                    width: 500px; 
                                    height: 60px; 
                                    background-color: #161616; 
                                    background-size: 100%;
                                    background-position: center center; 
                                    color: #161616; 
                                    border-radius: 10px; 
                                    box-shadow: 0px 5px 20px -3px black; 
                                    transition: ease-in-out 200ms;`;
        this.pickedStatus.style.cssText = ` position: absolute; 
                                            top: 50px; 
                                            left: 100px; 
                                            width: 100px; 
                                            height: 20px; 
                                            color: #fff; 
                                            line-height: 30px; 
                                            font-size: 15px; 
                                            text-align: center; 
                                            user-select: none; 
                                            transition: ease-in-out 300ms; 
                                            opacity: 0%; border-radius: 25px; 
                                            text-shadow: 0 0 10px black`;
        this.overlay.style.cssText = `  position: absolute; 
                                        top: 0px; 
                                        left: 0px; 
                                        width: 500px; 
                                        height: 60px; 
                                        background-color: #000; 
                                        border-radius: 10px; 
                                        opacity: 50%; 
                                        transition: ease-in-out 200ms;`;
        this.bg.style.cssText = `   position: absolute; 
                                    top: 50px; left: 150px; 
                                    width: 350px; 
                                    height: 20px; 
                                    background-color: #161616; 
                                    color: #fff; 
                                    border-radius: 15px; 
                                    box-shadow: 0px 5px 20px -3px black; 
                                    transition: ease-in-out 200ms;`;
        this.stats.style.cssText = `position: absolute; 
                                    top: 50px; 
                                    left: 170px; 
                                    width: 310px; 
                                    color: #fff; 
                                    font-family: Exo2; 
                                    font-size: 13px; 
                                    line-height: 20px; 
                                    text-shadow: 0 2px 3px black; 
                                    text-align: center; 
                                    user-select: none; 
                                    transition: ease-in-out 200ms;`;
        this.mods.style.cssText = ` position: absolute; 
                                    top: 10px; 
                                    right: -20px; 
                                    width: 40px; 
                                    height: 40px; 
                                    background-size: 100%; 
                                    background-image: url("./static/${this.modid}.png"); 
                                    -webkit-filter: drop-shadow(0px 2px 2px #000); 
                                    filter: drop-shadow(0px 2px 2px #000); 
                                    transition: ease-in-out 200ms;`;
        this.clicker.style.cssText = `  position: absolute; 
                                        top: ${this.top}px; 
                                        left: ${this.left}px; 
                                        width: 500px; 
                                        height: 130px; 
                                        transition: ease-in-out 200ms;`;

        clickerObj.appendChild(this.map);
        clickerObj.appendChild(this.overlay);
        clickerObj.appendChild(this.metadata);
        clickerObj.appendChild(this.difficulty);
        clickerObj.appendChild(this.pickedStatus);
        clickerObj.appendChild(this.bg);
        clickerObj.appendChild(this.stats);
        clickerObj.appendChild(this.mods);
    }
    grayedOut() {
        this.overlay.style.cssText = `position: absolute; top: 0px; left: 0px; width: 500px; height: 100px; background-color: #000; border-radius: 10px; opacity: 100%`;
    }
}

let clickStat = 0;

socket.onmessage = async(event) => {
    let data = JSON.parse(event.data);

    if (!hasSetup) setupBeatmaps();

    if (tempImg !== data.menu.bm.path.full) {
        tempImg = data.menu.bm.path.full;
        data.menu.bm.path.full = data.menu.bm.path.full.replace(/#/g, '%23').replace(/%/g, '%25').replace(/\\/g, '/');
        nowPlayingContainer.style.backgroundImage = `url('http://127.0.0.1:24050/Songs/${data.menu.bm.path.full}?a=${Math.random(10000)}')`;
    }
    if (tempMapID !== data.menu.bm.id || tempSR !== data.menu.bm.stats.fullSR) {
        tempMapID = data.menu.bm.id;
        tempMapArtist = data.menu.bm.metadata.artist;
        tempMapTitle = data.menu.bm.metadata.title;
        tempMapDiff = '[' + data.menu.bm.metadata.difficulty + ']';
        tempMapper = data.menu.bm.metadata.mapper;

        tempCS = data.menu.bm.stats.CS;
        tempAR = data.menu.bm.stats.AR;
        tempOD = data.menu.bm.stats.OD;
        tempHP = data.menu.bm.stats.HP;
        tempSR = data.menu.bm.stats.fullSR;

        mapName.innerHTML = tempMapArtist + ' - ' + tempMapTitle;
        mapInfo.innerHTML = 'Difficulty: ' + tempMapDiff + '&emsp;&emsp;&emsp;&emsp;' + 'Mapper: ' + tempMapper;
        stats.innerHTML = 'CS: ' + tempCS + '&emsp;' + 'AR: ' + tempAR + '&emsp;' + 'OD: ' + tempOD + '&emsp;' + 'HP: ' + tempHP + '&emsp;' + 'Star Rating: ' + tempSR + '*';
    }

    /*if (chatLen != data.tourney.manager.chat.length) {
        // There's new chats that haven't been updated

        if (chatLen == 0 || (chatLen > 0 && chatLen > data.tourney.manager.chat.length)) {
            // Starts from bottom
            chats.innerHTML = "";
            chatLen = 0;
        }

        // Add the chats
        for (var i = chatLen; i < data.tourney.manager.chat.length; i++) {
            tempClass = data.tourney.manager.chat[i].team;

            // Chat variables
            let chatParent = document.createElement('div');
            chatParent.setAttribute('class', 'chat');

            let chatTime = document.createElement('div');
            chatTime.setAttribute('class', 'chatTime');

            let chatName = document.createElement('div');
            chatName.setAttribute('class', 'chatName');

            let chatText = document.createElement('div');
            chatText.setAttribute('class', 'chatText');

            chatTime.innerText = data.tourney.manager.chat[i].time;
            chatName.innerText = data.tourney.manager.chat[i].name + ":\xa0";
            chatText.innerText = data.tourney.manager.chat[i].messageBody;

            chatName.classList.add(tempClass);

            chatParent.append(chatTime);
            chatParent.append(chatName);
            chatParent.append(chatText);
            chats.append(chatParent);
        }

        // Update the Length of chat
        chatLen = data.tourney.manager.chat.length;

        // Update the scroll so it's sticks at the bottom by default
        chats.scrollTop = chats.scrollHeight;
    }*/

};

function setupBeatmaps() {
    hasSetup = true;

    const bms = [
        { beatmapId: 3015906, mods: "NM" },
        { beatmapId: 1848250, mods: "NM" },
        { beatmapId: 2994883, mods: "NM" },
        { beatmapId: 2747949, mods: "NM" },
        { beatmapId: 2943226, mods: "NM" },
        { beatmapId: 2931958, mods: "NM" },
        { beatmapId: 2566810, mods: "HD" },
        { beatmapId: 2407203, mods: "HD" },
        { beatmapId: 2940873, mods: "HD" },
        { beatmapId: 2017880, mods: "HR" },
        { beatmapId: 2153557, mods: "HR" },
        { beatmapId: 2095147, mods: "HR" },
        { beatmapId: 2956769, mods: "DT" },
        { beatmapId: 2417883, mods: "DT" },
        { beatmapId: 2236734, mods: "DT" },
        { beatmapId: 2236734, mods: "DT" },
        { beatmapId: 1594266, mods: "FM" },
        { beatmapId: 1363001, mods: "FM" },
        { beatmapId: 1950368, mods: "FM" },
        { beatmapId: 2596015, mods: "TB" },
    ]; // For testing only

    let row = -1;
    let preMod = 0;
    let colIndex = 0;
    bms.map(async(beatmap, index) => {
        if (beatmap.mods !== preMod || colIndex % 3 === 0) {
            preMod = beatmap.mods;
            colIndex = 0;
            row++;
        }
        const bm = new Beatmap(beatmap.mods, beatmap.beatmapId, 100 * row + 110, 500 * (colIndex % 3) + 105 * (colIndex++ % 3 + 1), `map${index}`);
        if (beatmap.mods == "TB") {
            bm.top = 810;
            bm.left = 710;
        }
        bm.generate();
        bm.clicker.onmouseover = function() {
            bm.clicker.style.transform = "translateY(-5px)";
        }
        bm.clicker.onmouseleave = function() {
            bm.clicker.style.transform = "translateY(0px)";
        }
        bm.clicker.addEventListener("mousedown", function() {
            bm.clicker.addEventListener("click", function(event) {
                if (event.shiftKey) {
                    bm.pickedStatus.style.color = "#de3950";
                    bm.pickedStatus.style.backgroundColor = "rgba(0, 0, 0, 0)";
                    bm.pickedStatus.style.top = "0px";
                    bm.pickedStatus.style.left = "0px";
                    bm.pickedStatus.style.width = "500px";
                    bm.pickedStatus.style.height = "60px";
                    bm.pickedStatus.style.lineHeight = "60px";
                    bm.pickedStatus.style.fontSize = "25px";
                    bm.overlay.style.opacity = "80%";
                    bm.metadata.style.opacity = "30%";
                    bm.difficulty.style.opacity = "30%";
                    bm.stats.style.opacity = "0%";
                    bm.bg.style.opacity = "0%";
                    bm.pickedStatus.style.textShadow = "0 0 10px black";
                    setTimeout(function() {
                        bm.pickedStatus.style.opacity = "100%";
                        bm.pickedStatus.innerHTML = "Banned by Red";
                    }, 150);
                } else if (event.ctrlKey) {
                    bm.overlay.style.opacity = "40%";
                    bm.metadata.style.opacity = "100%";
                    bm.difficulty.style.opacity = "100%";
                    bm.stats.style.opacity = "100%";
                    bm.bg.style.opacity = "100%";
                    bm.pickedStatus.style.left = "100px";
                    bm.pickedStatus.style.opacity = "0%";
                    bm.pickedStatus.style.backgroundColor = "rgba(0,0,0,0)";
                    setTimeout(function() {
                        bm.pickedStatus.style.opacity = "100%";
                        bm.pickedStatus.innerHTML = "";
                    }, 150);
                } else {
                    bm.pickedStatus.style.color = "#fff";
                    bm.pickedStatus.style.backgroundColor = "#de3950";
                    bm.pickedStatus.style.top = "50px";
                    bm.pickedStatus.style.left = "0px";
                    bm.pickedStatus.style.width = "100px";
                    bm.pickedStatus.style.height = "20px";
                    bm.pickedStatus.style.lineHeight = "20px";
                    bm.pickedStatus.style.fontSize = "13px";
                    bm.overlay.style.opacity = "40%";
                    bm.metadata.style.opacity = "100%";
                    bm.difficulty.style.opacity = "100%";
                    bm.stats.style.opacity = "100%";
                    bm.bg.style.opacity = "100%";
                    bm.pickedStatus.style.textShadow = "0 0 0 rgba(0,0,0,0)";
                    setTimeout(function() {
                        bm.pickedStatus.style.opacity = "100%";
                        bm.pickedStatus.innerHTML = "Picked";
                    }, 150);
                }
            });
            bm.clicker.addEventListener("contextmenu", function(event) {
                if (event.shiftKey) {
                    bm.pickedStatus.style.color = "#2982e3";
                    bm.pickedStatus.style.backgroundColor = "rgba(0, 0, 0, 0)";
                    bm.pickedStatus.style.top = "0px";
                    bm.pickedStatus.style.left = "0px";
                    bm.pickedStatus.style.width = "500px";
                    bm.pickedStatus.style.height = "60px";
                    bm.pickedStatus.style.lineHeight = "60px";
                    bm.pickedStatus.style.fontSize = "25px";
                    bm.overlay.style.opacity = "80%";
                    bm.metadata.style.opacity = "30%";
                    bm.difficulty.style.opacity = "30%";
                    bm.stats.style.opacity = "0%";
                    bm.bg.style.opacity = "0%";
                    bm.pickedStatus.style.textShadow = "0 0 10px black";
                    setTimeout(function() {
                        bm.pickedStatus.style.opacity = "100%";
                        bm.pickedStatus.innerHTML = "Banned by Blue";
                    }, 150);
                } else if (event.ctrlKey) {
                    bm.overlay.style.opacity = "40%";
                    bm.metadata.style.opacity = "100%";
                    bm.difficulty.style.opacity = "100%";
                    bm.stats.style.opacity = "100%";
                    bm.bg.style.opacity = "100%";
                    bm.pickedStatus.style.left = "100px";
                    bm.pickedStatus.style.opacity = "0%";
                    bm.pickedStatus.style.backgroundColor = "rgba(0,0,0,0)";
                    setTimeout(function() {
                        bm.pickedStatus.style.opacity = "100%";
                        bm.pickedStatus.innerHTML = "";
                    }, 150);
                } else {
                    bm.pickedStatus.style.color = "#fff";
                    bm.pickedStatus.style.backgroundColor = "#2982e3";
                    bm.pickedStatus.style.top = "50px";
                    bm.pickedStatus.style.left = "0px";
                    bm.pickedStatus.style.width = "100px";
                    bm.pickedStatus.style.height = "20px";
                    bm.pickedStatus.style.lineHeight = "20px";
                    bm.pickedStatus.style.fontSize = "13px";
                    bm.overlay.style.opacity = "40%";
                    bm.metadata.style.opacity = "100%";
                    bm.difficulty.style.opacity = "100%";
                    bm.stats.style.opacity = "100%";
                    bm.bg.style.opacity = "100%";
                    bm.pickedStatus.style.textShadow = "0 0 0 rgba(0,0,0,0)";
                    setTimeout(function() {
                        bm.pickedStatus.style.opacity = "100%";
                        bm.pickedStatus.innerHTML = "Picked";
                    }, 150);
                }
            });
        });
        const mapData = await getDataSet(beatmap.beatmapId);
        bm.map.style.backgroundImage = `url('https://assets.ppy.sh/beatmaps/${mapData.beatmapset_id}/covers/cover.jpg')`;
        bm.metadata.innerHTML = mapData.artist + ' - ' + mapData.title;
        bm.difficulty.innerHTML = "Difficulty: " + mapData.version + '&emsp;&emsp;Mapper: ' + mapData.creator;
        bm.stats.innerHTML = "CS: " + mapData.diff_size + '&emsp;AR: ' + mapData.diff_approach + '&emsp;OD: ' + mapData.diff_overall + '&emsp;HP: ' + mapData.diff_drain + '&emsp;Star Rating: ' + parseFloat(mapData.difficultyrating).toFixed(2) + '*';
        beatmaps.add(bm);
    });
}

async function getDataSet(mapid) {
    try {
        const data = (
            await axios.get("/get_beatmaps", {
                baseURL: "https://osu.ppy.sh/api",
                params: {
                    k: `${api}`,
                    b: `${mapid}`,
                },
            })
        )["data"];
        return data.length !== 0 ? data[0] : null;
    } catch (error) {
        console.error(error);
    }
};