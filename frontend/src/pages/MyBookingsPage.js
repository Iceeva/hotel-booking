import React, { useState, useEffect } from 'react';
import axios from 'axios';

const STATUS_LABELS = {
  confirmed: 'Confirmée', pending: 'En attente',
  checked_in: 'Arrivé', checked_out: 'Parti', cancelled: 'Annulée',
};

export default function MyBookingsPage({ navigate }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ setCancelId] = useState(null);
  const [searchEmail, setSearchEmail] = useState('');
  const [filtered, setFiltered] = useState([]);

  useEffect(() => {
    axios.get('/api/bookings').then(r => {
      setBookings(r.data.data || []);
      setFiltered(r.data.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSearch = () => {
    if (!searchEmail.trim()) { setFiltered(bookings); return; }
    setFiltered(bookings.filter(b => b.email?.toLowerCase().includes(searchEmail.toLowerCase()) ||
      b.id.toLowerCase().includes(searchEmail.toLowerCase())));
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Confirmer l\'annulation de cette réservation ?')) return;
    try {
      await axios.patch(`/api/bookings/${id}/cancel`);
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b));
      setFiltered(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b));
      setCancelId(null);
    } catch { alert('Erreur lors de l\'annulation.'); }
  };

  return (
    <div className="bookings-page">
      <div className="bookings-inner">
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <span className="eyebrow">Gestion</span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--navy)', marginTop: '8px' }}>
            Mes Réservations
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
            Consultez et gérez toutes vos réservations
          </p>
        </div>

        {/* Search */}
        <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '20px', marginBottom: '28px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <input
            type="text" placeholder="Rechercher par email ou numéro de réservation..."
            value={searchEmail} onChange={e => setSearchEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            style={{ flex: 1, minWidth: '240px', padding: '10px 14px', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '.95rem' }}
          />
          <button className="btn-filter" onClick={handleSearch}>🔍 Rechercher</button>
          {searchEmail && <button className="btn-filter" style={{ background: 'var(--cream-dark)', color: 'var(--text-secondary)' }} onClick={() => { setSearchEmail(''); setFiltered(bookings); }}>✕ Effacer</button>}
        </div>

        {loading ? (
          <div className="loading"><div className="spinner" /><span>Chargement...</span></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <h3>{bookings.length === 0 ? 'Aucune réservation' : 'Aucun résultat'}</h3>
            <p>{bookings.length === 0 ? 'Réservez votre première chambre dès maintenant !' : 'Essayez avec un autre email ou numéro.'}</p>
            <br />
            {bookings.length === 0 && <button className="btn-primary" onClick={() => navigate('rooms')}>Voir les chambres</button>}
          </div>
        ) : (
          <>
            <p style={{ color: 'var(--text-muted)', marginBottom: '16px', fontSize: '.9rem' }}>
              {filtered.length} réservation{filtered.length > 1 ? 's' : ''} trouvée{filtered.length > 1 ? 's' : ''}
            </p>
            <div className="booking-list">
              {filtered.map(b => (
                <div key={b.id} className="booking-item">
                  <div>
                    <div className="booking-ref">Réf. #{b.id.slice(0, 8).toUpperCase()}</div>
                    <div className="booking-room">{b.room_name}</div>
                    <div className="booking-dates">
                      <div className="booking-date-item">
                        <span className="booking-date-label">Arrivée</span>
                        <span className="booking-date-val">{new Date(b.check_in).toLocaleDateString('fr-FR')}</span>
                      </div>
                      <div className="booking-date-item">
                        <span className="booking-date-label">Départ</span>
                        <span className="booking-date-val">{new Date(b.check_out).toLocaleDateString('fr-FR')}</span>
                      </div>
                      <div className="booking-date-item">
                        <span className="booking-date-label">Chambre</span>
                        <span className="booking-date-val">N° {b.room_number} · Étage {b.room_type}</span>
                      </div>
                    </div>
                    <div className="booking-guest">
                      👤 {b.first_name} {b.last_name} · ✉️ {b.email}
                      {b.phone && ` · 📞 ${b.phone}`}
                    </div>
                    {b.special_requests && (
                      <div style={{ marginTop: '8px', fontSize: '.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                        💬 {b.special_requests}
                      </div>
                    )}
                  </div>
                  <div className="booking-actions">
                    <span className={`status-badge status-${b.status}`}>{STATUS_LABELS[b.status] || b.status}</span>
                    <div className="booking-price">{b.total_price}€</div>
                    <div style={{ fontSize: '.8rem', color: 'var(--text-muted)' }}>
                      {Math.ceil((new Date(b.check_out) - new Date(b.check_in)) / 86400000)} nuit{Math.ceil((new Date(b.check_out) - new Date(b.check_in)) / 86400000) > 1 ? 's' : ''}
                    </div>
                    {!['cancelled', 'checked_out'].includes(b.status) && (
                      <button className="btn-cancel" onClick={() => handleCancel(b.id)}>Annuler</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
