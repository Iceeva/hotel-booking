const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../../hotel.db');

let db = null;

async function initDb() {
  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  createSchema();
  seedData();
  saveDb();
  return db;
}

function saveDb() {
  if (!db) return;
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

function createSchema() {
  db.run(`
    CREATE TABLE IF NOT EXISTS rooms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      number TEXT NOT NULL UNIQUE,
      type TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      price_per_night REAL NOT NULL,
      capacity INTEGER NOT NULL DEFAULT 2,
      floor INTEGER NOT NULL DEFAULT 1,
      amenities TEXT DEFAULT '[]',
      images TEXT DEFAULT '[]',
      is_available INTEGER NOT NULL DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS guests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      phone TEXT,
      nationality TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      room_id INTEGER NOT NULL,
      guest_id INTEGER NOT NULL,
      check_in TEXT NOT NULL,
      check_out TEXT NOT NULL,
      adults INTEGER NOT NULL DEFAULT 1,
      children INTEGER NOT NULL DEFAULT 0,
      total_price REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'confirmed',
      special_requests TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      name_fr TEXT NOT NULL,
      name_ar TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      category TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS chat_sessions (
      id TEXT PRIMARY KEY,
      language TEXT DEFAULT 'fr',
      created_at TEXT DEFAULT (datetime('now')),
      last_activity TEXT DEFAULT (datetime('now'))
    );
  `);
}

function seedData() {
  const roomCount = queryOne('SELECT COUNT(*) as c FROM rooms');
  if (roomCount.c === 0) {
    const rooms = [
      ['101','standard','Chambre Standard Vue Jardin','Chambre confortable avec vue sur le jardin tropical',75,2,1,
        JSON.stringify(['WiFi','Climatisation','TV','Minibar']),
        JSON.stringify(['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800'])],
      ['102','standard','Chambre Standard Vue Piscine','Chambre élégante avec vue directe sur la piscine',85,2,1,
        JSON.stringify(['WiFi','Climatisation','TV','Coffre-fort']),
        JSON.stringify(['https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800'])],
      ['201','deluxe','Chambre Deluxe Supérieure','Chambre spacieuse avec balcon et vue panoramique',140,2,2,
        JSON.stringify(['WiFi','Climatisation','TV 4K','Minibar','Jacuzzi','Balcon']),
        JSON.stringify(['https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800'])],
      ['202','deluxe','Chambre Deluxe Familiale','Grande chambre pour familles avec deux lits',165,4,2,
        JSON.stringify(['WiFi','Climatisation','TV','Minibar','Baignoire']),
        JSON.stringify(['https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800'])],
      ['301','suite','Suite Junior Prestige','Suite élégante avec salon séparé',260,2,3,
        JSON.stringify(['WiFi Fibre','Climatisation','TV 55"','Minibar Premium','Jacuzzi','Terrasse']),
        JSON.stringify(['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800'])],
      ['401','presidential','Suite Présidentielle Royal','L\'excellence absolue avec service butler 24h/24',650,4,4,
        JSON.stringify(['WiFi Fibre','Climatisation Multi-zones','TV 75"','Bar complet','Spa privé','Terrasse panoramique','Butler 24h']),
        JSON.stringify(['https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800'])],
    ];
    rooms.forEach(r => {
      db.run('INSERT INTO rooms (number,type,name,description,price_per_night,capacity,floor,amenities,images) VALUES (?,?,?,?,?,?,?,?,?)', r);
    });
  }

  const svcCount = queryOne('SELECT COUNT(*) as c FROM services');
  if (svcCount.c === 0) {
    const services = [
      ['Breakfast','Petit-déjeuner buffet','وجبة الإفطار','Buffet international 7h-10h',18,'restaurant'],
      ['Airport Transfer','Transfert aéroport','نقل المطار','Navette VIP vers/depuis l\'aéroport',45,'transport'],
      ['Spa Access','Accès Spa & Hammam','دخول السبا','Accès piscine, hammam, sauna',35,'wellness'],
      ['Laundry','Service blanchisserie','خدمة الغسيل','Pressing et livraison en 24h',25,'service'],
      ['Room Service 24h','Room Service 24h','خدمة الغرف','Repas servis en chambre toute la nuit',10,'restaurant'],
      ['City Tour','Excursion en ville','جولة المدينة','Visite guidée des sites touristiques',60,'tour'],
    ];
    services.forEach(s => {
      db.run('INSERT INTO services (name,name_fr,name_ar,description,price,category) VALUES (?,?,?,?,?,?)', s);
    });
  }
}

// ─── Query Helpers ────────────────────────────────────────────
function queryAll(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  return rows;
}

function queryOne(sql, params = []) {
  const rows = queryAll(sql, params);
  return rows[0] || null;
}

function run(sql, params = []) {
  db.run(sql, params);
  saveDb();
  // Return last insert rowid
  const rowid = queryOne('SELECT last_insert_rowid() as id');
  return { lastInsertRowid: rowid ? rowid.id : null, changes: db.getRowsModified() };
}

function getDb() { return { queryAll, queryOne, run, saveDb }; }

module.exports = { initDb, getDb };
