import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TYPE_LABELS = { standard: 'Standard', deluxe: 'Deluxe', suite: 'Suite', presidential: 'Présidentielle' };

export default function RoomsPage({ navigate }) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ type: '', available: 'true' });

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter.type) params.type = filter.type;
      if (filter.available) params.available = filter.available;
      const res = await axios.get('/api/rooms', { params });
      setRooms(res.data.data || []);
    } catch { setRooms([]); }
    setLoading(false);
  };

  useEffect(() => { fetchRooms(); }, []); // eslint-disable-line

  return (
    <>
      {/* Page Header */}
      <div style={{ background: 'var(--navy)', padding: '48px 24px 36px', textAlign: 'center' }}>
        <span className="eyebrow" style={{ color: 'var(--gold-light)' }}>Hébergement</span>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem', color: 'var(--white)', marginTop: '8px' }}>
          Nos Chambres & Suites
        </h1>
        <p style={{ color: 'rgba(255,255,255,.6)', marginTop: '10px' }}>
          Du confort à l'excellence — trouvez votre hébergement idéal
        </p>
      </div>

      {/* Filters */}
      <div className="search-bar-section">
        <div className="search-bar-inner">
          <div className="filter-group">
            <label>Type de chambre</label>
            <select value={filter.type} onChange={e => setFilter(f => ({ ...f, type: e.target.value }))}>
              <option value="">Tous les types</option>
              <option value="standard">Standard</option>
              <option value="deluxe">Deluxe</option>
              <option value="suite">Suite</option>
              <option value="presidential">Présidentielle</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Disponibilité</label>
            <select value={filter.available} onChange={e => setFilter(f => ({ ...f, available: e.target.value }))}>
              <option value="true">Disponibles</option>
              <option value="">Toutes</option>
            </select>
          </div>
          <button className="btn-filter" onClick={fetchRooms}>🔍 Filtrer</button>
        </div>
      </div>

      {/* Rooms Grid */}
      <section className="section">
        <div className="section-inner">
          {loading ? (
            <div className="loading"><div className="spinner" /><span>Chargement des chambres...</span></div>
          ) : rooms.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🛏️</div>
              <h3>Aucune chambre trouvée</h3>
              <p>Modifiez vos filtres pour voir plus de résultats.</p>
            </div>
          ) : (
            <div className="rooms-grid">
              {rooms.map(room => (
                <RoomCard key={room.id} room={room} navigate={navigate} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

function RoomCard({ room, navigate }) {
  const img = room.images?.[0] || 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800';
  return (
    <div className={`room-card ${!room.is_available ? 'unavailable' : ''}`}>
      <div className="room-card-img">
        <img src={img} alt={room.name} loading="lazy" />
        <span className="room-type-badge">{TYPE_LABELS[room.type] || room.type}</span>
        {!room.is_available && (
          <div style={{
            position: 'absolute', inset: 0, background: 'rgba(0,0,0,.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 700, fontSize: '1.1rem', letterSpacing: '.05em'
          }}>INDISPONIBLE</div>
        )}
      </div>
      <div className="room-card-body">
        <div className="room-card-header">
          <div className="room-card-name">{room.name}</div>
          <div className="room-price">{room.price_per_night}€<span>/nuit</span></div>
        </div>
        <p className="room-desc">{room.description}</p>
        <div className="room-meta">
          <div className="room-meta-item">👥 {room.capacity} pers.</div>
          <div className="room-meta-item">🏢 Étage {room.floor}</div>
          <div className="room-meta-item">🔢 N° {room.number}</div>
        </div>
        <div className="amenities-list">
          {(room.amenities || []).slice(0, 4).map((a, i) => (
            <span key={i} className="amenity-tag">{a}</span>
          ))}
          {room.amenities?.length > 4 && <span className="amenity-tag">+{room.amenities.length - 4}</span>}
        </div>
        <button
          className="btn-book"
          onClick={() => room.is_available && navigate('booking', { room })}
          disabled={!room.is_available}
        >
          {room.is_available ? '📅 Réserver cette chambre' : '❌ Indisponible'}
        </button>
      </div>
    </div>
  );
}
