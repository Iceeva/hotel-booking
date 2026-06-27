import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SERVICES_ICONS = {
  restaurant: '🍽️', transport: '🚗', wellness: '💆', service: '👔', tour: '🗺️'
};

export default function HomePage({ navigate }) {
  const [stats, setStats] = useState(null);
  const [services, setServices] = useState([]);
  const [search, setSearch] = useState({ check_in: '', check_out: '', type: '', guests: '2' });

  useEffect(() => {
    axios.get('/api/stats').then(r => setStats(r.data.data)).catch(() => {});
    axios.get('/api/services').then(r => setServices(r.data.data || [])).catch(() => {});
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate('rooms', { search });
  };

  // Default dates
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  return (
    <>
      {/* ─── Hero ─── */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-text">
            <div className="hero-badge">⭐ Hôtel 5 Étoiles · Bénin</div>
            <h1 className="hero-title">
              L'art de vivre<br /><em>à son sommet</em>
            </h1>
            <p className="hero-subtitle">
              Découvrez une expérience hôtelière d'exception au cœur du Bénin. 
              Luxe, confort et service personnalisé vous attendent à l'Hôtel Royal Palm.
            </p>
            <div className="hero-actions">
              <button className="btn-primary" onClick={() => navigate('rooms')}>Voir nos chambres</button>
              <button className="btn-outline" onClick={() => navigate('mybookings')}>Mes réservations</button>
            </div>
          </div>

          {/* Search Card */}
          <div className="hero-card">
            <div className="hero-card-title">🔍 Vérifier la disponibilité</div>
            <div className="search-grid">
              <div className="search-row">
                <div className="search-field">
                  <label>Arrivée</label>
                  <input type="date" min={today}
                    value={search.check_in || today}
                    onChange={e => setSearch(s => ({ ...s, check_in: e.target.value }))} />
                </div>
                <div className="search-field">
                  <label>Départ</label>
                  <input type="date" min={search.check_in || tomorrow}
                    value={search.check_out || tomorrow}
                    onChange={e => setSearch(s => ({ ...s, check_out: e.target.value }))} />
                </div>
              </div>
              <div className="search-row">
                <div className="search-field">
                  <label>Type</label>
                  <select value={search.type} onChange={e => setSearch(s => ({ ...s, type: e.target.value }))}>
                    <option value="">Tous</option>
                    <option value="standard">Standard</option>
                    <option value="deluxe">Deluxe</option>
                    <option value="suite">Suite</option>
                    <option value="presidential">Présidentielle</option>
                  </select>
                </div>
                <div className="search-field">
                  <label>Voyageurs</label>
                  <select value={search.guests} onChange={e => setSearch(s => ({ ...s, guests: e.target.value }))}>
                    <option value="1">1 personne</option>
                    <option value="2">2 personnes</option>
                    <option value="3">3 personnes</option>
                    <option value="4">4+ personnes</option>
                  </select>
                </div>
              </div>
              <button className="btn-search" onClick={handleSearch}>Rechercher les chambres disponibles →</button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Stats Bar ─── */}
      <div className="stats-bar">
        <div className="stats-inner">
          <div className="stat-item"><div className="stat-num">{stats?.totalRooms ?? '6'}+</div><div className="stat-label">Chambres</div></div>
          <div className="stat-item"><div className="stat-num">5⭐</div><div className="stat-label">Étoiles</div></div>
          <div className="stat-item"><div className="stat-num">{stats?.totalBookings ?? '0'}</div><div className="stat-label">Réservations</div></div>
          <div className="stat-item"><div className="stat-num">24/7</div><div className="stat-label">Service</div></div>
          <div className="stat-item"><div className="stat-num">100%</div><div className="stat-label">Satisfaction</div></div>
        </div>
      </div>

      {/* ─── About ─── */}
      <section className="section" style={{ background: 'var(--white)' }}>
        <div className="section-inner">
          <div className="section-header">
            <span className="eyebrow">Notre Hôtel</span>
            <h2 className="section-title">Une expérience unique au cœur duBénin</h2>
            <div className="divider" />
            <p className="section-sub">
              Niché dans un cadre paradisiaque, l'Hôtel Royal Palm conjugue architecture moderne et 
              traditions Bénin pour vous offrir un séjour inoubliable.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
            {[
              { icon: '🏊', title: 'Piscine Infinity', desc: 'Vue panoramique sur la ville' },
              { icon: '💆', title: 'Spa & Hammam', desc: 'Soins traditionnels et modernes' },
              { icon: '🍽️', title: 'Restaurant Gastronomique', desc: 'Cuisine Bénin et internationale' },
              { icon: '🏋️', title: 'Salle de Sport', desc: 'Équipements dernière génération' },
            ].map((f, i) => (
              <div key={i} className="service-card" style={{ textAlign: 'center' }}>
                <div className="service-icon">{f.icon}</div>
                <div className="service-name">{f.title}</div>
                <div className="service-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Services ─── */}
      <section className="section">
        <div className="section-inner">
          <div className="section-header">
            <span className="eyebrow">Services</span>
            <h2 className="section-title">Tout pour votre confort</h2>
            <div className="divider" />
          </div>
          <div className="services-grid">
            {services.map(s => (
              <div key={s.id} className="service-card">
                <div className="service-icon">{SERVICES_ICONS[s.category] || '✨'}</div>
                <div className="service-name">{s.name_fr}</div>
                <div className="service-desc">{s.description}</div>
                <div className="service-price">{s.price}€ <span style={{ fontSize: '.8rem', color: 'var(--text-muted)', fontWeight: 400 }}>/ pers.</span></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Banner ─── */}
      <section style={{ background: 'var(--navy)', padding: '72px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div className="eyebrow" style={{ color: 'var(--gold-light)' }}>Offre Spéciale</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', color: 'var(--white)', margin: '12px 0 16px' }}>
            Réservez directement et économisez <span style={{ color: 'var(--gold-light)' }}>jusqu'à 20%</span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,.65)', marginBottom: '32px', lineHeight: 1.7 }}>
            Profitez de nos meilleures offres en réservant sur notre site officiel. 
            Petit-déjeuner offert pour toute réservation de 3 nuits minimum.
          </p>
          <button className="btn-primary" style={{ fontSize: '1.1rem', padding: '16px 40px' }} onClick={() => navigate('rooms')}>
            Découvrir les offres →
          </button>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-grid">
            <div className="footer-col">
              <h4>🌴 Royal Palm</h4>
              <p>Votre hôtel de luxe 5 étoiles au Bénin. Une expérience unique alliant traditions et modernité.</p>
            </div>
            <div className="footer-col">
              <h4>Navigation</h4>
              <a href="/" onClick={() => navigate('home')}>Accueil</a>
              <a href="/rooms" onClick={() => navigate('rooms')}>Chambres & Suites</a>
              <a href="/mybookings" onClick={() => navigate('mybookings')}>Mes réservations</a>
            </div>
            <div className="footer-col">
              <h4>Services</h4>
              <a href="/services/restaurant-bar">Restaurant & Bar</a>
              <a href="/services/spa-bien-etre">Spa & Bien-être</a>
              <a href="/services/salle-de-conference">Salle de conférence</a>
              <a href="/services/transfert-aeroport">Transfert aéroport</a>
            </div>
            <div className="footer-col">
              <h4>Contact</h4>
              <p>📍 123 Bd de l'ocean Cotonou,Bénin</p>
              <p>📞 +229 01 59 12 22 92 </p>
              <p>📧 info@royalpalm.dz</p>
              <p>🌐 www.royalpalm-hotel.com</p>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2026 Hôtel Royal Palm. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
