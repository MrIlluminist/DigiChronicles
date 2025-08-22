var db = null;
var player = 1;
const deckColors = ['Red', 'Blue', 'Yellow', 'Green', 'Black', 'Purple', 'White', 'Multicolor'];
var deckColorCodes = ['#e7012c', '#0195dd', '#fce100', '#009c6a', '#211617', '#6457a7', '#ffffff', '#ff99cc'];
var playedColors = [];
var playedColorChart = null;
loadDB();
async function loadDB(){
    const sqlPromise = initSqlJs();
    const dataPromise = fetch("https://mrilluminist.github.io/DigiChronicles/assets/data/DigiChronicles.db").then(res => res.arrayBuffer());
    const [SQL, buf] = await Promise.all([sqlPromise, dataPromise]);
    db = new SQL.Database(new Uint8Array(buf));
    listPlayers();
    getPlayedTournaments();
    getPlayedColors();
}

function listPlayers(){
    const stmt = db.prepare(
        "SELECT * FROM players"
    );
    const playerselect = document.getElementById("playerselect");
    var opt = [];
    while (stmt.step()) {
        let player = stmt.get();
        opt.push("<option value=" + player[0] + ">" + player[1] +"</option>");
    }
    playerselect.innerHTML = opt.join();
    const playerName = document.getElementById("playerName");
    playerName.textContent = playerselect.options[playerselect.selectedIndex].text;
    stmt.free();
}

function changePlayer(){
    const playerselect = document.getElementById("playerselect");
    const playerName = document.getElementById("playerName");
    player = playerselect.value;
    playerName.textContent = playerselect.options[playerselect.selectedIndex].text;
    getPlayedTournaments();
    getPlayedColors();
}

function getPlayedTournaments(){
    const playerstmt = db.prepare(
        "SELECT * FROM results WHERE player=" + player
    );
    const playedTournaments = document.getElementById("playedTournaments");
    var playedTournamentCount = 0;
    while (playerstmt.step()) {
        playedTournamentCount+=1;
    }
    playedTournaments.textContent = "Played Tournaments: " + playedTournamentCount;
    playerstmt.free();
    const totalstmt = db.prepare(
        "SELECT * FROM tournaments"
    );
    const appearanceRate = document.getElementById("appearanceRate");
    var totalTournamentCount = 0;
    while (totalstmt.step()) {
        totalTournamentCount+=1;
    }
    var appearance = 100/totalTournamentCount*playedTournamentCount;
    appearanceRate.textContent = "Appearance Rate: " + appearance.toPrecision(4) + "%";
    totalstmt.free();
}

function initializeCharts(){
    const colorchart = document.getElementById("colorChart");
    colorchart.value = 0;
    playedColorChart = new Chart(colorchart,{
        type: 'bar',
        data:{
            labels: deckColors,
            datasets: [{
                label: 'Tournaments played',
                data: playedColors,
                backgroundColor: deckColorCodes
            }]
        }
    })
}

function getPlayedColors(){
    playedColors = [];
    deckColors.forEach(color => { 
        const colorstmt = db.prepare(
            "SELECT deckID FROM decks WHERE color LIKE '%" + color + "%'"
        );
        var colorDecks = [];
        while (colorstmt.step()) {
            colorDecks.push(colorstmt.get()[0]);
        }
        var colorCount = 0;
        colorDecks.forEach(deck => {
            const deckstmt = db.prepare(
                "SELECT * FROM results WHERE deck=" + deck + " AND player=" + player
            );
            while (deckstmt.step()) {
                colorCount+=1;
            }
            deckstmt.free();
        });
        playedColors.push(colorCount);
        colorstmt.free();
    });
    const colorchart = document.getElementById("colorChart");
    colorchart.value = 0;
    if (playedColorChart != null) {
        playedColorChart.destroy();
    }
    playedColorChart = new Chart(colorchart,{
        type: 'polarArea',
        options: {
            title: {
                text: 'Decks played by color',
                display: true
            }
        },
        data:{
            labels: deckColors,
            datasets: [{
                label: 'Tournaments played',
                data: playedColors,
                backgroundColor: deckColorCodes
            }]
        }
    })
}