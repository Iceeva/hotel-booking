const { getDb } = require('./database');

const LANG_PATTERNS = {
  ar: /[\u0600-\u06FF]/,
  en: /\b(hello|hi|help|book|room|price|available|check|hotel|reservation|want|need|show|please|thanks|thank)\b/i,
};

function detectLanguage(text) {
  if (LANG_PATTERNS.ar.test(text)) return 'ar';
  if (LANG_PATTERNS.en.test(text)) return 'en';
  return 'fr';
}

const INTENTS = {
  GREET:    { fr: /^(bonjour|salut|hello|bonsoir|coucou|hey|allô)/i,  en: /^(hello|hi|hey|good\s?(morning|evening|afternoon))/i, ar: /^(مرحبا|أهلا|السلام|صباح|مساء)/ },
  ROOMS:    { fr: /chambre|room|disponib|hébergement|suite/i,          en: /room|suite|accommodation|stay|available/i,             ar: /غرفة|جناح|متاح|إقامة/ },
  PRICE:    { fr: /prix|tarif|coût|combien|cher|budget/i,              en: /price|cost|rate|how much|expensive|budget/i,           ar: /سعر|تكلفة|كم|غالي|ميزانية/ },
  BOOK:     { fr: /réserv|booker|book|commander/i,                     en: /book|reserve|reservation/i,                           ar: /حجز|أحجز|أريد حجز/ },
  CHECKIN:  { fr: /check.?in|arrivée|arriver/i,                        en: /check.?in|arrival|arrive/i,                           ar: /وصول|تسجيل الدخول/ },
  CHECKOUT: { fr: /check.?out|départ|partir/i,                         en: /check.?out|departure|leave/i,                         ar: /مغادرة|تسجيل الخروج/ },
  SERVICES: { fr: /service|restaur|spa|piscine|gym|transfert|blanchiss/i, en: /service|restaurant|spa|pool|gym|transfer|laundry/i, ar: /خدمة|مطعم|سبا|مسبح|نقل/ },
  WIFI:     { fr: /wifi|internet|connexion/i,                          en: /wifi|internet|connection/i,                           ar: /واي فاي|إنترنت/ },
  CANCEL:   { fr: /annul|cancel|rembours/i,                            en: /cancel|cancellation|refund/i,                         ar: /إلغاء|استرداد/ },
  CONTACT:  { fr: /contact|téléphone|email|adresse|appeler/i,          en: /contact|phone|email|address|call/i,                   ar: /اتصال|هاتف|بريد|عنوان/ },
  THANKS:   { fr: /merci|super|parfait|excellent|génial/i,             en: /thank|thanks|great|perfect|awesome/i,                 ar: /شكرا|ممتاز|رائع/ },
  BYE:      { fr: /au revoir|bye|bonne nuit|à bientôt/i,               en: /goodbye|bye|see you|good night/i,                     ar: /وداعا|مع السلامة/ },
};

function detectIntent(text, lang) {
  for (const [intent, patterns] of Object.entries(INTENTS)) {
    const p = patterns[lang] || patterns.fr;
    if (p && p.test(text)) return intent;
  }
  return 'UNKNOWN';
}

