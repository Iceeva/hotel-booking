import React from 'react';

export default function Header({ currentPage, navigate }) {
  return (
    <header className="header">
      <div className="header-inner">
        <div className="logo" onClick={() => navigate('home')}>
          <div className="logo-icon">🌴</div>
          <div className="logo-text">
            <div className="logo-title">Royal Palm</div>
            <div className="logo-sub">Luxury Hotel</div>
          </div>
        </div>
        <nav className="nav">
          <button className={`nav-btn ${currentPage === 'home' ? 'active' : ''}`} onClick={() => navigate('home')}>Accueil</button>
          <button className={`nav-btn ${currentPage === 'rooms' ? 'active' : ''}`} onClick={() => navigate('rooms')}>Chambres</button>
          <button className={`nav-btn ${currentPage === 'mybookings' ? 'active' : ''}`} onClick={() => navigate('mybookings')}>Mes Réservations</button>
          <button className="nav-btn nav-cta" onClick={() => navigate('rooms')}>Réserver</button>
        </nav>
      </div>
    </header>
  );
}
