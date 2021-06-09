window.addEventListener("contextmenu", (e) => e.preventDefault());

const file = [];
let api;
async function getAPI() {
    try {
        const jsonData = await $.getJSON("api.json");
        jsonData.map((num) => {
            file.push(num);
        });
        api = file[0].api;
    } catch (error) {
        console.error("Could not read JSON file", error);
    }
};
getAPI();


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

// Avatar
let avaLeft = document.getElementById("avatarLeft");
let avaRight = document.getElementById("avatarRight");
let avaSet = 0;

const beatmaps = new Set(); // Store beatmapID;

socket.onopen = () => {
    console.log("Successfully Connected");
};

socket.onclose = (event) => {
    console.log("Socket Closed Connection: ", event);
    socket.send("Client Closed!");
};

socket.onerror = (error) => {
    console.log("Socket Error: ", error);
};

let tempUID;

let tempMapID, tempImg, tempMapArtist, tempMapTitle, tempMapDiff, tempMapper;

let tempSR, tempCS, tempAR, tempOD, tempHP;

let scoreLeftTemp, scoreRightTemp;
let teamNameLeftTemp, teamNameRightTemp;

let gameState;

let chatLen = 0;
let tempClass = "unknown";

let hasSetup = false;

let scoreLeft = [];
let scoreRight = [];

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
        this.modIcon = document.createElement("div");
        this.pickedStatus = document.createElement("div");

        this.bg.id = this.layerName;
        this.map.id = `${this.layerName}BG`;
        this.overlay.id = `${this.layerName}Overlay`;
        this.metadata.id = `${this.layerName}META`;
        this.difficulty.id = `${this.layerName}DIFF`;
        this.stats.id = `${this.layerName}Stats`;
        this.modIcon.id = `${this.layerName}ModIcon`;
        this.pickedStatus.id = `${this.layerName}STATUS`;

        this.metadata.setAttribute("class", "mapInfo");
        this.difficulty.setAttribute("class", "mapInfo");
        this.map.setAttribute("class", "map");
        this.pickedStatus.setAttribute("class", "pickingStatus");
        this.overlay.setAttribute("class", "overlay");
        this.bg.setAttribute("class", "statBG");
        this.modIcon.setAttribute("class", "modIcon");
        this.modIcon.style.backgroundImage = `url("./static/${this.mods}.png")`;
        this.clicker.setAttribute("class", "clicker");
        clickerObj.appendChild(this.map);
        document.getElementById(this.map.id).appendChild(this.overlay);
        document.getElementById(this.map.id).appendChild(this.metadata);
        document.getElementById(this.map.id).appendChild(this.difficulty);
        clickerObj.appendChild(this.pickedStatus);
        clickerObj.appendChild(this.bg);
        clickerObj.appendChild(this.stats);
        clickerObj.appendChild(this.modIcon);

        this.clicker.style.transform = "translateY(0)";
    }
    grayedOut() {
        this.overlay.style.opacity = '1';
    }
}

let bestOfTemp;
let scoreVisibleTemp;
let starsVisibleTemp;

