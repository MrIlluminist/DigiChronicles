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
    getMostPlayedDecks();
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
    getMostPlayedDecks();
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
    if (appearance %1 == 0) {
    }
    else if (appearance >= 10) {
        appearance = appearance.toPrecision(4);
    }
    else{
        appearance = appearance.toPrecision(3);
    }
    appearanceRate.textContent = "Appearance Rate: " + appearance + "%";
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

function getMostPlayedDecks(){
    const deck1Label = document.getElementById("deck1");
    const deck2Label = document.getElementById("deck2");
    const deck3Label = document.getElementById("deck3");

    const mostPlayedDeckstmt = db.prepare(
        "SELECT deck FROM results WHERE player=" + player
    );
    var playedDecks = [];
    var playedDecksCount = [];
    while (mostPlayedDeckstmt.step()) {
        var playedDeck = 0;
        playedDeck = mostPlayedDeckstmt.get()[0];
        if (!playedDecks.includes(playedDeck)) {
            playedDecks.push(playedDeck);
            playedDecksCount.push(0);
        }
        var index;
        index = playedDecks.indexOf(playedDeck);
        playedDecksCount[index] += 1;
    }
    mostPlayedDeckstmt.free();

    var mostplayedDecks = [];
    for (let i = 0; i < 3; i++) {
        var mostTournaments = 0;
        playedDecksCount.forEach(count => {
            if (count > mostTournaments) {
                mostTournaments = count;
            }
        });
        var deckIndex = playedDecksCount.indexOf(mostTournaments);
        if (mostTournaments != 0) {
            mostplayedDecks.push(playedDecks[deckIndex]);
        }
        else{
            mostplayedDecks.push(-1);
        }
        playedDecksCount.splice(deckIndex, 1);
        playedDecks.splice(deckIndex, 1);
    };

    var deck1Name = getDeckName(mostplayedDecks[0]);
    var deck2Name = getDeckName(mostplayedDecks[1]);;
    var deck3Name = getDeckName(mostplayedDecks[2]);;
    deck1Label.textContent = "";
    deck2Label.textContent = "";
    deck3Label.textContent = "";
    if (mostplayedDecks[0] != -1) {
        deck1Label.textContent = deck1Name + " Winrate: " + getDeckWinrate(mostplayedDecks[0]) + "% Tournaments: " + getTournamentsPlayedwithDeck(mostplayedDecks[0]);
    }
    if (mostplayedDecks[1] != -1) {
        deck2Label.textContent = deck2Name + " Winrate: " + getDeckWinrate(mostplayedDecks[1]) + "% Tournaments: " + getTournamentsPlayedwithDeck(mostplayedDecks[1]);
    }
    if (mostplayedDecks[2] != -1) {
        deck3Label.textContent = deck3Name + " Winrate: " + getDeckWinrate(mostplayedDecks[2]) + "% Tournaments: " + getTournamentsPlayedwithDeck(mostplayedDecks[2]);
    }
}

function getDeckName(deckID){
    const deckstmt = db.prepare(
        "SELECT name FROM decks WHERE deckID=" + deckID
    );
    var deckName;
    while (deckstmt.step()) {
            deckName = deckstmt.get()[0];
    }
    deckstmt.free();
    return deckName;
}

function getDeckWinrate(deckID){
    const deckwrstmt = db.prepare(
        "SELECT wins, draws, losses FROM results WHERE deck=" + deckID + " AND player=" + player
    );
    var wins = 0;
    var draws = 0;
    var losses = 0;
    var totalGames = 0;
    while (deckwrstmt.step()) {
        wins += deckwrstmt.get()[0];
        draws += deckwrstmt.get()[1];
        losses += deckwrstmt.get()[2];
    }
    deckwrstmt.free();
    totalGames = wins + draws + losses;
    var winrate;
    winrate = 100/totalGames*wins;
    if (winrate %1 == 0) {
    }
    else if (winrate >= 10) {
        winrate = winrate.toPrecision(4);
    }
    else{
        winrate = winrate.toPrecision(3);
    }
    return winrate;
}

function getTournamentsPlayedwithDeck(deckID){
    const deckstmt = db.prepare(
        "SELECT tournament FROM results WHERE deck=" + deckID + " AND player=" + player
    );
    var tournamentsPlayed = 0;
    while (deckstmt.step()) {
        tournamentsPlayed++;
    }
    deckstmt.free();
    return tournamentsPlayed;
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

    const winrateLabel = document.getElementById("winrate");
    var winrate = 0;
    var totalGames = wins + draws + losses;
    winrate = 100/totalGames*wins;
    if (winrate %1 == 0) {
    }
    else if (winrate >= 10) {
        winrate = winrate.toPrecision(4);
    }
    else{
        winrate = winrate.toPrecision(3);
    }
    winrateLabel.textContent = "Winrate: " + winrate + "%";
}

function getPacks(){
    packs = [0, 24];
    const packstmt = db.prepare(
        "SELECT savedPacks FROM players WHERE playerID=" + player
    );
    while (packstmt.step()) {
            packs[0] = packstmt.get()[0];
    }
    packstmt.free();

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