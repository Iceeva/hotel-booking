import React, { useState } from 'react';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import RoomsPage from './pages/RoomsPage';
import BookingPage from './pages/BookingPage';
import MyBookingsPage from './pages/MyBookingsPage';
import ChatBot from './components/ChatBot';
import './App.css';

export default function App() {
  const [page, setPage] = useState('home');
  const [selectedRoom, setSelectedRoom] = useState(null);

  const navigate = (p, data = null) => {
    setPage(p);
    if (data?.room) setSelectedRoom(data.room);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPage = () => {
    switch (page) {
      case 'rooms':   return <RoomsPage navigate={navigate} />;
      case 'booking': return <BookingPage navigate={navigate} room={selectedRoom} />;
      case 'mybookings': return <MyBookingsPage navigate={navigate} />;
      default:        return <HomePage navigate={navigate} />;
    }
  };

  return (
    <div className="app">
      <Header currentPage={page} navigate={navigate} />
      <main className="main-content">
        {renderPage()}
      </main>
      <ChatBot navigate={navigate} />
    </div>
  );
}