let team1 = "Red",
    team2 = "Blue";

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
        mapInfo.innerHTML = `${tempMapDiff}` + '&emsp;&emsp;&emsp;&emsp;' + 'Mapper: ' + tempMapper;
        stats.innerHTML = 'CS: ' + tempCS + '&emsp;' + 'AR: ' + tempAR + '&emsp;' + 'OD: ' + tempOD + '&emsp;' + 'HP: ' + tempHP + '&emsp;' + 'Star Rating: ' + tempSR + '*';
    }

    if (starsVisibleTemp !== data.tourney.manager.bools.starsVisible) {
        starsVisibleTemp = data.tourney.manager.bools.starsVisible;
        if (starsVisibleTemp) {
            document.getElementById("scoreContainerLeft").style.opacity = "1";
            document.getElementById("scoreContainerRight").style.opacity = "1";
        } else {
            document.getElementById("scoreContainerLeft").style.opacity = "0";
            document.getElementById("scoreContainerRight").style.opacity = "0";
        }
    }

    if (bestOfTemp !== data.tourney.manager.bestOF) {
        bestOfTemp = data.tourney.manager.bestOF;
        containerLeft = document.getElementById("scoreContainerLeft");
        containerRight = document.getElementById("scoreContainerRight");
        containerLeft.innerHTML = '';
        containerRight.innerHTML = '';
        for (var counter = 0; counter < Math.ceil(bestOfTemp / 2); counter++) {
            scoreLeft[counter] = document.createElement("div");
            scoreLeft[counter].id = `scoreLeft${counter}`;
            scoreLeft[counter].setAttribute("class", "scoreLeft");
            containerLeft.appendChild(scoreLeft[counter]);

            scoreRight[counter] = document.createElement("div");
            scoreRight[counter].id = `scoreRight${counter}`;
            scoreRight[counter].setAttribute("class", "scoreRight");
            containerRight.appendChild(scoreRight[counter]);
        }
    }

    if (scoreLeftTemp !== data.tourney.manager.stars.left) {
        scoreLeftTemp = data.tourney.manager.stars.left;
        for (var i = 0; i < Math.ceil(bestOfTemp / 2); i++) {
            if (i < scoreLeftTemp) {
                scoreLeft[Math.ceil(bestOfTemp / 2) - 1 - i].style.backgroundColor = "#161616";
                scoreLeft[Math.ceil(bestOfTemp / 2) - 1 - i].style.borderColor = "#fff";
            } else if (i >= scoreLeftTemp) {
                scoreLeft[Math.ceil(bestOfTemp / 2) - 1 - i].style.backgroundColor = "white";
                scoreLeft[Math.ceil(bestOfTemp / 2) - 1 - i].style.borderColor = "#999";
            }
        }
    }

    if (scoreRightTemp !== data.tourney.manager.stars.right) {
        scoreRightTemp = data.tourney.manager.stars.right;
        for (var i = 0; i < Math.ceil(bestOfTemp / 2); i++) {
            if (i < scoreRightTemp) {
                scoreRight[i].style.backgroundColor = "#161616";
                scoreRight[i].style.borderColor = "#fff";
            } else if (i >= scoreRightTemp) {
                scoreRight[i].style.backgroundColor = "white";
                scoreRight[i].style.borderColor = "#999";
            }
        }
    }

    if (teamNameLeftTemp !== data.tourney.manager.teamName.left) {
        teamNameLeftTemp = data.tourney.manager.teamName.left.toUpperCase();
        teamLeftName.innerHTML = teamNameLeftTemp;
    }
    if (teamNameRightTemp !== data.tourney.manager.teamName.right) {
        teamNameRightTemp = data.tourney.manager.teamName.right.toUpperCase();
        teamRightName.innerHTML = teamNameRightTemp;
    }

    if (!avaSet) {
        avaSet = 1;
        if (teamNameLeftTemp !== "" || teamNameRightTemp !== "") {
            setAvatar(avaLeft, teamNameLeftTemp);
            setAvatar(avaRight, teamNameRightTemp);
        } else if (teamNameLeftTemp == "" || teamNameRight == "") {
            avaLeft.style.backgroundImage = "url('./static/left.png')";
            avaRight.style.backgroundImage = "url('./static/right.png')";
        }
    }

    if (data.tourney.manager.teamName.left !== "" && data.tourney.manager.teamName.right !== "") {
        team1 = data.tourney.manager.teamName.left;
        team2 = data.tourney.manager.teamName.right;
    }

    if (!scoreVisibleTemp) {
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
};

async function setupBeatmaps() {
    hasSetup = true;

    const modsCount = {
        NM: 0,
        HD: 0,
        HR: 0,
        DT: 0,
        FM: 0,
        TB: 0,
    };

    const bms = [];
    try {
        const jsonData = await $.getJSON("beatmaps.json");
        jsonData.map((beatmap) => {
            bms.push(beatmap);
        });
    } catch (error) {
        console.error("Could not read JSON file", error);
    }

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
        };
        bm.clicker.onmouseleave = function() {
            bm.clicker.style.transform = "translateY(0px)";
        };
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
        bm.bg.innerHTML = "CS: " + mapData.diff_size + '&emsp;AR: ' + mapData.diff_approach + '&emsp;OD: ' + mapData.diff_overall + '&emsp;HP: ' + mapData.diff_drain + '&emsp;SR: ' + parseFloat(mapData.difficultyrating).toFixed(2) + '*';
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

async function setAvatar(element, username) {
    const data = await getUserDataSet(username);
    element.style.backgroundImage = `url("http://s.ppy.sh/a/${data.user_id}")`;
}

async function getUserDataSet(name) {
    try {
        const data = (
            await axios.get("/get_user", {
                baseURL: "https://osu.ppy.sh/api",
                params: {
                    k: api,
                    u: name,
                },
            })
        )["data"];
        return data.length !== 0 ? data[0] : null;
    } catch (error) {
        console.error(error);
    }
};