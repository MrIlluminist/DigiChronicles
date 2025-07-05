var db = null;
var player = 1;
loadDB();
async function loadDB(){
    const sqlPromise = initSqlJs();
    const dataPromise = fetch("../assets/data/DigiChronicles.db").then(res => res.arrayBuffer());
    const [SQL, buf] = await Promise.all([sqlPromise, dataPromise]);
    db = new SQL.Database(new Uint8Array(buf));
    listPlayers();
    getPlayedTournaments()
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
    getPlayedTournaments()
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