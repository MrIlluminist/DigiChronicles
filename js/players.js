var db = null;
var player = 1;
const deckColors = ['Red', 'Blue', 'Yellow', 'Green', 'Black', 'Purple', 'White', 'Multicolor'];
const winrateColors = ['Wins', 'Draws', 'Losses'];
const packLabels = ['Packs', 'Display'];
var deckColorCodes = ['#e7012c', '#0195dd', '#fce100', '#009c6a', '#211617', '#6457a7', '#ffffff', '#ff99cc'];
var winrateColorCodes = ['#009c6a', '#fce100', '#e7012c'];
var packColorCodes = ['#a4ff80ff', '#6d77fdff'];
var playedColors = [];
var winsDrawsLosses = [0, 0, 0];
var packs = [0, 24];
var playedColorChart = null;
var winrateChart = null;
var packChart = null;
loadDB();
async function loadDB(){
    const sqlPromise = initSqlJs();
    const dataPromise = fetch("https://mrilluminist.github.io/DigiChronicles/assets/data/DigiChronicles.db").then(res => res.arrayBuffer());
    const [SQL, buf] = await Promise.all([sqlPromise, dataPromise]);
    db = new SQL.Database(new Uint8Array(buf));
    listPlayers();
    getPlayedTournaments();
    getPlayedColors();
    getWinrate();
    getPacks();
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
    getWinrate();
    getPacks();
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

function getWinrate(){
    winsDrawsLosses = [0, 0, 0];
    var wins = 0;
    var draws = 0;
    var losses = 0;
    const resultstmt = db.prepare(
        "SELECT wins, draws, losses FROM results WHERE player=" + player
    );
    while (resultstmt.step()) {
            wins += resultstmt.get()[0];
            draws += resultstmt.get()[1];
            losses += resultstmt.get()[2];
    }
    resultstmt.free();
    winsDrawsLosses[0] = wins;
    winsDrawsLosses[1] = draws;
    winsDrawsLosses[2] = losses;

    const winratechart = document.getElementById("winrateChart");
    winratechart.value = 0;
    if (winrateChart != null) {
        winrateChart.destroy();
    }
    winrateChart = new Chart(winratechart,{
        type: 'doughnut',
        options: {
            title: {
                text: 'Overall Winrate',
                display: true
            }
        },
        data:{
            labels: winrateColors,
            datasets: [{
                data: winsDrawsLosses,
                backgroundColor: winrateColorCodes
            }]
        }
    })
}

function getPacks(){
    packs = [0, 24];
    const packstmt = db.prepare(
        "SELECT savedPacks FROM players WHERE playerID=" + player
    );
    while (packstmt.step()) {
            packs[0] = packstmt.get()[0];
    }

    const packchart = document.getElementById("packChart");
    packchart.value = 0;
    if (packChart != null) {
        packChart.destroy();
    }
    packChart = new Chart(packchart,{
        type: 'bar',
        options: {
            title: {
                text: 'Saved Packs',
                display: true
            }
        },
        data:{
            labels: packLabels,
            datasets: [{
                label: 'Saved Packs',
                data: packs,
                backgroundColor: packColorCodes
            }]
        }
    })
}