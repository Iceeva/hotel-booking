# 🌴 Hotel Royal Palm — Application de Réservation

Application web complète de réservation hôtelière avec chatbot multilingue intégré.

## 🚀 Stack Technique

| Couche       | Technologies                              |
|-------------|-------------------------------------------|
| Frontend    | React.js 18, Axios, CSS Variables         |
| Backend     | Node.js, Express.js                       |
| Base de données | SQLite (better-sqlite3) — `hotel.db` auto-créé |
| ChatBot     | Rule-based engine, multilingue FR/EN/AR   |

---

## ⚙️ Installation & Démarrage

### Prérequis
- **Node.js** v16+ ([nodejs.org](https://nodejs.org))
- **npm** v8+

### Étape 1 — Installer les dépendances

```bash
# Backend
cd backend
npm install

# Frontend (nouveau terminal)
cd frontend
npm install
```

### Étape 2 — Démarrer les serveurs

```bash
# Terminal 1 — Backend API (port 3001)
cd backend
npm start

# Terminal 2 — Frontend React (port 3000)
cd frontend
npm start
```

### Étape 3 — Ouvrir l'application
Rendez-vous sur **http://localhost:3000**

> 💾 La base de données `hotel.db` est créée **automatiquement** au premier lancement du backend, avec des données de démonstration pré-chargées.

---

## 🗂️ Structure du Projet

```
hotel-booking/
├── backend/
│   ├── src/
│   │   ├── server.js        # API Express (routes REST)
│   │   ├── database.js      # SQLite — schema + seed data
│   │   └── chatbot.js       # Moteur chatbot rule-based
│   ├── package.json
│   └── hotel.db             # ← Créé automatiquement
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.js           # Routage principal
│   │   ├── App.css          # Styles globaux (Design Luxury)
│   │   ├── index.js
│   │   ├── components/
│   │   │   ├── Header.js    # Navigation
│   │   │   └── ChatBot.js   # Widget chatbot
│   │   └── pages/
│   │       ├── HomePage.js       # Accueil + Hero + Search
│   │       ├── RoomsPage.js      # Catalogue des chambres
│   │       ├── BookingPage.js    # Formulaire de réservation
│   │       └── MyBookingsPage.js # Gestion des réservations
│   └── package.json
│
├── package.json   # Scripts racine
└── README.md
```

---

## 🤖 ChatBot — Rex le Concierge Virtuel

### Langues supportées
| Langue     | Détection         |
|-----------|-------------------|
| 🇫🇷 Français | Défaut            |
| 🇬🇧 English  | Mots-clés anglais |
| 🇩🇿 Arabe    | Caractères arabes |

### Intentions reconnues
| Intent     | Exemples FR                        |
|-----------|-------------------------------------|
| GREET     | "Bonjour", "Salut"                  |
| ROOMS     | "Chambres disponibles", "suite"     |
| PRICE     | "Prix", "tarif", "combien ça coûte" |
| BOOK      | "Réserver", "faire une réservation" |
| CHECKIN   | "Check-in", "arrivée"               |
| CHECKOUT  | "Check-out", "départ"               |
| SERVICES  | "Spa", "restaurant", "transfert"    |
| WIFI      | "WiFi", "internet"                  |
| CANCEL    | "Annuler", "remboursement"          |
| CONTACT   | "Téléphone", "adresse", "email"     |
| THANKS    | "Merci", "super", "parfait"         |
| BYE       | "Au revoir", "bonne nuit"           |

---

## 🗄️ Base de Données SQLite

### Tables créées automatiquement

```sql
rooms         — 6 chambres (Standard → Présidentielle)
guests        — Informations des clients
bookings      — Réservations (UUID, statuts)
services      — Services hôteliers (6 services)
chat_sessions — Sessions chatbot
```

### Données de démonstration (seed)
- **6 chambres** : Standard (75€), Deluxe (140-165€), Suite (260€), Présidentielle (650€)
- **6 services** : Petit-déjeuner, transfert, spa, blanchisserie, room service, excursion

---

## 🌐 API REST — Endpoints

```
GET    /api/health                    Status serveur
GET    /api/rooms                     Liste des chambres
GET    /api/rooms/:id                 Détail d'une chambre
POST   /api/rooms/check-availability  Vérifier disponibilité
GET    /api/bookings                  Toutes les réservations
GET    /api/bookings/:id              Détail réservation
POST   /api/bookings                  Créer une réservation
PATCH  /api/bookings/:id/cancel       Annuler une réservation
GET    /api/services                  Liste des services
POST   /api/chat/message              Envoyer un message chatbot
GET    /api/stats                     Statistiques dashboard
```

---

## 🎨 Design

- Palette **Navy + Or** — Luxe hôtelier
- Police **Playfair Display** (titres) + **Inter** (corps)
- Responsive mobile-first
- Animations CSS fluides
- Chatbot widget flottant

---

## 📄 Licence

MIT — Libre d'utilisation et de modification.

https://t.me/c/2725058189/3494