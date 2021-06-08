window.addEventListener("contextmenu", e => e.preventDefault());

// PASTE YOUR API HERE
let api = "";

window.onload = function() {
    let apiInput = prompt("Please enter your API", '');
    if (apiInput !== null)
        api = apiInput;
};

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

const mods = {
    NM: 0,
    HD: 1,
    HR: 2,
    DT: 3,
    FM: 4,
    TB: 5,
};

class Beatmap {
    constructor(mods, beatmapID, layerName) {
        this.mods = mods;
        this.beatmapID = beatmapID;
        this.layerName = layerName;
    }
    generate() {
        let mappoolContainer = document.getElementById(`${this.mods}`);

        this.clicker = document.createElement("div");
        this.clicker.id = `${this.layerName}Clicker`;

        mappoolContainer.appendChild(this.clicker);
        let clickerObj = document.getElementById(this.clicker.id);

        this.bg = document.createElement("div");
        this.map = document.createElement("div");
        this.overlay = document.createElement("div");
        this.metadata = document.createElement("div");
        this.difficulty = document.createElement("div");
        this.stats = document.createElement("div");
        this.mod = document.createElement("div");
        this.pickedStatus = document.createElement("div");

        this.bg.id = this.layerName;
        this.map.id = `${this.layerName}BG`;
        this.overlay.id = `${this.layerName}Overlay`;
        this.metadata.id = `${this.layerName}META`;
        this.difficulty.id = `${this.layerName}DIFF`;
        this.stats.id = `${this.layerName}Stats`;
        this.mod.id = `${this.layerName}Mods`;
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
                                            opacity: 0; 
                                            border-radius: 25px; 
                                            text-shadow: 0 0 10px black`;
        this.overlay.style.cssText = `  position: absolute; 
                                        top: 0px; 
                                        left: 0px; 
                                        width: 500px; 
                                        height: 60px; 
                                        background-color: #000; 
                                        border-radius: 10px; 
                                        opacity: 0.5; 
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
        this.mod.style.cssText = ` position: absolute; 
                                    top: 10px; 
                                    right: -20px; 
                                    width: 40px; 
                                    height: 40px; 
                                    background-size: 100%; 
                                    background-image: url("./static/${this.mods}.png"); 
                                    -webkit-filter: drop-shadow(0px 2px 2px #000); 
                                    filter: drop-shadow(0px 2px 2px #000); 
                                    transition: ease-in-out 200ms;`;
        this.clicker.style.cssText = `  width: 500px; 
                                        height: 80px; 
                                        transition: ease-in-out 300ms;`;

        clickerObj.appendChild(this.map);
        clickerObj.appendChild(this.overlay);
        clickerObj.appendChild(this.metadata);
        clickerObj.appendChild(this.difficulty);
        clickerObj.appendChild(this.pickedStatus);
        clickerObj.appendChild(this.bg);
        clickerObj.appendChild(this.stats);
        clickerObj.appendChild(this.mod);

        this.clicker.style.transform = "translateY(0)";
    }
    grayedOut() {
        this.overlay.style.cssText = `  position: absolute; 
                                        top: 0px; left: 0px; 
                                        width: 500px; 
                                        height: 100px; 
                                        background-color: #000; 
                                        border-radius: 10px; 
                                        opacity: 1`;
    }
}

let team1 = "Red",
    team2 = "Blue";

socket.onmessage = async(event) => {
    let data = JSON.parse(event.data);

    if (data.tourney.manager.ipcState == 1) {
        team1 = data.tourney.manager.teamName.left;
        team2 = data.tourney.manager.teamName.right;
        if (chatLen != data.tourney.manager.chat.length) {
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
        }
    }

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
        mapInfo.innerHTML = `${tempMapDiff}` + '&emsp;&emsp;&emsp;&emsp;' + 'Mapper: ' + tempMapper;
        stats.innerHTML = 'CS: ' + tempCS + '&emsp;' + 'AR: ' + tempAR + '&emsp;' + 'OD: ' + tempOD + '&emsp;' + 'HP: ' + tempHP + '&emsp;' + 'SR: ' + tempSR + '*';
    }
};

