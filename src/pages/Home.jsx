import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Utensils, MessageCircle, Instagram, MapPin, Settings } from 'lucide-react';
import logo from '../assets/logo.png'; 

const Home = () => {
  const navigate = useNavigate();

  const buttons = [
    { label: "Ver Menú Digital", icon: <Utensils size={20} />, onClick: () => navigate("/menu"), primary: true },
    { label: "Escríbeme por WhatsApp", icon: <MessageCircle size={20} />, onClick: () => window.open("https://wa.me/56976645547", "_blank"), primary: false },
    { label: "Sígueme en Instagram", icon: <Instagram size={20} />, onClick: () => window.open("https://instagram.com/oishi.sushi.stg", "_blank"), primary: false },
    { label: "Cómo llegar", icon: <MapPin size={20} />, onClick: () => window.open("https://maps.google.com", "_blank"), primary: false },
  ];

  return (
    <div className="home-container animate-fade">
      <button onClick={() => navigate('/login')} className="settings-btn" title="Admin Login">
        <Settings size={20} />
      </button>

      <div className="home-overlay"></div>

      <main className="home-content container">
        <header className="home-header">
          <div className="brand-container">
            <img src={logo} alt="Oishi Sushi Logo" className="home-logo" />
            <div className="brand-text">
              <h1 className="text-gradient">OISHI</h1>
              <span>SUSHI & COCKTAIL</span>
            </div>
          </div>
          <p className="home-tagline">Sabor auténtico en cada pieza</p>
        </header>

        <nav className="home-nav">
          {buttons.map((btn, index) => (
            <button
              key={index}
              onClick={btn.onClick}
              className={`btn ${btn.primary ? "btn-primary" : "btn-secondary glass"}`}
              style={{ width: "100%", justifyContent: 'center', height: '56px', fontSize: '1.05rem' }}
            >
              <span style={{ marginRight: '10px', display: 'flex' }}>{btn.icon}</span>
              {btn.label}
            </button>
          ))}
        </nav>
      </main>
    </div>
  );
};

export default Home;