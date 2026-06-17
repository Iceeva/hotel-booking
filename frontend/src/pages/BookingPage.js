import React, { useState } from 'react';
import axios from 'axios';

export default function BookingPage({ navigate, room }) {
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const [form, setForm] = useState({
    check_in: today, check_out: tomorrow,
    adults: 1, children: 0, special_requests: '',
    first_name: '', last_name: '', email: '', phone: '', nationality: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  if (!room) {
    return (
      <div className="booking-page">
        <div className="empty-state">
          <div className="empty-state-icon">🛏️</div>
          <h3>Aucune chambre sélectionnée</h3>
          <p>Veuillez choisir une chambre avant de réserver.</p>
          <br />
          <button className="btn-primary" onClick={() => navigate('rooms')}>Voir les chambres</button>
        </div>
      </div>
    );
  }

  const nights = Math.max(1, Math.ceil((new Date(form.check_out) - new Date(form.check_in)) / 86400000));
  const total = room.price_per_night * nights;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    setError('');
  };

  const validate = () => {
    if (!form.first_name || !form.last_name) return 'Prénom et nom requis.';
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) return 'Email invalide.';
    if (new Date(form.check_out) <= new Date(form.check_in)) return 'La date de départ doit être après la date d\'arrivée.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setLoading(true);
    try {
      const res = await axios.post('/api/bookings', {
        room_id: room.id, check_in: form.check_in, check_out: form.check_out,
        adults: parseInt(form.adults), children: parseInt(form.children),
        special_requests: form.special_requests,
        guest: { first_name: form.first_name, last_name: form.last_name, email: form.email, phone: form.phone, nationality: form.nationality },
      });
      setSuccess(res.data.data);
    } catch (e) {
      setError(e.response?.data?.error || 'Erreur lors de la réservation.');
    }
    setLoading(false);
  };

  const img = room.images?.[0] || 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800';

  return (
    <div className="booking-page">
      <div className="booking-inner">
        <div className="booking-header">
          <span className="eyebrow">Réservation</span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--navy)', marginTop: '8px' }}>
            Confirmer votre séjour
          </h1>
        </div>

        <div className="booking-grid">
          {/* Form */}
          <div className="booking-form-card">
            <form onSubmit={handleSubmit}>
              {error && <div className="alert alert-error">⚠️ {error}</div>}

              {/* Dates */}
              <div className="form-section">
                <div className="form-section-title">📅 Dates du séjour</div>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Date d'arrivée *</label>
                    <input type="date" name="check_in" value={form.check_in} min={today} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>Date de départ *</label>
                    <input type="date" name="check_out" value={form.check_out} min={form.check_in} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>Adultes</label>
                    <select name="adults" value={form.adults} onChange={handleChange}>
                      {[1,2,3,4].map(n => <option key={n} value={n}>{n} adulte{n > 1 ? 's' : ''}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Enfants</label>
                    <select name="children" value={form.children} onChange={handleChange}>
                      {[0,1,2,3].map(n => <option key={n} value={n}>{n} enfant{n > 1 ? 's' : ''}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Guest Info */}
              <div className="form-section">
                <div className="form-section-title">👤 Informations personnelles</div>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Prénom *</label>
                    <input type="text" name="first_name" value={form.first_name} onChange={handleChange} placeholder="Mohammed" required />
                  </div>
                  <div className="form-group">
                    <label>Nom *</label>
                    <input type="text" name="last_name" value={form.last_name} onChange={handleChange} placeholder="Benali" required />
                  </div>
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="exemple@email.com" required />
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Téléphone</label>
                    <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="+213 555 ..." />
                  </div>
                  <div className="form-group">
                    <label>Nationalité</label>
                    <input type="text" name="nationality" value={form.nationality} onChange={handleChange} placeholder="Bénin" />
                  </div>
                </div>
              </div>

              {/* Special Requests */}
              <div className="form-section">
                <div className="form-section-title">💬 Demandes spéciales</div>
                <div className="form-group">
                  <label>Demandes particulières (optionnel)</label>
                  <textarea name="special_requests" value={form.special_requests} onChange={handleChange}
                    placeholder="Ex: Chambre haute, lit bébé, arrivée tardive..." />
                </div>
              </div>

              <button type="submit" className="btn-confirm" disabled={loading}>
                {loading ? '⏳ Traitement en cours...' : `✅ Confirmer la réservation — ${total}€`}
              </button>
              <p style={{ textAlign: 'center', fontSize: '.82rem', color: 'var(--text-muted)', marginTop: '12px' }}>
                🔒 Paiement sécurisé · Annulation gratuite sous 48h
              </p>
            </form>
          </div>

          {/* Summary */}
          <div className="booking-summary">
            <img src={img} alt={room.name} className="summary-room-img" />
            <div className="summary-room-name">{room.name}</div>
            <div className="summary-detail">
              <span className="summary-label">Type</span>
              <span className="summary-value" style={{ textTransform: 'capitalize' }}>{room.type}</span>
            </div>
            <div className="summary-detail">
              <span className="summary-label">Chambre N°</span>
              <span className="summary-value">{room.number}</span>
            </div>
            <div className="summary-detail">
              <span className="summary-label">Étage</span>
              <span className="summary-value">{room.floor}</span>
            </div>
            <div className="summary-detail">
              <span className="summary-label">Capacité</span>
              <span className="summary-value">👥 {room.capacity} personnes</span>
            </div>
            <div className="summary-detail">
              <span className="summary-label">Arrivée</span>
              <span className="summary-value">{new Date(form.check_in).toLocaleDateString('fr-FR')}</span>
            </div>
            <div className="summary-detail">
              <span className="summary-label">Départ</span>
              <span className="summary-value">{new Date(form.check_out).toLocaleDateString('fr-FR')}</span>
            </div>
            <div className="summary-detail">
              <span className="summary-label">Durée</span>
              <span className="summary-value">{nights} nuit{nights > 1 ? 's' : ''}</span>
            </div>
            <div className="summary-detail">
              <span className="summary-label">Prix / nuit</span>
              <span className="summary-value">{room.price_per_night}€</span>
            </div>
            <div className="summary-total">
              <span className="summary-total-label">TOTAL</span>
              <span className="summary-total-price">{total}€</span>
            </div>
            <div style={{ marginTop: '16px', padding: '12px', background: 'var(--cream-dark)', borderRadius: 'var(--radius-sm)', fontSize: '.82rem', color: 'var(--text-secondary)' }}>
              ✅ WiFi gratuit · 🅿️ Parking · 🏊 Piscine inclus
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {success && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-icon">🎉</div>
            <h2 className="modal-title">Réservation confirmée !</h2>
            <div className="modal-id">#{success.booking_id.slice(0, 8).toUpperCase()}</div>
            <p className="modal-sub">
              Votre réservation de <strong>{success.nights} nuit{success.nights > 1 ? 's' : ''}</strong> a été confirmée.<br />
              Montant total : <strong>{success.total_price}€</strong><br />
              Un email de confirmation vous sera envoyé.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button className="btn-primary" onClick={() => navigate('mybookings')}>Mes réservations</button>
              <button className="btn-outline" style={{ border: '2px solid var(--navy)', color: 'var(--navy)' }} onClick={() => navigate('rooms')}>
                Retour aux chambres
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
