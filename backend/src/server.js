const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const { initDb, getDb } = require('./database');
const { processMessage } = require('./chatbot');

const app = express();
app.use(cors());
app.use(express.json());

// ─── Health ─────────────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ status: 'ok', hotel: 'Royal Palm' }));

// ─── Rooms ──────────────────────────────────────────────────
app.get('/api/rooms', (req, res) => {
  try {
    const { queryAll } = getDb();
    let sql = 'SELECT * FROM rooms WHERE 1=1';
    const params = [];
    if (req.query.type)      { sql += ' AND type = ?'; params.push(req.query.type); }
    if (req.query.available !== undefined) { sql += ' AND is_available = ?'; params.push(req.query.available === 'true' ? 1 : 0); }
    sql += ' ORDER BY price_per_night ASC';
    const rooms = queryAll(sql, params).map(r => ({ ...r, amenities: JSON.parse(r.amenities||'[]'), images: JSON.parse(r.images||'[]'), is_available: r.is_available === 1 }));
    res.json({ success: true, data: rooms });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

app.get('/api/rooms/:id', (req, res) => {
  try {
    const { queryOne } = getDb();
    const room = queryOne('SELECT * FROM rooms WHERE id = ?', [req.params.id]);
    if (!room) return res.status(404).json({ success: false, error: 'Room not found' });
    room.amenities = JSON.parse(room.amenities||'[]');
    room.images = JSON.parse(room.images||'[]');
    room.is_available = room.is_available === 1;
    res.json({ success: true, data: room });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

app.post('/api/rooms/check-availability', (req, res) => {
  try {
    const { queryOne } = getDb();
    const { room_id, check_in, check_out } = req.body;
    if (!room_id || !check_in || !check_out) return res.status(400).json({ success: false, error: 'Missing fields' });
    const conflict = queryOne("SELECT id FROM bookings WHERE room_id = ? AND status NOT IN ('cancelled','checked_out') AND check_in < ? AND check_out > ?", [room_id, check_out, check_in]);
    res.json({ success: true, available: !conflict });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

// ─── Bookings ────────────────────────────────────────────────
app.get('/api/bookings', (req, res) => {
  try {
    const { queryAll } = getDb();
    const bookings = queryAll(`SELECT b.*, r.name as room_name, r.type as room_type, r.number as room_number, g.first_name, g.last_name, g.email, g.phone FROM bookings b JOIN rooms r ON b.room_id = r.id JOIN guests g ON b.guest_id = g.id ORDER BY b.created_at DESC`);
    res.json({ success: true, data: bookings });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

app.post('/api/bookings', (req, res) => {
  try {
    const { queryOne, run } = getDb();
    const { room_id, check_in, check_out, adults, children, special_requests, guest } = req.body;
    if (!room_id || !check_in || !check_out || !guest?.email) return res.status(400).json({ success: false, error: 'Missing required fields' });

    const conflict = queryOne("SELECT id FROM bookings WHERE room_id = ? AND status NOT IN ('cancelled','checked_out') AND check_in < ? AND check_out > ?", [room_id, check_out, check_in]);
    if (conflict) return res.status(409).json({ success: false, error: 'Room not available for selected dates' });

    let guestRow = queryOne('SELECT id FROM guests WHERE email = ?', [guest.email]);
    if (!guestRow) {
      const r = run('INSERT INTO guests (first_name, last_name, email, phone, nationality) VALUES (?,?,?,?,?)', [guest.first_name, guest.last_name, guest.email, guest.phone||null, guest.nationality||null]);
      guestRow = { id: r.lastInsertRowid };
    }

    const room = queryOne('SELECT price_per_night FROM rooms WHERE id = ?', [room_id]);
    const nights = Math.ceil((new Date(check_out) - new Date(check_in)) / 86400000);
    const total_price = room.price_per_night * nights;
    const booking_id = uuidv4();

    run('INSERT INTO bookings (id, room_id, guest_id, check_in, check_out, adults, children, total_price, special_requests) VALUES (?,?,?,?,?,?,?,?,?)',
      [booking_id, room_id, guestRow.id, check_in, check_out, adults||1, children||0, total_price, special_requests||null]);

    res.status(201).json({ success: true, data: { booking_id, total_price, nights } });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

app.patch('/api/bookings/:id/cancel', (req, res) => {
  try {
    const { run } = getDb();
    run("UPDATE bookings SET status = 'cancelled' WHERE id = ? AND status NOT IN ('cancelled','checked_out')", [req.params.id]);
    res.json({ success: true, message: 'Booking cancelled' });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

// ─── Services ────────────────────────────────────────────────
app.get('/api/services', (req, res) => {
  try {
    const { queryAll } = getDb();
    res.json({ success: true, data: queryAll('SELECT * FROM services') });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

// ─── Stats ───────────────────────────────────────────────────
app.get('/api/stats', (req, res) => {
  try {
    const { queryOne } = getDb();
    const totalRooms = queryOne('SELECT COUNT(*) as c FROM rooms').c;
    const availableRooms = queryOne('SELECT COUNT(*) as c FROM rooms WHERE is_available = 1').c;
    const totalBookings = queryOne("SELECT COUNT(*) as c FROM bookings WHERE status != 'cancelled'").c;
    const rev = queryOne("SELECT COALESCE(SUM(total_price),0) as t FROM bookings WHERE status NOT IN ('cancelled')");
    const todayBookings = queryOne("SELECT COUNT(*) as c FROM bookings WHERE date(created_at) = date('now')").c;
    res.json({ success: true, data: { totalRooms, availableRooms, totalBookings, revenue: rev.t, todayBookings } });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

// ─── ChatBot ─────────────────────────────────────────────────
app.post('/api/chat/message', (req, res) => {
  try {
    const { queryOne, run } = getDb();
    const { message, session_id, lang } = req.body;
    if (!message) return res.status(400).json({ success: false, error: 'Message required' });
    const sid = session_id || uuidv4();
    const session = queryOne('SELECT * FROM chat_sessions WHERE id = ?', [sid]);
    if (!session) {
      run('INSERT INTO chat_sessions (id, language) VALUES (?,?)', [sid, lang||'fr']);
    } else {
      run("UPDATE chat_sessions SET last_activity = datetime('now') WHERE id = ?", [sid]);
    }
    const currentLang = session?.language || lang || 'fr';
    const result = processMessage(message, currentLang);
    if (result.lang !== currentLang) run('UPDATE chat_sessions SET language = ? WHERE id = ?', [result.lang, sid]);
    res.json({ success: true, session_id: sid, data: { response: result.response, intent: result.intent, lang: result.lang } });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

// ─── Start ───────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`\n🏨  Hotel Royal Palm API`);
    console.log(`✅  Running on http://localhost:${PORT}`);
    console.log(`💾  Database: hotel.db (SQLite via sql.js)\n`);
  });
}).catch(e => { console.error('DB init failed:', e); process.exit(1); });