function setupBeatmaps() {
    hasSetup = true;

    const modsCount = {
        NM: 0,
        HD: 0,
        HR: 0,
        DT: 0,
        FM: 0,
        TB: 0,
    };

    const bms = [
        { beatmapId: 2719302, mods: "NM" },
        { beatmapId: 2719284, mods: "NM" },
        { beatmapId: 2651784, mods: "NM" },
        { beatmapId: 2719485, mods: "NM" },
        { beatmapId: 2719305, mods: "NM" },
        { beatmapId: 2719326, mods: "NM" },
        { beatmapId: 2478754, mods: "HD" },
        { beatmapId: 2719334, mods: "HD" },
        { beatmapId: 2719328, mods: "HD" },
        { beatmapId: 2719386, mods: "HR" },
        { beatmapId: 2719372, mods: "HR" },
        { beatmapId: 665149, mods: "HR" },
        { beatmapId: 2719411, mods: "DT" },
        { beatmapId: 2719893, mods: "DT" },
        { beatmapId: 2719407, mods: "DT" },
        { beatmapId: 2603690, mods: "DT" },
        { beatmapId: 2719427, mods: "FM" },
        { beatmapId: 2719439, mods: "FM" },
        { beatmapId: 2719437, mods: "FM" },
        { beatmapId: 2719462, mods: "TB" },
    ]; // For testing only

    (function countMods() {
        bms.map((beatmap) => {
            modsCount[beatmap.mods]++;
        });
    })();

    let row = -1;
    let preMod = 0;
    let colIndex = 0;
    bms.map(async(beatmap, index) => {
        if (beatmap.mods !== preMod || colIndex % 3 === 0) {
            preMod = beatmap.mods;
            colIndex = 0;
            row++;
        }
        let oddRow = Math.round(modsCount[beatmap.mods] / 3) + 1;
        let leftCol = modsCount[beatmap.mods] % 3;
        const bm = new Beatmap(beatmap.mods, beatmap.beatmapId, `map${index}`);
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
                    bm.overlay.style.opacity = "0.8";
                    bm.metadata.style.opacity = "0.3";
                    bm.difficulty.style.opacity = "0.3";
                    bm.stats.style.opacity = "0";
                    bm.bg.style.opacity = "0";
                    bm.pickedStatus.style.textShadow = "0 0 10px black";
                    setTimeout(function() {
                        bm.pickedStatus.style.opacity = "1";
                        bm.pickedStatus.innerHTML = `Banned by ${team1}`;
                    }, 150);
                } else if (event.ctrlKey) {
                    bm.overlay.style.opacity = "0.5";
                    bm.metadata.style.opacity = "1";
                    bm.difficulty.style.opacity = "1";
                    bm.stats.style.opacity = "1";
                    bm.bg.style.opacity = "1";
                    bm.pickedStatus.style.left = "100px";
                    bm.pickedStatus.style.opacity = "0";
                    bm.pickedStatus.style.backgroundColor = "rgba(0,0,0,0)";
                    setTimeout(function() {
                        bm.pickedStatus.style.opacity = "1";
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
                    bm.overlay.style.opacity = "0.5";
                    bm.metadata.style.opacity = "1";
                    bm.difficulty.style.opacity = "1";
                    bm.stats.style.opacity = "1";
                    bm.bg.style.opacity = "1";
                    bm.pickedStatus.style.textShadow = "0 0 0 rgba(0,0,0,0)";
                    setTimeout(function() {
                        bm.pickedStatus.style.opacity = "1";
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
                    bm.overlay.style.opacity = "0.8";
                    bm.metadata.style.opacity = "0.3";
                    bm.difficulty.style.opacity = "0.3";
                    bm.stats.style.opacity = "0";
                    bm.bg.style.opacity = "0";
                    bm.pickedStatus.style.textShadow = "0 0 10px black";
                    setTimeout(function() {
                        bm.pickedStatus.style.opacity = "1";
                        bm.pickedStatus.innerHTML = `Banned by ${team2}`;
                    }, 150);
                } else if (event.ctrlKey) {
                    bm.overlay.style.opacity = "0.5";
                    bm.metadata.style.opacity = "1";
                    bm.difficulty.style.opacity = "1";
                    bm.stats.style.opacity = "1";
                    bm.bg.style.opacity = "1";
                    bm.pickedStatus.style.left = "100px";
                    bm.pickedStatus.style.opacity = "0";
                    bm.pickedStatus.style.backgroundColor = "rgba(0,0,0,0)";
                    setTimeout(function() {
                        bm.pickedStatus.style.opacity = "1";
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
                    bm.overlay.style.opacity = "0.5";
                    bm.metadata.style.opacity = "1";
                    bm.difficulty.style.opacity = "1";
                    bm.stats.style.opacity = "1";
                    bm.bg.style.opacity = "1";
                    bm.pickedStatus.style.textShadow = "0 0 0 rgba(0,0,0,0)";
                    setTimeout(function() {
                        bm.pickedStatus.style.opacity = "1";
                        bm.pickedStatus.innerHTML = "Picked";
                    }, 150);
                }
            });
        });
        const mapData = await getDataSet(beatmap.beatmapId);
        bm.map.style.backgroundImage = `url('https://assets.ppy.sh/beatmaps/${mapData.beatmapset_id}/covers/cover.jpg')`;
        bm.metadata.innerHTML = mapData.artist + ' - ' + mapData.title;
        bm.difficulty.innerHTML = `[${mapData.version}]` + '&emsp;&emsp;Mapper: ' + mapData.creator;
        bm.stats.innerHTML = "CS: " + mapData.diff_size + '&emsp;AR: ' + mapData.diff_approach + '&emsp;OD: ' + mapData.diff_overall + '&emsp;HP: ' + mapData.diff_drain + '&emsp;Star Rating: ' + parseFloat(mapData.difficultyrating).toFixed(2) + '*';
        beatmaps.add(bm);
    });
}

async function getDataSet(beatmapID) {
    try {
        const data = (
            await axios.get("/get_beatmaps", {
                baseURL: "https://osu.ppy.sh/api",
                params: {
                    k: api,
                    b: beatmapID,
                },
            })
        )["data"];
        return data.length !== 0 ? data[0] : null;
    } catch (error) {
        console.error(error);
    }
};