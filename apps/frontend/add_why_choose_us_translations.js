const fs = require('fs');
const path = require('path');

const translations = {
  "en": {
    "The Modern Choice": "The Modern Choice",
    "Why Choose Ezee Flights": "Why Choose Ezee Flights",
    "Best Price Guarantee": "Best Price Guarantee",
    "Discover unbeatable prices on international flights with our exclusive deals": "Discover unbeatable prices on international flights with our exclusive deals",
    "Easy Booking": "Easy Booking",
    "Best deals on international flights in just a few clicks": "Best deals on international flights in just a few clicks",
    "24X7 Support": "24X7 Support",
    "Get award-winning service and special deals by calling +1-888-604-0198": "Get award-winning service and special deals by calling +1-888-604-0198",
    "Trust pay": "Trust pay",
    "100% Payment Protection. Easy Return Policy.": "100% Payment Protection. Easy Return Policy."
  },
  "ar": {
    "The Modern Choice": "الاختيار الحديث",
    "Why Choose Ezee Flights": "لماذا تختار Ezee Flights",
    "Best Price Guarantee": "ضمان أفضل الأسعار",
    "Discover unbeatable prices on international flights with our exclusive deals": "اكتشف أسعارًا لا تقبل المنافسة على الرحلات الدولية مع عروضنا الحصرية",
    "Easy Booking": "حجز سهل",
    "Best deals on international flights in just a few clicks": "أفضل العروض على الرحلات الدولية في بضع نقرات فقط",
    "24X7 Support": "دعم على مدار الساعة طوال أيام الأسبوع",
    "Get award-winning service and special deals by calling +1-888-604-0198": "احصل على خدمة حائزة على جوائز وعروض خاصة عن طريق الاتصال على +1-888-604-0198",
    "Trust pay": "دفع موثوق",
    "100% Payment Protection. Easy Return Policy.": "حماية الدفع بنسبة 100٪. سياسة إرجاع سهلة."
  },
  "de": {
    "The Modern Choice": "Die moderne Wahl",
    "Why Choose Ezee Flights": "Warum Ezee Flights wählen",
    "Best Price Guarantee": "Bestpreisgarantie",
    "Discover unbeatable prices on international flights with our exclusive deals": "Entdecken Sie unschlagbare Preise für internationale Flüge mit unseren exklusiven Angeboten",
    "Easy Booking": "Einfache Buchung",
    "Best deals on international flights in just a few clicks": "Die besten Angebote für internationale Flüge in nur wenigen Klicks",
    "24X7 Support": "24/7 Support",
    "Get award-winning service and special deals by calling +1-888-604-0198": "Erhalten Sie preisgekrönten Service und Sonderangebote unter +1-888-604-0198",
    "Trust pay": "Sichere Zahlung",
    "100% Payment Protection. Easy Return Policy.": "100% Zahlungsschutz. Einfache Rückgabebedingungen."
  },
  "es": {
    "The Modern Choice": "La elección moderna",
    "Why Choose Ezee Flights": "Por qué elegir Ezee Flights",
    "Best Price Guarantee": "Garantía de mejor precio",
    "Discover unbeatable prices on international flights with our exclusive deals": "Descubra precios inmejorables en vuelos internacionales con nuestras ofertas exclusivas",
    "Easy Booking": "Reserva fácil",
    "Best deals on international flights in just a few clicks": "Las mejores ofertas en vuelos internacionales en solo unos clics",
    "24X7 Support": "Soporte 24/7",
    "Get award-winning service and special deals by calling +1-888-604-0198": "Obtenga un servicio galardonado y ofertas especiales llamando al +1-888-604-0198",
    "Trust pay": "Pago de confianza",
    "100% Payment Protection. Easy Return Policy.": "Protección de pago del 100%. Política de devoluciones fácil."
  },
  "et": {
    "The Modern Choice": "Kaasaegne valik",
    "Why Choose Ezee Flights": "Miks valida Ezee Flights",
    "Best Price Guarantee": "Parima hinna garantii",
    "Discover unbeatable prices on international flights with our exclusive deals": "Avastage rahvusvahelistel lendudel ületamatuid hindu meie eksklusiivsete pakkumistega",
    "Easy Booking": "Lihtne broneerimine",
    "Best deals on international flights in just a few clicks": "Parimad pakkumised rahvusvahelistele lendudele vaid mõne klõpsuga",
    "24X7 Support": "24/7 tugi",
    "Get award-winning service and special deals by calling +1-888-604-0198": "Saage auhinnatud teenust ja eripakkumisi, helistades +1-888-604-0198",
    "Trust pay": "Usaldusväärne makse",
    "100% Payment Protection. Easy Return Policy.": "100% maksekaitse. Lihtne tagastuspoliitika."
  },
  "fr": {
    "The Modern Choice": "Le choix moderne",
    "Why Choose Ezee Flights": "Pourquoi choisir Ezee Flights",
    "Best Price Guarantee": "Garantie du meilleur prix",
    "Discover unbeatable prices on international flights with our exclusive deals": "Découvrez des prix imbattables sur les vols internationaux avec nos offres exclusives",
    "Easy Booking": "Réservation facile",
    "Best deals on international flights in just a few clicks": "Les meilleures offres sur les vols internationaux en quelques clics",
    "24X7 Support": "Assistance 24/7",
    "Get award-winning service and special deals by calling +1-888-604-0198": "Bénéficiez d'un service primé et d'offres spéciales en appelant le +1-888-604-0198",
    "Trust pay": "Paiement de confiance",
    "100% Payment Protection. Easy Return Policy.": "Protection des paiements à 100%. Politique de retour facile."
  },
  "hi": {
    "The Modern Choice": "आधुनिक विकल्प",
    "Why Choose Ezee Flights": "ईज़ी फ्लाइट्स क्यों चुनें",
    "Best Price Guarantee": "सर्वोत्तम मूल्य की गारंटी",
    "Discover unbeatable prices on international flights with our exclusive deals": "हमारे विशेष सौदों के साथ अंतरराष्ट्रीय उड़ानों पर अपराजेय कीमतों की खोज करें",
    "Easy Booking": "आसान बुकिंग",
    "Best deals on international flights in just a few clicks": "कुछ ही क्लिक में अंतरराष्ट्रीय उड़ानों पर सर्वोत्तम सौदे",
    "24X7 Support": "24X7 सहायता",
    "Get award-winning service and special deals by calling +1-888-604-0198": "+1-888-604-0198 पर कॉल करके पुरस्कार विजेता सेवा और विशेष सौदे प्राप्त करें",
    "Trust pay": "विश्वसनीय भुगतान",
    "100% Payment Protection. Easy Return Policy.": "100% भुगतान सुरक्षा। आसान वापसी नीति।"
  },
  "tl": {
    "The Modern Choice": "Ang Makabagong Pagpipilian",
    "Why Choose Ezee Flights": "Bakit Piliin ang Ezee Flights",
    "Best Price Guarantee": "Garantiyang Pinakamagandang Presyo",
    "Discover unbeatable prices on international flights with our exclusive deals": "Tuklasin ang hindi matatalo na mga presyo sa mga internasyonal na flight kasama ang aming mga eksklusibong alok",
    "Easy Booking": "Madaling Pag-book",
    "Best deals on international flights in just a few clicks": "Pinakamahusay na mga alok sa internasyonal na flight sa ilang pag-click lang",
    "24X7 Support": "Suporta 24/7",
    "Get award-winning service and special deals by calling +1-888-604-0198": "Kumuha ng serbisyo na nanalo ng parangal at mga espesyal na alok sa pagtawag sa +1-888-604-0198",
    "Trust pay": "Tiwala sa pagbabayad",
    "100% Payment Protection. Easy Return Policy.": "100% Proteksyon sa Pagbabayad. Madaling Patakaran sa Pagbabalik."
  },
  "tr": {
    "The Modern Choice": "Modern Seçim",
    "Why Choose Ezee Flights": "Neden Ezee Flights'ı Seçmelisiniz",
    "Best Price Guarantee": "En İyi Fiyat Garantisi",
    "Discover unbeatable prices on international flights with our exclusive deals": "Özel fırsatlarımızla uluslararası uçuşlarda rakipsiz fiyatları keşfedin",
    "Easy Booking": "Kolay Rezervasyon",
    "Best deals on international flights in just a few clicks": "Sadece birkaç tıklamayla uluslararası uçuşlarda en iyi fırsatlar",
    "24X7 Support": "7/24 Destek",
    "Get award-winning service and special deals by calling +1-888-604-0198": "+1-888-604-0198 numaralı telefonu arayarak ödüllü hizmet ve özel fırsatlar alın",
    "Trust pay": "Güvenli ödeme",
    "100% Payment Protection. Easy Return Policy.": "%100 Ödeme Koruması. Kolay İade Politikası."
  },
  "ur": {
    "The Modern Choice": "جدید انتخاب",
    "Why Choose Ezee Flights": "ایزی فلائٹس کیوں منتخب کریں",
    "Best Price Guarantee": "بہترین قیمت کی ضمانت",
    "Discover unbeatable prices on international flights with our exclusive deals": "ہمارے خصوصی سودوں کے ساتھ بین الاقوامی پروازوں پر ناقابل شکست قیمتیں دریافت کریں",
    "Easy Booking": "آسان بکنگ",
    "Best deals on international flights in just a few clicks": "صرف چند کلکس میں بین الاقوامی پروازوں پر بہترین سودے",
    "24X7 Support": "24/7 سپورٹ",
    "Get award-winning service and special deals by calling +1-888-604-0198": "+1-888-604-0198 پر کال کرکے ایوارڈ یافتہ سروس اور خصوصی سودے حاصل کریں",
    "Trust pay": "قابل اعتماد ادائیگی",
    "100% Payment Protection. Easy Return Policy.": "100% ادائیگی کا تحفظ۔ آسان واپسی کی پالیسی۔"
  },
  "zh-hans": {
    "The Modern Choice": "现代之选",
    "Why Choose Ezee Flights": "为什么选择Ezee Flights",
    "Best Price Guarantee": "最优价格保证",
    "Discover unbeatable prices on international flights with our exclusive deals": "通过我们的独家优惠发现国际航班的无与伦比的价格",
    "Easy Booking": "轻松预订",
    "Best deals on international flights in just a few clicks": "只需几次点击即可获得国际航班的最佳优惠",
    "24X7 Support": "24/7全天候支持",
    "Get award-winning service and special deals by calling +1-888-604-0198": "致电+1-888-604-0198获取屡获殊荣的服务和特别优惠",
    "Trust pay": "信赖支付",
    "100% Payment Protection. Easy Return Policy.": "100%支付保护。轻松退货政策。"
  },
  "zh-hant": {
    "The Modern Choice": "現代之選",
    "Why Choose Ezee Flights": "為什麼選擇Ezee Flights",
    "Best Price Guarantee": "最優價格保證",
    "Discover unbeatable prices on international flights with our exclusive deals": "透過我們的獨家優惠發現國際航班的無與倫比的價格",
    "Easy Booking": "輕鬆預訂",
    "Best deals on international flights in just a few clicks": "只需幾次點擊即可獲得國際航班的最佳優惠",
    "24X7 Support": "24/7全天候支援",
    "Get award-winning service and special deals by calling +1-888-604-0198": "致電+1-888-604-0198獲取屢獲殊榮的服務和特別優惠",
    "Trust pay": "信賴支付",
    "100% Payment Protection. Easy Return Policy.": "100%支付保護。輕鬆退貨政策。"
  }
};

const dir = path.join(__dirname, 'translations');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));

for (const file of files) {
  const lang = file.replace('.json', '');
  const filePath = path.join(dir, file);
  if (translations[lang]) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const merged = { ...data, ...translations[lang] };
    fs.writeFileSync(filePath, JSON.stringify(merged, null, 2));
    console.log(`Updated ${file}`);
  }
}
