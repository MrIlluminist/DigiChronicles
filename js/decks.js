var db = null;
loadDB();
async function loadDB(){
    const sqlPromise = initSqlJs();
    const dataPromise = fetch("../assets/data/DigiChronicles.db").then(res => res.arrayBuffer());
    const [SQL, buf] = await Promise.all([sqlPromise, dataPromise]);
    db = new SQL.Database(new Uint8Array(buf));
    listDecks();
}

function listDecks(){
    const stmt = db.prepare("SELECT * FROM decks");

    while (stmt.step()) {
        let deck = stmt.get();
        console.log(deck);
    }

    stmt.free();
}