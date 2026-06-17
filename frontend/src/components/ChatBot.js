import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const QUICK_REPLIES = {
  fr: ['🛏️ Voir les chambres', '💰 Tarifs', '📅 Comment réserver', '🍽️ Services', '📞 Contact', '📶 WiFi'],
  en: ['🛏️ View rooms', '💰 Prices', '📅 How to book', '🍽️ Services', '📞 Contact', '📶 WiFi'],
  ar: ['🛏️ عرض الغرف', '💰 الأسعار', '📅 كيفية الحجز', '🍽️ الخدمات', '📞 اتصل بنا', '📶 واي فاي'],
};

const WELCOME = {
  fr: '👋 Bonjour ! Je suis **Rex**, votre concierge virtuel.\nComment puis-je vous aider aujourd\'hui ?',
  en: '👋 Hello! I\'m **Rex**, your virtual concierge.\nHow can I help you today?',
  ar: '👋 مرحباً! أنا **ريكس**، كونسيرج الافتراضي.\nكيف يمكنني مساعدتك اليوم؟',
};

function formatMessage(text) {
  // Bold
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  // Italic
  text = text.replace(/_(.*?)_/g, '<em>$1</em>');
  return text;
}

export default function ChatBot({ navigate }) {
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState('fr');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [unread, setUnread] = useState(1);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Init welcome message
  useEffect(() => {
    setMessages([{ role: 'bot', text: WELCOME[lang], id: Date.now() }]);
  }, [lang]);

  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const sendMessage = async (text) => {
    if (!text.trim()) return;
    const userMsg = { role: 'user', text: text.trim(), id: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setTyping(true);

    try {
      const res = await axios.post('/api/chat/message', {
        message: text.trim(),
        session_id: sessionId,
        lang,
      });
      const data = res.data.data;
      if (!sessionId) setSessionId(res.data.session_id);
      // Auto-update lang if changed
      if (data.lang && data.lang !== lang) setLang(data.lang);

      setTimeout(() => {
        setTyping(false);
        setMessages(prev => [...prev, { role: 'bot', text: data.response, id: Date.now() + 1 }]);
      }, 600 + Math.random() * 400);
    } catch {
      setTyping(false);
      const errMsgs = { fr: '❌ Erreur de connexion. Veuillez réessayer.', en: '❌ Connection error. Please try again.', ar: '❌ خطأ في الاتصال. حاول مرة أخرى.' };
      setMessages(prev => [...prev, { role: 'bot', text: errMsgs[lang], id: Date.now() + 1 }]);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  };

  const handleQuickReply = (qr) => {
    // Strip emoji prefix for send
    const clean = qr.replace(/^[\u{1F300}-\u{1FFFF}][\uFE0F]?\s*/u, '');
    sendMessage(clean);
  };

  const switchLang = (l) => {
    setLang(l);
    setSessionId(null);
  };

  return (
    <>
      {/* Trigger Button */}
      <button className="chatbot-trigger" onClick={() => setOpen(o => !o)} title="Chat avec nous">
        {open ? '✕' : '💬'}
        {!open && unread > 0 && <span className="chatbot-badge">{unread}</span>}
      </button>

      {/* Chat Window */}
      {open && (
        <div className="chatbot-window">
          {/* Header */}
          <div className="chat-header">
            <div className="chat-header-info">
              <div className="chat-avatar">🤖</div>
              <div className="chat-header-text">
                <h4>Rex — Concierge</h4>
                <span><span className="online-dot" />En ligne 24h/24</span>
              </div>
            </div>
            <button className="chat-close" onClick={() => setOpen(false)}>✕</button>
          </div>

          {/* Language Bar */}
          <div className="chat-lang-bar">
            {['fr', 'en', 'ar'].map(l => (
              <button key={l} className={`lang-btn ${lang === l ? 'active' : ''}`} onClick={() => switchLang(l)}>
                {l === 'fr' ? '🇫🇷 FR' : l === 'en' ? '🇬🇧 EN' : '🇩🇿 AR'}
              </button>
            ))}
          </div>

          {/* Messages */}
          <div className="chat-messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`message ${msg.role}`}>
                <div className={`msg-avatar ${msg.role === 'bot' ? 'bot-avatar' : 'user-avatar'}`}>
                  {msg.role === 'bot' ? '🤖' : '👤'}
                </div>
                <div
                  className="message-bubble"
                  dangerouslySetInnerHTML={{ __html: formatMessage(msg.text) }}
                  dir={lang === 'ar' ? 'rtl' : 'ltr'}
                />
              </div>
            ))}
            {typing && (
              <div className="message bot">
                <div className="msg-avatar bot-avatar">🤖</div>
                <div className="message-bubble">
                  <div className="typing-dots">
                    <span /><span /><span />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies */}
          <div className="quick-replies">
            {QUICK_REPLIES[lang].map((qr, i) => (
              <button key={i} className="quick-reply" onClick={() => handleQuickReply(qr)}>{qr}</button>
            ))}
          </div>

          {/* Input Area */}
          <div className="chat-input-area">
            <input
              ref={inputRef}
              className="chat-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder={lang === 'fr' ? 'Tapez votre message...' : lang === 'en' ? 'Type your message...' : 'اكتب رسالتك...'}
              dir={lang === 'ar' ? 'rtl' : 'ltr'}
            />
            <button className="chat-send" onClick={() => sendMessage(input)} disabled={!input.trim()}>
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