const RESPONSES = {
  GREET: {
    fr: () => `🏨 **Bienvenue à l'Hôtel Royal Palm !**\n\nJe suis **Rex**, votre concierge virtuel. Je peux vous aider avec :\n• 🛏️ Disponibilité des chambres\n• 💰 Tarifs et offres\n• 📅 Réservations\n• 🍽️ Nos services\n• ℹ️ Informations pratiques\n\nComment puis-je vous aider ?`,
    en: () => `🏨 **Welcome to Hotel Royal Palm!**\n\nI'm **Rex**, your virtual concierge. I can help you with:\n• 🛏️ Room availability\n• 💰 Rates & offers\n• 📅 Reservations\n• 🍽️ Our services\n\nHow can I assist you?`,
    ar: () => `🏨 **مرحباً بكم في فندق رويال بالم!**\n\nأنا **ريكس**، كونسيرجك الافتراضي. يمكنني مساعدتك في:\n• 🛏️ توفر الغرف\n• 💰 الأسعار\n• 📅 الحجوزات\n• 🍽️ خدماتنا\n\nكيف يمكنني مساعدتك؟`,
  },
  ROOMS: {
    fr: () => {
      const { queryAll } = getDb();
      const rooms = queryAll('SELECT * FROM rooms WHERE is_available = 1 ORDER BY price_per_night');
      if (!rooms.length) return '😔 Aucune chambre disponible pour le moment.';
      let msg = `🛏️ **Nos chambres disponibles (${rooms.length}) :**\n\n`;
      rooms.forEach(r => {
        const am = JSON.parse(r.amenities || '[]').slice(0,3).join(', ');
        msg += `**${r.name}** (${r.type})\n💶 ${r.price_per_night}€/nuit · 👥 ${r.capacity} pers. · Étage ${r.floor}\n✨ ${am}...\n\n`;
      });
      return msg + `📌 Cliquez sur **"Chambres"** pour voir les photos et réserver.`;
    },
    en: () => {
      const { queryAll } = getDb();
      const rooms = queryAll('SELECT * FROM rooms WHERE is_available = 1');
      let msg = `🛏️ **Available Rooms (${rooms.length}):**\n\n`;
      rooms.forEach(r => { msg += `**${r.name}** (${r.type})\n💶 €${r.price_per_night}/night · 👥 ${r.capacity} guests\n\n`; });
      return msg + `📌 Click **"Rooms"** to see photos and book.`;
    },
    ar: () => {
      const { queryAll } = getDb();
      const rooms = queryAll('SELECT * FROM rooms WHERE is_available = 1');
      let msg = `🛏️ **الغرف المتاحة (${rooms.length}):**\n\n`;
      rooms.forEach(r => { msg += `**${r.name}** (${r.type})\n💶 ${r.price_per_night}€/ليلة · 👥 ${r.capacity} أشخاص\n\n`; });
      return msg + `📌 انقر على **"الغرف"** للحجز.`;
    },
  },
  PRICE: {
    fr: () => {
      const { queryAll } = getDb();
      const rows = queryAll("SELECT type, MIN(price_per_night) as mn, MAX(price_per_night) as mx FROM rooms GROUP BY type");
      const labels = { standard:'🏠 Standard', deluxe:'⭐ Deluxe', suite:'👑 Suite', presidential:'🏆 Présidentielle' };
      let msg = `💰 **Nos tarifs par nuit :**\n\n`;
      rows.forEach(r => { msg += `${labels[r.type]||r.type} : **${r.mn===r.mx?r.mn+'€':r.mn+'€–'+r.mx+'€'}**/nuit\n`; });
      return msg + `\n✅ WiFi, parking et piscine inclus dans tous les tarifs.`;
    },
    en: () => {
      const { queryAll } = getDb();
      const rows = queryAll("SELECT type, MIN(price_per_night) as mn, MAX(price_per_night) as mx FROM rooms GROUP BY type");
      let msg = `💰 **Our nightly rates:**\n\n`;
      rows.forEach(r => { msg += `${r.type.charAt(0).toUpperCase()+r.type.slice(1)}: **${r.mn===r.mx?'€'+r.mn:'€'+r.mn+'–€'+r.mx}**/night\n`; });
      return msg + `\n✅ WiFi, parking & pool included.`;
    },
    ar: () => {
      const { queryAll } = getDb();
      const rows = queryAll("SELECT type, MIN(price_per_night) as mn, MAX(price_per_night) as mx FROM rooms GROUP BY type");
      let msg = `💰 **أسعارنا الليلية:**\n\n`;
      rows.forEach(r => { msg += `${r.type}: **${r.mn===r.mx?r.mn+'€':r.mn+'€–'+r.mx+'€'}**/ليلة\n`; });
      return msg + `\n✅ تشمل الأسعار: واي فاي، موقف، مسبح.`;
    },
  },
  BOOK: {
    fr: () => `📅 **Pour réserver :**\n\n1. Allez dans **"Chambres"**\n2. Choisissez votre chambre\n3. Cliquez **"Réserver"**\n4. Remplissez le formulaire\n5. Confirmation immédiate ✅\n\n💡 Annulation gratuite jusqu'à 48h avant l'arrivée.`,
    en: () => `📅 **To book:**\n\n1. Go to **"Rooms"**\n2. Choose your room\n3. Click **"Book Now"**\n4. Fill in details\n5. Instant confirmation ✅\n\n💡 Free cancellation up to 48h before arrival.`,
    ar: () => `📅 **للحجز:**\n\n1. اذهب إلى **"الغرف"**\n2. اختر غرفتك\n3. انقر **"احجز"**\n4. أدخل بياناتك\n5. تأكيد فوري ✅`,
  },
  CHECKIN: {
    fr: () => `🔑 **Check-in :**\n\n⏰ À partir de **14h00**\n🌙 Early check-in disponible (+15€)\n📋 Pièce d'identité + confirmation requises\n🅿️ Parking gratuit pour résidents`,
    en: () => `🔑 **Check-in:**\n\n⏰ From **2:00 PM**\n🌙 Early check-in available (+€15)\n📋 ID + booking confirmation required\n🅿️ Free parking for guests`,
    ar: () => `🔑 **تسجيل الدخول:**\n\n⏰ من الساعة **14:00**\n🌙 دخول مبكر متاح (+15€)\n📋 هوية + تأكيد الحجز مطلوبان`,
  },
  CHECKOUT: {
    fr: () => `🧳 **Check-out :**\n\n⏰ Avant **12h00**\n🌅 Late check-out jusqu'à 15h (+20€)\n💼 Bagagerie gratuite jusqu'à 18h\n🚗 Transfert aéroport sur réservation (45€)`,
    en: () => `🧳 **Check-out:**\n\n⏰ Before **12:00 PM**\n🌅 Late check-out until 3 PM (+€20)\n💼 Free luggage storage until 6 PM`,
    ar: () => `🧳 **تسجيل الخروج:**\n\n⏰ قبل **12:00**\n🌅 خروج متأخر حتى 15:00 (+20€)\n💼 حفظ أمتعة مجاني حتى 18:00`,
  },
  SERVICES: {
    fr: () => {
      const { queryAll } = getDb();
      const svcs = queryAll('SELECT * FROM services');
      let msg = `🍽️ **Nos Services :**\n\n`;
      svcs.forEach(s => { msg += `✅ **${s.name_fr}** — ${s.price}€\n   _${s.description}_\n\n`; });
      return msg + `📞 Contactez la réception pour réserver.`;
    },
    en: () => {
      const { queryAll } = getDb();
      const svcs = queryAll('SELECT * FROM services');
      let msg = `🍽️ **Our Services:**\n\n`;
      svcs.forEach(s => { msg += `✅ **${s.name}** — €${s.price}\n   _${s.description}_\n\n`; });
      return msg + `📞 Contact reception to add services.`;
    },
    ar: () => {
      const { queryAll } = getDb();
      const svcs = queryAll('SELECT * FROM services');
      let msg = `🍽️ **خدماتنا:**\n\n`;
      svcs.forEach(s => { msg += `✅ **${s.name_ar}** — ${s.price}€\n\n`; });
      return msg + `📞 اتصل بالاستقبال لإضافة الخدمات.`;
    },
  },
  WIFI:    { fr: () => `📶 **WiFi :**\n\n🔐 Réseau : **RoyalPalm_Guest**\n🔑 Mot de passe : **royalpalm2026**\n\n⚡ Fibre optique dans tout l'hôtel.`, en: () => `📶 **WiFi:**\n\n🔐 Network: **RoyalPalm_Guest**\n🔑 Password: **royalpalm2026**\n\n⚡ Fiber optic throughout.`, ar: () => `📶 **واي فاي:**\n\n🔐 الشبكة: **RoyalPalm_Guest**\n🔑 كلمة المرور: **royalpalm2026**` },
  CANCEL:  { fr: () => `❌ **Annulation :**\n\n✅ Gratuite jusqu'à **48h avant**\n⚠️ 48h–24h : 50% du montant\n🚫 Moins de 24h : 100%\n\n📧 reservation@royalpalm-hotel.com`, en: () => `❌ **Cancellation:**\n\n✅ Free up to **48h before**\n⚠️ 48–24h: 50% charge\n🚫 Under 24h: 100%\n\n📧 reservation@royalpalm-hotel.com`, ar: () => `❌ **الإلغاء:**\n\n✅ مجاني حتى **48 ساعة قبل**\n⚠️ 48–24 ساعة: 50%\n🚫 أقل من 24 ساعة: 100%` },
  CONTACT: { fr: () => `📞 **Contact :**\n\n🏨 Hôtel Royal Palm\n📍 123 Bd de l'ocean Cotonou,Bénin\n📞 +229 01 59 12 22 92 \n📧 info@royalpalm-hotel.com\n\n⏰ Réception 24h/24 · 7j/7`, en: () => `📞 **Contact:**\n\n🏨 Hotel Royal Palm\n📍 123 Bd du Lac, Algiers\n📞 +229 01 59 12 22 92 \n📧 info@royalpalm-hotel.com\n\n⏰ Reception 24/7`, ar: () => `📞 **اتصل بنا:**\n\n🏨 فندق رويال بالم\n📍 123 شارع البحيرة، الجزائر\n📞 +229 01 59 12 22 92 \n📧 info@royalpalm-hotel.com` },
  THANKS:  { fr: () => `😊 Avec plaisir ! Y a-t-il autre chose que je puisse faire pour vous ?`, en: () => `😊 You're welcome! Anything else I can help with?`, ar: () => `😊 على الرحب والسعة! هل هناك شيء آخر؟` },
  BYE:     { fr: () => `👋 **Au revoir !**\n\nNous espérons vous accueillir bientôt à l'Hôtel Royal Palm. 🌴\nBonne journée !`, en: () => `👋 **Goodbye!**\n\nWe hope to welcome you soon at Hotel Royal Palm. 🌴`, ar: () => `👋 **وداعاً!**\n\nنأمل أن نستقبلك قريباً في فندق رويال بالم. 🌴` },
  UNKNOWN: {
    fr: () => `🤔 Je ne suis pas sûr de comprendre.\n\nEssayez :\n• "chambres disponibles"\n• "tarifs"\n• "réserver"\n• "services"\n• "contact"\n• "wifi"`,
    en: () => `🤔 I'm not sure I understand.\n\nTry asking about:\n• "available rooms"\n• "prices"\n• "booking"\n• "services"\n• "contact"`,
    ar: () => `🤔 لست متأكداً.\n\nجرب:\n• "الغرف المتاحة"\n• "الأسعار"\n• "حجز"\n• "الخدمات"\n• "اتصال"`,
  },
};

function processMessage(text, sessionLang) {
  const lang = detectLanguage(text) !== 'fr' ? detectLanguage(text) : (sessionLang || 'fr');
  const intent = detectIntent(text, lang);
  const respFn = RESPONSES[intent]?.[lang] || RESPONSES[intent]?.fr || RESPONSES.UNKNOWN.fr;
  return { intent, lang, response: respFn(), timestamp: new Date().toISOString() };
}

module.exports = { processMessage, detectLanguage };
