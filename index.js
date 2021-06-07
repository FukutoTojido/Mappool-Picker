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

/*let bg = document.createElement("bg");
bg.style.cssText = "position: absolute; top: 0px; left: 0px; width: 1920px; height: 540px; background-color: #fff; color: #161616";
document.getElementById("main").appendChild(bg);*/

function ObjectReturn(user, data, mapid) {
    let getUser = async() => {
        try {
            const response = await axios.get("/get_beatmaps", {
                baseURL: "https://osu.ppy.sh/api",
                params: {
                    k: `${api}`,
                    b: `${mapid}`,
                },
            });
            return response.data[0];
        } catch (error) {
            console.error(error);
        }
    };
    Promise.resolve(getUser()).then((data) => Object.assign(user, data));

    return user.beatmapset_id;
};

class Map {
    constructor(modid, mapid, width, height, top, left, layer) {
        this.modid = modid;
        this.mapid = mapid;
        this.width = width;
        this.height = height;
        this.top = top;
        this.left = left;
    }
    generate() {
        this.bg = document.createElement(this.layer);
        this.map = document.createElement(this.layer + "PR");
        this.bg.style.cssText = `position: absolute; top: ${this.top}px; left: ${this.left}px; width: ${this.width}px; height: ${this.height}px; background-color: #fff; color: #161616`;
        this.map.style.cssText = `position: absolute; top: ${this.top}px; left: ${this.left}px; width: ${this.width}px; height: ${this.height / 2}px; background-color: #161616; color: #161616`;
        document.getElementById("main").appendChild(this.bg);
        document.getElementById("main").appendChild(this.map);
    }
}

let map1 = new Map(1, 3015905, 960, 540, 0, "map1");
map1.generate();
/*let map2 = new Map(1, 827488, 500, 500, 500, 500, "map2");
map2.generate();*/

socket.onmessage = event => {
    let data = JSON.parse(event.data);

    map1.map.style.backgroundImage = `url('https://assets.ppy.sh/beatmaps/${ObjectReturn(user, data, map1.mapid)}/covers/cover.jpg')`;
    //map2.map.style.backgroundImage = `url('https://assets.ppy.sh/beatmaps/${ObjectReturn(user, data, map2.mapid)}/covers/cover.jpg')`;
    //bg.style.backgroundImage = `url('https://assets.ppy.sh/beatmaps/${ObjectReturn(user, data, 3015906)}/covers/cover.jpg')`;
    //bg.innerHTML = ObjectReturn(user, data, 1848250);

    if (tempImg !== data.menu.bm.path.full) {
        tempImg = data.menu.bm.path.full;
        data.menu.bm.path.full = data.menu.bm.path.full.replace(/#/g, '%23').replace(/%/g, '%25').replace(/\\/g, '/');
        nowPlayingContainer.style.backgroundImage = `url('http://127.0.0.1:24050/Songs/${data.menu.bm.path.full}?a=${Math.random(10000)}')`;
    }
    if (tempMapID !== data.menu.bm.id) {
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