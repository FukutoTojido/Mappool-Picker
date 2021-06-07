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

let isCalled = false;

/*let bg = document.createElement("bg");
bg.style.cssText = "position: absolute; top: 0px; left: 0px; width: 1920px; height: 540px; background-color: #fff; color: #161616";
document.getElementById("main").appendChild(bg);*/

class Map {
    constructor(modid, mapid, top, left, layerName) {
        this.modid = modid;
        this.mapid = mapid;
        this.top = top;
        this.left = left;
        this.layerName = layerName;
        this.user = {};
    }
    generate() {
        this.bg = document.createElement(this.layerName);
        this.map = document.createElement(`${this.layerName}BG`);
        this.overlay = document.createElement(`${this.layerName}Overlay`);
        this.metadata = document.createElement(`${this.layerName}META`);
        this.difficulty = document.createElement(`${this.layerName}DIFF`);
        this.metadata.style.cssText = `position: absolute; top: ${this.top + 30}px; left: ${this.left + 20}px; width: 500px; color: #fff; font-family: Exo2; font-size: 15px; line-height: 30px; text-shadow: 0 2px 3px black;`;
        this.difficulty.style.cssText = `position: absolute; top: ${this.top + 50}px; left: ${this.left + 20}px; width: 500px; color: #fff; font-family: Exo2; font-size: 15px; line-height: 30px; text-shadow: 0 2px 3px black;`;
        this.map.style.cssText = `position: absolute; top: ${this.top}px; left: ${this.left}px; width: 500px; height: 100px; background-color: #161616; background-size: 100%; background-position: center center; color: #161616; border-radius: 10px; box-shadow: 0px 5px 20px -3px black;`;
        this.overlay.style.cssText = `position: absolute; top: ${this.top}px; left: ${this.left}px; width: 500px; height: 100px; background-color: #000; border-radius: 10px; opacity: 40%`;
        this.bg.style.cssText = `position: absolute; top: ${this.top + 85}px; left: ${this.left + 250}px; width: 250px; height: 30px; background-color: #161616; color: #fff; border-radius: 15px; box-shadow: 0px 5px 20px -3px black;`;
        document.getElementById("main").appendChild(this.map);
        document.getElementById("main").appendChild(this.overlay);
        document.getElementById("main").appendChild(this.metadata);
        document.getElementById("main").appendChild(this.difficulty);
        document.getElementById("main").appendChild(this.bg);
    }
}

let map1 = new Map(1, 3015906, 50, 105, "map1");
map1.generate();
let map2 = new Map(1, 3021758, 50, 710, "map2");
map2.generate();
let map3 = new Map(1, 2994883, 50, 1315, "map3");
map3.generate();
let map4 = new Map(1, 2747949, 180, 105, "map4");
map4.generate();
let map5 = new Map(1, 2943226, 310, 105, "map5");
map5.generate();

socket.onmessage = async(event) => {
    let data = JSON.parse(event.data);

    if (!isCalled) {
        isCalled = true;

        const map1_api = await ObjectReturn(map1.mapid);
        const map2_api = await ObjectReturn(map2.mapid);
        const map3_api = await ObjectReturn(map3.mapid);
        const map4_api = await ObjectReturn(map4.mapid);
        const map5_api = await ObjectReturn(map5.mapid);

        map1.map.style.backgroundImage = `url('https://assets.ppy.sh/beatmaps/${map1_api.beatmapset_id}/covers/cover.jpg')`;
        map2.map.style.backgroundImage = `url('https://assets.ppy.sh/beatmaps/${map2_api.beatmapset_id}/covers/cover.jpg')`;
        map3.map.style.backgroundImage = `url('https://assets.ppy.sh/beatmaps/${map3_api.beatmapset_id}/covers/cover.jpg')`;
        map4.map.style.backgroundImage = `url('https://assets.ppy.sh/beatmaps/${map4_api.beatmapset_id}/covers/cover.jpg')`;
        map5.map.style.backgroundImage = `url('https://assets.ppy.sh/beatmaps/${map5_api.beatmapset_id}/covers/cover.jpg')`;

        map1.metadata.innerHTML = map1_api.artist + ' - ' + map1_api.title;
        map1.difficulty.innerHTML = "Difficulty: " + map1_api.version + '&emsp;&emsp;Mapper: ' + map1_api.creator;
        map2.metadata.innerHTML = map2_api.artist + ' - ' + map2_api.title;
        map2.difficulty.innerHTML = "Difficulty: " + map2_api.version + '&emsp;&emsp;Mapper: ' + map2_api.creator;
    }
    //bg.style.backgroundImage = `url('https://assets.ppy.sh/beatmaps/${ObjectReturn(user, data, 3015906)}/covers/cover.jpg')`;
    //bg.innerHTML = ObjectReturn(user, data, 1848250);

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

async function ObjectReturn(mapid) {
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